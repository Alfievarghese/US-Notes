import React from 'react';
import { motion } from 'framer-motion';

interface FloatingElementsProps {
    heartCount?: number;
    butterflyCount?: number;
}

export const FloatingElements: React.FC<FloatingElementsProps> = ({
    heartCount = 10,
    butterflyCount = 5
}) => {
    const hearts = Array.from({ length: heartCount }, (_, i) => ({
        id: `heart-${i}`,
        size: 16 + Math.random() * 20,
        left: Math.random() * 100,
        delay: Math.random() * 20,
        duration: 15 + Math.random() * 10,
    }));

    const butterflies = Array.from({ length: butterflyCount }, (_, i) => ({
        id: `butterfly-${i}`,
        left: 10 + Math.random() * 80,
        top: 10 + Math.random() * 80,
        delay: Math.random() * 5,
    }));

    return (
        <>
            {/* Floating Hearts */}
            <div className="floating-hearts">
                {hearts.map((heart) => (
                    <motion.div
                        key={heart.id}
                        className="heart"
                        style={{
                            left: `${heart.left}%`,
                            fontSize: `${heart.size}px`,
                        }}
                        initial={{ y: '100vh', rotate: 0, opacity: 0 }}
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
                        ❤️
                    </motion.div>
                ))}
            </div>

            {/* Butterflies */}
            {butterflies.map((butterfly) => (
                <motion.div
                    key={butterfly.id}
                    className="butterfly"
                    style={{
                        left: `${butterfly.left}%`,
                        top: `${butterfly.top}%`,
                    }}
                    animate={{
                        y: [0, -30, -10, -40, 0],
                        x: [0, 20, -15, 10, 0],
                        rotate: [0, 10, -5, 8, 0],
                    }}
                    transition={{
                        duration: 8,
                        delay: butterfly.delay,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                >
                    🦋
                </motion.div>
            ))}
        </>
    );
};

export default FloatingElements;
