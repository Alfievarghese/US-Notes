import React, { useMemo } from 'react';

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
            size: 16 + (hash % 20),
            delay: (hash % 200) / 10,
            duration: 12 + (hash % 10),
            animationType: hash % 3, // 0, 1, or 2 for different animations
        });
    }
    return elements;
};

export const FloatingElements: React.FC<FloatingElementsProps> = ({
    heartCount = 12,
    butterflyCount = 6
}) => {
    // UseMemo with empty deps ensures these don't regenerate on rerender
    const hearts = useMemo(() => generateStableElements(heartCount, 1234), [heartCount]);
    const butterflies = useMemo(() => generateStableElements(butterflyCount, 5678), [butterflyCount]);

    return (
        <>
            {/* Floating Hearts - CSS animations (won't reset on state change) */}
            <div className="floating-hearts" aria-hidden="true">
                {hearts.map((heart) => (
                    <div
                        key={heart.id}
                        className={`heart heart-animation-${heart.animationType}`}
                        style={{
                            left: `${heart.left}%`,
                            fontSize: `${heart.size}px`,
                            animationDelay: `${heart.delay}s`,
                            animationDuration: `${heart.duration}s`,
                        }}
                    >
                        ❤️
                    </div>
                ))}
            </div>

            {/* Butterflies - CSS animations */}
            {butterflies.map((butterfly) => (
                <div
                    key={butterfly.id}
                    className={`butterfly butterfly-animation-${butterfly.animationType}`}
                    style={{
                        left: `${butterfly.left}%`,
                        top: `${10 + (butterfly.animationType * 25)}%`,
                        animationDelay: `${butterfly.delay}s`,
                    }}
                    aria-hidden="true"
                >
                    🦋
                </div>
            ))}
        </>
    );
};

export default FloatingElements;
