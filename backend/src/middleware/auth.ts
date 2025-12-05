import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';

export interface AuthRequest extends Request {
    user?: IUser;
    userId?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'anti-gravity-love-notes-secret-key-2024';

export const generateToken = (userId: string): string => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

export const authMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
            const user = await User.findById(decoded.userId);

            if (!user) {
                res.status(401).json({ error: 'User not found' });
                return;
            }

            req.user = user;
            req.userId = decoded.userId;
            next();
        } catch (jwtError) {
            res.status(401).json({ error: 'Invalid token' });
            return;
        }
    } catch (error) {
        res.status(500).json({ error: 'Authentication error' });
    }
};
