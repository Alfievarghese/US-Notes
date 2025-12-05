import mongoose, { Document, Schema } from 'mongoose';

export interface IDiary extends Document {
    _id: mongoose.Types.ObjectId;
    content: string;
    userId: mongoose.Types.ObjectId;
    roomId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const DiarySchema = new Schema<IDiary>({
    content: {
        type: String,
        required: true,
        maxlength: 2000,
        trim: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    roomId: {
        type: Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient queries
DiarySchema.index({ roomId: 1, createdAt: -1 });
DiarySchema.index({ userId: 1 });

export const Diary = mongoose.model<IDiary>('Diary', DiarySchema);
