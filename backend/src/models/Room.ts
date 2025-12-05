import mongoose, { Document, Schema } from 'mongoose';

export interface IRoom extends Document {
    _id: mongoose.Types.ObjectId;
    roomCode: string;
    roomName: string;
    creatorId: mongoose.Types.ObjectId;
    partnerId?: mongoose.Types.ObjectId;
    createdAt: Date;
    isActive: boolean;
}

// Generate a unique 6-character room code
function generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded confusing chars like 0,O,I,1
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

const RoomSchema = new Schema<IRoom>({
    roomCode: {
        type: String,
        required: true,
        unique: true,
        default: generateRoomCode
    },
    roomName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50,
        default: 'Our Love Space'
    },
    creatorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    partnerId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

// Index for fast lookups
RoomSchema.index({ roomCode: 1 });
RoomSchema.index({ creatorId: 1 });
RoomSchema.index({ partnerId: 1 });

export const Room = mongoose.model<IRoom>('Room', RoomSchema);
export { generateRoomCode };
