import React from 'react';
import { motion } from 'framer-motion';

interface FloatingHeartsProps {
    count?: number;
}

export const FloatingHearts: React.FC<FloatingHeartsProps> = ({ count = 15 }) => {
    const hearts = Array.from({ length: count }, (_, i) => ({
        id: i,
        size: 20 + Math.random() * 30,
        left: Math.random() * 100,
        delay: Math.random() * 15,
        duration: 15 + Math.random() * 10,
    }));

    return (
        <div className="floating-hearts">
            {hearts.map((heart) => (
                <motion.div
                    key={heart.id}
                    className="heart"
                    style={{
                        left: `${heart.left}%`,
                        fontSize: `${heart.size}px`,
                    }}
                    initial={{
                        y: '100vh',
                        rotate: 0,
                        opacity: 0,
                    }}
                    animate={{
                        y: '-100px',
                        rotate: 720,
                        opacity: [0, 0.15, 0.15, 0],
                    }}
                    transition={{
                        duration: heart.duration,
                        delay: heart.delay,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                >
                    💕
                </motion.div>
            ))}
        </div>
    );
};

export default FloatingHearts;
