import React, { useState } from 'react';
import { useTrainingStore } from '../../../store/trainingStore';
import { ExamItem } from '../../../types/soap';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';

const AVAILABLE_EXAMS: ExamItem[] = [
    { id: 'bp', name: '血压测量', category: 'physical', cost: 10, status: 'pending' },
    { id: 'ecg', name: '心电图 (ECG)', category: 'lab', cost: 50, status: 'pending' },
    { id: 'tnI', name: '肌钙蛋白 (cTnI)', category: 'lab', cost: 150, status: 'pending' },
    { id: 'ck_mb', name: '心肌酶谱', category: 'lab', cost: 100, status: 'pending' },
    { id: 'echo', name: '超声心动图', category: 'lab', cost: 200, status: 'pending' },
    { id: 'cxr', name: '胸部X线', category: 'lab', cost: 120, status: 'pending' },
    { id: 'glu', name: '随机血糖', category: 'lab', cost: 20, status: 'pending' },
    { id: 'hba1c', name: '糖化血红蛋白', category: 'lab', cost: 80, status: 'pending' },
    { id: 'ua', name: '尿常规', category: 'lab', cost: 30, status: 'pending' },
    { id: 'lipids', name: '血脂四项', category: 'lab', cost: 120, status: 'pending' },
    { id: 'eyes', name: '眼底检查', category: 'physical', cost: 50, status: 'pending' },
];

export const AuxiliaryExamPanel: React.FC = () => {
    const { soapData, addExam, currentVariant } = useTrainingStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [loadingExamId, setLoadingExamId] = useState<string | null>(null);

    const handleAddExam = async (exam: ExamItem) => {
        // Prevent adding if already pending or completed
        if (soapData.exams.some(e => e.id === exam.id)) return;

        // Optimistic UI update: Add as pending immediately
        const newItem: ExamItem = { ...exam, status: 'pending' };
        addExam(newItem);
        setLoadingExamId(exam.id);

        try {
            // Call AI API to generate result
            // We need variantId to pass context
            const variantId = currentVariant?.id; // Assuming store has this

            if (!variantId) {
                // Fallback to simulation if no variant loaded
                const resultExam: ExamItem = {
                    ...exam,
                    status: 'completed',
                    result: simulateResult(exam.id) + ' (模拟-无病例ID)'
                };
                addExam(resultExam);
                setLoadingExamId(null);
                return;
            }

            const request = (await import('../../../api/request')).default;
            const res: any = await request.post('/ai/exam', {
                variantId,
                examName: exam.name
            });

            // Update with AI result
            const resultExam: ExamItem = {
                ...exam,
                status: 'completed',
                result: res.result
            };
            addExam(resultExam);

            // Inject into chat
            const { addMessage } = useTrainingStore.getState();
            addMessage({
                id: Date.now().toString(),
                role: 'system',
                content: `【检查结果】${exam.name}：\n${res.result}`,
                timestamp: Date.now()
            });

        } catch (error) {
            console.error("生成检查结果失败", error);
            // Update as failed or keep pending with error note?
            // For MVP, just update as completed with error message
            const resultExam: ExamItem = {
                ...exam,
                status: 'completed',
                result: '生成失败，请稍后重试'
            };
            addExam(resultExam);
        } finally {
            setLoadingExamId(null);
        }
    };

    const simulateResult = (id: string) => {
        switch (id) {
            default: return '结果生成中...';
        }
    }

    const filteredExams = AVAILABLE_EXAMS.filter(
        e => !soapData.exams.some(se => se.id === e.id) && e.name.includes(searchTerm)
    );

    return (
        <div className="h-full flex flex-col">
            {/* Search & Add */}
            <div className="p-4 border-b border-slate-200">
                <h3 className="text-sm font-medium text-slate-700 mb-2">开立检查项目</h3>
                <input
                    type="text"
                    placeholder="搜索检查项目..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                    {filteredExams.slice(0, 5).map(exam => (
                        <Button
                            key={exam.id}
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddExam(exam)}
                            disabled={loadingExamId === exam.id} // Disable if loading
                        >
                            {loadingExamId === exam.id ? '生成中...' : '+ ' + exam.name}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
                <h3 className="text-sm font-medium text-slate-700 mb-3">检查结果 ({soapData.exams.length})</h3>
                {soapData.exams.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center mt-10">暂无检查记录</p>
                ) : (
                    <div className="space-y-3">
                        {soapData.exams.map((item, index) => (
                            <div key={index} className="bg-white p-3 rounded border border-slate-200 shadow-sm">
                                <div className="flex justify-between items-start">
                                    <span className="font-medium text-slate-900">{item.name}</span>
                                    <Badge variant={item.status === 'completed' ? 'success' : 'warning'}>
                                        {item.status === 'completed' ? '已出' : '待查'}
                                    </Badge>
                                </div>
                                {item.result && (
                                    <div className="mt-2 text-sm text-slate-600 bg-slate-50 p-2 rounded">
                                        <span className="font-semibold">结果: </span>
                                        {item.result}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
