import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';

export const StudentLayout: React.FC = () => {
    const { logout, userInfo } = useUserStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    }

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col">
            {/* Top Navigation */}
            <header className="bg-white shadow-sm z-10 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center">
                        <span className="text-xl font-bold text-primary">AISP Student</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-600">欢迎, {userInfo?.username}</span>
                        <button
                            onClick={() => navigate('/student/history')}
                            className="text-sm text-slate-500 hover:text-primary"
                        >
                            实训记录
                        </button>
                        <button
                            onClick={() => navigate('/student/settings')}
                            className="text-sm text-slate-500 hover:text-primary"
                        >
                            设置
                        </button>
                        <button
                            onClick={handleLogout}
                            className="text-sm text-slate-500 hover:text-red-500"
                        >
                            退出
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden relative">
                <Outlet />
            </main>
        </div>
    );
};
