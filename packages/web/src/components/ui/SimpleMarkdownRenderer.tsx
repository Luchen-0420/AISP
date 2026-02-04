import React from 'react';

interface SimpleMarkdownRendererProps {
    content: string;
    className?: string;
}

export const SimpleMarkdownRenderer: React.FC<SimpleMarkdownRendererProps> = ({ content, className = '' }) => {
    if (!content) return null;

    // Split by newlines to handle paragraphs/lines
    const lines = content.split('\n');

    return (
        <div className={`text-sm text-slate-700 leading-relaxed ${className}`}>
            {lines.map((line, index) => {
                // Check for empty lines (paragraph breaks)
                if (!line.trim()) {
                    return <div key={index} className="h-2" />;
                }

                // Parse bold syntax: **text**
                const parts = line.split(/(\*\*.*?\*\*)/g);

                return (
                    <div key={index} className="mb-1">
                        {parts.map((part, i) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                                return <strong key={i} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
                            }
                            return <span key={i}>{part}</span>;
                        })}
                    </div>
                );
            })}
        </div>
    );
};
