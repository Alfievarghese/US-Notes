import { Router, Response } from 'express';
import { Room, generateRoomCode } from '../models/Room';
import { User } from '../models/User';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Create a new room
router.post('/create', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { roomName } = req.body;
        const userId = req.userId!;
        const user = req.user!;

        // Check if user is already in a room
        if (user.roomId) {
            res.status(400).json({ error: 'You are already in a room. Leave your current room first.' });
            return;
        }

        // Generate unique room code
        let roomCode = generateRoomCode();
        let attempts = 0;
        while (await Room.findOne({ roomCode }) && attempts < 10) {
            roomCode = generateRoomCode();
            attempts++;
        }

        const room = new Room({
            roomCode,
            roomName: roomName || 'Our Love Space ❤️',
            creatorId: userId
        });

        await room.save();

        // Update user with room ID
        user.roomId = room._id as any;
        await user.save();

        res.status(201).json({
            message: 'Room created! Share the code with your partner ❤️',
            room: {
                id: room._id,
                roomCode: room.roomCode,
                roomName: room.roomName,
                createdAt: room.createdAt
            }
        });
    } catch (error) {
        console.error('Create room error:', error);
        res.status(500).json({ error: 'Failed to create room' });
    }
});

// Join an existing room
router.post('/join', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { roomCode } = req.body;
        const userId = req.userId!;
        const user = req.user!;

        if (!roomCode) {
            res.status(400).json({ error: 'Room code is required' });
            return;
        }

        // Check if user is already in a room
        if (user.roomId) {
            res.status(400).json({ error: 'You are already in a room. Leave your current room first.' });
            return;
        }

        const room = await Room.findOne({ roomCode: roomCode.toUpperCase(), isActive: true });

        if (!room) {
            res.status(404).json({ error: 'Room not found. Check the code and try again.' });
            return;
        }

        // Check if room already has 2 members
        if (room.partnerId) {
            res.status(400).json({ error: 'This room is already full. Each room is for 2 people only.' });
            return;
        }

        // Check if user is trying to join their own room
        if (room.creatorId.toString() === userId) {
            res.status(400).json({ error: 'You are already the creator of this room!' });
            return;
        }

        // Join the room
        room.partnerId = user._id;
        await room.save();

        user.roomId = room._id as any;
        await user.save();

        // Get creator name
        const creator = await User.findById(room.creatorId).select('displayName');

        res.json({
            message: `You joined ${creator?.displayName}'s room! ❤️`,
            room: {
                id: room._id,
                roomCode: room.roomCode,
                roomName: room.roomName,
                createdAt: room.createdAt
            }
        });
    } catch (error) {
        console.error('Join room error:', error);
        res.status(500).json({ error: 'Failed to join room' });
    }
});

// Get current room info
router.get('/current', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = req.user!;

        if (!user.roomId) {
            res.json({ room: null, partner: null });
            return;
        }

        const room = await Room.findById(user.roomId);

        if (!room) {
            res.json({ room: null, partner: null });
            return;
        }

        // Get partner info
        const partnerId = room.creatorId.toString() === user._id.toString()
            ? room.partnerId
            : room.creatorId;

        const partner = partnerId
            ? await User.findById(partnerId).select('displayName username profilePicture bio')
            : null;

        res.json({
            room: {
                id: room._id,
                roomCode: room.roomCode,
                roomName: room.roomName,
                createdAt: room.createdAt,
                isCreator: room.creatorId.toString() === user._id.toString(),
                isFull: !!room.partnerId
            },
            partner: partner ? {
                id: partner._id,
                displayName: partner.displayName,
                username: partner.username,
                profilePicture: partner.profilePicture,
                bio: partner.bio
            } : null
        });
    } catch (error) {
        console.error('Get room error:', error);
        res.status(500).json({ error: 'Failed to get room info' });
    }
});

// Leave room
router.post('/leave', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = req.user!;

        if (!user.roomId) {
            res.status(400).json({ error: 'You are not in a room' });
            return;
        }

        const room = await Room.findById(user.roomId);

        if (room) {
            if (room.creatorId.toString() === user._id.toString()) {
                // Creator is leaving - if partner exists, make them creator
                if (room.partnerId) {
                    room.creatorId = room.partnerId;
                    room.partnerId = undefined;
                    await room.save();
                } else {
                    // No partner, delete the room
                    room.isActive = false;
                    await room.save();
                }
            } else {
                // Partner is leaving
                room.partnerId = undefined;
                await room.save();
            }
        }

        user.roomId = undefined;
        await user.save();

        res.json({ message: 'You left the room' });
    } catch (error) {
        console.error('Leave room error:', error);
        res.status(500).json({ error: 'Failed to leave room' });
    }
});

// Update room name (only creator)
router.put('/name', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { roomName } = req.body;
        const user = req.user!;

        if (!user.roomId) {
            res.status(400).json({ error: 'You are not in a room' });
            return;
        }

        const room = await Room.findById(user.roomId);

        if (!room) {
            res.status(404).json({ error: 'Room not found' });
            return;
        }

        if (room.creatorId.toString() !== user._id.toString()) {
            res.status(403).json({ error: 'Only the room creator can change the name' });
            return;
        }

        room.roomName = roomName || room.roomName;
        await room.save();

        res.json({
            message: 'Room name updated! ❤️',
            room: {
                id: room._id,
                roomCode: room.roomCode,
                roomName: room.roomName
            }
        });
    } catch (error) {
        console.error('Update room name error:', error);
        res.status(500).json({ error: 'Failed to update room name' });
    }
});

export default router;
