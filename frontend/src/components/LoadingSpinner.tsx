import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    color = '#f5b8d3'
}) => {
    const sizeMap = {
        sm: 24,
        md: 40,
        lg: 60
    };

    const dimension = sizeMap[size];

    return (
        <svg
            width={dimension}
            height={dimension}
            viewBox="0 0 50 50"
            style={{ display: 'inline-block' }}
        >
            <motion.circle
                cx="25"
                cy="25"
                r="20"
                fill="none"
                stroke={color}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="31.4 31.4"
                animate={{ rotate: 360 }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear"
                }}
                style={{ transformOrigin: "center" }}
            />
        </svg>
    );
};

export default LoadingSpinner;
