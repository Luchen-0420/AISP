import React from 'react';
import { useTrainingStore } from '../../../store/trainingStore';
// import { Button } from '../../ui/Button';

export const DiagnosisPanel: React.FC = () => {
    const { soapData, updateDiagnosis } = useTrainingStore();

    return (
        <div className="h-full flex flex-col p-4 space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">初步诊断 (Primary Diagnosis)</label>
                <textarea
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary text-sm h-24 resize-none"
                    placeholder="请输入初步诊断结论..."
                    value={soapData.diagnosis.primary}
                    onChange={(e) => updateDiagnosis({ primary: e.target.value })}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">鉴别诊断 (Differential Diagnosis)</label>
                <div className="space-y-2">
                    {soapData.diagnosis.differentials.map((diff, idx) => (
                        <div key={idx} className="flex gap-2">
                            <input
                                className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm bg-slate-50"
                                value={diff}
                                readOnly
                            />
                            <button
                                onClick={() => {
                                    const newDiffs = soapData.diagnosis.differentials.filter((_, i) => i !== idx);
                                    updateDiagnosis({ differentials: newDiffs });
                                }}
                                className="text-red-500 hover:text-red-700 font-bold px-2"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="添加鉴别诊断..."
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-primary focus:border-primary"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const val = (e.target as HTMLInputElement).value.trim();
                                    if (val) {
                                        updateDiagnosis({ differentials: [...soapData.diagnosis.differentials, val] });
                                        (e.target as HTMLInputElement).value = '';
                                    }
                                }
                            }}
                        />
                    </div>
                    <p className="text-xs text-slate-500">按回车键添加鉴别项</p>
                </div>
            </div>

            <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">诊断依据 (Rationale)</label>
                <textarea
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary text-sm h-full resize-none"
                    placeholder="请简述支持上述诊断的依据..."
                    value={soapData.diagnosis.rationale}
                    onChange={(e) => updateDiagnosis({ rationale: e.target.value })}
                />
            </div>

        </div>
    );
};
