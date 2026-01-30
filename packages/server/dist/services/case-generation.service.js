import { ChatOpenAI } from "@langchain/openai";
import { variationPromptTemplate } from "../prompts/variation";
import { CaseService } from "./case.service";
import { pool } from "../db/client";
export class CaseGenerationService {
    /**
     * Generate a new case variant based on a template and parameters
     */
    static async generateVariant(templateId, params, options) {
        // 1. Configure Model (BYOK support)
        let apiKey = options?.apiKey || process.env.OPENAI_API_KEY;
        let baseUrl = options?.baseUrl || process.env.OPENAI_BASE_URL;
        let modelName = options?.modelName || process.env.OPENAI_MODEL_NAME || 'gpt-3.5-turbo';
        // Clean inputs
        apiKey = apiKey?.trim();
        baseUrl = baseUrl?.trim();
        modelName = modelName?.trim();
        if (!apiKey) {
            throw new Error("Missing API Key. Please configure it in Settings.");
        }
        console.log(`Initializing ChatOpenAI with Key: ${apiKey.substring(0, 3)}...${apiKey.substring(apiKey.length - 3)}`);
        console.log(`Using Model: ${modelName}`);
        const model = new ChatOpenAI({
            modelName: modelName,
            temperature: 0.7,
            openAIApiKey: apiKey,
            configuration: {
                baseURL: baseUrl,
                apiKey: apiKey, // Explicitly pass to OpenAI Client config as backup
            },
        });
        // 2. Fetch the standard case template
        const template = await CaseService.getCaseTemplateById(templateId);
        if (!template) {
            throw new Error(`Case template with ID ${templateId} not found`);
        }
        // 3. Prepare the prompt inputs
        const templateStr = JSON.stringify(template, null, 2);
        // 4. Invoke LLM
        const chain = variationPromptTemplate.pipe(model);
        const response = await chain.invoke({
            caseTemplate: templateStr,
            difficulty: params.difficulty,
            compliance: params.compliance,
            personality: params.personality,
            aim: params.aim || 'None'
        });
        // 4. Parse JSON output
        const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
        console.log("LLM Raw Output:", content); // Debug log
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
        let variantData;
        if (jsonMatch && jsonMatch[1]) {
            variantData = JSON.parse(jsonMatch[1]);
        }
        else {
            // Fallback: try to parse the whole string if no code blocks
            try {
                variantData = JSON.parse(content);
            }
            catch (e) {
                console.error("Failed to parse LLM response as JSON", content);
                throw new Error("AI Generation Failed: Invalid JSON format. Raw: " + content.substring(0, 100));
            }
        }
        return variantData;
    }
    /**
     * Save a generated variant to the database
     */
    static async saveVariant(templateId, variantData) {
        // Map flat JSON to DB structure
        const patientInfo = {
            name: variantData.name,
            age: variantData.age,
            gender: variantData.gender,
            occupation: variantData.occupation
        };
        const medicalInfo = {
            chief_complaint: variantData.chief_complaint,
            history_of_present_illness: variantData.history_of_present_illness,
            past_medical_history: variantData.past_medical_history,
            personal_history: variantData.personal_history,
            family_history: variantData.family_history
        };
        const personality = {
            traits: variantData.personality_traits,
            communication_style: variantData.communication_style,
            hidden_info: variantData.hidden_info
        };
        // Default values for required fields not in AI output
        const difficultyLevel = 'Medium'; // Or derive from params if passed
        const estimatedDuration = 15;
        const result = await pool.query(`INSERT INTO case_variants 
            (template_id, variant_name, patient_info, medical_info, personality, difficulty_level, estimated_duration, created_at) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) 
            RETURNING *`, [
            templateId,
            `${variantData.name} - ${variantData.age}岁 - ${variantData.chief_complaint}`,
            JSON.stringify(patientInfo),
            JSON.stringify(medicalInfo),
            JSON.stringify(personality),
            difficultyLevel,
            estimatedDuration
        ]);
        return result.rows[0];
    }
}
