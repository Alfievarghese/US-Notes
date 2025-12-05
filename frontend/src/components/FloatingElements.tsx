import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface FloatingElementsProps {
    heartCount?: number;
    butterflyCount?: number;
}

// Generate stable random values once
const generateStableElements = (count: number, seed: number) => {
    const elements = [];
    for (let i = 0; i < count; i++) {
        // Use deterministic pseudo-random based on index
        const hash = (seed * (i + 1) * 9301 + 49297) % 233280;
        elements.push({
            id: `${seed}-${i}`,
            left: (hash % 100),
            top: (hash % 80),
            size: 20 + (hash % 24),
            delay: (hash % 200) / 10,
            duration: 15 + (hash % 15),
            animationType: hash % 3,
        });
    }
    return elements;
};

export const FloatingElements: React.FC<FloatingElementsProps> = ({
    heartCount = 10,
    butterflyCount = 8
}) => {
    const hearts = useMemo(() => generateStableElements(heartCount, 1234), [heartCount]);
    const butterflies = useMemo(() => generateStableElements(butterflyCount, 5678), [butterflyCount]);

    return (
        <>
            {/* Floating Hearts - Draggable */}
            <div className="floating-hearts" aria-hidden="true">
                {hearts.map((heart) => (
                    <motion.div
                        key={heart.id}
                        drag
                        dragMomentum={false}
                        dragElastic={0.1}
                        whileHover={{ scale: 1.3, rotate: 15, cursor: 'grab' }}
                        whileTap={{ scale: 1.1, cursor: 'grabbing' }}
                        style={{
                            position: 'absolute',
                            left: `${heart.left}%`,
                            top: `${heart.top}%`,
                            fontSize: `${heart.size}px`,
                            zIndex: 1,
                            userSelect: 'none',
                        }}
                        animate={{
                            y: [0, -30, 0],
                            x: [0, Math.sin(heart.id.length) * 20, 0],
                            rotate: [0, 10, -10, 0],
                        }}
                        transition={{
                            duration: heart.duration,
                            delay: heart.delay,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        ❤️
                    </motion.div>
                ))}
            </div>

            {/* Butterflies - Draggable */}
            {butterflies.map((butterfly) => (
                <motion.div
                    key={butterfly.id}
                    drag
                    dragMomentum={false}
                    dragElastic={0.15}
                    whileHover={{
                        scale: 1.4,
                        rotate: [0, -10, 10, -10, 0],
                        cursor: 'grab',
                        transition: { duration: 0.3 }
                    }}
                    whileTap={{ scale: 1.2, cursor: 'grabbing' }}
                    style={{
                        position: 'absolute',
                        left: `${butterfly.left}%`,
                        top: `${butterfly.top}%`,
                        fontSize: `${butterfly.size}px`,
                        zIndex: 1,
                        userSelect: 'none',
                    }}
                    animate={{
                        x: [0, 40, -30, 40, 0],
                        y: [0, -25, -15, -30, 0],
                        rotate: [0, 5, -5, 3, -3, 0],
                    }}
                    transition={{
                        duration: butterfly.duration,
                        delay: butterfly.delay,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    aria-hidden="true"
                >
                    🦋
                </motion.div>
            ))}
        </>
    );
};

export default FloatingElements;
