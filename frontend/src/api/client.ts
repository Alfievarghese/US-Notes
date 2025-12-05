import axios from 'axios';

// Use environment variable for production, or proxy for development
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authApi = {
    register: async (username: string, password: string, displayName: string) => {
        const response = await api.post('/auth/register', { username, password, displayName });
        return response.data;
    },
    login: async (username: string, password: string) => {
        const response = await api.post('/auth/login', { username, password });
        return response.data;
    },
    me: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },
    updateProfile: async (data: { displayName?: string; profilePicture?: string; bio?: string }) => {
        const response = await api.put('/auth/profile', data);
        return response.data;
    },
    changePassword: async (currentPassword: string, newPassword: string) => {
        const response = await api.put('/auth/password', { currentPassword, newPassword });
        return response.data;
    },
    savePushSubscription: async (subscription: any) => {
        const response = await api.post('/auth/push-subscription', { subscription });
        return response.data;
    },
};

// Room API
export const roomApi = {
    create: async (roomName?: string) => {
        const response = await api.post('/room/create', { roomName });
        return response.data;
    },
    join: async (roomCode: string) => {
        const response = await api.post('/room/join', { roomCode });
        return response.data;
    },
    getCurrent: async () => {
        const response = await api.get('/room/current');
        return response.data;
    },
    leave: async () => {
        const response = await api.post('/room/leave');
        return response.data;
    },
    updateName: async (roomName: string) => {
        const response = await api.put('/room/name', { roomName });
        return response.data;
    },
};

// Notes API
export const notesApi = {
    create: async (content: string, voiceMessage?: string, voiceDuration?: number) => {
        const response = await api.post('/notes', { content, voiceMessage, voiceDuration });
        return response.data;
    },
    publish: async (noteId: string) => {
        const response = await api.post(`/notes/${noteId}/publish`);
        return response.data;
    },
    getAll: async () => {
        const response = await api.get('/notes');
        return response.data;
    },
};

// Diary API
export const diaryApi = {
    create: async (content: string) => {
        const response = await api.post('/diary', { content });
        return response.data;
    },
    getAll: async () => {
        const response = await api.get('/diary');
        return response.data;
    },
    update: async (id: string, content: string) => {
        const response = await api.put(`/diary/${id}`, { content });
        return response.data;
    },
};

export default api;
