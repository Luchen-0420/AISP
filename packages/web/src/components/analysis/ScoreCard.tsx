import React from 'react';
import { Card } from '../ui/Card';

interface ScoreCardProps {
    title: string;
    score: number;
    total: number;
    feedback?: string;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ title, score, total, feedback }) => {
    const percentage = Math.round((score / total) * 100);

    let colorClass = 'text-green-600';
    if (percentage < 60) colorClass = 'text-red-600';
    else if (percentage < 80) colorClass = 'text-yellow-600';

    return (
        <Card className="h-full">
            <div className="flex justify-between items-baseline mb-2">
                <h4 className="text-slate-600 font-medium">{title}</h4>
                <span className={`text-2xl font-bold ${colorClass}`}>{score} <span className="text-sm text-slate-400 font-normal">/ {total}</span></span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mb-3">
                <div
                    className={`h-2 rounded-full ${percentage < 60 ? 'bg-red-500' : percentage < 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
            {feedback && (
                <p className="text-sm text-slate-500 italic mt-2">
                    "{feedback}"
                </p>
            )}
        </Card>
    );
}
