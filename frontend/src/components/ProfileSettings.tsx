import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUpload, FiUser, FiMessageSquare } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

interface ProfileSettingsProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ isOpen, onClose }) => {
    const { user, updateProfile } = useAuth();
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePicture(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await updateProfile({
                displayName,
                bio,
                profilePicture
            });

            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                onClose();
            }, 2000);
        } catch (error) {
            console.error('Failed to update profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 px-4"
                    >
                        <div className="glass-card p-4 sm:p-6 md:p-8">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4 sm:mb-6">
                                <h2 className="text-2xl sm:text-3xl font-romantic text-gradient">Edit Profile</h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-pink-100 rounded-full transition-colors"
                                >
                                    <FiX size={24} className="text-pink-700" />
                                </button>
                            </div>

                            {/* Success Animation */}
                            <AnimatePresence>
                                {showSuccess && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="mb-4 p-4 bg-green-100 border-2 border-green-400 rounded-xl text-center"
                                    >
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                            className="text-5xl mb-2"
                                        >
                                            ✨
                                        </motion.div>
                                        <p className="text-green-700 font-bold">Profile Updated!</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Profile Picture Upload */}
                            <div className="flex flex-col items-center mb-4 sm:mb-6">
                                <div className="relative group">
                                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-pink-300 shadow-lg">
                                        {profilePicture ? (
                                            <img
                                                src={profilePicture}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white text-3xl sm:text-4xl">
                                                {displayName?.charAt(0) || user?.username?.charAt(0) || '?'}
                                            </div>
                                        )}
                                    </div>
                                    <label className="absolute bottom-0 right-0 p-2 bg-pink-500 rounded-full cursor-pointer hover:bg-pink-600 transition-colors shadow-lg">
                                        <FiUpload className="text-white" size={18} />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Tap to upload photo</p>
                            </div>

                            {/* Display Name */}
                            <div className="mb-3 sm:mb-4">
                                <label className="flex items-center gap-2 text-pink-700 font-handwritten mb-2 text-base sm:text-lg">
                                    <FiUser size={18} />
                                    Display Name
                                </label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="love-input w-full text-sm sm:text-base"
                                    placeholder="How your partner sees you"
                                />
                            </div>

                            {/* Bio */}
                            <div className="mb-4 sm:mb-6">
                                <label className="flex items-center gap-2 text-pink-700 font-handwritten mb-2 text-base sm:text-lg">
                                    <FiMessageSquare size={18} />
                                    Bio
                                </label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    className="love-input w-full h-20 sm:h-24 resize-none text-sm sm:text-base"
                                    placeholder="Tell your partner about yourself..."
                                    maxLength={200}
                                />
                                <p className="text-xs text-gray-400 mt-1 text-right">{bio.length}/200</p>
                            </div>

                            {/* Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <motion.button
                                    onClick={onClose}
                                    className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-bold text-gray-700 transition-colors"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    onClick={handleSave}
                                    disabled={isLoading}
                                    className="flex-1 love-button"
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
                                    ) : (
                                        '💖 Save Changes'
                                    )}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ProfileSettings;
