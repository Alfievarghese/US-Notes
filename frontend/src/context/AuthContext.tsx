import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../supabaseClient';


interface User {
    id: string;
    username: string;
    displayName: string;
    profilePicture: string;
    bio: string;
    roomId?: string;
}

interface Partner extends User { }

interface Room {
    id: string;
    roomCode: string;
    roomName: string;
    createdAt: string;
    creatorId: string;
    participants: string[]; // Array of UUIDs
}

interface AuthContextType {
    user: User | null;
    partner: Partner | null;
    room: Room | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, displayName: string, username: string) => Promise<void>;
    logout: () => Promise<void>;
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
    const [isLoading, setIsLoading] = useState(true);

    // Auth & User Listener
    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                fetchUserProfile(session.user.id);
            } else {
                setAllNull();
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                fetchUserProfile(session.user.id);
            } else {
                setAllNull();
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const setAllNull = () => {
        setUser(null);
        setPartner(null);
        setRoom(null);
        setIsLoading(false);
    };

    const fetchUserProfile = async (userId: string) => {
        try {
            const { data } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (data) {
                // User exists
                const userData: User = {
                    id: data.id,
                    username: data.username,
                    displayName: data.display_name,
                    profilePicture: data.profile_picture,
                    bio: data.bio,
                    roomId: data.room_id
                };
                setUser(userData);
            } else {
                // User does not exist (e.g. first time Google Login)
                // Auto-create profile
                const { data: { user: authUser } } = await supabase.auth.getUser();

                if (authUser) {
                    const email = authUser.email || '';
                    const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
                    const displayName = authUser.user_metadata.full_name || authUser.user_metadata.name || 'New User';
                    const avatar = authUser.user_metadata.avatar_url || authUser.user_metadata.picture || '';

                    const { error: insertError } = await supabase
                        .from('users')
                        .insert({
                            id: userId,
                            username: username,
                            display_name: displayName,
                            profile_picture: avatar,
                            bio: ''
                        });

                    if (insertError) {
                        // If duplicate key error, just fetch the existing profile
                        if (insertError.code === '23505') {
                            console.log('Profile already exists, fetching...');
                            const { data: existingData } = await supabase
                                .from('users')
                                .select('*')
                                .eq('id', userId)
                                .single();

                            if (existingData) {
                                setUser({
                                    id: existingData.id,
                                    username: existingData.username,
                                    displayName: existingData.display_name,
                                    profilePicture: existingData.profile_picture,
                                    bio: existingData.bio,
                                    roomId: existingData.room_id
                                });
                            }
                        } else {
                            console.error('Error creating profile:', insertError);
                        }
                    } else {
                        // Profile created, set local state
                        setUser({
                            id: userId,
                            username: username,
                            displayName: displayName,
                            profilePicture: avatar,
                            bio: ''
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error in fetchUserProfile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Room Listener
    useEffect(() => {
        if (!user?.roomId) {
            setRoom(null);
            setPartner(null);
            return;
        }

        const fetchRoom = async () => {
            const { data, error } = await supabase
                .from('rooms')
                .select('*')
                .eq('id', user.roomId)
                .single();

            if (data && !error) {
                const roomData: Room = {
                    id: data.id,
                    roomCode: data.room_code,
                    roomName: data.room_name,
                    createdAt: data.created_at,
                    creatorId: data.creator_id,
                    // participants stored as jsonb array of strings
                    participants: data.participants || []
                };
                setRoom(roomData);
            }
        };

        fetchRoom();

        // Realtime Subscription for Room
        const channel = supabase
            .channel(`room:${user.roomId}`)
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${user.roomId}` },
                (payload) => {
                    // Update room state
                    if (payload.new) {
                        const newData = payload.new as any;
                        const roomData: Room = {
                            id: newData.id,
                            roomCode: newData.room_code,
                            roomName: newData.room_name,
                            createdAt: newData.created_at,
                            creatorId: newData.creator_id,
                            participants: newData.participants || []
                        };
                        setRoom(roomData);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };

    }, [user?.roomId]);


    // Partner Listener
    useEffect(() => {
        if (!room || !user) return;

        const partnerId = room.participants.find((uid: string) => uid !== user.id);

        if (!partnerId) {
            setPartner(null);
            return;
        }

        const fetchPartner = async () => {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', partnerId)
                .single();

            if (data && !error) {
                setPartner({
                    id: data.id,
                    username: data.username,
                    displayName: data.display_name,
                    profilePicture: data.profile_picture,
                    bio: data.bio,
                    roomId: data.room_id
                });
            }
        };

        fetchPartner();

        // Realtime Subscription for Partner Profile
        const channel = supabase
            .channel(`partner:${partnerId}`)
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'users', filter: `id=eq.${partnerId}` },
                (payload) => {
                    if (payload.new) {
                        const data = payload.new as any;
                        setPartner({
                            id: data.id,
                            username: data.username,
                            displayName: data.display_name,
                            profilePicture: data.profile_picture,
                            bio: data.bio,
                            roomId: data.room_id
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [room?.participants, user?.id]);


    const login = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
    };

    const register = async (email: string, password: string, displayName: string, username: string) => {
        // 1. Sign Up
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    display_name: displayName,
                    username: username
                }
            }
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('Registration failed');

        // 2. Create User Record (Trigger often handles this, but we'll do manual for now)
        const { error: dbError } = await supabase.from('users').insert({
            id: authData.user.id,
            username,
            display_name: displayName,
            profile_picture: '',
            bio: ''
        });

        if (dbError) {
            // Rollback auth? Not easy.
            console.error('DB User creation failed', dbError);
            throw new Error('Failed to create user profile');
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setAllNull();
    };

    const createRoom = async (roomName: string = 'Our Love Space ❤️') => {
        if (!user) return;

        const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        const { data: roomData, error: roomError } = await supabase
            .from('rooms')
            .insert({
                room_code: roomCode,
                room_name: roomName,
                creator_id: user.id,
                participants: [user.id]
            })
            .select() // return the created row
            .single();

        if (roomError) throw roomError;
        if (!roomData) throw new Error('Failed to create room');

        const { error: userError } = await supabase
            .from('users')
            .update({ room_id: roomData.id })
            .eq('id', user.id);

        if (userError) throw userError;

        // Optimistic update
        setUser({ ...user, roomId: roomData.id });
    };

    const joinRoom = async (roomCode: string) => {
        if (!user) return;

        // Find room
        const { data: roomData, error: roomError } = await supabase
            .from('rooms')
            .select('*')
            .eq('room_code', roomCode.toUpperCase())
            .single();

        if (roomError || !roomData) throw new Error('Room not found');

        const currentParticipants = (roomData.participants as string[]) || [];

        if (currentParticipants.length >= 2) {
            throw new Error('Room is full');
        }
        if (currentParticipants.includes(user.id)) {
            throw new Error('Already in this room');
        }

        const newParticipants = [...currentParticipants, user.id];

        // Update Room
        const { error: updateError } = await supabase
            .from('rooms')
            .update({ participants: newParticipants })
            .eq('id', roomData.id);

        if (updateError) throw updateError;

        // Update User
        const { error: userError } = await supabase
            .from('users')
            .update({ room_id: roomData.id })
            .eq('id', user.id);

        if (userError) throw userError;

        setUser({ ...user, roomId: roomData.id });
    };

    const leaveRoom = async () => {
        if (!user || !user.roomId) return;

        // Fetch current room to get participants
        const { data: roomData } = await supabase
            .from('rooms')
            .select('participants')
            .eq('id', user.roomId)
            .single();

        if (roomData) {
            const currentParticipants = (roomData.participants as string[]) || [];
            const newParticipants = currentParticipants.filter(id => id !== user.id);

            await supabase
                .from('rooms')
                .update({ participants: newParticipants })
                .eq('id', user.roomId);
        }

        await supabase
            .from('users')
            .update({ room_id: null })
            .eq('id', user.id);

        setUser({ ...user, roomId: undefined });
    };

    const updateProfile = async (data: { displayName?: string; profilePicture?: string; bio?: string }) => {
        if (!user) return;

        const updates: any = {};
        if (data.displayName) updates.display_name = data.displayName;
        if (data.profilePicture) updates.profile_picture = data.profilePicture;
        if (data.bio) updates.bio = data.bio;

        const { error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', user.id);

        if (error) throw error;

        // Local update
        setUser(prev => prev ? { ...prev, ...data } : null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                partner,
                room,
                isLoading,
                login,
                register,
                logout,
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
