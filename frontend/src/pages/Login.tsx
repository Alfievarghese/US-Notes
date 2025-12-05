import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FloatingElements from '../components/FloatingElements';

export const Login: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login, register, user } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const emailFromUsername = (u: string) => `${u.toLowerCase()}@usnotes.app`;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const email = emailFromUsername(username);
            if (isLogin) {
                await login(email, password);
            } else {
                await register(email, password, displayName, username);
            }
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-love-gradient">
            <FloatingElements />

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="glass-card w-full max-w-md p-8 relative z-10"
            >
                {/* Logo */}
                <motion.div
                    className="text-center mb-8"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                    <motion.span
                        className="text-7xl inline-block"
                        whileHover={{ scale: 1.2, rotate: 10 }}
                    >
                        ❤️
                    </motion.span>
                    <h1 className="font-romantic text-5xl text-gradient mt-4">
                        US
                    </h1>
                    <p className="text-gray-600 font-handwritten mt-2 text-lg">
                        A private space for you and your love
                    </p>
                </motion.div>

                {/* Tab switcher */}
                <div className="flex mb-6 bg-white/30 rounded-xl p-1">
                    <button
                        onClick={() => setIsLogin(true)}
                        className={`flex-1 py-3 rounded-lg font-handwritten text-lg transition-all ${isLogin ? 'tab-active' : 'text-gray-500 hover:text-pink-600'
                            }`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => setIsLogin(false)}
                        className={`flex-1 py-3 rounded-lg font-handwritten text-lg transition-all ${!isLogin ? 'tab-active' : 'text-gray-500 hover:text-pink-600'
                            }`}
                    >
                        Register
                    </button>
                </div>

                {/* Error message */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-4 p-3 bg-red-100 border border-red-200 text-red-600 rounded-xl text-center font-medium text-sm"
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-pink-700 font-handwritten mb-2 text-lg">
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="love-input w-full"
                            placeholder="Choose a username"
                            required
                            minLength={3}
                        />
                    </div>

                    <AnimatePresence>
                        {!isLogin && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <label className="block text-pink-700 font-handwritten mb-2 text-lg">
                                    Display Name
                                </label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="love-input w-full "
                                    placeholder="How your partner sees you"
                                    required={!isLogin}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div>
                        <label className="block text-pink-700 font-handwritten mb-2 text-lg">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="love-input w-full"
                            placeholder="Enter your password"
                            required
                            minLength={6}
                        />
                    </div>

                    <motion.button
                        type="submit"
                        className="love-button w-full mt-6"
                        disabled={isLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {isLoading ? (
                            <motion.span
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="inline-block"
                            >
                                💫
                            </motion.span>
                        ) : isLogin ? (
                            'Welcome Back ❤️'
                        ) : (
                            'Join the Love ❤️'
                        )}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;
