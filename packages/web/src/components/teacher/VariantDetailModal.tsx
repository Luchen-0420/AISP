import React from 'react';
import { Button } from '../ui/Button';

interface VariantDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    variant: any;
}

export const VariantDetailModal: React.FC<VariantDetailModalProps> = ({
    isOpen,
    onClose,
    variant,
}) => {
    if (!isOpen || !variant) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
                    <h2 className="text-xl font-bold text-slate-800">
                        病例变体详情
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                            {(variant.patient_info?.gender || variant.gender) === '男' ? '👨🏻‍🦳' : '👵🏻'}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">
                                {variant.patient_info?.name || variant.name || variant.variant_name?.split(' - ')[0]}
                                <span className="text-base font-normal text-slate-500 ml-2">
                                    ({variant.patient_info?.age || variant.age}岁 {variant.patient_info?.gender || variant.gender})
                                </span>
                            </h3>
                            <p className="text-slate-500 text-sm">
                                {variant.patient_info?.occupation || variant.occupation || '未记录职业'}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <h4 className="font-semibold text-slate-800 mb-2">💡 核心主诉</h4>
                            <p className="text-slate-700">
                                {variant.medical_info?.chief_complaint || variant.chief_complaint || '暂无主诉'}
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-slate-800 mb-2">📜 现病史</h4>
                            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                                {variant.medical_info?.history_of_present_illness || variant.history_of_present_illness || '暂无现病史描述'}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-semibold text-slate-800 mb-2">🎭 性格特征</h4>
                                <p className="text-slate-600 text-sm bg-yellow-50 p-3 rounded border border-yellow-100">
                                    {variant.personality?.traits || variant.personality_traits || '未设定'}
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-800 mb-2">⚙️ 参数设定</h4>
                                <div className="text-sm space-y-1 text-slate-600">
                                    <p>难度: {variant.difficulty_level}</p>
                                    <p>依从性: {variant.compliance_level || 'Good'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 flex justify-end">
                    <Button onClick={onClose}>关闭</Button>
                </div>
            </div>
        </div>
    );
};
