import cron from 'node-cron';
import { Note } from '../models/Note';

// Helper to get expiry delay based on dev mode
const getExpiryDelay = (): number => {
    const devMode = process.env.DEV_MODE === 'true';
    if (devMode) {
        const minutes = parseInt(process.env.DEV_EXPIRY_DELAY_MINUTES || '5');
        return minutes * 60 * 1000; // Convert to milliseconds
    }
    return 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds
};

// Auto-publish notes that have reached their publish time
const autoPublishNotes = async (): Promise<void> => {
    try {
        const now = new Date();

        // Find notes that should be published
        const notesToPublish = await Note.find({
            isPublished: false,
            isDeleted: false,
            publishTime: { $lte: now }
        });

        if (notesToPublish.length > 0) {
            console.log(`💕 Auto-publishing ${notesToPublish.length} note(s)...`);

            for (const note of notesToPublish) {
                note.isPublished = true;
                note.expiryTime = new Date(now.getTime() + getExpiryDelay());
                await note.save();
                console.log(`   ✨ Published note ${note._id}`);
            }
        }
    } catch (error) {
        console.error('❌ Auto-publish error:', error);
    }
};

// Soft-delete expired notes
const cleanupExpiredNotes = async (): Promise<void> => {
    try {
        const now = new Date();

        // Find published notes that have expired
        const expiredNotes = await Note.find({
            isPublished: true,
            isDeleted: false,
            expiryTime: { $lte: now }
        });

        if (expiredNotes.length > 0) {
            console.log(`🌙 Cleaning up ${expiredNotes.length} expired note(s)...`);

            for (const note of expiredNotes) {
                note.isDeleted = true;
                await note.save();
                console.log(`   🗑️ Soft-deleted note ${note._id}`);
            }
        }
    } catch (error) {
        console.error('❌ Cleanup error:', error);
    }
};

// Run both tasks
const runScheduledTasks = async (): Promise<void> => {
    const devMode = process.env.DEV_MODE === 'true';
    console.log(`\n⏰ [${new Date().toISOString()}] Running scheduled tasks... (Dev Mode: ${devMode})`);

    await autoPublishNotes();
    await cleanupExpiredNotes();

    console.log('✅ Scheduled tasks completed\n');
};

// Initialize the scheduler
export const initScheduler = (): void => {
    const devMode = process.env.DEV_MODE === 'true';

    // In dev mode, run every minute for faster testing
    // In production, run every 10 minutes
    const schedule = devMode ? '* * * * *' : '*/10 * * * *';

    console.log(`📅 Scheduler initialized (running ${devMode ? 'every minute' : 'every 10 minutes'})`);

    cron.schedule(schedule, runScheduledTasks);

    // Run once immediately on startup
    setTimeout(runScheduledTasks, 5000);
};

export { autoPublishNotes, cleanupExpiredNotes };
