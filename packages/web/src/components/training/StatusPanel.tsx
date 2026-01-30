import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrainingStore } from '../../store/trainingStore';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const StatusPanel: React.FC = () => {
    const navigate = useNavigate();
    // const { id } = useParams();
    const { startTime, turnCount, scores, status, currentVariant } = useTrainingStore();
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        if (status !== 'running' || !startTime) return;
        const interval = setInterval(() => {
            setElapsed(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, [status, startTime]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    return (
        <div className="space-y-4 h-full">
            <Card className="bg-slate-800 text-white border-none">
                <div className="flex flex-col items-center py-2">
                    <span className="text-xs text-slate-400 uppercase tracking-wider">训练时长</span>
                    <span className="text-3xl font-mono font-bold mt-1 text-blue-400">
                        {formatTime(elapsed)}
                    </span>
                    <Badge variant={status === 'running' ? 'success' : 'warning'} className="mt-2">
                        {status === 'running' ? '进行中' : '暂停/未开始'}
                    </Badge>
                </div>
            </Card>

            <Card title="当前状态">
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-600 text-sm">当前回合</span>
                        <span className="font-bold text-slate-900">{turnCount} / 30</span>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3">实时评分维度</h4>
                        <div className="space-y-3">
                            {Object.entries(scores).map(([key, value]) => {
                                const labels: Record<string, string> = {
                                    history: '病史采集',
                                    relevance: '提问相关性',
                                    logic: '临床逻辑',
                                    empathy: '人文关怀',
                                    safety: '危险排查',
                                    plan: '诊疗方案'
                                };
                                return (
                                    <div key={key}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-slate-600">{labels[key] || key}</span>
                                            <span className="font-medium">{value}</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                                            <div
                                                className="bg-primary h-1.5 rounded-full transition-all duration-500"
                                                style={{ width: `${Math.min(value, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </Card>

            <Card title="病历概览">
                <div className="text-sm text-slate-600 mb-4">
                    <p>
                        <span className="font-medium text-slate-900">姓名:</span>{' '}
                        {currentVariant?.patient_info?.name || currentVariant?.name || '加载中...'}
                    </p>
                    <p>
                        <span className="font-medium text-slate-900">年龄:</span>{' '}
                        {currentVariant?.patient_info?.age || currentVariant?.age || '--'}岁
                    </p>
                    <p>
                        <span className="font-medium text-slate-900">主诉:</span>{' '}
                        {currentVariant?.medical_info?.chief_complaint || currentVariant?.chief_complaint || '--'}
                    </p>
                </div>

                <Button
                    className="w-full"
                    variant="primary"
                    onClick={async () => {
                        if (window.confirm('确定结束本次问诊训练吗？')) {
                            // Collect data
                            const state = useTrainingStore.getState();

                            // To be safe, we might want to check if data is ready, but for now just submit
                            try {
                                await import('../../services/training.service').then(async ({ trainingService }) => {
                                    await trainingService.submitSession({
                                        variantId: state.caseId || '', // In this context caseId is actually holding the ID passed to startSession
                                        sessionId: state.sessionId || '',
                                        scores: state.scores,
                                        soapData: state.soapData,
                                        history: [], // We might need to store history in store to pass it here, or ChatInterface needs to sync it. 
                                        // For MVP Phase 9, let's omit history or assume store tracks it? 
                                        // Wait, store doesn't track proper chat history yet, only turn count.
                                        // Let's rely on what we have. Chat history is currently local in ChatInterface.
                                        // To solve this properly, ChatInterface should probably update store or we just submit scores for now.
                                        // Let's submit scores first.

                                    });

                                    state.endSession();
                                    navigate('result', { state: { resultData: state.scores } }); // Pass scores to result page locally for now, real DB fetch can happen too
                                });
                            } catch (e) {
                                console.error("Submission failed", e);
                                alert("Failed to save session");
                            }
                        }
                    }}
                >
                    结束诊疗
                </Button>
            </Card>
        </div>
    );
};
