import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUserStore } from '../store/userStore';

interface RoleBasedRouteProps {
    allowedRoles?: string[]; // If empty, allow any authenticated user
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ allowedRoles }) => {
    const { token, userInfo } = useUserStore();

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && allowedRoles.length > 0) {
        if (!userInfo?.role || !allowedRoles.includes(userInfo.role)) {
            // Redirect to a dashboard or 403 page based on typical behavior, 
            // for now just 403 behavior or fallback to home
            // Assuming "/" redirects to the correct dashboard based on role
            return <Navigate to="/" replace />;
        }
    }

    return <Outlet />;
};
