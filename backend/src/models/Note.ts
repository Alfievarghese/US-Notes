import mongoose, { Document, Schema } from 'mongoose';

export interface INote extends Document {
    _id: mongoose.Types.ObjectId;
    content: string;
    senderId: mongoose.Types.ObjectId;
    roomId: mongoose.Types.ObjectId;
    createdAt: Date;
    publishTime: Date;
    isPublished: boolean;
    expiryTime?: Date;
    isDeleted: boolean;
    voiceMessage?: string;
    voiceDuration?: number;
}

const NoteSchema = new Schema<INote>({
    content: {
        type: String,
        maxlength: 500,
        trim: true,
        default: ''
    },
    senderId: {
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
    publishTime: {
        type: Date,
        required: true
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    expiryTime: {
        type: Date
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    voiceMessage: {
        type: String,
        default: ''
    },
    voiceDuration: {
        type: Number,
        default: 0
    }
});

// Index for efficient queries
NoteSchema.index({ roomId: 1, isPublished: 1, publishTime: 1 });
NoteSchema.index({ roomId: 1, isPublished: 1, expiryTime: 1 });
NoteSchema.index({ roomId: 1, senderId: 1 });
NoteSchema.index({ isDeleted: 1 });

export const Note = mongoose.model<INote>('Note', NoteSchema);
