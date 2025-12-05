import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StickyNote } from './StickyNote';

interface Note {
    id: string;
    content: string;
    sender: {
        _id: string;
        displayName: string;
        username: string;
    };
    createdAt: string;
    publishTime: string;
    isPublished: boolean;
    expiryTime?: string;
    isOwn: boolean;
    timeUntilPublish: number | null;
    timeUntilExpiry: number | null;
}

interface FloatingNotesProps {
    notes: Note[];
    onPublish: (noteId: string) => Promise<void>;
    isLoading: boolean;
}

export const FloatingNotes: React.FC<FloatingNotesProps> = ({
    notes,
    onPublish,
    isLoading
}) => {
    if (notes.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
            >
                <motion.div
                    animate={{
                        y: [0, -10, 0],
                        rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="text-8xl mb-6"
                >
                    💌
                </motion.div>
                <h3 className="font-handwritten text-2xl text-gray-600 mb-2">
                    No love notes yet...
                </h3>
                <p className="text-gray-400">
                    Write your first note and let it float to your loved one!
                </p>
            </motion.div>
        );
    }

    // Separate notes into own and partner's
    const ownNotes = notes.filter(n => n.isOwn);
    const partnerNotes = notes.filter(n => !n.isOwn);

    return (
        <div className="space-y-8">
            {/* Partner's notes */}
            {partnerNotes.length > 0 && (
                <div>
                    <h3 className="font-handwritten text-xl text-love-pink-500 mb-4 flex items-center gap-2">
                        <span>💕</span> Notes for you
                    </h3>
                    <div className="flex flex-wrap gap-6 justify-center">
                        <AnimatePresence mode="popLayout">
                            {partnerNotes.map((note, index) => (
                                <motion.div
                                    key={note.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <StickyNote
                                        content={note.content}
                                        senderName={note.sender.displayName}
                                        isOwn={false}
                                        isPublished={note.isPublished}
                                        createdAt={new Date(note.createdAt)}
                                        publishTime={new Date(note.publishTime)}
                                        expiryTime={note.expiryTime ? new Date(note.expiryTime) : undefined}
                                        timeUntilPublish={note.timeUntilPublish}
                                        timeUntilExpiry={note.timeUntilExpiry}
                                        colorIndex={index + 1}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {/* Own notes */}
            {ownNotes.length > 0 && (
                <div>
                    <h3 className="font-handwritten text-xl text-love-purple-500 mb-4 flex items-center gap-2">
                        <span>✨</span> Your notes
                    </h3>
                    <div className="flex flex-wrap gap-6 justify-center">
                        <AnimatePresence mode="popLayout">
                            {ownNotes.map((note, index) => (
                                <motion.div
                                    key={note.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <StickyNote
                                        content={note.content}
                                        senderName="You"
                                        isOwn={true}
                                        isPublished={note.isPublished}
                                        createdAt={new Date(note.createdAt)}
                                        publishTime={new Date(note.publishTime)}
                                        expiryTime={note.expiryTime ? new Date(note.expiryTime) : undefined}
                                        timeUntilPublish={note.timeUntilPublish}
                                        timeUntilExpiry={note.timeUntilExpiry}
                                        onPublish={isLoading ? undefined : () => onPublish(note.id)}
                                        colorIndex={index}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FloatingNotes;
