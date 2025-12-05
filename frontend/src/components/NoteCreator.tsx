import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NoteCreatorProps {
    onSubmit: (content: string, voiceMessage?: string, voiceDuration?: number) => Promise<void>;
    isLoading: boolean;
}

export const NoteCreator: React.FC<NoteCreatorProps> = ({ onSubmit, isLoading }) => {
    const [content, setContent] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioDuration, setAudioDuration] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const startTimeRef = useRef<number>(0);

    const maxLength = 500;
    const remainingChars = maxLength - content.length;

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];
            startTimeRef.current = Date.now();

            mediaRecorder.ondataavailable = (e) => {
                audioChunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                setAudioDuration((Date.now() - startTimeRef.current) / 1000);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error('Failed to start recording:', err);
            alert('Could not access microphone. Please allow microphone access.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const clearRecording = () => {
        setAudioBlob(null);
        setAudioDuration(0);
    };

    const handleSubmit = async () => {
        if (!content.trim() && !audioBlob) return;

        try {
            let voiceBase64: string | undefined;

            if (audioBlob) {
                const reader = new FileReader();
                voiceBase64 = await new Promise((resolve) => {
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(audioBlob);
                });
            }

            await onSubmit(content, voiceBase64, audioDuration);
            setContent('');
            setAudioBlob(null);
            setAudioDuration(0);
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                setIsExpanded(false);
            }, 2000);
        } catch (error) {
            console.error('Failed to create note:', error);
        }
    };

    return (
        <motion.div className="glass-card w-full max-w-lg mx-auto p-6" layout>
            <AnimatePresence mode="wait">
                {showSuccess ? (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-8"
                    >
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 0.5 }}
                            className="text-6xl mb-4"
                        >
                            💌
                        </motion.div>
                        <h3 className="font-handwritten text-2xl text-gradient">Note sent with love!</h3>
                        <p className="text-gray-400 mt-2">It will float to your partner soon...</p>
                    </motion.div>
                ) : (
                    <motion.div key="form" layout>
                        {!isExpanded ? (
                            <motion.button
                                onClick={() => setIsExpanded(true)}
                                className="w-full py-8 text-center group"
                                whileHover={{ scale: 1.02 }}
                            >
                                <span className="text-5xl group-hover:scale-110 inline-block transition-transform">✨</span>
                                <h3 className="font-handwritten text-2xl text-gradient mt-3">Write a love note...</h3>
                            </motion.button>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-4"
                            >
                                {/* Text input */}
                                <div className="relative">
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Write something sweet..."
                                        className="love-input min-h-[120px] resize-none"
                                        maxLength={maxLength}
                                        autoFocus
                                    />
                                    <span className={`absolute bottom-3 right-3 text-sm ${remainingChars < 50 ? 'text-red-400' : 'text-gray-400'}`}>
                                        {remainingChars}
                                    </span>
                                </div>

                                {/* Voice recorder */}
                                <div className="voice-recorder p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg">🎤 Voice Message</span>

                                        {!audioBlob && !isRecording && (
                                            <motion.button
                                                onClick={startRecording}
                                                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-full text-sm"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                Start Recording
                                            </motion.button>
                                        )}

                                        {isRecording && (
                                            <motion.button
                                                onClick={stopRecording}
                                                className="px-4 py-2 bg-red-600 text-white rounded-full text-sm recording-pulse flex items-center gap-2"
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                                Stop
                                            </motion.button>
                                        )}

                                        {audioBlob && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-300">{Math.round(audioDuration)}s</span>
                                                <button onClick={clearRecording} className="text-red-400 hover:text-red-300">✕</button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => { setIsExpanded(false); setContent(''); clearRecording(); }}
                                        className="love-button-secondary flex-1"
                                        disabled={isLoading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        className="love-button flex-1"
                                        disabled={(!content.trim() && !audioBlob) || isLoading}
                                    >
                                        {isLoading ? '💫' : 'Send ❤️'}
                                    </button>
                                </div>

                                <p className="text-xs text-center text-gray-500">
                                    Your note will be published to your partner in 24 hours
                                </p>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default NoteCreator;
