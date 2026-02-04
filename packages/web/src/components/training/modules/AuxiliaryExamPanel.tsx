import React, { useState, useMemo } from 'react';
import { useTrainingStore } from '../../../store/trainingStore';
import { ExamItem } from '../../../types/soap';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { SimpleMarkdownRenderer } from '../../ui/SimpleMarkdownRenderer';

// ============ 检查项目数据库 ============
interface ExamDefinition {
    id: string;
    name: string;
    aliases: string[];      // 别名/缩写 (用于模糊匹配)
    category: 'physical' | 'lab' | 'imaging';
    departments: string[]; // 适用科室
    cost: number;
}

const EXAM_DATABASE: ExamDefinition[] = [
    // 通用检查
    { id: 'bp', name: '血压测量', aliases: ['血压', 'BP'], category: 'physical', departments: ['通用', '心内科', '内分泌科', '神经内科'], cost: 10 },
    { id: 'temp', name: '体温测量', aliases: ['体温', 'T'], category: 'physical', departments: ['通用'], cost: 5 },
    { id: 'cbc', name: '血常规', aliases: ['血常规', 'CBC', '血细胞'], category: 'lab', departments: ['通用'], cost: 30 },
    { id: 'ua', name: '尿常规', aliases: ['尿常规', 'UA', '尿检'], category: 'lab', departments: ['通用', '内分泌科', '肾内科'], cost: 30 },
    { id: 'lft', name: '肝功能', aliases: ['肝功', 'LFT', '转氨酶', 'ALT', 'AST'], category: 'lab', departments: ['通用', '消化科'], cost: 80 },
    { id: 'rft', name: '肾功能', aliases: ['肾功', 'RFT', '肌酐', 'Cr', 'BUN'], category: 'lab', departments: ['通用', '肾内科'], cost: 80 },
    { id: 'coag', name: '凝血功能', aliases: ['凝血', 'PT', 'APTT', 'INR'], category: 'lab', departments: ['通用', '血液科'], cost: 100 },
    { id: 'electrolytes', name: '电解质', aliases: ['电解质', 'K', 'Na', 'Cl', '钾', '钠'], category: 'lab', departments: ['通用'], cost: 50 },

    // 心内科
    { id: 'ecg', name: '心电图', aliases: ['心电图', 'ECG', 'EKG', '心电'], category: 'lab', departments: ['心内科', '急诊', '通用'], cost: 50 },
    { id: 'tnI', name: '肌钙蛋白', aliases: ['肌钙蛋白', 'cTnI', 'TnI', '心肌标志物'], category: 'lab', departments: ['心内科', '急诊'], cost: 150 },
    { id: 'ck_mb', name: '心肌酶谱', aliases: ['心肌酶', 'CK-MB', 'CK', '肌酸激酶'], category: 'lab', departments: ['心内科', '急诊'], cost: 100 },
    { id: 'bnp', name: 'BNP/NT-proBNP', aliases: ['BNP', 'NT-proBNP', '脑钠肽', '心衰标志物'], category: 'lab', departments: ['心内科'], cost: 200 },
    { id: 'echo', name: '超声心动图', aliases: ['心超', 'UCG', '心脏彩超', 'ECHO'], category: 'imaging', departments: ['心内科'], cost: 200 },
    { id: 'lipids', name: '血脂四项', aliases: ['血脂', 'TC', 'TG', 'LDL', 'HDL', '胆固醇'], category: 'lab', departments: ['心内科', '内分泌科'], cost: 120 },
    { id: 'holter', name: '动态心电图', aliases: ['Holter', '24小时心电图'], category: 'lab', departments: ['心内科'], cost: 300 },

    // 内分泌科
    { id: 'glu', name: '空腹血糖', aliases: ['血糖', 'FBG', 'GLU', '葡萄糖'], category: 'lab', departments: ['内分泌科', '通用'], cost: 20 },
    { id: 'ogtt', name: '口服糖耐量试验', aliases: ['OGTT', '糖耐量', '葡萄糖耐量'], category: 'lab', departments: ['内分泌科'], cost: 100 },
    { id: 'hba1c', name: '糖化血红蛋白', aliases: ['糖化', 'HbA1c', 'A1C'], category: 'lab', departments: ['内分泌科'], cost: 80 },
    { id: 'tft', name: '甲状腺功能', aliases: ['甲功', 'TFT', 'TSH', 'T3', 'T4', '甲状腺'], category: 'lab', departments: ['内分泌科'], cost: 150 },
    { id: 'thyroid_us', name: '甲状腺超声', aliases: ['甲状腺彩超', '甲状腺B超'], category: 'imaging', departments: ['内分泌科'], cost: 120 },
    { id: 'eyes', name: '眼底检查', aliases: ['眼底', '视网膜', '眼科'], category: 'physical', departments: ['内分泌科', '眼科'], cost: 50 },
    { id: 'acr', name: '尿微量白蛋白', aliases: ['尿微量白蛋白', 'ACR', 'UACR'], category: 'lab', departments: ['内分泌科', '肾内科'], cost: 60 },

    // 呼吸科
    { id: 'cxr', name: '胸部X线', aliases: ['胸片', 'X光', 'CXR', '胸透'], category: 'imaging', departments: ['呼吸科', '心内科', '通用'], cost: 80 },
    { id: 'chest_ct', name: '胸部CT', aliases: ['胸部CT', '肺CT', 'HRCT'], category: 'imaging', departments: ['呼吸科', '肿瘤科'], cost: 400 },
    { id: 'pft', name: '肺功能检查', aliases: ['肺功能', 'PFT', 'FEV1', 'FVC'], category: 'lab', departments: ['呼吸科'], cost: 150 },
    { id: 'abg', name: '血气分析', aliases: ['血气', 'ABG', 'PaO2', 'PaCO2'], category: 'lab', departments: ['呼吸科', '急诊', 'ICU'], cost: 100 },
    { id: 'sputum', name: '痰培养', aliases: ['痰培养', '痰检', '痰涂片'], category: 'lab', departments: ['呼吸科', '感染科'], cost: 80 },

    // 消化科
    { id: 'abd_us', name: '腹部超声', aliases: ['腹部B超', '腹部彩超', '肝胆胰脾'], category: 'imaging', departments: ['消化科', '肝胆外科'], cost: 150 },
    { id: 'stool', name: '便常规+潜血', aliases: ['大便', '便常规', 'OB', '潜血'], category: 'lab', departments: ['消化科', '通用'], cost: 30 },
    { id: 'egd', name: '胃镜', aliases: ['胃镜', 'EGD', '上消化道内镜'], category: 'imaging', departments: ['消化科'], cost: 500 },
    { id: 'colonoscopy', name: '结肠镜', aliases: ['肠镜', '结肠镜'], category: 'imaging', departments: ['消化科'], cost: 600 },
    { id: 'hpab', name: '幽门螺杆菌抗体', aliases: ['HP', '幽门', 'Hp抗体', 'C14', 'C13'], category: 'lab', departments: ['消化科'], cost: 80 },
    { id: 'amylase', name: '血淀粉酶', aliases: ['淀粉酶', 'AMY', 'AMS'], category: 'lab', departments: ['消化科', '急诊'], cost: 50 },

    // 神经内科
    { id: 'head_ct', name: '头颅CT', aliases: ['头CT', '脑CT', '颅脑CT'], category: 'imaging', departments: ['神经内科', '急诊', '神经外科'], cost: 350 },
    { id: 'head_mri', name: '头颅MRI', aliases: ['头MRI', '脑MRI', '磁共振'], category: 'imaging', departments: ['神经内科', '神经外科'], cost: 800 },
    { id: 'eeg', name: '脑电图', aliases: ['脑电图', 'EEG'], category: 'lab', departments: ['神经内科'], cost: 200 },
    { id: 'lp', name: '腰椎穿刺', aliases: ['腰穿', 'LP', '脑脊液'], category: 'lab', departments: ['神经内科', '感染科'], cost: 300 },
    { id: 'emg', name: '肌电图', aliases: ['肌电图', 'EMG', '神经传导'], category: 'lab', departments: ['神经内科'], cost: 250 },
];

// ============ 模糊搜索函数 ============
const fuzzyMatch = (query: string, exam: ExamDefinition): boolean => {
    if (!query) return true;
    const lowerQuery = query.toLowerCase();
    // 匹配名称
    if (exam.name.toLowerCase().includes(lowerQuery)) return true;
    // 匹配别名
    if (exam.aliases.some(alias => alias.toLowerCase().includes(lowerQuery))) return true;
    return false;
};

export const AuxiliaryExamPanel: React.FC = () => {
    const { soapData, addExam, currentVariant } = useTrainingStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [loadingExamId, setLoadingExamId] = useState<string | null>(null);
    const [showAll, setShowAll] = useState(false);

    // 获取当前科室
    const currentDepartment = currentVariant?.department || '心内科'; // 默认心内科

    // 计算推荐检查和搜索结果
    const { recommendedExams, otherExams, searchResults } = useMemo(() => {
        const addedIds = new Set(soapData.exams.map(e => e.id));
        const available = EXAM_DATABASE.filter(e => !addedIds.has(e.id));

        if (searchTerm) {
            // 搜索模式：模糊匹配
            const results = available.filter(e => fuzzyMatch(searchTerm, e));
            return { recommendedExams: [], otherExams: [], searchResults: results };
        }

        // 推荐模式：按科室分组
        const recommended = available.filter(e =>
            e.departments.includes(currentDepartment) || e.departments.includes('通用')
        );
        const others = available.filter(e =>
            !e.departments.includes(currentDepartment) && !e.departments.includes('通用')
        );

        return { recommendedExams: recommended, otherExams: others, searchResults: [] };
    }, [soapData.exams, searchTerm, currentDepartment]);

    const handleAddExam = async (examDef: ExamDefinition) => {
        const exam: ExamItem = {
            id: examDef.id,
            name: examDef.name,
            category: examDef.category,
            cost: examDef.cost,
            status: 'pending'
        };

        if (soapData.exams.some(e => e.id === exam.id)) return;

        addExam(exam);
        setLoadingExamId(exam.id);
        setSearchTerm(''); // 清空搜索

        try {
            const variantId = currentVariant?.id;

            if (!variantId) {
                const resultExam: ExamItem = {
                    ...exam,
                    status: 'completed',
                    result: '【模拟结果】请配置病例后重试'
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

            const resultExam: ExamItem = {
                ...exam,
                status: 'completed',
                result: res.result
            };
            addExam(resultExam);

            // const { addMessage } = useTrainingStore.getState();
            // addMessage({
            //     id: Date.now().toString(),
            //     role: 'system',
            //     content: `【检查结果】${exam.name}：\n${res.result}`,
            //     timestamp: Date.now()
            // });

        } catch (error) {
            console.error("生成检查结果失败", error);
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

    const renderExamButton = (exam: ExamDefinition) => (
        <Button
            key={exam.id}
            size="sm"
            variant="outline"
            onClick={() => handleAddExam(exam)}
            disabled={loadingExamId === exam.id}
            className="text-xs"
        >
            {loadingExamId === exam.id ? '生成中...' : '+ ' + exam.name}
        </Button>
    );

    return (
        <div className="h-full flex flex-col">
            {/* 搜索框 */}
            <div className="p-4 border-b border-slate-200">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-slate-700">开立检查项目</h3>
                    <Badge variant="info">{currentDepartment}</Badge>
                </div>
                <input
                    type="text"
                    placeholder="输入关键词搜索（如：心电图、ECG、血糖...）"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />

                {/* 搜索结果 */}
                {searchTerm && (
                    <div className="mt-3">
                        <p className="text-xs text-slate-500 mb-2">搜索结果 ({searchResults.length})</p>
                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                            {searchResults.length > 0 ? (
                                searchResults.map(renderExamButton)
                            ) : (
                                <p className="text-xs text-slate-400">未找到匹配的检查项目</p>
                            )}
                        </div>
                    </div>
                )}

                {/* 推荐检查 */}
                {!searchTerm && (
                    <>
                        <div className="mt-3">
                            <p className="text-xs text-slate-500 mb-2">📌 推荐检查</p>
                            <div className="flex flex-wrap gap-2">
                                {recommendedExams.slice(0, 8).map(renderExamButton)}
                            </div>
                        </div>

                        {/* 更多检查 */}
                        {otherExams.length > 0 && (
                            <div className="mt-3">
                                <button
                                    onClick={() => setShowAll(!showAll)}
                                    className="text-xs text-primary hover:underline"
                                >
                                    {showAll ? '收起' : `查看更多检查 (${otherExams.length})`}
                                </button>
                                {showAll && (
                                    <div className="flex flex-wrap gap-2 mt-2 max-h-32 overflow-y-auto">
                                        {otherExams.map(renderExamButton)}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* 检查结果列表 */}
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
                                    <div className="mt-2 text-sm text-slate-600 bg-slate-50 p-2 rounded whitespace-pre-wrap">
                                        <span className="font-semibold block mb-1">结果: </span>
                                        <SimpleMarkdownRenderer content={item.result} />
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

