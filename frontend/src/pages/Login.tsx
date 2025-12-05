import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FloatingElements } from '../components/FloatingElements';

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isLogin) {
                await login(username, password);
            } else {
                await register(username, password, displayName);
            }
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            <FloatingElements heartCount={15} butterflyCount={6} />

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
                        Kunji Kurups
                    </h1>
                    <p className="text-gray-300 font-handwritten mt-2 text-lg">
                        A private space for you and your love
                    </p>
                </motion.div>

                {/* Tab switcher */}
                <div className="flex mb-6 bg-white/5 rounded-xl p-1">
                    <button
                        onClick={() => setIsLogin(true)}
                        className={`flex-1 py-3 rounded-lg font-handwritten text-lg transition-all ${isLogin ? 'tab-active' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => setIsLogin(false)}
                        className={`flex-1 py-3 rounded-lg font-handwritten text-lg transition-all ${!isLogin ? 'tab-active' : 'text-gray-400 hover:text-white'
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
                            className="mb-4 p-3 bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl text-center font-handwritten"
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-300 font-handwritten mb-2 text-lg">
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="love-input"
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
                                <label className="block text-gray-300 font-handwritten mb-2 text-lg">
                                    Display Name
                                </label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="love-input"
                                    placeholder="How your partner sees you"
                                    required={!isLogin}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div>
                        <label className="block text-gray-300 font-handwritten mb-2 text-lg">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="love-input"
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
