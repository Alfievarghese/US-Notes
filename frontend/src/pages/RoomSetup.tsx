import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FloatingElements } from '../components/FloatingElements';

export const RoomSetup: React.FC = () => {
    const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose');
    const [roomName, setRoomName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { user, room, createRoom, joinRoom, logout } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (room) {
            navigate('/');
        }
    }, [room, navigate]);

    const handleCreateRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await createRoom(roomName || undefined);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to create room');
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoinRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await joinRoom(roomCode.toUpperCase());
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to join room');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            <FloatingElements heartCount={12} butterflyCount={4} />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card w-full max-w-md p-8 relative z-10"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="text-6xl mb-4"
                    >
                        🏠
                    </motion.div>
                    <h1 className="font-romantic text-4xl text-gradient">
                        Create Your Space
                    </h1>
                    <p className="text-gray-300 font-handwritten mt-2">
                        Welcome, {user?.displayName}! ❤️
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mb-4 p-3 bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl text-center"
                    >
                        {error}
                    </motion.div>
                )}

                {/* Mode Selection */}
                {mode === 'choose' && (
                    <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <motion.button
                            onClick={() => setMode('create')}
                            className="w-full p-6 glass-card hover:bg-white/10 transition-all group"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <span className="text-4xl block mb-2">✨</span>
                            <h3 className="font-handwritten text-xl text-white">Create a New Room</h3>
                            <p className="text-gray-400 text-sm mt-1">Start a private space and invite your partner</p>
                        </motion.button>

                        <motion.button
                            onClick={() => setMode('join')}
                            className="w-full p-6 glass-card hover:bg-white/10 transition-all group"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <span className="text-4xl block mb-2">🔗</span>
                            <h3 className="font-handwritten text-xl text-white">Join Partner's Room</h3>
                            <p className="text-gray-400 text-sm mt-1">Enter the room code your partner shared</p>
                        </motion.button>

                        <button
                            onClick={logout}
                            className="w-full text-gray-400 hover:text-white font-handwritten mt-4 transition-colors"
                        >
                            Logout
                        </button>
                    </motion.div>
                )}

                {/* Create Room Form */}
                {mode === 'create' && (
                    <motion.form
                        onSubmit={handleCreateRoom}
                        className="space-y-4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div>
                            <label className="block text-gray-300 font-handwritten mb-2 text-lg">
                                Room Name (optional)
                            </label>
                            <input
                                type="text"
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value)}
                                className="love-input"
                                placeholder="Our Love Space ❤️"
                                maxLength={50}
                            />
                        </div>

                        <motion.button
                            type="submit"
                            className="love-button w-full"
                            disabled={isLoading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isLoading ? '💫 Creating...' : '✨ Create Room'}
                        </motion.button>

                        <button
                            type="button"
                            onClick={() => setMode('choose')}
                            className="w-full text-gray-400 hover:text-white font-handwritten transition-colors"
                        >
                            ← Back
                        </button>
                    </motion.form>
                )}

                {/* Join Room Form */}
                {mode === 'join' && (
                    <motion.form
                        onSubmit={handleJoinRoom}
                        className="space-y-4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div>
                            <label className="block text-gray-300 font-handwritten mb-2 text-lg">
                                Room Code
                            </label>
                            <input
                                type="text"
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                className="love-input text-center text-2xl tracking-widest"
                                placeholder="XXXXXX"
                                maxLength={6}
                                required
                                style={{ fontFamily: 'monospace' }}
                            />
                        </div>

                        <motion.button
                            type="submit"
                            className="love-button w-full"
                            disabled={isLoading || roomCode.length !== 6}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isLoading ? '💫 Joining...' : '🔗 Join Room'}
                        </motion.button>

                        <button
                            type="button"
                            onClick={() => setMode('choose')}
                            className="w-full text-gray-400 hover:text-white font-handwritten transition-colors"
                        >
                            ← Back
                        </button>
                    </motion.form>
                )}
            </motion.div>
        </div>
    );
};

export default RoomSetup;
