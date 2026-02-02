import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import request from '../../api/request';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts';

export const ClassAnalyticsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await request.get(`/classes/${id}/analytics`);
                setAnalytics(res.data);
            } catch (error) {
                console.error('Failed to fetch analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchAnalytics();
        }
    }, [id]);

    if (loading) return <div className="p-8 text-center text-slate-500">Loading analytics...</div>;
    if (!analytics) return <div className="p-8 text-center text-slate-500">No data available</div>;

    const radarData = [
        { subject: 'OPQRST覆盖', A: analytics.averages.coverage, fullMark: 100 },
        { subject: '人文关怀', A: analytics.averages.empathy, fullMark: 100 },
        { subject: '问诊逻辑', A: analytics.averages.logic, fullMark: 100 },
        { subject: '细节捕捉', A: analytics.averages.detail, fullMark: 100 },
        { subject: '相关性', A: analytics.averages.relevance, fullMark: 100 },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="secondary" onClick={() => navigate(`/teacher/classes/${id}`)}>
                    ← 返回班级
                </Button>
                <h1 className="text-2xl font-bold text-slate-800">班级数据分析</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 综合能力雷达图 */}
                <Card title="综合能力评估 (平均分)">
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="subject" />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                <Radar
                                    name="班级平均"
                                    dataKey="A"
                                    stroke="#3b82f6"
                                    fill="#3b82f6"
                                    fillOpacity={0.6}
                                />
                                <Tooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* 常见遗漏点 */}
                <Card title="常见遗漏问诊点 (TOP 5)">
                    <div className="space-y-4">
                        {analytics.commonMissedItems && analytics.commonMissedItems.length > 0 ? (
                            analytics.commonMissedItems.map((item: string, index: number) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                                    <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-full bg-red-200 text-red-800 flex items-center justify-center text-sm font-bold">
                                            {index + 1}
                                        </span>
                                        <span className="text-slate-800 font-medium">{item}</span>
                                    </div>
                                    <span className="text-xs text-red-600 font-medium">高频遗漏</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-500 text-center py-8">暂无数据</p>
                        )}
                    </div>
                </Card>
            </div>

            {/* 总体统计 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <p className="text-sm font-medium text-slate-500">总训练人次</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">{analytics.totalSessions}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <p className="text-sm font-medium text-slate-500">平均覆盖率</p>
                    <p className={`mt-2 text-3xl font-bold ${analytics.averages.coverage >= 80 ? 'text-green-600' :
                        analytics.averages.coverage >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                        {analytics.averages.coverage}%
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <p className="text-sm font-medium text-slate-500">平均人文关怀</p>
                    <p className="mt-2 text-3xl font-bold text-blue-600">{analytics.averages.empathy}</p>
                </div>
            </div>
        </div>
    );
};
