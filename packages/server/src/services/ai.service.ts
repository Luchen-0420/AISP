import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";

interface ChatOptions {
    apiKey?: string;
    baseUrl?: string;
    modelName?: string;
    systemPrompt?: string;
}

export class AIService {
    private static instance: AIService;

    private constructor() { }

    public static getInstance(): AIService {
        if (!AIService.instance) {
            AIService.instance = new AIService();
        }
        return AIService.instance;
    }

    public async chat(message: string, history: any[], options?: ChatOptions): Promise<string> {
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
                ...history.map((msg: any) =>
                    msg.role === 'user' || msg.role === 'student' || msg.role === 'doctor'
                        ? new HumanMessage(msg.content)
                        : new SystemMessage(msg.content) // Treat mostly as assistant, but for simplicity/safety against strict types
                ),
                new HumanMessage(message)
            ];

            const outputParser = new StringOutputParser();
            const response = await chatModel.pipe(outputParser).invoke(messages);

            return response;

        } catch (error: any) {
            console.error("AI Service Error:", error);
            // Ensure error.message exists or provide default
            const errorMessage = error instanceof Error ? error.message : String(error);
            return `【系统错误】AI 服务调用失败: ${errorMessage}`;
        }
    }

    public async generateExamReport(examName: string, patientContext: string, options?: ChatOptions): Promise<string> {
        const systemPrompt = "你是一个专业的医学检查辅助系统。根据提供的患者信息，生成合理的检查项目结果。结果应模仿真实的医院报告格式，包含数值（如有）和简短的临床意义判读。结果必须严谨、符合病情逻辑。请直接输出结果内容，不要包含其他寒暄。";
        const message = `患者信息：\n${patientContext}\n\n请求的检查项目：${examName}`;
        return this.chat(message, [], { ...options, systemPrompt });
    }

    public async analyzeDialogue(studentMessage: string, patientContext: string, options?: ChatOptions): Promise<any> {
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
        } catch (e) {
            console.error("Failed to parse AI analysis result", response);
            return null;
        }
    }

    public async generateSessionFeedback(chatHistory: any[], patientContext: string, options?: ChatOptions): Promise<any> {
        const systemPrompt = `你是一个医学教育专家。请根据医学生与模拟患者的对话记录，以及患者的标准病例信息，生成一份详细的实训点评。

输入信息：
1. 患者标准病例：包含正确的诊断、病史和关键评分点。
2. 对话记录：学生与患者的完整对话。

请输出 JSON 格式的点评，包含以下字段：
- highlights (优点): 学生做得好的地方（如问到了关键症状、态度好）。
- improvements (待改进): 学生遗漏的问诊点或错误的判断。
- resources (推荐资源): 针对不足推荐的医学教材章节或指南。

格式要求：
{
  "highlights": "...",
  "improvements": "...",
  "resources": ["资源1", "资源2"]
}
请直接输出 JSON，不要包含 Markdown 标记。`;

        // Format history for prompt
        const historyText = chatHistory.map(m => `${m.role === 'doctor' ? '医学生' : '患者'}: ${m.content}`).join('\n');
        const message = `患者标准信息：\n${patientContext}\n\n对话记录：\n${historyText}`;

        const response = await this.chat(message, [], { ...options, systemPrompt });

        try {
            const jsonStr = response.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);
        } catch (e) {
            console.error("Failed to parse AI feedback", response);
            // Fallback
            return {
                highlights: "无法解析AI反馈",
                improvements: "请检查后台日志",
                resources: []
            };
        }
    }
}

export const aiService = AIService.getInstance();
