import React, { useState } from 'react';
import { useTrainingStore } from '../../../store/trainingStore';
import { Button } from '../../ui/Button';

export const TreatmentPlanPanel: React.FC = () => {
    const { soapData, updatePlan, addMedication, removeMedication } = useTrainingStore();
    const [medInput, setMedInput] = useState({ name: '', dosage: '', frequency: '' });

    const handleAddMed = () => {
        if (medInput.name && medInput.dosage && medInput.frequency) {
            addMedication({ ...medInput });
            setMedInput({ name: '', dosage: '', frequency: '' });
        }
    };

    return (
        <div className="h-full flex flex-col p-4 space-y-6 overflow-y-auto">
            {/* Medications */}
            <div>
                <h3 className="text-sm font-medium text-slate-700 mb-2">药物治疗 (Medications)</h3>
                <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                        <input
                            placeholder="药名 (如: 二甲双胍)"
                            className="text-xs px-2 py-1.5 border rounded focus:ring-primary focus:border-primary"
                            value={medInput.name}
                            onChange={(e) => setMedInput({ ...medInput, name: e.target.value })}
                        />
                        <input
                            placeholder="剂量 (如: 0.5g)"
                            className="text-xs px-2 py-1.5 border rounded focus:ring-primary focus:border-primary"
                            value={medInput.dosage}
                            onChange={(e) => setMedInput({ ...medInput, dosage: e.target.value })}
                        />
                        <input
                            placeholder="频次 (如: bid)"
                            className="text-xs px-2 py-1.5 border rounded focus:ring-primary focus:border-primary"
                            value={medInput.frequency}
                            onChange={(e) => setMedInput({ ...medInput, frequency: e.target.value })}
                        />
                    </div>
                    <Button
                        size="sm"
                        variant="secondary"
                        className="w-full"
                        onClick={handleAddMed}
                        disabled={!medInput.name}
                    >
                        添加医嘱
                    </Button>

                    {/* List */}
                    {soapData.plan.medications.length > 0 && (
                        <div className="mt-2 space-y-1">
                            {soapData.plan.medications.map((med, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-white px-2 py-1 rounded border border-slate-100 text-xs">
                                    <span className="font-medium text-slate-800">{med.name}</span>
                                    <span className="text-slate-500">{med.dosage} / {med.frequency}</span>
                                    <button
                                        onClick={() => removeMedication(idx)}
                                        className="text-red-400 hover:text-red-600"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Lifestyle */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">生活方式干预 (Lifestyle)</label>
                <div className="space-y-2">
                    {soapData.plan.lifestyle.map((item, idx) => (
                        <div key={idx} className="flex gap-2">
                            <input className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm bg-slate-50" value={item} readOnly />
                            <button
                                onClick={() => {
                                    const newList = soapData.plan.lifestyle.filter((_, i) => i !== idx);
                                    updatePlan({ lifestyle: newList });
                                }}
                                className="text-red-500 font-bold px-2"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                    <input
                        type="text"
                        placeholder="添加建议 (按回车)..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-primary focus:border-primary"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                const val = (e.target as HTMLInputElement).value.trim();
                                if (val) {
                                    updatePlan({ lifestyle: [...soapData.plan.lifestyle, val] });
                                    (e.target as HTMLInputElement).value = '';
                                }
                            }
                        }}
                    />
                </div>
            </div>

            {/* Follow Up */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">随访计划 (Follow-up)</label>
                <textarea
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary text-sm h-16 resize-none"
                    placeholder="何时复诊? 需要带什么结果?"
                    value={soapData.plan.followUp}
                    onChange={(e) => updatePlan({ followUp: e.target.value })}
                />
            </div>

            {/* Education */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">健康宣教 (Education)</label>
                <textarea
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary text-sm h-16 resize-none"
                    placeholder="针对患者的关键宣教内容..."
                    value={soapData.plan.education}
                    onChange={(e) => updatePlan({ education: e.target.value })}
                />
            </div>

        </div>
    );
};
