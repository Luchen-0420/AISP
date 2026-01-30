import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { classService } from '../../services/class.service';

// Mock Data Removed

import { CreateClassModal } from '../../components/teacher/CreateClassModal';

export const ClassList: React.FC = () => {
    const navigate = useNavigate();
    const [classes, setClasses] = useState<any[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const fetchClasses = async () => {
        try {
            const data = await classService.getClasses();
            setClasses(data);
        } catch (error) {
            console.error('Failed to fetch classes:', error);
        }
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    const handleCreateClass = async (data: { name: string; description: string }) => {
        await classService.createClass(data);
        fetchClasses();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">班级管理</h1>
                <Button onClick={() => setIsCreateModalOpen(true)}>+ 创建班级</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map((cls) => (
                    <div
                        key={cls.id}
                        className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative group"
                    >
                        <div
                            className="cursor-pointer"
                            onClick={() => navigate(`/teacher/classes/${cls.id}`)}
                        >
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">{cls.name}</h3>
                            <div className="mb-3 text-sm">
                                <span className="bg-blue-100 text-blue-800 py-1 px-2 rounded font-mono">
                                    邀请码: {cls.invite_code || '无'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-slate-500">
                                <span>{cls.studentCount} 名学生</span>
                                <span>{cls.createdAt ? new Date(cls.createdAt).toLocaleDateString() : '刚刚'}</span>
                            </div>
                        </div>

                        {/* Delete Button - Visible on Hover */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('确定要删除这个班级吗？此操作不可逆。')) {
                                    classService.deleteClass(cls.id).then(fetchClasses);
                                }
                            }}
                            className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                            title="删除班级"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>

            <CreateClassModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateClass}
            />
        </div>
    );
};
