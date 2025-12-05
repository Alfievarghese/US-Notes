import { Router, Response } from 'express';
import { Note } from '../models/Note';
import { User } from '../models/User';
import { Room } from '../models/Room';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

const router = Router();

// Time constants (24 hours for publish, 3 days for expiry)
const PUBLISH_DELAY_MS = 24 * 60 * 60 * 1000; // 24 hours
const EXPIRY_DELAY_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

// Middleware to check if user is in a room
const requireRoom = async (req: AuthRequest, res: Response, next: Function) => {
    if (!req.user?.roomId) {
        res.status(400).json({ error: 'You need to be in a room to use this feature' });
        return;
    }
    next();
};

// Create a new note (text or voice)
router.post('/', authMiddleware, requireRoom, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { content, voiceMessage, voiceDuration, imageData } = req.body;
        const userId = req.userId!;
        const roomId = req.user!.roomId!;

        // Must have either content, voice message, or image
        if ((!content || content.trim().length === 0) && !voiceMessage && !imageData) {
            res.status(400).json({ error: 'Note content, voice message, or image is required' });
            return;
        }

        if (content && content.length > 500) {
            res.status(400).json({ error: 'Note content must be 500 characters or less' });
            return;
        }

        const now = new Date();
        const publishTime = new Date(now.getTime() + PUBLISH_DELAY_MS);

        const note = new Note({
            content: content?.trim() || '',
            senderId: userId,
            roomId,
            createdAt: now,
            publishTime,
            isPublished: false,
            isDeleted: false,
            voiceMessage: voiceMessage || '',
            voiceDuration: voiceDuration || 0,
            imageData: imageData || ''
        });

        await note.save();

        // Try to notify partner
        try {
            await notifyPartner(userId, roomId, 'New love note coming your way! ❤️');
        } catch (e) {
            // Notification failed, but note was created
        }

        res.status(201).json({
            message: `Note created! It will be published in 24 hours ❤️`,
            note: {
                id: note._id,
                content: note.content,
                createdAt: note.createdAt,
                publishTime: note.publishTime,
                isPublished: note.isPublished,
                hasVoice: !!note.voiceMessage
            }
        });
    } catch (error) {
        console.error('Create note error:', error);
        res.status(500).json({ error: 'Failed to create note' });
    }
});

// Manually publish a note
router.post('/:id/publish', authMiddleware, requireRoom, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.userId!;
        const roomId = req.user!.roomId!;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ error: 'Invalid note ID' });
            return;
        }

        const note = await Note.findOne({ _id: id, roomId, isDeleted: false });

        if (!note) {
            res.status(404).json({ error: 'Note not found' });
            return;
        }

        if (note.senderId.toString() !== userId) {
            res.status(403).json({ error: 'Only the sender can publish this note' });
            return;
        }

        if (note.isPublished) {
            res.status(400).json({ error: 'Note is already published' });
            return;
        }

        const now = new Date();
        note.isPublished = true;
        note.expiryTime = new Date(now.getTime() + EXPIRY_DELAY_MS);
        await note.save();

        // Notify partner
        try {
            await notifyPartner(userId, roomId, 'Your partner sent you a love note! ❤️');
        } catch (e) { }

        res.json({
            message: `Note published! It will expire in 3 days ❤️`,
            note: {
                id: note._id,
                content: note.content,
                isPublished: note.isPublished,
                expiryTime: note.expiryTime
            }
        });
    } catch (error) {
        console.error('Publish note error:', error);
        res.status(500).json({ error: 'Failed to publish note' });
    }
});

// Get all visible notes in the room
router.get('/', authMiddleware, requireRoom, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId!;
        const roomId = req.user!.roomId!;
        const now = new Date();

        const notes = await Note.find({
            roomId,
            isDeleted: false,
            $or: [
                { senderId: userId },
                {
                    senderId: { $ne: userId },
                    isPublished: true,
                    expiryTime: { $gt: now }
                }
            ]
        })
            .populate('senderId', 'displayName username profilePicture bio')
            .sort({ createdAt: -1 });

        const formattedNotes = notes.map(note => ({
            id: note._id,
            content: note.content,
            sender: note.senderId,
            createdAt: note.createdAt,
            publishTime: note.publishTime,
            isPublished: note.isPublished,
            expiryTime: note.expiryTime,
            isOwn: (note.senderId as any)._id.toString() === userId,
            hasVoice: !!note.voiceMessage,
            voiceMessage: note.voiceMessage,
            voiceDuration: note.voiceDuration,
            hasImage: !!note.imageData,
            imageData: note.imageData,
            timeUntilPublish: !note.isPublished
                ? Math.max(0, note.publishTime.getTime() - now.getTime())
                : null,
            timeUntilExpiry: note.isPublished && note.expiryTime
                ? Math.max(0, note.expiryTime.getTime() - now.getTime())
                : null
        }));

        res.json({
            notes: formattedNotes,
            count: formattedNotes.length
        });
    } catch (error) {
        console.error('Get notes error:', error);
        res.status(500).json({ error: 'Failed to get notes' });
    }
});

// Helper function to notify partner in the same room
async function notifyPartner(userId: string, roomId: mongoose.Types.ObjectId, message: string) {
    const partner = await User.findOne({
        roomId,
        _id: { $ne: userId },
        pushSubscription: { $exists: true }
    });
    if (partner && partner.pushSubscription) {
        console.log(`📱 Would notify ${partner.displayName}: ${message}`);
    }
}

export default router;
