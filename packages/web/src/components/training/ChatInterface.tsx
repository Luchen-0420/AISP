import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChatBubble, Message } from './ChatBubble';
import { Button } from '../ui/Button';
import request from '../../api/request';
import { useUserStore } from '../../store/userStore';
import { useTrainingStore, EmotionType } from '../../store/trainingStore';
import { OPQRST_ITEMS, detectOPQRSTCoverage } from '../../utils/opqrst';

// 其他常用问句
const OTHER_QUESTIONS = [
    { label: '既往史', question: '请问您以前有什么疾病吗？比如高血压、糖尿病？', key: 'past' },
    { label: '过敏史', question: '您有对什么药物或食物过敏吗？', key: 'allergy' },
    { label: '用药史', question: '最近有在吃什么药物吗？', key: 'medication' },
    { label: '家族史', question: '您的家人中有类似的疾病吗？', key: 'family' },
];

// ============ 动态提示生成 ============
// ============ 动态提示生成 ============
const getHintByStage = (messageCount: number, coveredItems: string[]): string => {
    // 符合“问了再说”原则，不主动提供具体问题或诊断方向
    if (messageCount === 0) {
        return '💡 请开始问诊，首先询问患者的主诉';
    }

    // 检查 OPQRST 覆盖情况，仅做笼统提示
    const isCoverageComplete = OPQRST_ITEMS.every(item => coveredItems.includes(item.key));

    if (!isCoverageComplete) {
        return '💡 请继续完善病史采集，注意涵盖 OPQRST 各个维度';
    }

    return '💡 病史采集已基本完成，请根据收集到的信息进行初步诊断';
};

export const ChatInterface: React.FC = () => {
    const { apiKey, apiBaseUrl } = useUserStore();
    const { caseId, messages, addMessage, patientMood, updateMood, incrementTurn } = useTrainingStore();

    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [showQuickPanel, setShowQuickPanel] = useState(true);
    const [showCoverage, setShowCoverage] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    // OPQRST 覆盖率追踪 (using shared utility)
    const coverage = useMemo(() => detectOPQRSTCoverage(messages), [messages]);
    const coveredItems = coverage.covered;
    const coveragePercent = coverage.percentage;

    // 动态提示
    const currentHint = useMemo(() => getHintByStage(messages.length, coveredItems), [messages.length, coveredItems]);

    // 快捷发送
    const handleQuickSend = (question: string) => {
        setInputValue(question);
        setTimeout(() => {
            const btn = document.getElementById('send-btn');
            btn?.click();
        }, 50);
    };

    const handleSend = async () => {
        if (!inputValue.trim() || loading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'doctor',
            content: inputValue,
            timestamp: Date.now()
        };

        addMessage(userMsg);
        incrementTurn(); // 增加回合数
        setInputValue('');
        setLoading(true);

        try {
            const history = messages.map(m => ({
                role: m.role === 'doctor' ? 'user' : m.role === 'patient' ? 'assistant' : 'system',
                content: m.content
            }));

            const res: any = await request.post('/ai/chat', {
                message: userMsg.content,
                history,
                variantId: caseId
            }, {
                headers: {
                    'x-custom-api-key': apiKey,
                    'x-custom-base-url': apiBaseUrl
                }
            });

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'patient',
                content: res.response || '（患者沉默了...）',
                timestamp: Date.now()
            };
            addMessage(aiMsg);

            // Analyze dialogue for scoring
            analyzeDialogue(userMsg.content);

            // Analyze mood impact (async, non-blocking)
            analyzeMoodImpact(userMsg.content);

        } catch (error: any) {
            console.error(error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'system',
                content: `Error: ${error.message || 'AI响应失败'}`,
                timestamp: Date.now()
            };
            addMessage(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const analyzeDialogue = async (message: string) => {
        try {
            const { updateScore } = useTrainingStore.getState();

            const res: any = await request.post('/ai/analyze', {
                message,
                variantId: caseId
            }, {
                headers: {
                    'x-custom-api-key': apiKey,
                    'x-custom-base-url': apiBaseUrl
                }
            });

            if (res.result && res.result.scores) {
                Object.entries(res.result.scores).forEach(([key, val]) => {
                    const score = val as number;
                    if (score > 0) {
                        const currentScores = useTrainingStore.getState().scores;
                        // @ts-ignore
                        const currentVal = currentScores[key] || 0;
                        updateScore(key, Math.min(currentVal + 10, 100));
                    }
                });
                console.log("Analysis Result:", res.result);
            }
        } catch (e) {
            console.error("Analysis failed", e);
        }
    };

    // Analyze mood impact of doctor's message
    const analyzeMoodImpact = async (message: string) => {
        try {
            const res: any = await request.post('/ai/mood', {
                message,
                currentMood: {
                    emotion: patientMood.emotion,
                    trust: patientMood.trust,
                    comfort: patientMood.comfort
                }
            }, {
                headers: {
                    'x-custom-api-key': apiKey,
                    'x-custom-base-url': apiBaseUrl
                }
            });

            if (res.success && res.data) {
                const { emotion, trustDelta, comfortDelta, reason } = res.data;
                const newTrust = Math.max(0, Math.min(100, patientMood.trust + (trustDelta || 0)));
                const newComfort = Math.max(0, Math.min(100, patientMood.comfort + (comfortDelta || 0)));

                updateMood({
                    emotion: emotion as EmotionType,
                    trust: newTrust,
                    comfort: newComfort,
                    lastChange: trustDelta !== 0 || comfortDelta !== 0 ? {
                        dimension: Math.abs(trustDelta || 0) >= Math.abs(comfortDelta || 0) ? 'trust' : 'comfort',
                        delta: Math.abs(trustDelta || 0) >= Math.abs(comfortDelta || 0) ? trustDelta : comfortDelta,
                        reason: reason || ''
                    } : null
                });
            }
        } catch (e) {
            console.error("Mood analysis failed", e);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Patient Mood Indicator Moved to StatusPanel */}
            {/* OPQRST Progress Bar */}
            <div className="bg-white px-4 py-3 border-b border-slate-200">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-600">📊 问诊覆盖率 (OPQRST)</span>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-600">{coveragePercent}%</span>
                        <button
                            onClick={() => setShowCoverage(!showCoverage)}
                            className="text-xs text-slate-400 hover:text-slate-600"
                        >
                            {showCoverage ? '收起' : '展开'}
                        </button>
                    </div>
                </div>

                {showCoverage && (
                    <>
                        <div className="flex gap-1">
                            {OPQRST_ITEMS.map(item => {
                                const isCovered = coveredItems.includes(item.key);
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
                                        <span className="text-[10px] mt-0.5">
                                            {isCovered ? '✓' : item.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        {/* Progress bar */}
                        <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-green-500 h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${coveragePercent}%` }}
                            />
                        </div>
                    </>
                )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4">
                {messages.length === 0 && (
                    <div className="text-center text-slate-400 mt-10">
                        <p className="text-lg mb-2">👋 患者已就位</p>
                        <p className="text-sm">请开始问诊，点击下方快捷按钮或输入问题</p>
                    </div>
                )}
                {messages.map(msg => (
                    <ChatBubble key={msg.id} message={msg} />
                ))}
                {loading && (
                    <div className="flex justify-start mb-4">
                        <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm text-slate-500 text-sm">
                            患者正在思考...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions Panel */}
            {showQuickPanel && (
                <div className="bg-slate-100 px-4 py-3 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-slate-600">⚡ 快捷问句 (OPQRST)</span>
                        <button
                            onClick={() => setShowQuickPanel(false)}
                            className="text-xs text-slate-400 hover:text-slate-600"
                        >
                            收起
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {OPQRST_ITEMS.map((item, i) => {
                            const isCovered = coveredItems.includes(item.key);
                            return (
                                <button
                                    key={i}
                                    onClick={() => handleQuickSend(item.question)}
                                    disabled={loading}
                                    className={`px-2 py-1 text-xs rounded transition-colors disabled:opacity-50 ${isCovered
                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                        }`}
                                    title={isCovered ? '已问过' : '点击发送'}
                                >
                                    {item.key} {item.fullName.split('(')[0]}
                                    {isCovered && ' ✓'}
                                </button>
                            );
                        })}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {OTHER_QUESTIONS.map((q, i) => (
                            <button
                                key={i}
                                onClick={() => handleQuickSend(q.question)}
                                disabled={loading}
                                className="px-2 py-1 text-xs bg-slate-200 text-slate-700 rounded hover:bg-slate-300 disabled:opacity-50 transition-colors"
                            >
                                {q.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="bg-white px-4 py-3 border-t border-slate-200">
                {/* Dynamic Hint */}
                <div className="mb-2 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded">
                    {currentHint}
                </div>

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        disabled={loading}
                        placeholder={loading ? "请等待回复..." : "请输入您的问题或诊断..."}
                        className="flex-1 appearance-none border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm disabled:bg-slate-100"
                    />
                    <Button id="send-btn" onClick={handleSend} isLoading={loading}>发送</Button>
                </div>

                {!showQuickPanel && (
                    <button
                        onClick={() => setShowQuickPanel(true)}
                        className="mt-2 text-xs text-blue-600 hover:underline"
                    >
                        展开快捷问句
                    </button>
                )}
            </div>
        </div>
    );
};
