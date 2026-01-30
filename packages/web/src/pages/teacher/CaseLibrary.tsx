import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { caseService } from '../../services/case.service';
import { VariantGenerationModal } from '../../components/teacher/VariantGenerationModal';
import { CreateCaseModal } from '../../components/teacher/CreateCaseModal';

import { VariantDetailModal } from '../../components/teacher/VariantDetailModal';

const CaseVariantsList: React.FC<{ caseId: string }> = ({ caseId }) => {
    const [variants, setVariants] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState<any>(null);

    const fetchVariants = async () => {
        setLoading(true);
        try {
            const data = await caseService.getVariants(caseId);
            setVariants(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (expanded) {
            fetchVariants();
        }
    }, [expanded, caseId]);

    return (
        <div className="text-sm">
            <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center text-slate-500 hover:text-primary transition-colors text-xs font-medium mb-2"
            >
                {expanded ? '▼' : '▶'} 已生成变体 ({variants.length || '?'})
            </button>

            {expanded && (
                <div className="space-y-2">
                    {loading ? (
                        <p className="text-slate-400 text-xs">加载中...</p>
                    ) : variants.length === 0 ? (
                        <p className="text-slate-400 text-xs pl-4">暂无变体</p>
                    ) : (
                        variants.map(v => (
                            <div
                                key={v.id}
                                className="bg-slate-50 p-2 rounded border border-slate-100 group flex justify-between items-start hover:border-blue-200 transition-colors cursor-pointer hover:shadow-sm"
                                onClick={() => setSelectedVariant(v)}
                            >
                                <div className="min-w-0 flex-1 mr-2">
                                    <p className="text-slate-800 font-medium text-xs truncate mb-1 text-blue-600 group-hover:underline" title={v.variant_name}>
                                        {v.variant_name || '未命名变体'}
                                    </p>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                        <span className={`px-1.5 py-0.5 rounded ${v.difficulty_level === 'Hard' ? 'bg-red-50 text-red-600' :
                                            v.difficulty_level === 'Medium' ? 'bg-yellow-50 text-yellow-600' :
                                                'bg-green-50 text-green-600'
                                            }`}>
                                            {v.difficulty_level === 'Easy' ? '简单' : v.difficulty_level === 'Medium' ? '中等' : '困难'}
                                        </span>
                                        <span>{new Date(v.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm('确定要删除这个变体吗？')) {
                                            caseService.deleteVariant(v.id).then(() => fetchVariants());
                                        }
                                    }}
                                    className="text-slate-300 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                                    title="删除变体"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}

            <VariantDetailModal
                isOpen={!!selectedVariant}
                variant={selectedVariant}
                onClose={() => setSelectedVariant(null)}
            />
        </div>
    );
};

export const CaseLibrary: React.FC = () => {
    const [cases, setCases] = useState<any[]>([]);
    const [selectedCase, setSelectedCase] = useState<any>(null);
    const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const fetchCases = async () => {
        try {
            const data = await caseService.getCases();
            setCases(data);
        } catch (error) {
            console.error('Failed to fetch cases:', error);
        }
    };

    useEffect(() => {
        fetchCases();
    }, []);

    const handleOpenGeneration = (c: any) => {
        setSelectedCase(c);
        setIsVariantModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">病例库管理</h1>
                <Button onClick={() => setIsCreateModalOpen(true)}>+ 新建病例</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cases.length === 0 ? (
                    <div className="col-span-full py-12 text-center bg-slate-50 rounded-lg border border-slate-200 border-dashed">
                        <p className="text-slate-500 mb-4">暂无病例，请先创建一个标准病例模版</p>
                        <Button onClick={() => setIsCreateModalOpen(true)}>立即创建</Button>
                    </div>
                ) : (
                    cases.map((c) => (
                        <div key={c.id} className="relative bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex flex-col justify-between min-h-[14rem] h-auto group bg-gradient-to-b from-white to-slate-50/30">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">
                                        {c.department}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs px-2 py-1 rounded-full ${c.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                                            }`}>
                                            {c.status === 'published' ? '已发布' : '草稿'}
                                        </span>
                                        <button
                                            className="text-slate-300 hover:text-red-500 transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (confirm('确定要删除这个病例模版吗？所有关联的变体也会被删除。')) {
                                                    caseService.deleteCase(c.id).then(() => fetchCases());
                                                }
                                            }}
                                            title="删除病例"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">{c.disease_name || c.title}</h3>
                                <p className="text-sm text-slate-500 mt-1">难度: {c.difficulty_level || 'N/A'}</p>
                            </div>

                            <div className="flex gap-2 mt-4">
                                <Button variant="secondary" className="flex-1 text-xs">编辑模板</Button>
                                <Button
                                    variant="primary"
                                    className="flex-1 text-xs"
                                    onClick={() => handleOpenGeneration(c)}
                                >
                                    ✨生成变体
                                </Button>
                            </div>

                            {/* Variant List Preview */}
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <CaseVariantsList caseId={c.id} />
                            </div>
                        </div>
                    ))
                )}
            </div>

            {selectedCase && (
                <VariantGenerationModal
                    isOpen={isVariantModalOpen}
                    onClose={() => setIsVariantModalOpen(false)}
                    caseId={selectedCase.id}
                    caseTitle={selectedCase.disease_name || selectedCase.title}
                    onSuccess={() => {
                        console.log('Refresh case variants list');
                    }}
                />
            )}

            <CreateCaseModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchCases}
            />
        </div>
    );
};
