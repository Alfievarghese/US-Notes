import { Router, Response } from 'express';
import { Diary } from '../models/Diary';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

const router = Router();

// Middleware to check if user is in a room
const requireRoom = async (req: AuthRequest, res: Response, next: Function) => {
    if (!req.user?.roomId) {
        res.status(400).json({ error: 'You need to be in a room to use this feature' });
        return;
    }
    next();
};

// Create a new diary entry
router.post('/', authMiddleware, requireRoom, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { content } = req.body;
        const userId = req.userId!;
        const roomId = req.user!.roomId!;

        if (!content || content.trim().length === 0) {
            res.status(400).json({ error: 'Diary content is required' });
            return;
        }

        if (content.length > 2000) {
            res.status(400).json({ error: 'Diary content must be 2000 characters or less' });
            return;
        }

        const diary = new Diary({
            content: content.trim(),
            userId,
            roomId
        });

        await diary.save();

        res.status(201).json({
            message: 'Diary entry created! ❤️',
            diary: {
                id: diary._id,
                content: diary.content,
                createdAt: diary.createdAt,
                updatedAt: diary.updatedAt
            }
        });
    } catch (error) {
        console.error('Create diary error:', error);
        res.status(500).json({ error: 'Failed to create diary entry' });
    }
});

// Get all diary entries in the room (both partners can see all)
router.get('/', authMiddleware, requireRoom, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId!;
        const roomId = req.user!.roomId!;

        const diaries = await Diary.find({ roomId })
            .populate('userId', 'displayName username profilePicture')
            .sort({ createdAt: -1 });

        const formattedDiaries = diaries.map(diary => ({
            id: diary._id,
            content: diary.content,
            author: diary.userId,
            createdAt: diary.createdAt,
            updatedAt: diary.updatedAt,
            isOwn: (diary.userId as any)._id.toString() === userId
        }));

        res.json({
            diaries: formattedDiaries,
            count: formattedDiaries.length
        });
    } catch (error) {
        console.error('Get diaries error:', error);
        res.status(500).json({ error: 'Failed to get diary entries' });
    }
});

// Update a diary entry (only owner can edit)
router.put('/:id', authMiddleware, requireRoom, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const userId = req.userId!;
        const roomId = req.user!.roomId!;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ error: 'Invalid diary ID' });
            return;
        }

        if (!content || content.trim().length === 0) {
            res.status(400).json({ error: 'Diary content is required' });
            return;
        }

        if (content.length > 2000) {
            res.status(400).json({ error: 'Diary content must be 2000 characters or less' });
            return;
        }

        const diary = await Diary.findOne({ _id: id, roomId });

        if (!diary) {
            res.status(404).json({ error: 'Diary entry not found' });
            return;
        }

        if (diary.userId.toString() !== userId) {
            res.status(403).json({ error: 'You can only edit your own diary entries' });
            return;
        }

        diary.content = content.trim();
        diary.updatedAt = new Date();
        await diary.save();

        res.json({
            message: 'Diary entry updated! ❤️',
            diary: {
                id: diary._id,
                content: diary.content,
                createdAt: diary.createdAt,
                updatedAt: diary.updatedAt
            }
        });
    } catch (error) {
        console.error('Update diary error:', error);
        res.status(500).json({ error: 'Failed to update diary entry' });
    }
});

export default router;
