import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'info';
    duration?: number;
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
    message,
    type = 'success',
    duration = 3000,
    onClose
}) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
        success: '✨',
        error: '❌',
        info: '💡'
    };

    const colors = {
        success: 'from-pink-500 to-rose-500',
        error: 'from-red-500 to-orange-500',
        info: 'from-blue-500 to-purple-500'
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="fixed top-6 left-1/2 z-[100] pointer-events-auto"
                    initial={{ opacity: 0, y: -50, x: '-50%' }}
                    animate={{ opacity: 1, y: 0, x: '-50%' }}
                    exit={{ opacity: 0, y: -50, x: '-50%' }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                >
                    <div className={`px-6 py-4 rounded-2xl bg-gradient-to-r ${colors[type]} text-white shadow-2xl flex items-center gap-3`}>
                        <span className="text-2xl">{icons[type]}</span>
                        <p className="font-semibold">{message}</p>
                        <button
                            onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }}
                            className="ml-2 opacity-70 hover:opacity-100 transition-opacity"
                        >
                            ✕
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// Toast Container for managing multiple toasts
interface ToastItem {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

export const useToastState = () => {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, message, type }]);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const ToastContainer = () => (
        <>
            {toasts.map((toast, index) => (
                <div key={toast.id} style={{ top: `${24 + index * 80}px` }} className="fixed left-1/2 z-[100]">
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => removeToast(toast.id)}
                    />
                </div>
            ))}
        </>
    );

    return { showToast, ToastContainer };
};

export default Toast;
