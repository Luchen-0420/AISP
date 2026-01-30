import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import request from '../api/request';
import { useUserStore } from '../store/userStore';

export const Login: React.FC = () => {
    const [form, setForm] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const setAuth = useUserStore((state) => state.setAuth);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res: any = await request.post('/users/login', form);
            const authData = res.data;
            setAuth(authData.token, authData.user);
            navigate('/');
        } catch (err: any) {
            alert(err.message || '登录失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-slate-700">用户名</label>
                    <div className="mt-1">
                        <input
                            id="username"
                            type="text"
                            required
                            value={form.username}
                            onChange={e => setForm({ ...form, username: e.target.value })}
                            className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700">密码</label>
                    <div className="mt-1">
                        <input
                            id="password"
                            type="password"
                            required
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        />
                    </div>
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-slate-400"
                    >
                        {loading ? '登录中...' : '立即登录'}
                    </button>
                </div>

                <div className="text-sm text-center">
                    <span
                        onClick={() => navigate('/register')}
                        className="font-medium text-primary hover:text-blue-500 cursor-pointer"
                    >
                        没有账号？去注册
                    </span>
                </div>
            </form>
        </div>
    );
};
