import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NoteCreatorProps {
    onSubmit: (content: string, voiceMessage?: string, voiceDuration?: number, imageData?: string) => Promise<void>;
    isLoading: boolean;
}

export const NoteCreator: React.FC<NoteCreatorProps> = ({ onSubmit, isLoading }) => {
    const [content, setContent] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioDuration, setAudioDuration] = useState(0);
    const [imageData, setImageData] = useState<string | null>(null);
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

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('Image must be under 2MB');
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                setImageData(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearImage = () => {
        setImageData(null);
    };

    const handleSubmit = async () => {
        if (!content.trim() && !audioBlob && !imageData) return;

        try {
            let voiceBase64: string | undefined;

            if (audioBlob) {
                const reader = new FileReader();
                voiceBase64 = await new Promise((resolve) => {
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(audioBlob);
                });
            }

            await onSubmit(content, voiceBase64, audioDuration, imageData || undefined);
            setContent('');
            setAudioBlob(null);
            setAudioDuration(0);
            setImageData(null);
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
                        <h3 className="font-semibold text-2xl text-gradient">Note sent with love!</h3>
                        <p className="text-gray-500 mt-2">It will float to your partner soon...</p>
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
                                <h3 className="font-semibold text-2xl text-gradient mt-3">Write a love note...</h3>
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

                                {/* Image preview */}
                                {imageData && (
                                    <motion.div
                                        className="relative rounded-xl overflow-hidden"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                    >
                                        <img src={imageData} alt="Attachment" className="w-full h-40 object-cover rounded-xl" />
                                        <button
                                            onClick={clearImage}
                                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                                        >
                                            ✕
                                        </button>
                                    </motion.div>
                                )}

                                {/* Attachment buttons */}
                                <div className="flex gap-3">
                                    {/* Image upload */}
                                    <label className="flex-1 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-dashed border-purple-200 cursor-pointer hover:border-purple-400 transition-colors text-center">
                                        <span className="text-2xl">📷</span>
                                        <p className="text-sm text-gray-600 mt-1">Add Photo</p>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </label>

                                    {/* Voice recorder */}
                                    <div className="flex-1 p-4 voice-recorder text-center">
                                        <span className="text-2xl">🎤</span>
                                        <p className="text-sm text-gray-600 mt-1">Voice Note</p>
                                        {!audioBlob && !isRecording && (
                                            <motion.button
                                                onClick={startRecording}
                                                className="mt-2 px-3 py-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full text-xs"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                Record
                                            </motion.button>
                                        )}

                                        {isRecording && (
                                            <motion.button
                                                onClick={stopRecording}
                                                className="mt-2 px-3 py-1 bg-red-600 text-white rounded-full text-xs recording-pulse flex items-center gap-1 mx-auto"
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                                Stop
                                            </motion.button>
                                        )}

                                        {audioBlob && (
                                            <div className="mt-2 flex items-center justify-center gap-2">
                                                <span className="text-xs text-gray-500">{Math.round(audioDuration)}s</span>
                                                <button onClick={clearRecording} className="text-red-400 hover:text-red-500 text-xs">✕</button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => { setIsExpanded(false); setContent(''); clearRecording(); clearImage(); }}
                                        className="love-button-secondary flex-1"
                                        disabled={isLoading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        className="love-button flex-1"
                                        disabled={(!content.trim() && !audioBlob && !imageData) || isLoading}
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
