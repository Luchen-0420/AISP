import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, footer }) => {
    return (
        <div className={`bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden ${className}`}>
            {title && (
                <div className="px-6 py-4 border-b border-slate-200">
                    <h3 className="text-lg font-medium text-slate-900">{title}</h3>
                </div>
            )}
            <div className="px-6 py-4">
                {children}
            </div>
            {footer && (
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                    {footer}
                </div>
            )}
        </div>
    );
};
