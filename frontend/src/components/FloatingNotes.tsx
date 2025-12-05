import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StickyNote } from './StickyNote';

interface Note {
    id: string;
    content: string;
    sender: {
        _id: string;
        displayName: string;
    };
    isPublished: boolean;
    isOwn: boolean;
    hasVoice?: boolean;
    voiceMessage?: string;
    voiceDuration?: number;
    timeUntilPublish?: string; // Changed to string
    daysUntilExpiry?: number; // Changed from timeUntilExpiry
}

interface FloatingNotesProps {
    notes: Note[];
    onPublish: (noteId: string) => Promise<void>;
    onPlayVoice?: (voiceMessage: string) => void;
}

export const FloatingNotes: React.FC<FloatingNotesProps> = ({
    notes,
    onPublish,
    onPlayVoice
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
                <h3 className="font-handwritten text-2xl text-gray-400 mb-2">
                    No love notes yet...
                </h3>
                <p className="text-gray-500">
                    Write your first note and let it float to your loved one!
                </p>
            </motion.div>
        );
    }

    const ownNotes = notes.filter(n => n.isOwn);
    const partnerNotes = notes.filter(n => !n.isOwn);

    return (
        <div className="space-y-8">
            {partnerNotes.length > 0 && (
                <div>
                    <h3 className="font-handwritten text-xl text-pink-400 mb-4 flex items-center gap-2">
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
                                        hasVoice={note.hasVoice}
                                        voiceDuration={note.voiceDuration}
                                        daysUntilExpiry={note.daysUntilExpiry}
                                        onPlayVoice={note.voiceMessage && onPlayVoice ? () => onPlayVoice(note.voiceMessage!) : undefined}
                                        colorIndex={index + 1}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {ownNotes.length > 0 && (
                <div>
                    <h3 className="font-handwritten text-xl text-purple-400 mb-4 flex items-center gap-2">
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
                                        hasVoice={note.hasVoice}
                                        voiceDuration={note.voiceDuration}
                                        timeUntilPublish={note.timeUntilPublish}
                                        daysUntilExpiry={note.daysUntilExpiry}
                                        onPublish={() => onPublish(note.id)}
                                        onPlayVoice={note.voiceMessage && onPlayVoice ? () => onPlayVoice(note.voiceMessage!) : undefined}
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
