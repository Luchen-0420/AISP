import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { trainingService } from '../../services/training.service';
import { OPQRST_ITEMS } from '../../utils/opqrst';

interface ReplayMessage {
    id: string;
    role: 'doctor' | 'patient' | 'system';
    content: string;
    timestamp: number;
    scoreChange?: Record<string, number>; // 本轮得分变化
}

export const TrainingReplayPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedMsgIndex, setSelectedMsgIndex] = useState<number | null>(null);

    useEffect(() => {
        loadSession();
    }, [id]);

    const loadSession = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const data = await trainingService.getSessionById(id);
            setSession((data as any).data || data);
        } catch (error) {
            console.error("Failed to load session", error);
        } finally {
            setLoading(false);
        }
    };

    const messages: ReplayMessage[] = session?.session_data?.messages || [];
    const finalScore = session?.final_score || {};
    const aiFeedback = session?.ai_feedback || null;
    const opqrstCoverage = session?.opqrst_coverage || { covered: [], percentage: 0 };

    const getRoleName = (role: string) => {
        switch (role) {
            case 'doctor': return '医学生';
            case 'patient': return '患者';
            case 'system': return '系统';
            default: return role;
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'doctor': return 'bg-blue-100 text-blue-800';
            case 'patient': return 'bg-green-100 text-green-800';
            case 'system': return 'bg-slate-100 text-slate-600';
            default: return 'bg-slate-100';
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8 text-center text-slate-500">
                加载中...
            </div>
        );
    }

    if (!session) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8 text-center text-slate-500">
                <p className="mb-4">未找到训练记录</p>
                <Button onClick={() => navigate('/student/history')}>返回历史记录</Button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">训练回放</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {session.variant_name || '未知病例'} |
                        {session.disease_name && ` ${session.disease_name} |`}
                        {new Date(session.created_at).toLocaleString('zh-CN')}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate('/student/history')}>
                        返回列表
                    </Button>
                    <Button onClick={() => navigate(`/student/training/${session.variant_id}/result`, {
                        state: { resultData: finalScore }
                    })}>
                        查看评分报告
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 对话记录 */}
                <div className="lg:col-span-2">
                    <Card>
                        <div className="p-4 border-b border-slate-200">
                            <h2 className="font-medium text-slate-900">对话记录 ({messages.length} 条)</h2>
                        </div>
                        <div className="p-4 max-h-[600px] overflow-y-auto space-y-4">
                            {messages.length === 0 ? (
                                <p className="text-slate-400 text-center py-8">暂无对话记录</p>
                            ) : (
                                messages.map((msg, index) => (
                                    <div
                                        key={msg.id || index}
                                        className={`p-3 rounded-lg cursor-pointer transition-all ${selectedMsgIndex === index
                                            ? 'ring-2 ring-blue-500'
                                            : 'hover:bg-slate-50'
                                            } ${getRoleColor(msg.role)}`}
                                        onClick={() => setSelectedMsgIndex(index)}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-medium">
                                                {getRoleName(msg.role)}
                                            </span>
                                            <span className="text-xs opacity-60">
                                                #{index + 1}
                                            </span>
                                        </div>
                                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                        {msg.scoreChange && Object.keys(msg.scoreChange).length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {Object.entries(msg.scoreChange).map(([key, val]) => (
                                                    <Badge key={key} variant="success" className="text-xs">
                                                        +{val} {key}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>

                {/* 侧边栏：评分与反馈 */}
                <div className="space-y-6">
                    {/* 最终得分 */}
                    <Card>
                        <div className="p-4 border-b border-slate-200">
                            <h2 className="font-medium text-slate-900">最终得分</h2>
                        </div>
                        <div className="p-4">
                            <div className="text-center mb-4">
                                <span className="text-4xl font-bold text-blue-600">
                                    {finalScore.total || '-'}
                                </span>
                                <span className="text-slate-500">/100</span>
                            </div>
                            <div className="space-y-2">
                                {Object.entries(finalScore).filter(([k]) => k !== 'total').map(([key, val]) => (
                                    <div key={key} className="flex justify-between text-sm">
                                        <span className="text-slate-600">{getScoreLabel(key)}</span>
                                        <span className="font-medium">{val as number}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>

                    {/* OPQRST 覆盖率 */}
                    <Card>
                        <div className="p-4 border-b border-slate-200">
                            <div className="flex justify-between items-center">
                                <h2 className="font-medium text-slate-900">问诊覆盖率</h2>
                                <Badge variant={opqrstCoverage.percentage >= 80 ? 'success' : opqrstCoverage.percentage >= 50 ? 'warning' : 'error'}>
                                    {opqrstCoverage.percentage}%
                                </Badge>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex gap-1 mb-3">
                                {OPQRST_ITEMS.map(item => {
                                    const isCovered = opqrstCoverage.covered?.includes(item.key);
                                    return (
                                        <div
                                            key={item.key}
                                            className={`flex-1 flex flex-col items-center p-2 rounded transition-all ${isCovered
                                                ? 'bg-green-100 text-green-700 border border-green-300'
                                                : 'bg-slate-100 text-slate-400 border border-slate-200'
                                                }`}
                                            title={item.fullName}
                                        >
                                            <span className="text-sm font-bold">{item.key}</span>
                                            <span className="text-[10px]">
                                                {isCovered ? '✓' : '○'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                                    style={{ width: `${opqrstCoverage.percentage}%` }}
                                />
                            </div>
                        </div>
                    </Card>

                    {/* AI 点评 */}
                    {aiFeedback && (
                        <Card>
                            <div className="p-4 border-b border-slate-200">
                                <h2 className="font-medium text-slate-900">AI 智能点评</h2>
                            </div>
                            <div className="p-4 space-y-3 text-sm">
                                {aiFeedback.highlights && (
                                    <div>
                                        <p className="font-medium text-green-700 mb-1">✅ 亮点</p>
                                        <p className="text-slate-600">{aiFeedback.highlights}</p>
                                    </div>
                                )}
                                {aiFeedback.improvements && (
                                    <div>
                                        <p className="font-medium text-orange-700 mb-1">⚠️ 待改进</p>
                                        <p className="text-slate-600">{aiFeedback.improvements}</p>
                                    </div>
                                )}
                                {aiFeedback.resources && aiFeedback.resources.length > 0 && (
                                    <div>
                                        <p className="font-medium text-blue-700 mb-2">📚 推荐学习资源</p>
                                        <div className="space-y-2">
                                            {aiFeedback.resources.map((r: any, i: number) => {
                                                // Handle both string and object formats
                                                const isObject = typeof r === 'object';
                                                const title = isObject ? r.title : r;
                                                const type = isObject ? r.type : 'textbook';
                                                const reason = isObject ? r.reason : null;

                                                const typeIcons: Record<string, string> = {
                                                    textbook: '📖',
                                                    guideline: '📋',
                                                    video: '🎬',
                                                    case: '🏥'
                                                };
                                                const typeLabels: Record<string, string> = {
                                                    textbook: '教材',
                                                    guideline: '指南',
                                                    video: '视频',
                                                    case: '病例'
                                                };

                                                return (
                                                    <div key={i} className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                                                        <div className="flex items-start gap-2">
                                                            <span className="text-lg">{typeIcons[type] || '📄'}</span>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium text-slate-800">{title}</span>
                                                                    <span className="text-xs bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded">
                                                                        {typeLabels[type] || type}
                                                                    </span>
                                                                </div>
                                                                {reason && (
                                                                    <p className="text-xs text-slate-500 mt-1">{reason}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

// 评分维度中文映射
const getScoreLabel = (key: string): string => {
    const labels: Record<string, string> = {
        history: '病史采集',
        relevance: '相关性',
        logic: '临床逻辑',
        empathy: '人文关怀',
        safety: '危险排查',
        plan: '诊疗方案'
    };
    return labels[key] || key;
};
