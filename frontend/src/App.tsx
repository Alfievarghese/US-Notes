import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { RoomSetup } from './pages/RoomSetup';
import Dashboard from './pages/Dashboard';

const RoomRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, room, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <span className="text-7xl animate-pulse">❤️</span>
                    <p className="font-handwritten text-xl text-pink-400 mt-4">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;
    if (!room) return <Navigate to="/room" replace />;
    return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <span className="text-7xl animate-pulse">❤️</span>
                    <p className="font-handwritten text-xl text-pink-400 mt-4">Loading...</p>
                </div>
            </div>
        );
    }

    if (user) return <Navigate to="/" replace />;
    return <>{children}</>;
};

const NeedsRoomRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, room, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <span className="text-7xl animate-pulse">❤️</span>
                    <p className="font-handwritten text-xl text-pink-400 mt-4">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;
    if (room) return <Navigate to="/" replace />;
    return <>{children}</>;
};

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/room" element={<NeedsRoomRoute><RoomSetup /></NeedsRoomRoute>} />
            <Route path="/" element={<RoomRoute><Dashboard /></RoomRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
};

export default App;
