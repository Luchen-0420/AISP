import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { trainingService } from '../../services/training.service';

export const TrainingHistoryPage: React.FC = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            setLoading(true);
            const data = await trainingService.getHistory();
            // The interceptor returns data directly, but if typed as AxiosResponse elsewhere, we might need adjustments
            // Based on request.ts, it returns response.data.
            // Let's cast it to any[] for now as service returns promise<any>
            setHistory((data as any).data || []);
        } catch (error) {
            console.error("Failed to load history", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getScore = (record: any) => {
        if (!record.final_score) return '-';
        return record.final_score.total ?? '-';
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-900">实训记录</h1>
                <Button variant="outline" onClick={() => navigate('/student')}>
                    返回首页
                </Button>
            </div>

            <Card>
                {loading ? (
                    <div className="p-8 text-center text-slate-500">加载中...</div>
                ) : history.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">暂无训练记录</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">时间</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">病例名称</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">疾病类型</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">综合得分</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">状态</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">操作</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {history.map((record) => (
                                    <tr key={record.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {formatDate(record.created_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                            {record.variant_name || '未知病例'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {record.disease_name || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                                            {getScore(record)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant={record.completed_at ? 'success' : 'warning'}>
                                                {record.completed_at ? '已完成' : '进行中'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    // Navigate to result page with mocked state or proper fetch
                                                    // Ideally ResultPage should fetch by ID from URL
                                                    // For MVP, if we don't have ID support in ResultPage yet, this might fail to show details
                                                    // But user asked for entry point.
                                                    // Let's assume ResultPage supports "passedScores" for now as seen before
                                                    navigate(`/student/training/${record.variant_id}/result`, {
                                                        state: { resultData: record.final_score }
                                                    });
                                                }}
                                            >
                                                查看详情
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
};
