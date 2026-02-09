import React, { useState } from 'react';
// import { AuxiliaryExamPanel } from './modules/AuxiliaryExamPanel'; // 简化流程：移除辅助检查
import { DiagnosisPanel } from './modules/DiagnosisPanel';
// import { TreatmentPlanPanel } from './modules/TreatmentPlanPanel'; // 简化流程：移除处置计划

const tabs = [
    { id: 'S', label: 'S 病史采集' },
    // { id: 'O', label: 'O 辅助检查' }, // 简化流程：移除辅助检查
    { id: 'A', label: 'A 诊断结论' },
    // { id: 'P', label: 'P 处置计划' }, // 简化流程：移除处置计划
];

export const SoapContainer: React.FC = () => {
    // const { currentStage, setStage } = useTrainingStore(); // Future use for auto-switching or validation

    const [activeTab, setActiveTab] = useState('S'); // 默认显示 S

    return (
        <div className="bg-white border-l border-slate-200 h-full flex flex-col">
            {/* Tabs Header */}
            <div className="flex border-b border-slate-200">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${activeTab === tab.id
                            ? 'border-primary text-primary'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {tab.id}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden bg-slate-50 relative">
                {activeTab === 'S' && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 p-8">
                        <div className="bg-white p-6 rounded-full shadow-sm mb-4">
                            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                        </div>
                        <p className="text-sm font-medium">病史采集在左侧对话中进行</p>
                        <p className="text-xs mt-2 text-slate-400 max-w-xs text-center">请通过提问获取患者的主诉、现病史、既往史等信息，系统将自动评估采集完整度。</p>
                    </div>
                )}

                {/* {activeTab === 'O' && <AuxiliaryExamPanel />} */}

                {activeTab === 'A' && <DiagnosisPanel />}

                {/* {activeTab === 'P' && <TreatmentPlanPanel />} */}
            </div>
        </div>
    );
};
