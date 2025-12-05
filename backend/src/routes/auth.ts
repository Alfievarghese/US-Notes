import { Router, Request, Response } from 'express';
import { User } from '../models/User';
import { generateToken, authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Register a new user
router.post('/register', async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password, displayName } = req.body;

        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            res.status(400).json({ error: 'Username already taken' });
            return;
        }

        // Validate input
        if (!username || !password || !displayName) {
            res.status(400).json({ error: 'Username, password, and display name are required' });
            return;
        }

        if (username.length < 3) {
            res.status(400).json({ error: 'Username must be at least 3 characters' });
            return;
        }

        if (password.length < 6) {
            res.status(400).json({ error: 'Password must be at least 6 characters' });
            return;
        }

        // Create user
        const user = new User({ username, password, displayName });
        await user.save();

        const token = generateToken(user._id.toString());

        res.status(201).json({
            message: 'Welcome to Kunji Kurups! ❤️',
            user: {
                id: user._id,
                username: user.username,
                displayName: user.displayName,
                profilePicture: user.profilePicture,
                bio: user.bio,
                roomId: user.roomId
            },
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// Login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).json({ error: 'Username and password are required' });
            return;
        }

        const user = await User.findOne({ username });
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const token = generateToken(user._id.toString());

        res.json({
            message: 'Welcome back! ❤️',
            user: {
                id: user._id,
                username: user.username,
                displayName: user.displayName,
                profilePicture: user.profilePicture,
                bio: user.bio,
                roomId: user.roomId
            },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

// Get current user info
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = req.user!;

        res.json({
            user: {
                id: user._id,
                username: user.username,
                displayName: user.displayName,
                profilePicture: user.profilePicture,
                bio: user.bio,
                roomId: user.roomId
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user info' });
    }
});

// Update profile
router.put('/profile', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { displayName, profilePicture, bio } = req.body;
        const user = req.user!;

        if (displayName) user.displayName = displayName;
        if (profilePicture !== undefined) user.profilePicture = profilePicture;
        if (bio !== undefined) user.bio = bio;

        await user.save();

        res.json({
            message: 'Profile updated! ❤️',
            user: {
                id: user._id,
                username: user.username,
                displayName: user.displayName,
                profilePicture: user.profilePicture,
                bio: user.bio
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Change password
router.put('/password', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = req.user!;

        if (!currentPassword || !newPassword) {
            res.status(400).json({ error: 'Current and new passwords are required' });
            return;
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            res.status(401).json({ error: 'Current password is incorrect' });
            return;
        }

        if (newPassword.length < 6) {
            res.status(400).json({ error: 'New password must be at least 6 characters' });
            return;
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password updated! ❤️' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

// Save push subscription
router.post('/push-subscription', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { subscription } = req.body;
        const user = req.user!;

        user.pushSubscription = subscription;
        await user.save();

        res.json({ message: 'Push subscription saved!' });
    } catch (error) {
        console.error('Save push subscription error:', error);
        res.status(500).json({ error: 'Failed to save push subscription' });
    }
});

export default router;
