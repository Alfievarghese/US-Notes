import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

interface SharedDiaryProps {
    roomId: string;
}

export const SharedDiary: React.FC<SharedDiaryProps> = ({ roomId }) => {
    const { user, partner } = useAuth();
    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [partnerTyping, setPartnerTyping] = useState(false);
    const saveTimeoutRef = useRef<NodeJS.Timeout>();
    const typingTimeoutRef = useRef<NodeJS.Timeout>();

    // Load diary content
    useEffect(() => {
        const loadDiary = async () => {
            const { data } = await supabase
                .from('diaries')
                .select('*')
                .eq('room_id', roomId)
                .single();

            if (data) {
                setContent(data.content || '');
                setLastSaved(new Date(data.updated_at));
            }
        };

        loadDiary();

        // Real-time updates
        const channel = supabase
            .channel(`diary:${roomId}`)
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'diaries', filter: `room_id=eq.${roomId}` },
                (payload) => {
                    const newData = payload.new as any;
                    if (newData && newData.last_edited_by !== user?.id) {
                        setContent(newData.content || '');
                        setLastSaved(new Date(newData.updated_at || Date.now()));
                    }
                }
            )
            .on('broadcast', { event: 'typing' }, (payload) => {
                if (payload.payload.userId !== user?.id) {
                    setPartnerTyping(true);
                    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                    typingTimeoutRef.current = setTimeout(() => setPartnerTyping(false), 2000);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, [roomId, user?.id]);

    // Auto-save after typing stops
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value;
        setContent(newContent);

        // Broadcast typing indicator
        const channel = supabase.channel(`diary:${roomId}`);
        channel.send({
            type: 'broadcast',
            event: 'typing',
            payload: { userId: user?.id }
        });

        // Debounce save
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => saveDiary(newContent), 1000);
    };

    const saveDiary = async (contentToSave: string) => {
        setIsSaving(true);
        try {
            const { data: existing } = await supabase
                .from('diaries')
                .select('id')
                .eq('room_id', roomId)
                .single();

            if (existing) {
                await supabase
                    .from('diaries')
                    .update({
                        content: contentToSave,
                        last_edited_by: user?.id,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', existing.id);
            } else {
                await supabase
                    .from('diaries')
                    .insert({
                        room_id: roomId,
                        content: contentToSave,
                        last_edited_by: user?.id
                    });
            }

            setLastSaved(new Date());
        } catch (error) {
            console.error('Error saving diary:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl mx-auto"
        >
            <div className="glass-card p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-romantic text-gradient flex items-center gap-2">
                            📔 Our Diary
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {lastSaved
                                ? `Last saved ${lastSaved.toLocaleTimeString()}`
                                : 'Start writing together...'
                            }
                        </p>
                    </div>

                    {isSaving && (
                        <div className="flex items-center gap-2 text-pink-500">
                            <LoadingSpinner size="sm" />
                            <span className="text-sm">Saving...</span>
                        </div>
                    )}
                </div>

                {/* Typing Indicator */}
                {partnerTyping && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-2 text-sm text-pink-500 flex items-center gap-2"
                    >
                        <span className="flex gap-1">
                            <span className="animate-bounce">.</span>
                            <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
                            <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>.</span>
                        </span>
                        {partner?.displayName} is typing
                    </motion.div>
                )}

                {/* Diary Content */}
                <textarea
                    value={content}
                    onChange={handleChange}
                    placeholder="Write your shared memories, thoughts, and dreams together... ✨"
                    className="w-full h-96 p-4 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:outline-none resize-none font-handwritten text-lg"
                    style={{
                        background: 'linear-gradient(145deg, #fffefa 0%, #fffcf5 100%)',
                        lineHeight: '1.8'
                    }}
                />

                <p className="text-xs text-gray-400 mt-2 text-right">
                    {content.length} characters
                </p>
            </div>
        </motion.div>
    );
};

export default SharedDiary;
