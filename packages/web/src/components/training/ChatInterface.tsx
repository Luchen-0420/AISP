import React, { useState, useRef, useEffect } from 'react';
import { ChatBubble, Message } from './ChatBubble';
import { Button } from '../ui/Button';
import request from '../../api/request';
import { useUserStore } from '../../store/userStore';
import { useTrainingStore } from '../../store/trainingStore';

export const ChatInterface: React.FC = () => {
    const { apiKey, apiBaseUrl } = useUserStore();
    const { caseId, messages, addMessage } = useTrainingStore();

    // Remove local messages state
    // const [messages, setMessages] = useState<Message[]>...

    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!inputValue.trim() || loading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'doctor',
            content: inputValue,
            timestamp: Date.now()
        };

        addMessage(userMsg);
        setInputValue('');
        setLoading(true);

        try {
            // Prepare history for context
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

            // Real-time Analysis (Fire and Forget)
            analyzeDialogue(userMsg.content);

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

            // Call analysis API
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
                // Update scores in store
                Object.entries(res.result.scores).forEach(([key, val]) => {
                    const score = val as number;
                    // Accumulate score if positive, up to 100 max per dimension for MVP logic ?
                    // Or logic: If AI returns 1, we add 5 points.
                    if (score > 0) {
                        const currentScores = useTrainingStore.getState().scores;
                        // @ts-ignore
                        const currentVal = currentScores[key] || 0;
                        updateScore(key, Math.min(currentVal + 10, 100)); // Add 10 points per hit
                    }
                });
                console.log("Analysis Result:", res.result);
            }
        } catch (e) {
            console.error("Analysis failed", e);
        }
    }

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4">
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

            {/* Input Area */}
            <div className="bg-white px-4 py-4 border-t border-slate-200">
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
                    <Button onClick={handleSend} isLoading={loading}>发送</Button>
                </div>
                <div className="mt-2 flex gap-2 text-xs text-slate-500">
                    <span>💡 提示：试着询问 "症状持续多久了？"</span>
                </div>
            </div>
        </div>
    );
};
