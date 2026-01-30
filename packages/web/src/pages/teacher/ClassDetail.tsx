import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { classService, ClassData } from '../../services/class.service';

export const ClassDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [classData, setClassData] = useState<ClassData | null>(null);

    useEffect(() => {
        if (!id) return;
        const fetchDetail = async () => {
            try {
                const data = await classService.getClassDetail(id);
                setClassData(data);
            } catch (error) {
                console.error('Failed to fetch class detail:', error);
            }
        };
        fetchDetail();
    }, [id]);

    if (!classData) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/teacher/classes')}
                    className="text-slate-500 hover:text-slate-700"
                >
                    ← 返回班级列表
                </button>
                <h1 className="text-2xl font-bold text-slate-800">班级详情: {classData.name}</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Student List */}
                <div className="lg:col-span-2 space-y-6">
                    <Card title="学生名单">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead>
                                    <tr>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">姓名</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">邮箱</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">加入时间</th>
                                        <th className="px-3 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">操作</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {classData.students && classData.students.length > 0 ? (
                                        classData.students.map((student: any) => (
                                            <tr key={student.id}>
                                                <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{student.username}</td>
                                                <td className="px-3 py-4 whitespace-nowrap text-sm text-slate-500">{student.email}</td>
                                                <td className="px-3 py-4 whitespace-nowrap text-sm text-slate-500">
                                                    {new Date(student.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button className="text-blue-600 hover:text-blue-900">查看报告</button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-3 py-4 text-center text-sm text-slate-500">
                                                暂无学生
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* Class Stats / Tasks */}
                <div className="space-y-6">
                    <Card title="班级公告">
                        <p className="text-sm text-slate-600">{classData.description || '暂无说明...'}</p>
                        <Button className="w-full mt-4" variant="secondary">发布公告</Button>
                    </Card>

                    <Card title="布置作业">
                        <p className="text-sm text-slate-500 mb-4">快速向该班级发布新的问诊训练任务。</p>
                        <Button className="w-full">发布新任务</Button>
                    </Card>
                </div>
            </div>
        </div>
    );
};
