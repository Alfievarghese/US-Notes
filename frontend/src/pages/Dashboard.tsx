import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notesApi, diaryApi } from '../api/client';
import { NoteCreator } from '../components/NoteCreator';
import { StickyNote } from '../components/StickyNote';
import { FloatingElements } from '../components/FloatingElements';

type TabType = 'notes' | 'diary' | 'settings';

interface Note {
    id: string;
    content: string;
    sender: { _id: string; displayName: string; profilePicture?: string };
    isPublished: boolean;
    hasVoice: boolean;
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
    const [profileForm, setProfileForm] = useState({ displayName: '', bio: '' });

    const audioRef = useRef<HTMLAudioElement>(null);
    const { user, partner, room, logout, leaveRoom, updateProfile, refreshRoomInfo } = useAuth();
    const navigate = useNavigate();

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
            const interval = setInterval(() => { fetchNotes(); fetchDiaries(); }, 30000);
            return () => clearInterval(interval);
        }
    }, [room, fetchNotes, fetchDiaries]);

    useEffect(() => {
        if (user) {
            setProfileForm({ displayName: user.displayName, bio: user.bio || '' });
        }
    }, [user]);

    const handleCreateNote = async (content: string, voiceMessage?: string, voiceDuration?: number) => {
        setIsCreating(true);
        try {
            await notesApi.create(content, voiceMessage, voiceDuration);
            await fetchNotes();
        } finally {
            setIsCreating(false);
        }
    };

    const handlePublishNote = async (noteId: string) => {
        try {
            await notesApi.publish(noteId);
            await fetchNotes();
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
        } catch (error) {
            console.error('Failed to create diary:', error);
        }
    };

    const handleUpdateDiary = async (id: string, content: string) => {
        try {
            await diaryApi.update(id, content);
            setEditingDiary(null);
            await fetchDiaries();
        } catch (error) {
            console.error('Failed to update diary:', error);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            await updateProfile(profileForm);
            alert('Profile updated! ❤️');
        } catch (error) {
            console.error('Failed to update profile:', error);
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
            <FloatingElements heartCount={8} butterflyCount={4} />
            <audio ref={audioRef} className="hidden" />

            {/* Header */}
            <header className="navbar sticky top-0 z-50 px-4 py-3">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <motion.span className="text-3xl" animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                            ❤️
                        </motion.span>
                        <div>
                            <h1 className="font-romantic text-2xl text-gradient">Kunji Kurups</h1>
                            <p className="text-xs text-gray-400">{room.roomName}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {partner ? (
                            <div className="text-right hidden sm:block">
                                <p className="text-xs text-gray-400">With</p>
                                <p className="font-handwritten text-pink-400">{partner.displayName} ❤️</p>
                            </div>
                        ) : (
                            <div className="text-right hidden sm:block">
                                <p className="text-xs text-gray-400">Room Code</p>
                                <p className="room-code text-sm">{room.roomCode}</p>
                            </div>
                        )}
                        <button onClick={logout} className="text-gray-400 hover:text-white transition-colors">Logout</button>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <div className="sticky top-16 z-40 bg-transparent py-4">
                <div className="max-w-md mx-auto flex bg-white/5 rounded-xl p-1 backdrop-blur-sm">
                    {(['notes', 'diary', 'settings'] as TabType[]).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`flex-1 py-2 rounded-lg font-handwritten text-lg transition-all capitalize ${tab === t ? 'tab-active' : 'text-gray-400 hover:text-white'
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
                                        <h3 className="font-handwritten text-xl text-pink-400 mb-4">❤️ Notes for you</h3>
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
                                                    voiceDuration={note.voiceDuration}
                                                    timeUntilExpiry={note.timeUntilExpiry}
                                                    onPlayVoice={() => note.voiceMessage && playVoice(note.voiceMessage)}
                                                    colorIndex={i + 1}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {ownNotes.length > 0 && (
                                    <div>
                                        <h3 className="font-handwritten text-xl text-purple-400 mb-4">✨ Your notes</h3>
                                        <div className="flex flex-wrap gap-6 justify-center">
                                            {ownNotes.map((note, i) => (
                                                <StickyNote
                                                    key={note.id}
                                                    content={note.content}
                                                    senderName="You"
                                                    isOwn={true}
                                                    isPublished={note.isPublished}
                                                    hasVoice={note.hasVoice}
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
                                        <h3 className="font-handwritten text-2xl text-gray-400">No love notes yet...</h3>
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
                                <h3 className="font-handwritten text-xl text-gradient mb-4">📖 Write in our diary</h3>
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
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center text-white">
                                                {diary.author.displayName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-handwritten text-lg">{diary.author.displayName}</p>
                                                <p className="text-xs text-gray-400">{new Date(diary.createdAt).toLocaleDateString()}</p>
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
                                                <p className="text-gray-200 whitespace-pre-wrap">{diary.content}</p>
                                                {diary.isOwn && (
                                                    <button onClick={() => setEditingDiary(diary.id)} className="text-sm text-gray-400 hover:text-white mt-2">Edit</button>
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
                                <h3 className="font-handwritten text-xl text-gradient mb-4">👤 Profile</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-gray-300 mb-2">Display Name</label>
                                        <input
                                            type="text"
                                            value={profileForm.displayName}
                                            onChange={(e) => setProfileForm(p => ({ ...p, displayName: e.target.value }))}
                                            className="love-input"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-300 mb-2">Bio</label>
                                        <textarea
                                            value={profileForm.bio}
                                            onChange={(e) => setProfileForm(p => ({ ...p, bio: e.target.value }))}
                                            className="love-input min-h-[80px] resize-none"
                                            placeholder="Tell your partner something..."
                                            maxLength={500}
                                        />
                                    </div>
                                    <button onClick={handleUpdateProfile} className="love-button w-full">Update Profile ❤️</button>
                                </div>
                            </div>

                            <div className="glass-card p-6 mb-6">
                                <h3 className="font-handwritten text-xl text-gradient mb-4">🏠 Room Info</h3>
                                <div className="space-y-3 text-gray-300">
                                    <p><span className="text-gray-400">Room Name:</span> {room.roomName}</p>
                                    <p><span className="text-gray-400">Room Code:</span> <span className="room-code text-xl">{room.roomCode}</span></p>
                                    <p><span className="text-gray-400">Partner:</span> {partner ? partner.displayName : 'Waiting for partner...'}</p>
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
                className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-red-500 text-white text-2xl shadow-lg z-50 flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                🔄
            </motion.button>
        </div>
    );
};

export default Dashboard;
