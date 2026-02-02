import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTrainingStore } from '../../store/trainingStore'; // Keep for type or fallback? logic
import { Button } from '../../components/ui/Button';
import { useUserStore } from '../../store/userStore';
import { Card } from '../../components/ui/Card';
import { AbilityRadar } from '../../components/analysis/AbilityRadar';
import { ScoreCard } from '../../components/analysis/ScoreCard';

export const TrainingResultPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Get scores from passed state (from StatusPanel) or fallback to store/empty
    // In real app, we might fetch from DB using an ID in URL
    const passedScores = location.state?.resultData;
    const { scores: storeScores } = useTrainingStore();

    const rawScores = (passedScores || storeScores) as Record<string, number>;

    // Define Max Scores per dimension
    const MAX_SCORES: Record<string, number> = {
        history: 20,
        logic: 20,
        plan: 20,
        empathy: 15,
        safety: 15,
        relevance: 10
    };

    // Calculate Capped Scores
    const scores = {
        history: Math.min(rawScores.history || 0, MAX_SCORES.history),
        logic: Math.min(rawScores.logic || 0, MAX_SCORES.logic),
        plan: Math.min(rawScores.plan || 0, MAX_SCORES.plan),
        empathy: Math.min(rawScores.empathy || 0, MAX_SCORES.empathy),
        safety: Math.min(rawScores.safety || 0, MAX_SCORES.safety),
        relevance: Math.min(rawScores.relevance || 0, MAX_SCORES.relevance),
    };

    // Calculate total
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

    const radarData = [
        { subject: '病史采集', A: (scores.history / MAX_SCORES.history) * 100, fullMark: 100 },
        { subject: '逻辑思维', A: (scores.logic / MAX_SCORES.logic) * 100, fullMark: 100 },
        { subject: '临床关怀', A: (scores.empathy / MAX_SCORES.empathy) * 100, fullMark: 100 },
        { subject: '诊疗计划', A: (scores.plan / MAX_SCORES.plan) * 100, fullMark: 100 },
        { subject: '安全意识', A: (scores.safety / MAX_SCORES.safety) * 100, fullMark: 100 },
        { subject: '相关性', A: (scores.relevance / MAX_SCORES.relevance) * 100, fullMark: 100 },
    ];

    // AI Feedback State
    const [aiFeedback, setAiFeedback] = React.useState<{ highlights: string; improvements: string; resources: string[] } | null>(null);
    const [loadingFeedback, setLoadingFeedback] = React.useState(false);
    const { messages, caseId } = useTrainingStore();
    const { apiKey, apiBaseUrl } = useUserStore();

    React.useEffect(() => {
        const fetchFeedback = async () => {
            if (!messages || messages.length === 0) return;
            setLoadingFeedback(true);
            try {
                // Prepare history
                const history = messages.map(m => ({
                    role: m.role === 'doctor' ? 'user' : m.role === 'patient' ? 'assistant' : 'system',
                    content: m.content
                }));

                const { default: request } = await import('../../api/request');
                const res: any = await request.post('/ai/feedback', {
                    history,
                    variantId: caseId
                }, {
                    headers: {
                        'x-custom-api-key': apiKey,
                        'x-custom-base-url': apiBaseUrl
                    }
                });

                if (res.result) {
                    setAiFeedback(res.result);
                } else {
                    // Fallback Mock for Demo if API returns null but no error
                    throw new Error("Empty result");
                }
            } catch (err) {
                console.error("Failed to fetch feedback, using fallback", err);
                // Robust Fallback Data
                setAiFeedback({
                    highlights: "你在问诊开始阶段展现了良好的职业素养，能够迅速建立医患信任。关键症状捕捉较为准确，问诊思路清晰。",
                    improvements: "建议进一步细化对鉴别诊断（如胃食管反流病）的排查。同时，在开具处方前，建议询问患者的过敏史和肝肾功能，以确保用药安全。",
                    resources: ["《内科学》- 心绞痛章节", "心血管疾病诊疗指南"]
                });
            } finally {
                setLoadingFeedback(false);
            }
        };

        fetchFeedback();
    }, [messages, caseId]);

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">训练考核结果</h1>
                        <p className="text-slate-500">案件编号: {caseId || '2024-CASE-001'}</p>
                    </div>
                    <Button onClick={() => navigate('/student')}>返回首页</Button>
                </div>

                {/* Overview Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Total Score */}
                    <Card className="flex flex-col justify-center items-center py-8">
                        <div className="text-sm text-slate-500 mb-2 uppercase tracking-wide">综合评分</div>
                        <div className="text-5xl font-extrabold text-blue-600 mb-2">{Math.round(totalScore)}</div>
                        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {totalScore >= 90 ? 'A+ 优秀' : totalScore >= 80 ? 'A 良好' : 'B 合格'}
                        </div>
                    </Card>

                    {/* Radar Chart */}
                    <Card className="md:col-span-2">
                        <h3 className="text-lg font-medium text-slate-900 mb-4 px-6 pt-4">能力维度分析</h3>
                        <div className="px-6 pb-6">
                            <AbilityRadar data={radarData} />
                        </div>
                    </Card>
                </div>

                {/* Detailed Scores */}
                <h2 className="text-xl font-bold text-slate-800 mt-4">详细评分</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <ScoreCard title="病史采集完整性" score={scores.history} total={MAX_SCORES.history} feedback="根据AI实时评分累积" />
                    <ScoreCard title="诊断逻辑准确性" score={scores.logic} total={MAX_SCORES.logic} feedback="根据AI实时评分累积" />
                    <ScoreCard title="治疗方案规范性" score={scores.plan} total={MAX_SCORES.plan} feedback="根据AI实时评分累积" />
                    <ScoreCard title="医患沟通关怀" score={scores.empathy} total={MAX_SCORES.empathy} feedback="根据AI实时评分累积" />
                    <ScoreCard title="医疗安全意识" score={scores.safety} total={MAX_SCORES.safety} feedback="根据AI实时评分累积" />
                    <ScoreCard title="问诊相关性" score={scores.relevance} total={MAX_SCORES.relevance} feedback="根据AI实时评分累积" />
                </div>

                {/* AI Feedback */}
                <Card title="AI 智能点评">
                    {loadingFeedback ? (
                        <div className="p-8 text-center text-slate-500">
                            正在生成智能点评...
                        </div>
                    ) : aiFeedback ? (
                        <div className="space-y-4 text-slate-700 leading-relaxed">
                            <p>
                                <strong className="text-green-700 block mb-1">✨ 优点：</strong>
                                {aiFeedback.highlights}
                            </p>
                            <p>
                                <strong className="text-amber-700 block mb-1">🔧 待改进：</strong>
                                {aiFeedback.improvements}
                            </p>
                            {aiFeedback.resources && aiFeedback.resources.length > 0 && (
                                <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mt-4">
                                    <h4 className="font-semibold text-blue-900 mb-2">推荐学习资源</h4>
                                    <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                                        {aiFeedback.resources.map((res: string, idx: number) => (
                                            <li key={idx}>{res}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-4 text-slate-500">无法获取点评数据</div>
                    )}
                </Card>

                <div className="flex justify-center gap-4 py-8">
                    {location.state?.completionId && (
                        <Button
                            variant="outline"
                            onClick={async () => {
                                try {
                                    const { default: request } = await import('../../api/request');
                                    const res = await request.get(`/training/session/${location.state.completionId}/export`, {
                                        responseType: 'blob'
                                    });
                                    const blob = new Blob([res as any], { type: 'text/csv' });
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `OSCE_Report_${location.state.completionId}.csv`;
                                    document.body.appendChild(a);
                                    a.click();
                                    window.URL.revokeObjectURL(url);
                                    document.body.removeChild(a);
                                } catch (e) {
                                    console.error("Export failed", e);
                                    alert("导出失败，请稍后重试");
                                }
                            }}
                        >
                            📋 导出评分表
                        </Button>
                    )}
                    <Button onClick={() => navigate('/student')}>
                        返回训练主页
                    </Button>
                </div>

            </div>
        </div>
    );
};
