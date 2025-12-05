import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notesApi, diaryApi } from '../api/client';
import { NoteCreator } from '../components/NoteCreator';
import { StickyNote } from '../components/StickyNote';
import { FloatingElements } from '../components/FloatingElements';
import { ProfilePopup } from '../components/ProfilePopup';
import { useToastState } from '../components/Toast';

type TabType = 'notes' | 'diary' | 'settings';

interface Note {
    id: string;
    content: string;
    sender: { _id: string; displayName: string; profilePicture?: string; bio?: string };
    isPublished: boolean;
    hasVoice: boolean;
    hasImage?: boolean;
    imageData?: string;
    voiceMessage?: string;
    voiceDuration?: number;
    timeUntilPublish: number | null;
    timeUntilExpiry: number | null;
    isOwn: boolean;
}

interface DiaryEntry {
    id: string;
    content: string;
    author: { _id: string; displayName: string; profilePicture?: string };
    createdAt: string;
    updatedAt: string;
    isOwn: boolean;
}

export const Dashboard: React.FC = () => {
    const [tab, setTab] = useState<TabType>('notes');
    const [notes, setNotes] = useState<Note[]>([]);
    const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [diaryContent, setDiaryContent] = useState('');
    const [editingDiary, setEditingDiary] = useState<string | null>(null);
    const [profileForm, setProfileForm] = useState({ displayName: '', bio: '', profilePicture: '' });
    const [selectedProfile, setSelectedProfile] = useState<{ displayName: string; profilePicture?: string; bio?: string } | null>(null);

    const audioRef = useRef<HTMLAudioElement>(null);
    const { user, partner, room, logout, leaveRoom, updateProfile, refreshRoomInfo } = useAuth();
    const navigate = useNavigate();
    const { showToast, ToastContainer } = useToastState();

    useEffect(() => {
        if (!user) navigate('/login');
        else if (!room) navigate('/room');
    }, [user, room, navigate]);

    const fetchNotes = useCallback(async () => {
        try {
            const data = await notesApi.getAll();
            setNotes(data.notes);
        } catch (error) {
            console.error('Failed to fetch notes:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchDiaries = useCallback(async () => {
        try {
            const data = await diaryApi.getAll();
            setDiaries(data.diaries);
        } catch (error) {
            console.error('Failed to fetch diaries:', error);
        }
    }, []);

    useEffect(() => {
        if (room) {
            fetchNotes();
            fetchDiaries();
            // Poll every 10 seconds for real-time updates (like WhatsApp)
            const interval = setInterval(() => { fetchNotes(); fetchDiaries(); }, 10000);
            return () => clearInterval(interval);
        }
    }, [room, fetchNotes, fetchDiaries]);

    useEffect(() => {
        if (user) {
            setProfileForm({
                displayName: user.displayName,
                bio: user.bio || '',
                profilePicture: user.profilePicture || ''
            });
        }
    }, [user]);

    const handleCreateNote = async (content: string, voiceMessage?: string, voiceDuration?: number, imageData?: string) => {
        setIsCreating(true);
        try {
            await notesApi.create(content, voiceMessage, voiceDuration, imageData);
            await fetchNotes();
            showToast('Note sent with love! 💕', 'success');
        } catch (error) {
            showToast('Failed to send note', 'error');
        } finally {
            setIsCreating(false);
        }
    };

    const handlePublishNote = async (noteId: string) => {
        try {
            await notesApi.publish(noteId);
            await fetchNotes();
            showToast('Note published! ❤️', 'success');
        } catch (error) {
            console.error('Failed to publish:', error);
        }
    };

    const handleCreateDiary = async () => {
        if (!diaryContent.trim()) return;
        try {
            await diaryApi.create(diaryContent);
            setDiaryContent('');
            await fetchDiaries();
            showToast('Diary entry added! 📖', 'success');
        } catch (error) {
            console.error('Failed to create diary:', error);
        }
    };

    const handleUpdateDiary = async (id: string, content: string) => {
        try {
            await diaryApi.update(id, content);
            setEditingDiary(null);
            await fetchDiaries();
            showToast('Diary updated! ✨', 'success');
        } catch (error) {
            console.error('Failed to update diary:', error);
        }
    };

    const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                showToast('Image must be under 2MB', 'error');
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                setProfileForm(p => ({ ...p, profilePicture: event.target?.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            await updateProfile(profileForm);
            showToast('Profile updated! ❤️', 'success');
        } catch (error) {
            showToast('Failed to update profile', 'error');
        }
    };

    const playVoice = (voiceMessage: string) => {
        if (audioRef.current) {
            audioRef.current.src = voiceMessage;
            audioRef.current.play();
        }
    };

    if (!user || !room) return null;

    const ownNotes = notes.filter(n => n.isOwn);
    const partnerNotes = notes.filter(n => !n.isOwn);

    return (
        <div className="min-h-screen relative pb-20">
            <FloatingElements heartCount={10} butterflyCount={5} />
            <audio ref={audioRef} className="hidden" />
            <ToastContainer />

            {/* Profile Popup */}
            <ProfilePopup
                isOpen={!!selectedProfile}
                onClose={() => setSelectedProfile(null)}
                profile={selectedProfile}
            />

            {/* Header */}
            <header className="navbar sticky top-0 z-50 px-4 py-3">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <motion.span className="text-3xl" animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                            ❤️
                        </motion.span>
                        <div>
                            <h1 className="font-romantic text-2xl text-gradient">US</h1>
                            <p className="text-xs text-gray-500">{room.roomName}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {partner ? (
                            <button
                                onClick={() => setSelectedProfile({
                                    displayName: partner.displayName,
                                    profilePicture: partner.profilePicture,
                                    bio: partner.bio
                                })}
                                className="text-right hidden sm:block hover:opacity-80 transition-opacity cursor-pointer"
                            >
                                <p className="text-xs text-gray-500">With</p>
                                <p className="font-handwritten text-pink-600">{partner.displayName} ❤️</p>
                            </button>
                        ) : (
                            <div className="text-right hidden sm:block">
                                <p className="text-xs text-gray-500">Room Code</p>
                                <p className="room-code text-sm">{room.roomCode}</p>
                            </div>
                        )}
                        <button onClick={logout} className="text-gray-500 hover:text-pink-600 transition-colors font-medium">Logout</button>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <div className="sticky top-16 z-40 bg-transparent py-4">
                <div className="max-w-md mx-auto flex bg-white/50 rounded-2xl p-1.5 backdrop-blur-sm shadow-sm">
                    {(['notes', 'diary', 'settings'] as TabType[]).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`flex-1 py-2.5 rounded-xl font-semibold text-base transition-all capitalize ${tab === t ? 'tab-active' : 'text-gray-500 hover:text-pink-600'
                                }`}
                        >
                            {t === 'notes' && '💌 '}{t === 'diary' && '📖 '}{t === 'settings' && '⚙️ '}{t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <main className="max-w-6xl mx-auto px-4 py-6 relative z-10">
                <AnimatePresence mode="wait">
                    {/* Notes Tab */}
                    {tab === 'notes' && (
                        <motion.div key="notes" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            <NoteCreator onSubmit={handleCreateNote} isLoading={isCreating} />

                            <div className="mt-10 space-y-8">
                                {partnerNotes.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold text-xl text-pink-600 mb-4">❤️ Notes for you</h3>
                                        <div className="flex flex-wrap gap-6 justify-center">
                                            {partnerNotes.map((note, i) => (
                                                <StickyNote
                                                    key={note.id}
                                                    content={note.content}
                                                    senderName={note.sender.displayName}
                                                    senderPicture={note.sender.profilePicture}
                                                    isOwn={false}
                                                    isPublished={note.isPublished}
                                                    hasVoice={note.hasVoice}
                                                    hasImage={note.hasImage}
                                                    imageData={note.imageData}
                                                    voiceDuration={note.voiceDuration}
                                                    timeUntilExpiry={note.timeUntilExpiry}
                                                    onPlayVoice={() => note.voiceMessage && playVoice(note.voiceMessage)}
                                                    onProfileClick={() => setSelectedProfile({
                                                        displayName: note.sender.displayName,
                                                        profilePicture: note.sender.profilePicture,
                                                        bio: note.sender.bio
                                                    })}
                                                    colorIndex={i + 1}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {ownNotes.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold text-xl text-purple-600 mb-4">✨ Your notes</h3>
                                        <div className="flex flex-wrap gap-6 justify-center">
                                            {ownNotes.map((note, i) => (
                                                <StickyNote
                                                    key={note.id}
                                                    content={note.content}
                                                    senderName="You"
                                                    isOwn={true}
                                                    isPublished={note.isPublished}
                                                    hasVoice={note.hasVoice}
                                                    hasImage={note.hasImage}
                                                    imageData={note.imageData}
                                                    voiceDuration={note.voiceDuration}
                                                    timeUntilPublish={note.timeUntilPublish}
                                                    timeUntilExpiry={note.timeUntilExpiry}
                                                    onPublish={() => handlePublishNote(note.id)}
                                                    onPlayVoice={() => note.voiceMessage && playVoice(note.voiceMessage)}
                                                    colorIndex={i}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {notes.length === 0 && !isLoading && (
                                    <div className="text-center py-16">
                                        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }} className="text-7xl mb-6">💌</motion.div>
                                        <h3 className="font-semibold text-2xl text-gray-600">No love notes yet...</h3>
                                        <p className="text-gray-500 mt-2">Write your first note and let it float to your loved one!</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Diary Tab */}
                    {tab === 'diary' && (
                        <motion.div key="diary" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            <div className="glass-card max-w-lg mx-auto p-6 mb-8">
                                <h3 className="font-semibold text-xl text-gradient mb-4">📖 Write in our diary</h3>
                                <textarea
                                    value={diaryContent}
                                    onChange={(e) => setDiaryContent(e.target.value)}
                                    className="love-input min-h-[100px] resize-none mb-4"
                                    placeholder="Share your thoughts..."
                                    maxLength={2000}
                                />
                                <button onClick={handleCreateDiary} className="love-button w-full" disabled={!diaryContent.trim()}>
                                    Add Entry ❤️
                                </button>
                            </div>

                            <div className="space-y-4 max-w-2xl mx-auto">
                                {diaries.map((diary) => (
                                    <motion.div key={diary.id} className="glass-card p-4" layout>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold">
                                                {diary.author.displayName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-lg text-gray-700">{diary.author.displayName}</p>
                                                <p className="text-xs text-gray-500">{new Date(diary.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        {editingDiary === diary.id ? (
                                            <div>
                                                <textarea
                                                    defaultValue={diary.content}
                                                    className="love-input min-h-[80px] resize-none mb-2"
                                                    id={`diary-edit-${diary.id}`}
                                                />
                                                <div className="flex gap-2">
                                                    <button onClick={() => {
                                                        const el = document.getElementById(`diary-edit-${diary.id}`) as HTMLTextAreaElement;
                                                        handleUpdateDiary(diary.id, el.value);
                                                    }} className="love-button text-sm py-2">Save</button>
                                                    <button onClick={() => setEditingDiary(null)} className="love-button-secondary text-sm py-2">Cancel</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="text-gray-700 whitespace-pre-wrap">{diary.content}</p>
                                                {diary.isOwn && (
                                                    <button onClick={() => setEditingDiary(diary.id)} className="text-sm text-pink-500 hover:text-pink-600 mt-2 font-medium">Edit</button>
                                                )}
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Settings Tab */}
                    {tab === 'settings' && (
                        <motion.div key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-lg mx-auto">
                            <div className="glass-card p-6 mb-6">
                                <h3 className="font-semibold text-xl text-gradient mb-6">👤 Profile</h3>

                                {/* Profile Picture */}
                                <div className="flex flex-col items-center mb-6">
                                    <div className="relative">
                                        {profileForm.profilePicture ? (
                                            <img
                                                src={profileForm.profilePicture}
                                                alt="Profile"
                                                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                                                style={{ boxShadow: '0 0 0 4px #f472b6' }}
                                            />
                                        ) : (
                                            <div
                                                className="w-24 h-24 rounded-full flex items-center justify-center text-4xl text-white font-bold"
                                                style={{
                                                    background: 'linear-gradient(135deg, #ec4899, #f43f5e)',
                                                    boxShadow: '0 0 0 4px #f472b6'
                                                }}
                                            >
                                                {user?.displayName?.charAt(0) || '?'}
                                            </div>
                                        )}
                                        <label className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center text-white cursor-pointer shadow-lg hover:scale-110 transition-transform">
                                            <span className="text-lg">📷</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleProfilePictureUpload}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-3">Tap 📷 to change photo</p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-gray-600 mb-2 font-medium">Display Name</label>
                                        <input
                                            type="text"
                                            value={profileForm.displayName}
                                            onChange={(e) => setProfileForm(p => ({ ...p, displayName: e.target.value }))}
                                            className="love-input"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-600 mb-2 font-medium">Bio</label>
                                        <textarea
                                            value={profileForm.bio}
                                            onChange={(e) => setProfileForm(p => ({ ...p, bio: e.target.value }))}
                                            className="love-input min-h-[100px] resize-none"
                                            placeholder="Tell your partner something sweet... 💕"
                                            maxLength={500}
                                        />
                                        <p className="text-xs text-gray-400 mt-1 text-right">{profileForm.bio.length}/500</p>
                                    </div>
                                    <button onClick={handleUpdateProfile} className="love-button w-full">Save Profile ❤️</button>
                                </div>
                            </div>

                            <div className="glass-card p-6 mb-6">
                                <h3 className="font-semibold text-xl text-gradient mb-4">🏠 Room Info</h3>
                                <div className="space-y-3 text-gray-600">
                                    <p><span className="text-gray-500">Room Name:</span> <span className="font-medium">{room.roomName}</span></p>
                                    <p><span className="text-gray-500">Room Code:</span> <span className="room-code">{room.roomCode}</span></p>
                                    <p><span className="text-gray-500">Partner:</span> <span className="font-medium">{partner ? partner.displayName : 'Waiting for partner...'}</span></p>
                                </div>
                                <button onClick={leaveRoom} className="love-button-secondary w-full mt-4">Leave Room</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Refresh FAB */}
            <motion.button
                onClick={() => { fetchNotes(); fetchDiaries(); refreshRoomInfo(); }}
                className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-2xl shadow-lg z-50 flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                🔄
            </motion.button>
        </div>
    );
};

export default Dashboard;
