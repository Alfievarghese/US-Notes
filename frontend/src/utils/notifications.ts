// Notification utility for browser push notifications

export const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    return false;
};

export const showNotification = (title: string, options?: NotificationOptions) => {
    if (Notification.permission === 'granted') {
        const notification = new Notification(title, {
            icon: '/heart-icon.png', // You can add a heart icon to public folder
            badge: '/heart-icon.png',
            vibrate: [200, 100, 200],
            tag: 'us-notes',
            renotify: true,
            requireInteraction: false,
            ...options
        });

        notification.onclick = () => {
            window.focus();
            notification.close();
        };

        // Auto-close after 5 seconds
        setTimeout(() => notification.close(), 5000);
    }
};

export const showNoteNotification = (senderName: string, preview: string) => {
    const body = preview.length > 50
        ? preview.substring(0, 50) + '...'
        : preview;

    showNotification(`💕 New note from ${senderName}`, {
        body,
        icon: '/heart-icon.png',
    });
};
