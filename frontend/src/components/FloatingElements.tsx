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
        const hash = (seed * (i + 1) * 9301 + 49297) % 233280;
        elements.push({
            id: `${seed}-${i}`,
            left: (hash % 90) + 5,
            top: (hash % 70) + 10,
            size: 20 + (hash % 20),
            delay: (hash % 200) / 10,
            duration: 8 + (hash % 8),
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
        <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 40 }}>
            {/* Floating Hearts - Draggable with continuous animation */}
            {hearts.map((heart) => (
                <motion.div
                    key={heart.id}
                    drag
                    dragMomentum={false}
                    dragElastic={0.2}
                    dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
                    whileHover={{ scale: 1.3, rotate: 15 }}
                    whileTap={{ scale: 1.1 }}
                    className="pointer-events-auto cursor-grab active:cursor-grabbing"
                    style={{
                        position: 'absolute',
                        left: `${heart.left}%`,
                        top: `${heart.top}%`,
                        fontSize: `${heart.size}px`,
                        userSelect: 'none',
                        willChange: 'transform',
                    }}
                    animate={{
                        y: [0, -20, 0, -15, 0],
                        x: [0, 10, -10, 5, 0],
                        rotate: [0, 5, -5, 3, 0],
                    }}
                    transition={{
                        duration: heart.duration,
                        delay: heart.delay,
                        repeat: Infinity,
                        ease: "easeInOut",
                        repeatType: "loop"
                    }}
                >
                    ❤️
                </motion.div>
            ))}

            {/* Butterflies - Draggable with flutter animation - On top layer */}
            {butterflies.map((butterfly, index) => (
                <motion.div
                    key={butterfly.id}
                    drag
                    dragMomentum={false}
                    dragElastic={0.2}
                    dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
                    whileHover={{
                        scale: 1.4,
                        rotate: [0, -10, 10, -10, 10, 0],
                        transition: { duration: 0.5, repeat: 3 }
                    }}
                    whileTap={{ scale: 1.2 }}
                    className="pointer-events-auto cursor-grab active:cursor-grabbing"
                    style={{
                        position: 'absolute',
                        left: `${butterfly.left}%`,
                        top: `${butterfly.top}%`,
                        fontSize: `${butterfly.size}px`,
                        userSelect: 'none',
                        willChange: 'transform',
                    }}
                    animate={{
                        x: index % 2 === 0 ? [0, 40, -30, 40, 0] : [0, -35, 25, -35, 0],
                        y: index % 3 === 0 ? [0, -20, -30, -15, 0] : [0, -25, -10, -25, 0],
                        rotate: index % 2 === 0 ? [0, 8, -8, 5, -5, 0] : [0, -6, 6, -4, 4, 0],
                    }}
                    transition={{
                        duration: butterfly.duration,
                        delay: butterfly.delay,
                        repeat: Infinity,
                        ease: "easeInOut",
                        repeatType: "loop"
                    }}
                >
                    🦋
                </motion.div>
            ))}
        </div>
    );
};

export default FloatingElements;
