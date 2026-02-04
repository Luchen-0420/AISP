import React, { useState } from 'react';
import { Button } from '../ui/Button';
// Card import removed
import request from '../../api/request';

interface VariantGenerationModalProps {
    isOpen: boolean;
    onClose: () => void;
    caseId: string;
    caseTitle: string;
    onSuccess: () => void;
}

export const VariantGenerationModal: React.FC<VariantGenerationModalProps> = ({
    isOpen,
    onClose,
    caseId,
    caseTitle,
    onSuccess,
}) => {
    const [step, setStep] = useState<'config' | 'preview'>('config');
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState({
        difficulty: 'Easy',
        compliance: 'Good',
        personality: '沉稳', // Changed from Stoic
        aim: ''
    });
    const [generatedVariant, setGeneratedVariant] = useState<any>(null);

    // Reset state when modal opens
    React.useEffect(() => {
        if (isOpen) {
            setStep('config');
            setGeneratedVariant(null);
            // Default config could also be reset here if desired, but keeping previous settings might be useful.
            // Let's reset config to be safe if that's preferred, but usually keeping 'difficulty' etc. is fine.
            // The user complained about seeing the *result* (Figure 2), which is 'step' and 'generatedVariant'.
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const response = await request.post(`/cases/${caseId}/generate`, config) as { data: any };
            setGeneratedVariant(response.data);
            setStep('preview');
        } catch (error) {
            console.error('Generation failed:', error);
            alert('Generation failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await request.post(`/cases/${caseId}/save-variant`, { variantData: generatedVariant });
            alert('Variant saved successfully!');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Save failed:', error);
            alert('Failed to save variant.');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setStep('config');
        setGeneratedVariant(null);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">
                        {step === 'config' ? '生成病例变体' : '预览生成结果'}
                        <span className="ml-2 text-sm font-normal text-slate-500">({caseTitle})</span>
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">×</button>
                </div>

                <div className="p-6">
                    {step === 'config' ? (
                        <div className="space-y-6">
                            {/* Target Template Warning Banner */}
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <span className="text-xl">🚩</span>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-blue-700">
                                            当前目标模版： <span className="font-bold text-lg">{caseTitle}</span>
                                        </p>
                                        <p className="text-xs text-blue-500 mt-1">
                                            生成的病例将归档至此模版下，请确保您的描述与该病种相关。
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">难度等级</label>
                                    <select
                                        className="w-full border border-slate-300 rounded-md p-2"
                                        value={config.difficulty}
                                        onChange={(e) => setConfig({ ...config, difficulty: e.target.value })}
                                    >
                                        <option value="Easy">简单 (入门)</option>
                                        <option value="Medium">中等 (进阶)</option>
                                        <option value="Hard">困难 (复杂病史)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">依从性</label>
                                    <select
                                        className="w-full border border-slate-300 rounded-md p-2"
                                        value={config.compliance}
                                        onChange={(e) => setConfig({ ...config, compliance: e.target.value })}
                                    >
                                        <option value="Good">良好 (配合)</option>
                                        <option value="Fair">一般 (偶尔遗忘)</option>
                                        <option value="Poor">差 (抗拒/不遵医嘱)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">病人性格</label>
                                <input
                                    type="text"
                                    className="w-full border border-slate-300 rounded-md p-2"
                                    placeholder="例如：焦虑、沉默寡言、健谈、易怒"
                                    value={config.personality}
                                    onChange={(e) => setConfig({ ...config, personality: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">额外要求 (可选)</label>
                                <textarea
                                    className="w-full border border-slate-300 rounded-md p-2"
                                    rows={3}
                                    placeholder="例如：包含吸烟史，或者让他说方言。"
                                    value={config.aim}
                                    onChange={(e) => setConfig({ ...config, aim: e.target.value })}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm">
                                <h3 className="font-bold text-lg mb-2">{generatedVariant?.name} ({generatedVariant?.age}岁, {generatedVariant?.gender})</h3>
                                <p><strong>职业:</strong> {generatedVariant?.occupation}</p>
                                <p><strong>主诉:</strong> {generatedVariant?.chief_complaint}</p>
                                <div className="mt-2">
                                    <p className="font-semibold">现病史:</p>
                                    <p className="text-slate-600">{generatedVariant?.history_of_present_illness}</p>
                                </div>
                                <div className="mt-2">
                                    <p className="font-semibold">性格特征:</p>
                                    <p className="text-slate-600">{generatedVariant?.personality_traits}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-xl">
                    {step === 'config' ? (
                        <>
                            <Button variant="secondary" onClick={onClose} disabled={loading}>取消</Button>
                            <Button onClick={handleGenerate} disabled={loading}>
                                {loading ? '正在生成...' : '开始生成 (AI)'}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="secondary" onClick={handleReset} disabled={loading}>重新设置</Button>
                            <Button onClick={handleSave} disabled={loading}>
                                {loading ? '保存中...' : '保存并入库'}
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
