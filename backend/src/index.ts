import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { initScheduler } from './scheduler/noteScheduler';
import authRoutes from './routes/auth';
import notesRoutes from './routes/notes';
import roomRoutes from './routes/room';
import diaryRoutes from './routes/diary';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));
app.use(express.json({ limit: '50mb' })); // Increased for high-res images and voice messages

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/room', roomRoutes);
app.use('/api/diary', diaryRoutes);

// Health check
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        message: '❤️ Kunji Kurups API is running!',
        version: '2.0.0'
    });
});

// Root route
app.get('/', (_req, res) => {
    res.json({
        message: '❤️ Kunji Kurups API',
        health: '/api/health'
    });
});

// Start server
const startServer = async (): Promise<void> => {
    try {
        await connectDatabase();
        initScheduler();

        app.listen(PORT, () => {
            console.log(`\n❤️ Kunji Kurups API running on port ${PORT}`);
            console.log(`🌐 Health check: http://localhost:${PORT}/api/health\n`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
