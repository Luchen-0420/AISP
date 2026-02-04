import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrainingStore } from '../../store/trainingStore';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import request from '../../api/request';
import { useUserStore } from '../../store/userStore';
import { detectOPQRSTCoverage } from '../../utils/opqrst';
import { PatientMoodIndicator } from './PatientMoodIndicator';

export const StatusPanel: React.FC = () => {
    const navigate = useNavigate();
    const { apiKey, apiBaseUrl } = useUserStore();
    const { startTime, turnCount, scores, status, currentVariant, messages, caseId } = useTrainingStore();
    const [elapsed, setElapsed] = useState(0);
    const [extractingSOAP, setExtractingSOAP] = useState(false);

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
    };

    // AI 自动提取 SOAP
    const handleAutoFillSOAP = async () => {
        if (messages.length < 3) {
            alert('请先进行至少一轮问诊对话');
            return;
        }

        setExtractingSOAP(true);
        try {
            const res: any = await request.post('/ai/extract-soap', {
                messages: messages.map(m => ({ role: m.role, content: m.content })),
                variantId: caseId
            }, {
                headers: {
                    'x-custom-api-key': apiKey,
                    'x-custom-base-url': apiBaseUrl
                }
            });

            if (res.success && res.data) {
                const { updateDiagnosis, updatePlan } = useTrainingStore.getState();

                // Update diagnosis if extracted
                if (res.data.diagnosis) {
                    updateDiagnosis({
                        primary: res.data.diagnosis.primary || '',
                        differentials: res.data.diagnosis.differentials || [],
                        rationale: res.data.diagnosis.rationale || ''
                    });
                }

                // Update plan if extracted
                if (res.data.plan) {
                    updatePlan({
                        lifestyle: res.data.plan.lifestyle || [],
                        followUp: res.data.plan.followUp || '',
                        education: res.data.plan.education || ''
                    });
                }

                alert('✅ SOAP 信息已自动填充，请在各面板中查看和编辑');
            }
        } catch (error) {
            console.error('SOAP extraction failed', error);
            alert('AI 提取失败，请手动填写');
        } finally {
            setExtractingSOAP(false);
        }
    };

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
                        <div className="mb-4">
                            <PatientMoodIndicator />
                        </div>
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

                {/* AI Auto-fill Button */}
                <Button
                    className="w-full mb-2"
                    variant="outline"
                    onClick={handleAutoFillSOAP}
                    isLoading={extractingSOAP}
                    disabled={extractingSOAP || messages.length < 3}
                >
                    🤖 AI 自动填充 SOAP
                </Button>

                <Button
                    className="w-full"
                    variant="primary"
                    onClick={async () => {
                        if (window.confirm('确定结束本次问诊训练吗？')) {
                            const state = useTrainingStore.getState();

                            // Calculate OPQRST coverage before submit
                            const opqrstCoverage = detectOPQRSTCoverage(state.messages);

                            try {
                                await import('../../services/training.service').then(async ({ trainingService }) => {
                                    const res: any = await trainingService.submitSession({
                                        variantId: state.caseId || '',
                                        sessionId: state.sessionId || '',
                                        scores: state.scores,
                                        soapData: state.soapData,
                                        history: state.messages,
                                        opqrstCoverage // Include coverage data
                                    });

                                    state.endSession();
                                    navigate('result', {
                                        state: {
                                            resultData: state.scores,
                                            completionId: res.completionId, // Pass ID for export
                                            feedback: res.aiFeedback // Pass AI Feedback directly to avoid re-fetching
                                        }
                                    });
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
