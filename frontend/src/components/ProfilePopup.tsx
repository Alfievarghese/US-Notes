import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfilePopupProps {
    isOpen: boolean;
    onClose: () => void;
    profile: {
        displayName: string;
        profilePicture?: string;
        bio?: string;
    } | null;
}

export const ProfilePopup: React.FC<ProfilePopupProps> = ({ isOpen, onClose, profile }) => {
    if (!profile) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Popup */}
                    <motion.div
                        className="fixed top-1/2 left-1/2 z-[95] w-[90%] max-w-sm"
                        initial={{ opacity: 0, scale: 0.8, x: '-50%', y: '-50%' }}
                        animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
                        exit={{ opacity: 0, scale: 0.8, x: '-50%', y: '-50%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        <div className="glass-card p-6 text-center relative overflow-hidden">
                            {/* Decorative hearts */}
                            <div className="absolute top-2 left-4 text-2xl opacity-30">💕</div>
                            <div className="absolute top-2 right-4 text-2xl opacity-30">💕</div>

                            {/* Close button */}
                            <button
                                onClick={onClose}
                                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-pink-100 hover:bg-pink-200 flex items-center justify-center transition-colors text-pink-600"
                            >
                                ✕
                            </button>

                            {/* Profile Picture */}
                            <div className="mb-4 mt-2">
                                {profile.profilePicture ? (
                                    <img
                                        src={profile.profilePicture}
                                        alt={profile.displayName}
                                        className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-white shadow-lg"
                                        style={{ boxShadow: '0 0 0 4px #f472b6, 0 8px 25px rgba(236, 72, 153, 0.3)' }}
                                    />
                                ) : (
                                    <div
                                        className="w-24 h-24 rounded-full mx-auto flex items-center justify-center text-4xl text-white font-bold"
                                        style={{
                                            background: 'linear-gradient(135deg, #ec4899, #f43f5e)',
                                            boxShadow: '0 0 0 4px white, 0 8px 25px rgba(236, 72, 153, 0.3)'
                                        }}
                                    >
                                        {profile.displayName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>

                            {/* Name */}
                            <h2 className="font-romantic text-3xl text-gradient mb-2">
                                {profile.displayName}
                            </h2>

                            {/* Divider */}
                            <div className="w-16 h-1 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full mx-auto mb-4" />

                            {/* Bio */}
                            {profile.bio ? (
                                <p className="text-gray-600 font-medium leading-relaxed whitespace-pre-wrap">
                                    {profile.bio}
                                </p>
                            ) : (
                                <p className="text-gray-400 italic">
                                    No bio yet... 💭
                                </p>
                            )}

                            {/* Heart decoration */}
                            <motion.div
                                className="mt-6 text-3xl"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                ❤️
                            </motion.div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ProfilePopup;
