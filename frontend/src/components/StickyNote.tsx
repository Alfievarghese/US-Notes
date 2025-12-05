import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface StickyNoteProps {
    content: string;
    senderName: string;
    senderPicture?: string;
    senderBio?: string;
    isOwn: boolean;
    isPublished: boolean;
    hasVoice?: boolean;
    hasImage?: boolean;
    imageData?: string;
    voiceDuration?: number;
    timeUntilPublish?: string; // Changed to string (formatted time)
    daysUntilExpiry?: number; // Days until auto-deletion
    onPublish?: () => void;
    onPlayVoice?: () => void;
    onProfileClick?: () => void;
    colorIndex?: number;
}

const COLORS = ['yellow', 'pink', 'blue', 'green', 'peach'] as const;

export const StickyNote: React.FC<StickyNoteProps> = ({
    content,
    senderName,
    senderPicture,
    isOwn,
    isPublished,
    hasVoice,
    hasImage,
    imageData,
    voiceDuration,
    timeUntilPublish,
    daysUntilExpiry,
    onPublish,
    onPlayVoice,
    onProfileClick,
    colorIndex = 0,
}) => {
    const rotation = useMemo(() => (Math.random() - 0.5) * 4, []);
    const animationDelay = useMemo(() => Math.random() * 2, []);
    const colorClass = COLORS[colorIndex % COLORS.length];

    return (
        <motion.div
            className={`sticky-note ${colorClass} w-72 p-5`}
            style={{ rotate: rotation }}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{
                opacity: 1,
                scale: 1,
                y: [0, -8, 0],
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
                opacity: { duration: 0.3 },
                scale: { duration: 0.3 },
                y: { duration: 5 + animationDelay, repeat: Infinity, ease: "easeInOut", delay: animationDelay }
            }}
            whileHover={{ scale: 1.05, rotate: 0 }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    {/* Clickable profile picture */}
                    <button
                        onClick={onProfileClick}
                        className={`flex-shrink-0 ${!isOwn && onProfileClick ? 'cursor-pointer hover:ring-2 hover:ring-pink-400 transition-all' : 'cursor-default'}`}
                        disabled={isOwn || !onProfileClick}
                    >
                        {senderPicture ? (
                            <img src={senderPicture} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-red-400 flex items-center justify-center text-white text-sm">
                                {senderName.charAt(0)}
                            </div>
                        )}
                    </button>
                    <span className="text-sm font-semibold text-gray-600">
                        {isOwn ? 'You' : senderName}
                    </span>
                </div>

                {!isPublished && isOwn && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                        ⏳ Pending
                    </span>
                )}
                {isPublished && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        ❤️ Sent
                    </span>
                )}
            </div>

            {/* Image attachment */}
            {hasImage && imageData && (
                <motion.div
                    className="mb-3 rounded-lg overflow-hidden cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                >
                    <img
                        src={imageData}
                        alt="Note attachment"
                        className="w-full h-auto max-h-40 object-cover rounded-lg"
                    />
                </motion.div>
            )}

            {/* Content */}
            {content && (
                <p className="font-handwritten text-lg text-gray-800 leading-relaxed mb-3">
                    {content}
                </p>
            )}

            {/* Voice message */}
            {hasVoice && (
                <motion.button
                    onClick={onPlayVoice}
                    className="w-full p-3 bg-gradient-to-r from-pink-100 to-red-100 rounded-lg flex items-center gap-3 group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <span className="text-2xl">🎵</span>
                    <div className="flex-1 text-left">
                        <p className="text-sm text-gray-600">Voice Message</p>
                        <p className="text-xs text-gray-400">{voiceDuration ? `${Math.round(voiceDuration)}s` : 'Tap to play'}</p>
                    </div>
                    <span className="text-xl group-hover:scale-110 transition-transform">▶️</span>
                </motion.button>
            )}

            {/* Timer */}
            <div className="mt-3 text-xs text-gray-500 space-y-1">
                {!isPublished && timeUntilPublish && (
                    <div className="flex justify-between">
                        <span>Auto-publish:</span>
                        <span className="font-semibold text-amber-600">{timeUntilPublish}</span>
                    </div>
                )}
                {isPublished && daysUntilExpiry != null && (
                    <div className="flex justify-between">
                        <span>Deletes in:</span>
                        <span className="font-semibold text-pink-600">{daysUntilExpiry.toFixed(1)} days</span>
                    </div>
                )}
            </div>

            {/* Publish button */}
            {!isPublished && isOwn && onPublish && (
                <motion.button
                    onClick={onPublish}
                    className="mt-3 w-full py-2 bg-gradient-to-r from-pink-500 to-red-500 text-white text-sm font-bold rounded-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    💌 Send Now
                </motion.button>
            )}
        </motion.div>
    );
};

export default StickyNote;
