/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'love-pink': {
                    50: '#fdf2f8',
                    100: '#fce7f3',
                    200: '#fbcfe8',
                    300: '#f9a8d4',
                    400: '#f472b6',
                    500: '#ec4899',
                    600: '#db2777',
                },
                'love-purple': {
                    50: '#faf5ff',
                    100: '#f3e8ff',
                    200: '#e9d5ff',
                    300: '#d8b4fe',
                    400: '#c084fc',
                    500: '#a855f7',
                },
                'love-blue': {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                },
                'sticky-yellow': '#fff9c4',
                'sticky-pink': '#f8bbd9',
                'sticky-blue': '#b3e5fc',
                'sticky-green': '#c8e6c9',
                'sticky-peach': '#ffe0b2',
            },
            fontFamily: {
                'handwritten': ['Kalam', 'Caveat', 'cursive'],
                'romantic': ['Dancing Script', 'cursive'],
            },
            boxShadow: {
                'sticky': '2px 2px 8px rgba(0,0,0,0.15), 0 0 4px rgba(0,0,0,0.05)',
                'sticky-hover': '4px 4px 12px rgba(0,0,0,0.2), 0 0 6px rgba(0,0,0,0.08)',
                'glow-pink': '0 0 20px rgba(236, 72, 153, 0.3)',
                'glow-purple': '0 0 20px rgba(168, 85, 247, 0.3)',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'float-delayed': 'float 6s ease-in-out infinite 2s',
                'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
                'sparkle': 'sparkle 2s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                'pulse-soft': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.8 },
                },
                sparkle: {
                    '0%, 100%': { opacity: 0, transform: 'scale(0)' },
                    '50%': { opacity: 1, transform: 'scale(1)' },
                },
            },
            backgroundImage: {
                'gradient-romantic': 'linear-gradient(135deg, #fdf2f8 0%, #f3e8ff 50%, #dbeafe 100%)',
                'gradient-sunset': 'linear-gradient(180deg, #fce7f3 0%, #e9d5ff 50%, #bfdbfe 100%)',
            },
        },
    },
    plugins: [],
}
