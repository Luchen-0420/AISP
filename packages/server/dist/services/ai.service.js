import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
export class AIService {
    static instance;
    constructor() { }
    static getInstance() {
        if (!AIService.instance) {
            AIService.instance = new AIService();
        }
        return AIService.instance;
    }
    async chat(message, history, options) {
        try {
            // Configuration priority: Request Options > Environment Variables
            let apiKey = options?.apiKey || process.env.OPENAI_API_KEY;
            let baseUrl = options?.baseUrl || process.env.OPENAI_BASE_URL;
            let modelName = options?.modelName || process.env.AI_MODEL_NAME || "gpt-3.5-turbo";
            // Clean inputs
            apiKey = apiKey?.trim();
            baseUrl = baseUrl?.trim();
            modelName = modelName?.trim();
            if (!apiKey) {
                // Return a mock response if no API key is available, but indicate it's a mock
                console.warn("No API Key provided. Returning mock response.");
                return "【系统提示】检测到未配置 API Key。请在设置页面配置您的 API Key，或在服务器端配置 OPENAI_API_KEY 环境变量。当前回复为模拟消息。";
            }
            console.log(`Initializing ChatOpenAI in AIService with Key: ${apiKey.substring(0, 3)}...${apiKey.substring(apiKey.length - 3)}`);
            const chatModel = new ChatOpenAI({
                openAIApiKey: apiKey,
                configuration: {
                    baseURL: baseUrl,
                    apiKey: apiKey, // Explicitly pass to OpenAI Client config as backup
                },
                modelName: modelName,
                temperature: 0.7,
            });
            // Construct messages
            const systemPrompt = options?.systemPrompt || `You are a helpful AI assistant.`; // Default if not provided
            const messages = [
                new SystemMessage(systemPrompt),
                ...history.map((msg) => msg.role === 'user' || msg.role === 'student' || msg.role === 'doctor'
                    ? new HumanMessage(msg.content)
                    : new SystemMessage(msg.content) // Treat mostly as assistant, but for simplicity/safety against strict types
                ),
                new HumanMessage(message)
            ];
            const outputParser = new StringOutputParser();
            const response = await chatModel.pipe(outputParser).invoke(messages);
            return response;
        }
        catch (error) {
            console.error("AI Service Error:", error);
            // Ensure error.message exists or provide default
            const errorMessage = error instanceof Error ? error.message : String(error);
            return `【系统错误】AI 服务调用失败: ${errorMessage}`;
        }
    }
    async generateExamReport(examName, patientContext, options) {
        const systemPrompt = "你是一个专业的医学检查辅助系统。根据提供的患者信息，生成合理的检查项目结果。结果应模仿真实的医院报告格式，包含数值（如有）和简短的临床意义判读。结果必须严谨、符合病情逻辑。请直接输出结果内容，不要包含其他寒暄。";
        const message = `患者信息：\n${patientContext}\n\n请求的检查项目：${examName}`;
        return this.chat(message, [], { ...options, systemPrompt });
    }
    async analyzeDialogue(studentMessage, patientContext, options) {
        const systemPrompt = `你是一个医学教育评估专家。请分析医学生（医生）对患者的提问。
请对以下6个维度进行评分判定（如果该问题体现了该维度，则给予加分建议，否则为0）：
1. history (病史采集): 是否询问了关键病史（如诱因、部位、性质、伴随症状等）？
2. relevance (相关性): 问题是否与当前主诉高度相关？
3. logic (临床逻辑): 是否体现了鉴别诊断的思路？
4. empathy (人文关怀): 是否表达了对患者的同情、安抚或礼貌？
5. safety (危险排查): 是否排查了急危重症（如心梗、肺栓塞等）的征象？
6. plan (诊疗方案): 是否给出了合理的下一步建议？

请 STRICTLY 以 JSON 格式输出，不要包含 Markdown 格式标记。格式如下：
{
  "scores": {
    "history": 0 or 1,
    "relevance": 0 or 1,
    "logic": 0 or 1,
    "empathy": 0 or 1,
    "safety": 0 or 1,
    "plan": 0 or 1
  },
  "feedback": "简短的一句话点评"
}`;
        const message = `患者背景：${patientContext}\n\n医学生提问：${studentMessage}`;
        const response = await this.chat(message, [], { ...options, systemPrompt });
        try {
            // Attempt to clean markdown if present (e.g. ```json ... ```)
            const jsonStr = response.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);
        }
        catch (e) {
            console.error("Failed to parse AI analysis result", response);
            return null;
        }
    }
    async generateSessionFeedback(chatHistory, patientContext, options) {
        const systemPrompt = `你是一个医学教育专家。请根据医学生与模拟患者的对话记录，以及患者的标准病例信息，生成一份详细的实训点评。

输入信息：
1. 患者标准病例：包含正确的诊断、病史和关键评分点。
2. 对话记录：学生与患者的完整对话。

请输出 JSON 格式的点评，包含以下字段：
- highlights (优点): 学生做得好的地方（如问到了关键症状、态度好）。
- improvements (待改进): 学生遗漏的问诊点或错误的判断。
- resources (推荐资源): 针对不足推荐的学习资源数组，每个资源包含:
  - type: 资源类型（textbook=教材, guideline=指南, video=视频, case=病例库）
  - title: 资源标题
  - reason: 推荐理由（简短说明为什么推荐这个资源）

格式要求：
{
  "highlights": "学生的优点描述...",
  "improvements": "需要改进的地方...",
  "resources": [
    { "type": "textbook", "title": "《内科学》第9版 - 相关章节", "reason": "针对本次病例的核心诊断" },
    { "type": "guideline", "title": "相关临床指南名称", "reason": "规范化诊疗流程参考" }
  ]
}
请直接输出 JSON，不要包含 Markdown 标记。请确保 resources 是对象数组格式。`;
        // Format history for prompt
        const historyText = chatHistory.map(m => `${m.role === 'doctor' || m.role === 'user' ? '医学生' : '患者'}: ${m.content}`).join('\n');
        const message = `患者标准信息：\n${patientContext}\n\n对话记录：\n${historyText}`;
        const response = await this.chat(message, [], { ...options, systemPrompt });
        try {
            const jsonStr = response.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(jsonStr);
            // Normalize resources to array of objects if it's array of strings
            if (parsed.resources && Array.isArray(parsed.resources)) {
                parsed.resources = parsed.resources.map((r) => {
                    if (typeof r === 'string') {
                        return { type: 'textbook', title: r, reason: '推荐学习' };
                    }
                    return r;
                });
            }
            return parsed;
        }
        catch (e) {
            console.error("Failed to parse AI feedback", response);
            // Fallback
            return {
                highlights: "无法解析AI反馈",
                improvements: "请检查后台日志",
                resources: []
            };
        }
    }
    // Extract SOAP structure from chat history
    async extractSOAPFromChat(messages, options) {
        const systemPrompt = `你是一名医学教育专家，负责从问诊对话中提取结构化病历信息。

请根据以下对话记录，提取SOAP格式的病历信息。只提取对话中明确提到的信息，不要推测。

输出格式(JSON)：
{
    "subjective": {
        "chiefComplaint": "主诉（一句话）",
        "historyOfPresentIllness": "现病史摘要",
        "pastHistory": "既往史",
        "allergies": "过敏史",
        "medications": "用药史"
    },
    "diagnosis": {
        "primary": "初步诊断（如无法确定则留空）",
        "differentials": ["鉴别诊断1", "鉴别诊断2"],
        "rationale": "诊断依据"
    },
    "plan": {
        "lifestyle": ["生活方式建议1", "建议2"],
        "followUp": "随访计划",
        "education": "健康教育要点"
    }
}

注意：
1. 只提取对话中明确出现的信息
2. 未提及的字段请留空字符串或空数组
3. 使用患者原话，不要过度医学化`;
        const historyText = messages.map(m => {
            const role = m.role === 'doctor' ? '医学生' : m.role === 'patient' ? '患者' : '系统';
            return `${role}: ${m.content}`;
        }).join('\n');
        const response = await this.chat(historyText, [], { ...options, systemPrompt });
        try {
            const jsonStr = response.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);
        }
        catch (e) {
            console.error("Failed to parse SOAP extraction", response);
            return null;
        }
    }
    // Analyze mood impact of doctor's message
    async analyzeMoodImpact(doctorMessage, context, options) {
        const systemPrompt = `你是一个医患沟通分析专家。请分析医学生的这句话对模拟患者情绪和信任度的影响。

当前患者状态：
- 情绪: ${context.currentMood.emotion}
- 信任度: ${context.currentMood.trust}%
- 舒适度: ${context.currentMood.comfort}%

请分析医学生的话语，并输出 JSON 格式：
{
  "emotion": "calm|anxious|frustrated|relieved|angry",
  "trustDelta": -10到+10之间的整数,
  "comfortDelta": -10到+10之间的整数,
  "reason": "变化原因的简短描述（10字以内）"
}

评估标准：
- 共情表达（如"理解您的担心"）：+5~10 信任度，情绪趋向 relieved
- 打断或不耐烦：-5~10 信任度，情绪趋向 frustrated/angry
- 问敏感问题无铺垫：-3~5 舒适度，情绪趋向 anxious
- 详细解释病情：+5~8 信任度，情绪趋向 calm
- 使用过多专业术语：-3 舒适度，情绪趋向 anxious
- 表达关心（"别担心"）：+3~5 信任度，情绪趋向 relieved

请直接输出 JSON，不要包含 Markdown 标记。`;
        const response = await this.chat(`医学生说: "${doctorMessage}"`, [], { ...options, systemPrompt });
        try {
            const jsonStr = response.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);
        }
        catch (e) {
            console.error("Failed to parse mood analysis", response);
            // Default: no change
            return {
                emotion: context.currentMood.emotion,
                trustDelta: 0,
                comfortDelta: 0,
                reason: ''
            };
        }
    }
}
export const aiService = AIService.getInstance();
