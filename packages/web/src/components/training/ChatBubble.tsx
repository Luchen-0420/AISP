import React from 'react';

export interface Message {
    id: string;
    role: 'doctor' | 'patient' | 'system';
    content: string;
    timestamp: number;
}

export const ChatBubble: React.FC<{ message: Message }> = ({ message }) => {
    const isDoctor = message.role === 'doctor';
    const isSystem = message.role === 'system';

    if (isSystem) {
        return (
            <div className="flex justify-center my-4">
                <span className="bg-slate-100 text-slate-500 text-xs px-3 py-1 rounded-full">
                    {message.content}
                </span>
            </div>
        );
    }

    return (
        <div className={`flex w-full mb-4 ${isDoctor ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[80%] ${isDoctor ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${isDoctor ? 'bg-blue-100 text-blue-600 ml-2' : 'bg-emerald-100 text-emerald-600 mr-2'
                    }`}>
                    {isDoctor ? '医' : '患'}
                </div>

                {/* Bubble */}
                <div className={`px-4 py-2 rounded-lg text-sm shadow-sm ${isDoctor
                        ? 'bg-primary text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                    }`}>
                    {message.content}
                </div>
            </div>
        </div>
    );
};
