/**
 * OPQRST Coverage Tracking Utility
 * Shared between ChatInterface (real-time display) and StatusPanel (submit)
 */

export interface OPQRSTItem {
    key: string;
    label: string;
    fullName: string;
    question: string;
    keywords: string[];
}

export const OPQRST_ITEMS: OPQRSTItem[] = [
    {
        key: 'O',
        label: 'O',
        fullName: '起病(Onset)',
        question: '请问您这个症状是什么时候开始的？怎么开始的？',
        keywords: ['什么时候', '开始', '多久了', '怎么发生', '起病', '发作', '几天', '几周', '几个月', '最初']
    },
    {
        key: 'P',
        label: 'P',
        fullName: '诱因(Provocation)',
        question: '有什么情况会加重症状？什么能缓解？',
        keywords: ['加重', '缓解', '什么时候', '活动', '休息', '吃药', '诱因', '触发', '减轻', '好转']
    },
    {
        key: 'Q',
        label: 'Q',
        fullName: '性质(Quality)',
        question: '您能描述一下是什么样的感觉吗？',
        keywords: ['什么样', '感觉', '描述', '性质', '刺痛', '钝痛', '胀痛', '绞痛', '灼烧', '酸痛']
    },
    {
        key: 'R',
        label: 'R',
        fullName: '放射(Radiation)',
        question: '这个不舒服会传导到其他地方吗？',
        keywords: ['放射', '传导', '其他地方', '蔓延', '扩散', '牵涉', '哪里', '部位']
    },
    {
        key: 'S',
        label: 'S',
        fullName: '程度(Severity)',
        question: '如果用0到10分来评价，您觉得有多严重？',
        keywords: ['严重', '程度', '评分', '几分', '厉害', '能忍受', '影响', '工作', '睡眠']
    },
    {
        key: 'T',
        label: 'T',
        fullName: '时间(Timing)',
        question: '是一直这样还是时好时坏？每次持续多久？',
        keywords: ['持续', '间歇', '多长时间', '多久', '频率', '每次', '反复', '规律', '时好时坏']
    },
];

export interface OPQRSTCoverage {
    covered: string[];
    percentage: number;
    details: Record<string, { asked: boolean; matchedKeywords: string[] }>;
}

/**
 * Detect OPQRST coverage from messages
 */
export function detectOPQRSTCoverage(messages: Array<{ role: string; content: string }>): OPQRSTCoverage {
    const doctorMessages = messages.filter(m => m.role === 'doctor').map(m => m.content);
    const allText = doctorMessages.join(' ');

    const covered: string[] = [];
    const details: Record<string, { asked: boolean; matchedKeywords: string[] }> = {};

    OPQRST_ITEMS.forEach(item => {
        const matchedKeywords = item.keywords.filter(kw => allText.includes(kw));
        const asked = matchedKeywords.length > 0;

        if (asked) {
            covered.push(item.key);
        }

        details[item.key] = { asked, matchedKeywords };
    });

    const percentage = Math.round((covered.length / OPQRST_ITEMS.length) * 100);

    return { covered, percentage, details };
}
