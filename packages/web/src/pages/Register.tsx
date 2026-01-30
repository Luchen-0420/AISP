import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import request from '../api/request';

export const Register: React.FC = () => {
    const [role, setRole] = useState<'student' | 'teacher'>('student');
    const [form, setForm] = useState({
        username: '',
        password: '',
        fullName: '',
        studentNumber: '',
        jobNumber: '',
        inviteCode: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await request.post('/users/register', {
                ...form,
                role
            });
            alert('注册成功，请登录');
            navigate('/login');
        } catch (err: any) {
            alert(err.message || '注册失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 max-w-md w-full mx-auto mt-10">
            <h2 className="text-2xl font-bold text-center mb-6 text-slate-800">注册新账号</h2>

            {/* Context Switch */}
            <div className="flex mb-6 border-b border-slate-200">
                <button
                    className={`flex-1 py-2 text-sm font-medium border-b-2 ${role === 'student' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    onClick={() => setRole('student')}
                >
                    我是学生
                </button>
                <button
                    className={`flex-1 py-2 text-sm font-medium border-b-2 ${role === 'teacher' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    onClick={() => setRole('teacher')}
                >
                    我是老师
                </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Common Fields */}
                <div>
                    <label className="block text-sm font-medium text-slate-700">用户名 (登录账号)</label>
                    <input
                        type="text"
                        required
                        value={form.username}
                        onChange={e => setForm({ ...form, username: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">密码</label>
                    <input
                        type="password"
                        required
                        value={form.password}
                        onChange={e => setForm({ ...form, password: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">真实姓名</label>
                    <input
                        type="text"
                        required
                        value={form.fullName}
                        onChange={e => setForm({ ...form, fullName: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                        placeholder="请输入您的真实姓名"
                    />
                </div>

                {/* Role Specific Fields */}
                {role === 'student' ? (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">学号</label>
                            <input
                                type="text"
                                required
                                value={form.studentNumber}
                                onChange={e => setForm({ ...form, studentNumber: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                                placeholder="请输入学号"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">班级邀请码</label>
                            <input
                                type="text"
                                required
                                value={form.inviteCode}
                                onChange={e => setForm({ ...form, inviteCode: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                                placeholder="需向老师获取 (6位数字)"
                            />
                        </div>
                    </>
                ) : (
                    <div>
                        <label className="block text-sm font-medium text-slate-700">工号</label>
                        <input
                            type="text"
                            required
                            value={form.jobNumber}
                            onChange={e => setForm({ ...form, jobNumber: e.target.value })}
                            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                            placeholder="请输入教职工号"
                        />
                    </div>
                )}

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-slate-400"
                    >
                        {loading ? '注册中...' : '注册并登录'}
                    </button>
                </div>

                <div className="text-sm text-center">
                    <span
                        onClick={() => navigate('/login')}
                        className="font-medium text-primary hover:text-blue-500 cursor-pointer"
                    >
                        已有账号？去登录
                    </span>
                </div>
            </form>
        </div>
    );
};
