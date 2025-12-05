import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import StickyNote from '../components/StickyNote';
import NoteCreator from '../components/NoteCreator';
import FloatingElements from '../components/FloatingElements';
import ProfilePopup from '../components/ProfilePopup';

// Icons
import {
    FiLogOut, FiSmile
} from 'react-icons/fi';

interface Note {
    id: string;
    content: string;
    senderId: string;
    roomId: string;
    imageData?: string; // Legacy base64
    imageUrl?: string;  // New URL
    voiceUrl?: string;  // New URL
    voiceMessage?: string; // Legacy base64
    voiceDuration?: number;
    createdAt: any;
    isPublished: boolean;
    timeUntilPublish?: string;
    forceAccess?: boolean;
    sender?: { displayName: string; profilePicture?: string; bio?: string };
}

const Dashboard: React.FC = () => {
    const { user, partner, room, logout } = useAuth();
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'notes' | 'diary'>('notes');
    const [showPartnerProfile, setShowPartnerProfile] = useState(false);

    // Toasts
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const msToTime = (duration: number) => {
        const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((duration / (1000 * 60)) % 60);
        return `${hours}h ${minutes}m`;
    };

    // processNotePublishStatus Logic
    const processNotePublishStatus = (note: Note): Note => {
        const created = new Date(note.createdAt).getTime();
        const now = Date.now();
        const diff = now - created;
        const hours24 = 24 * 60 * 60 * 1000;

        const isReady = diff >= hours24;
        const timeLeft = hours24 - diff;

        return {
            ...note,
            isPublished: note.isPublished || isReady,
            timeUntilPublish: isReady ? undefined : msToTime(timeLeft)
        };
    };

    // --- Helper: Base64 to Blob for Supabase Upload ---
    const base64ToBlob = async (base64: string): Promise<Blob> => {
        const res = await fetch(base64);
        return await res.blob();
    };

    // --- Fetch Notes & Realtime Listener ---
    useEffect(() => {
        if (!room || !user) return;

        setIsLoading(true);

        const fetchNotes = async () => {
            const { data, error } = await supabase
                .from('notes')
                .select('*, sender:sender_id(display_name, profile_picture)')
                .eq('room_id', room.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching notes:', error);
                return;
            }
            if (data) {
                const mappedNotes: Note[] = data.map((n: any) => ({
                    id: n.id,
                    content: n.content,
                    senderId: n.sender_id,
                    roomId: n.room_id,
                    imageUrl: n.image_url,
                    voiceUrl: n.voice_url,
                    voiceDuration: n.voice_duration,
                    createdAt: n.created_at,
                    isPublished: n.is_published,
                    forceAccess: n.force_access,
                    sender: {
                        displayName: n.sender?.display_name || 'Partner',
                        profilePicture: n.sender?.profile_picture
                    }
                }));
                const processed = mappedNotes.map(n => processNotePublishStatus(n));
                setNotes(processed);
            }
            setIsLoading(false);
        };

        fetchNotes();

        // Realtime Subscription
        const channel = supabase
            .channel(`room_notes:${room.id}`)
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'notes', filter: `room_id=eq.${room.id}` },
                () => {
                    fetchNotes();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };

    }, [room, user]);


    // --- Create Note ---
    const handleCreateNote = async (content: string, voiceMessage?: string, voiceDuration?: number, imageData?: string) => {
        if (!user || !room) return;

        try {
            let voiceUrl = null;
            let imageUrl = null;

            // Upload Voice
            if (voiceMessage) {
                const blob = await base64ToBlob(voiceMessage);
                const filename = `voice/${room.id}/${Date.now()}.webm`;
                const { error } = await supabase.storage.from('media').upload(filename, blob);
                if (error) throw error;

                const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filename);
                voiceUrl = publicUrl;
            }

            // Upload Image
            if (imageData) {
                const blob = await base64ToBlob(imageData);
                const filename = `images/${room.id}/${Date.now()}.png`;

                const { error } = await supabase.storage.from('media').upload(filename, blob);
                if (error) throw error;

                const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filename);
                imageUrl = publicUrl;
            }

            // Insert Note
            const { error: insertError } = await supabase.from('notes').insert({
                content,
                sender_id: user.id,
                room_id: room.id,
                voice_url: voiceUrl,
                voice_duration: voiceDuration,
                image_url: imageUrl,
                is_published: false
            });

            if (insertError) throw insertError;

            showToast('Note sent! 💌');

        } catch (err: any) {
            console.error(err);
            showToast('Failed to send note', 'error');
        }
    };


    const partnerName = partner?.displayName || 'Partner';

    return (
        <div className="min-h-screen relative overflow-hidden bg-love-gradient selection:bg-pink-200">
            <FloatingElements />
            {toast && (
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`fixed top-5 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full shadow-xl z-50 ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'
                        } text-white font-medium`}
                >
                    {toast.message}
                </motion.div>
            )}

            {/* Navbar */}
            <nav className="navbar fixed top-0 w-full z-40 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h1 className="font-logo text-3xl text-gradient cursor-pointer">
                        Kunji Kurups
                    </h1>
                    {room && (
                        <div className="glass-card px-4 py-2">
                            <p className="text-xs text-gray-600">Room Code</p>
                            <p className="text-lg font-bold text-pink-700 tracking-wider">{room.roomCode}</p>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-6">
                    {/* Partner Badge - Text Only */}
                    <div
                        className="glass-card px-4 py-2 cursor-pointer hover:bg-pink-50 transition-colors"
                        onClick={() => setShowPartnerProfile(true)}
                    >
                        <p className="text-sm font-bold text-pink-700">{partnerName}</p>
                        <p className="text-xs text-gray-500">
                            {partner ? 'Connected' : 'Waiting...'}
                        </p>
                    </div>

                    <button
                        onClick={logout}
                        className="p-3 rounded-full hover:bg-white/50 text-pink-700 transition-all hover:rotate-180"
                        title="Logout"
                    >
                        <FiLogOut size={24} />
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="pt-28 pb-10 px-4 md:px-10 max-w-7xl mx-auto min-h-screen flex flex-col items-center">

                {/* Note Creator */}
                <div className="w-full max-w-2xl mb-12 relative z-10">
                    <NoteCreator
                        onSubmit={handleCreateNote}
                        isLoading={false}
                    />
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 bg-white/30 p-1.5 rounded-full backdrop-blur-sm">
                    <button
                        onClick={() => setActiveTab('notes')}
                        className={`px-8 py-2 rounded-full font-bold transition-all ${activeTab === 'notes' ? 'tab-active' : 'text-pink-800 hover:bg-white/50'
                            }`}
                    >
                        Notes 📝
                    </button>
                    <button
                        onClick={() => setActiveTab('diary')}
                        className={`px-8 py-2 rounded-full font-bold transition-all ${activeTab === 'diary' ? 'tab-active' : 'text-pink-800 hover:bg-white/50'
                            }`}
                    >
                        Diaries 📔
                    </button>
                </div>

                {/* Notes Grid */}
                <AnimatePresence mode='wait'>
                    {isLoading ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center gap-4 mt-10"
                        >
                            <div className="w-12 h-12 border-4 border-pink-300 border-t-pink-600 rounded-full animate-spin" />
                            <p className="text-pink-700 font-medium animate-pulse">Loading {activeTab}...</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="w-full"
                        >
                            {notes.length === 0 ? (
                                <div className="text-center py-20 opacity-60">
                                    <FiSmile size={60} className="mx-auto mb-4 text-pink-400" />
                                    <p className="text-xl font-handwritten text-pink-800">No notes yet. Be the first to write one!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full pb-20">
                                    {notes.map((note, i) => {
                                        const isOwn = note.senderId === user?.id;
                                        return (
                                            <StickyNote
                                                key={note.id}
                                                content={note.content}
                                                senderName={isOwn ? 'You' : note.sender?.displayName || 'Partner'}
                                                senderPicture={note.sender?.profilePicture}
                                                isOwn={isOwn}
                                                isPublished={note.isPublished}
                                                hasVoice={!!(note.voiceUrl || note.voiceMessage)}
                                                hasImage={!!(note.imageUrl || note.imageData)}
                                                imageData={note.imageUrl || note.imageData}
                                                voiceDuration={note.voiceDuration}
                                                onPlayVoice={() => {
                                                    const audio = new Audio(note.voiceUrl || note.voiceMessage);
                                                    audio.play();
                                                }}
                                                timeUntilPublish={null}
                                                colorIndex={i}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Profile Popup */}
            <ProfilePopup
                isOpen={showPartnerProfile}
                onClose={() => setShowPartnerProfile(false)}
                profile={partner}
            />
        </div>
    );
};

export default Dashboard;
