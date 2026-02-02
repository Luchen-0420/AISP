import React from 'react';
import { Card } from '../ui/Card';
import { useTrainingStore, EmotionType } from '../../store/trainingStore';

// 情绪图标映射
const EMOTION_CONFIG: Record<EmotionType, { icon: string; label: string; color: string }> = {
    calm: { icon: '😊', label: '平静', color: 'text-green-600' },
    anxious: { icon: '😰', label: '焦虑', color: 'text-yellow-600' },
    frustrated: { icon: '😤', label: '沮丧', color: 'text-orange-600' },
    relieved: { icon: '😌', label: '放松', color: 'text-blue-600' },
    angry: { icon: '😠', label: '生气', color: 'text-red-600' }
};

// 进度条颜色
const getProgressColor = (value: number): string => {
    if (value >= 80) return 'bg-green-500';
    if (value >= 60) return 'bg-blue-500';
    if (value >= 40) return 'bg-yellow-500';
    if (value >= 20) return 'bg-orange-500';
    return 'bg-red-500';
};

export const PatientMoodIndicator: React.FC = () => {
    const { patientMood } = useTrainingStore();
    const { emotion, trust, comfort, lastChange } = patientMood;

    const emotionConfig = EMOTION_CONFIG[emotion];

    return (
        <Card className="mb-4">
            <div className="p-4">
                {/* 标题与情绪图标 */}
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-700">患者状态</span>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">{emotionConfig.icon}</span>
                        <span className={`text-sm font-medium ${emotionConfig.color}`}>
                            {emotionConfig.label}
                        </span>
                    </div>
                </div>

                {/* 信任度进度条 */}
                <div className="mb-3">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>信任度</span>
                        <span className="font-medium">{trust}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(trust)}`}
                            style={{ width: `${trust}%` }}
                        />
                    </div>
                </div>

                {/* 舒适度进度条 */}
                <div className="mb-3">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>舒适度</span>
                        <span className="font-medium">{comfort}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(comfort)}`}
                            style={{ width: `${comfort}%` }}
                        />
                    </div>
                </div>

                {/* 最近变化提示 */}
                {lastChange && (
                    <div className={`text-xs p-2 rounded-md mt-2 ${lastChange.delta > 0
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                        <span className="font-medium">
                            {lastChange.delta > 0 ? '📈' : '📉'}
                            {lastChange.dimension === 'trust' ? '信任度' : '舒适度'}
                            {lastChange.delta > 0 ? '+' : ''}{lastChange.delta}
                        </span>
                        <span className="ml-1">— {lastChange.reason}</span>
                    </div>
                )}
            </div>
        </Card>
    );
};
