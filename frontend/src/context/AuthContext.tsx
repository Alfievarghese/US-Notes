import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, roomApi } from '../api/client';

interface User {
    id: string;
    username: string;
    displayName: string;
    profilePicture: string;
    bio: string;
    roomId?: string;
}

interface Partner {
    id: string;
    username: string;
    displayName: string;
    profilePicture: string;
    bio: string;
}

interface Room {
    id: string;
    roomCode: string;
    roomName: string;
    createdAt: string;
    isCreator: boolean;
    isFull: boolean;
}

interface AuthContextType {
    user: User | null;
    partner: Partner | null;
    room: Room | null;
    token: string | null;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, password: string, displayName: string) => Promise<void>;
    logout: () => void;
    refreshUserInfo: () => Promise<void>;
    refreshRoomInfo: () => Promise<void>;
    createRoom: (roomName?: string) => Promise<void>;
    joinRoom: (roomCode: string) => Promise<void>;
    leaveRoom: () => Promise<void>;
    updateProfile: (data: { displayName?: string; profilePicture?: string; bio?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [partner, setPartner] = useState<Partner | null>(null);
    const [room, setRoom] = useState<Room | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            refreshUserInfo();
            refreshRoomInfo();
        } else {
            setIsLoading(false);
        }
    }, []);

    const refreshUserInfo = async () => {
        try {
            const data = await authApi.me();
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
        } catch (error) {
            console.error('Failed to refresh user info:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const refreshRoomInfo = async () => {
        try {
            const data = await roomApi.getCurrent();
            setRoom(data.room);
            setPartner(data.partner);
        } catch (error) {
            console.error('Failed to refresh room info:', error);
        }
    };

    const login = async (username: string, password: string) => {
        const data = await authApi.login(username, password);
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        await refreshRoomInfo();
    };

    const register = async (username: string, password: string, displayName: string) => {
        const data = await authApi.register(username, password, displayName);
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
    };

    const logout = () => {
        setUser(null);
        setPartner(null);
        setRoom(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const createRoom = async (roomName?: string) => {
        await roomApi.create(roomName);
        await refreshUserInfo();
        await refreshRoomInfo();
    };

    const joinRoom = async (roomCode: string) => {
        await roomApi.join(roomCode);
        await refreshUserInfo();
        await refreshRoomInfo();
    };

    const leaveRoom = async () => {
        await roomApi.leave();
        setRoom(null);
        setPartner(null);
        await refreshUserInfo();
    };

    const updateProfile = async (data: { displayName?: string; profilePicture?: string; bio?: string }) => {
        const response = await authApi.updateProfile(data);
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                partner,
                room,
                token,
                isLoading,
                login,
                register,
                logout,
                refreshUserInfo,
                refreshRoomInfo,
                createRoom,
                joinRoom,
                leaveRoom,
                updateProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
