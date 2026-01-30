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
}
export const aiService = AIService.getInstance();
