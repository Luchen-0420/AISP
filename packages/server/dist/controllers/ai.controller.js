import { aiService } from '../services/ai.service';
export const chat = async (req, res) => {
    try {
        const { message, history, variantId, caseId } = req.body;
        // Extract custom config from headers (BYOK - Bring Your Own Key)
        const apiKey = req.headers['x-custom-api-key'];
        const baseUrl = req.headers['x-custom-base-url'];
        const modelName = req.headers['x-model-name'];
        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }
        let systemPrompt = `You are a helpful medical tutor.`;
        // Strategy: 
        // 1. If variantId is provided, load variant persona.
        // 2. If caseId is provided (standard template), load template persona (or generate a default one).
        // 3. Fallback to generic tutor.
        const targetId = variantId || caseId;
        if (targetId) {
            // Try to find as variant first
            const { CaseService } = await import('../services/case.service');
            const variant = await CaseService.getVariantById(targetId);
            if (variant) {
                const pInfo = variant.patient_info; // JSON object
                const pPers = variant.personality; // JSON object
                const mInfo = variant.medical_info; // JSON object
                systemPrompt = `你是一个专业的标准化病人(SP)，用于医学学生问诊训练。
你的角色信息：
- 姓名：${pInfo.name || '未命名'}
- 年龄：${pInfo.age}岁
- 性别：${pInfo.gender}
- 职业：${pInfo.occupation}
- 主诉：${mInfo.chief_complaint}
- 现病史：${mInfo.history_of_present_illness}

性格特征：
${pPers.traits || ''}
${pPers.communication_style || ''}
${pPers.hidden_info ? `隐藏信息（仅在被问及特定问题时透露）：${pPers.hidden_info}` : ''}

行为准则：
1. 你的回答必须简短、口语化，像一个真实的患者，不要使用过于专业的医学术语。
2. 除非学生问到，否则不要主动透露所有信息。要像挤牙膏一样，问一点说一点。
3. 如果学生的问题不清楚，你可以表现出困惑。
4. 如果学生展现出共情，你要表现出信任度增加。
5. 永远不要跳出角色（不要说"作为一个AI..."）。
当前对话阶段：初诊接待`;
            }
            else {
                // Try as template (Standard Case) - Fallback for Phase 9 MVP
                // For now, if not variant, we assume it might be a raw template ID?
                // Let's keep it simple: If not variant, check template.
                const template = await CaseService.getCaseTemplateById(targetId);
                if (template) {
                    // Standard template might not have detailed persona fields yet as separated columns
                    // processing... assume generic fallback for template
                    systemPrompt = `你是一个标准病例病人。疾病：${template.disease_name}。请扮演该疾病的典型患者。`;
                }
            }
        }
        const response = await aiService.chat(message, history || [], {
            apiKey,
            baseUrl,
            modelName,
            systemPrompt
        });
        res.json({ response });
    }
    catch (error) {
        console.error('Chat controller error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
export const testConnection = async (req, res) => {
    try {
        // Extract custom config from headers (BYOK)
        const apiKey = req.headers['x-api-key'];
        const baseUrl = req.headers['x-base-url'];
        const modelName = req.headers['x-model-name']; // Optional
        if (!apiKey) {
            return res.status(400).json({ message: 'API Key is missing' });
        }
        console.log(`Testing Connection with Key: ${apiKey.substring(0, 5)}... Model: ${modelName || 'default'}`);
        // Send a simple "Hello" to test credentials
        const response = await aiService.chat("Hello! Verify connection.", [], {
            apiKey,
            baseUrl,
            modelName
        });
        res.json({ success: true, message: "Connection successful!", response });
    }
    catch (error) {
        console.error('Test connection error:', error);
        // Return 200 with success=false so frontend can display the specific error message easily
        // Or return 400/500. Let's return 200 with success: false pattern for consistency if existing API uses it, 
        // but `utils/response` suggests we might have standards. 
        // The current `chat` uses `res.status(500)`. Let's stick to status codes or consistent JSON.
        // Let's use status code for error to distinguish from logic failure.
        res.status(400).json({ success: false, message: error.message || 'Connection failed' });
    }
};
export const generateExamResult = async (req, res) => {
    try {
        const { variantId, examName } = req.body;
        // Headers for BYOK
        const apiKey = (req.headers['x-custom-api-key'] || req.headers['x-api-key']);
        const baseUrl = (req.headers['x-custom-base-url'] || req.headers['x-base-url']);
        const modelName = req.headers['x-model-name'];
        if (!variantId || !examName) {
            return res.status(400).json({ message: 'variantId and examName are required' });
        }
        // Fetch Patient Context
        const { CaseService } = await import('../services/case.service');
        const variant = await CaseService.getVariantById(variantId);
        if (!variant) {
            return res.status(404).json({ message: 'Variant not found' });
        }
        const pInfo = variant.patient_info || {};
        const mInfo = variant.medical_info || {};
        const patientContext = `
姓名：${pInfo.name}，性别：${pInfo.gender}，年龄：${pInfo.age}
主诉：${mInfo.chief_complaint}
现病史：${mInfo.history_of_present_illness}
既往史：${mInfo.past_medical_history || '无'}
        `;
        const result = await aiService.generateExamReport(examName, patientContext, {
            apiKey,
            baseUrl,
            modelName
        });
        res.json({ result });
    }
    catch (error) {
        console.error('Generate Exam Error:', error);
        res.status(500).json({ message: 'Failed to generate exam result', error: error.message });
    }
};
export const analyzeDialogue = async (req, res) => {
    try {
        const { message, variantId } = req.body;
        // Headers for BYOK
        const apiKey = (req.headers['x-custom-api-key'] || req.headers['x-api-key']);
        const baseUrl = (req.headers['x-custom-base-url'] || req.headers['x-base-url']);
        const modelName = req.headers['x-model-name'];
        // Fetch Patient Context
        const { CaseService } = await import('../services/case.service');
        const variant = variantId ? await CaseService.getVariantById(variantId) : null;
        const context = variant
            ? `主诉：${variant.medical_info?.chief_complaint || ''}。现病史：${variant.medical_info?.history_of_present_illness || ''}`
            : '标准病例上下文';
        const result = await aiService.analyzeDialogue(message, context, {
            apiKey,
            baseUrl,
            modelName
        });
    }
    catch (error) {
        console.error('Analyze Dialogue Error:', error);
        res.status(500).json({ message: 'Failed to analyze dialogue', error: error.message });
    }
};
export const generateFeedback = async (req, res) => {
    try {
        const { history, variantId } = req.body;
        // Headers for BYOK
        const apiKey = (req.headers['x-custom-api-key'] || req.headers['x-api-key']);
        const baseUrl = (req.headers['x-custom-base-url'] || req.headers['x-base-url']);
        const modelName = req.headers['x-model-name'];
        // Fetch Patient Context
        const { CaseService } = await import('../services/case.service');
        const variant = variantId ? await CaseService.getVariantById(variantId) : null;
        const context = variant
            ? `诊断：${variant.disease_name}。主诉：${variant.medical_info?.chief_complaint}。`
            : '标准病例上下文';
        const result = await aiService.generateSessionFeedback(history, context, {
            apiKey,
            baseUrl,
            modelName
        });
        res.json({ result });
    }
    catch (error) {
        console.error('Feedback Gen Error:', error);
        res.status(500).json({ message: 'Failed to generate feedback', error: error.message });
    }
};
// Extract SOAP data from chat history
export const extractSOAP = async (req, res) => {
    try {
        const { messages, variantId } = req.body;
        const apiKey = req.headers['x-custom-api-key'];
        const baseUrl = req.headers['x-custom-base-url'];
        const modelName = req.headers['x-model-name'];
        if (!messages || messages.length === 0) {
            return res.status(400).json({ success: false, message: 'Messages are required' });
        }
        const result = await aiService.extractSOAPFromChat(messages, {
            apiKey,
            baseUrl,
            modelName
        });
        res.json({ success: true, data: result });
    }
    catch (error) {
        console.error('SOAP Extraction Error:', error);
        res.status(500).json({ success: false, message: 'Failed to extract SOAP', error: error.message });
    }
};
// Analyze mood impact of doctor's message
export const analyzeMood = async (req, res) => {
    try {
        const { message, currentMood } = req.body;
        const apiKey = req.headers['x-custom-api-key'];
        const baseUrl = req.headers['x-custom-base-url'];
        const modelName = req.headers['x-model-name'];
        if (!message) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }
        const result = await aiService.analyzeMoodImpact(message, {
            currentMood: currentMood || { emotion: 'calm', trust: 60, comfort: 60 }
        }, {
            apiKey,
            baseUrl,
            modelName
        });
        res.json({ success: true, data: result });
    }
    catch (error) {
        console.error('Mood Analysis Error:', error);
        res.status(500).json({ success: false, message: 'Failed to analyze mood', error: error.message });
    }
};
