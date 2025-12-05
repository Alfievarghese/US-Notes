import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    username: string;
    password: string;
    displayName: string;
    profilePicture: string;
    bio: string;
    roomId?: mongoose.Types.ObjectId;
    createdAt: Date;
    pushSubscription?: {
        endpoint: string;
        keys: {
            p256dh: string;
            auth: string;
        };
    };
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 20
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    displayName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 30
    },
    profilePicture: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        default: '',
        maxlength: 500
    },
    roomId: {
        type: Schema.Types.ObjectId,
        ref: 'Room'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    pushSubscription: {
        endpoint: String,
        keys: {
            p256dh: String,
            auth: String
        }
    }
});

// Index for room lookups
UserSchema.index({ roomId: 1 });

// Hash password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error: any) {
        next(error);
    }
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);
