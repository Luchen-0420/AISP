import React from 'react';
import { Card } from '../../components/ui/Card';

export const TeacherDashboard: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">教学概览</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <p className="text-sm font-medium text-slate-500">总班级数</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">3</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <p className="text-sm font-medium text-slate-500">学生总数</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">128</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <p className="text-sm font-medium text-slate-500">今日活跃</p>
                    <p className="mt-2 text-3xl font-bold text-green-600">45</p>
                </div>
            </div>

            {/* Recent Activity */}
            <Card title="近期教学动态">
                <div className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                        <div className="flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            <span className="text-sm text-slate-700">2023级临床医学1班 完成了 "2型糖尿病初诊" 训练</span>
                        </div>
                        <span className="text-xs text-slate-500">10分钟前</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                        <div className="flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <span className="text-sm text-slate-700">新病例 "急性阑尾炎" 已发布</span>
                        </div>
                        <span className="text-xs text-slate-500">1小时前</span>
                    </div>
                </div>
            </Card>
        </div>
    );
};
