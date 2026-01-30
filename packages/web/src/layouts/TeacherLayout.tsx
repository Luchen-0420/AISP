import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../store/userStore';

export const TeacherLayout: React.FC = () => {
    const { logout, userInfo } = useUserStore();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { name: '仪表盘', path: '/teacher' },
        { name: '班级管理', path: '/teacher/classes' },
        { name: '病例库', path: '/teacher/cases' },
        { name: '设置', path: '/teacher/settings' },
    ];

    return (
        <div className="min-h-screen bg-slate-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-slate-800">
                    <span className="text-xl font-bold text-white">AISP Teacher</span>
                </div>

                <nav className="flex-1 py-6 px-3 space-y-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== '/teacher' && location.pathname.startsWith(item.path));
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                                        ? 'bg-slate-800 text-white'
                                        : 'hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                {item.name}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white">
                            {userInfo?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-sm">
                            <p className="text-white font-medium">{userInfo?.username}</p>
                            <p className="text-xs text-slate-500">教师</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full text-left text-sm text-slate-400 hover:text-white transition-colors"
                    >
                        退出登录
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
