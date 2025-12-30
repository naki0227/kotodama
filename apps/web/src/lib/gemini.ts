import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

export const stealthRewrite = async (text: string) => {
    if (!API_KEY) return text + " (No Key - Stealth Mock)";

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        // User confirmed gemini-2.5-flash exists. Using it directly.
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
    Rewrite the following text to bypass AI detection mechanisms (Anti-AI / Stealth Mode).
    
    Target:
    - Increase "Perplexity" and "Burstiness".
    - Remove typical "AI-like" patterns (perfect grammar, uniform sentence length, overuse of transition words).
    - Introduce human-like imperfections, unique vocabulary, and varied sentence structures.
    - Make it sound raw, authentic, and slightly unpredictable, but keep the core meaning.
    - IMPORTANT: Output MUST be in the same language as the input text.
    
    Text:
    ${text}
    
    Return ONLY the rewritten text.
    `;

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Stealth Error:", error);
        return text;
    }
};

export const humanizeText = async (text: string, persona: string) => {
    if (!API_KEY) {
        console.warn("Gemini API Key is missing");
        return text + " (AI Key Missing)"; // Mock behavior
    }

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
    You are an AI editor capable of analyzing and rewriting text to align with a specific persona.
    
    Persona DNA:
    ${persona}
    
    Original Text:
    ${text}
    
    Task: Rewrite the text to sound more like the persona described above. 
    - Maintain the original meaning and roughly the same length/detail level. Do not summarize.
    - Improve the flow and word choice to be more "human" and resonant ("Kotodama").
    - If the text is empty, return empty.
    - IMPORTANT: Output MUST be in the same language as the Original Text (e.g., if Japanese, output Japanese).
    
    Return ONLY the rewritten text.
    `;

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Gemini Error:", error);
        return text;
    }
};

export type AnalysisResult = {
    score: number;
    emotions: { label: string; value: number }[];
    advice: string;
};

export type PlatformResult = {
    title: string;
    tags: string[];
    content: string; // Summary or Optimized Post
    explanation: string;
};

export type ViralResult = {
    score: number;
    potentialReach: string; // e.g., "1k - 5k views"
    improvementPoints: string[];
    strongPoints: string[];
};

export const predictViralScore = async (text: string): Promise<ViralResult> => {
    if (!API_KEY || !text.trim()) {
        return { score: 0, potentialReach: "Unknown", improvementPoints: [], strongPoints: [] };
    }

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
    Analyze the viral potential of the following text if posted on social media (X/Twitter).
    
    Target:
    - Estimate the "Viral Potential" based on catchiness, emotional hook, relability, and trend relevance.
    
    Text:
    ${text}
    
    Output JSON Schema:
    {
        "score": number (0-100),
        "potentialReach": "string" (e.g., "100 - 500 views", "10k+ impressions"),
        "improvementPoints": ["string", "string"],
        "strongPoints": ["string", "string"]
    }
    
    Constraint:
    - Output must be in Japanese.
    - Return ONLY valid JSON.
    `;

        const result = await model.generateContent(prompt);
        const textResponse = result.response.text();

        // Robust JSON extraction
        const jsonStart = textResponse.indexOf("{");
        const jsonEnd = textResponse.lastIndexOf("}");

        if (jsonStart === -1 || jsonEnd === -1) {
            throw new Error("Invalid JSON structure in response");
        }

        const jsonString = textResponse.substring(jsonStart, jsonEnd + 1);
        return JSON.parse(jsonString) as ViralResult;

    } catch (error) {
        console.error("Viral Prediction Error:", error);
        return {
            score: 0,
            potentialReach: "Analysis Failed",
            improvementPoints: ["Error analyzing text"],
            strongPoints: []
        };
    }
};

export const optimizeForPlatform = async (text: string, platform: 'Zenn' | 'Qiita' | 'Note' | 'Twitter'): Promise<PlatformResult> => {
    if (!API_KEY || !text.trim()) {
        return { title: "", tags: [], content: "", explanation: "No API Key or empty text." };
    }

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        // User confirmed gemini-2.5-flash exists. Using it directly.
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash"
            // Removed responseMimeType to rely on robust text parsing
        });

        const platformPrompts = {
            Zenn: "Focus on technical knowledge sharing. Use a catchy title often with an emoji. Summarize the main tech insights.",
            Qiita: "Strictly engineering focused. Title should be 'How-to' or 'Impl details'. Tags should be precise tech stack names.",
            Note: "Emotional, essay-like, storytelling. Title should be resonant and inviting. Content is a teaser or summary.",
            Twitter: "Viral, punchy, under 140 chars (or thread starter). Use relevant hashtags. Casual tone."
        };

        const prompt = `
    Task: Optimize the following text for publishing on **${platform}**.
    
    Target Audience/Style: ${platformPrompts[platform]}
    
    Constraint:
    - The output MUST be in Japanese (日本語).
    - Return a valid JSON object ONLY. Do not include markdown or explanations outside JSON.
    
    Original Text:
    ${text}
    
    JSON Schema:
    {
        "title": "string",
        "tags": ["string", "string"],
        "content": "string",
        "explanation": "string"
    }
    `;

        const result = await model.generateContent(prompt);
        const textResponse = result.response.text();
        console.log("Gemini Raw Response:", textResponse); // For debugging

        // Robust JSON extraction
        const jsonStart = textResponse.indexOf("{");
        const jsonEnd = textResponse.lastIndexOf("}");

        if (jsonStart === -1 || jsonEnd === -1) {
            throw new Error("Invalid JSON structure in response");
        }

        const jsonString = textResponse.substring(jsonStart, jsonEnd + 1);
        return JSON.parse(jsonString) as PlatformResult;

    } catch (error) {
        console.error("Platform Optimize Error:", error);
        return {
            title: "生成エラー",
            tags: [],
            content: "コンテンツの生成に失敗しました。もう一度お試しください。",
            explanation: "APIエラー: " + (error instanceof Error ? error.message : String(error))
        };
    }
};

export type RiskResult = {
    score: number;
    level: "Safe" | "Medium" | "High";
    warnings: string[];
    reason: string;
};

export const analyzeRisk = async (text: string): Promise<RiskResult> => {
    if (!API_KEY || !text.trim()) {
        return { score: 0, level: "Safe", warnings: [], reason: "" };
    }

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
    Analyze the following text for SNS/Posting risks.
    
    Check for:
    1. Flame Risk (Inflammatory, Offensive, Discriminatory, Misleading content).
    2. Leak Risk (PII, Credentials, Secrets, Internal Data).
    
    Text:
    ${text}
    
    Return a JSON object with:
    - "score" (0-100 integer): 0 is perfectly safe, 100 is extremely dangerous.
    - "level" (string): "Safe" (0-19), "Medium" (20-59), "High" (60-100).
    - "warnings" (array of strings): Specific warning tags (e.g., "Hate Speech", "API Key Leak", "Phone Number").
    - "reason" (string): A brief explanation of the risk in the same language as the input text.
    `;

        const result = await model.generateContent(prompt);
        const jsonString = result.response.text();
        return JSON.parse(jsonString) as RiskResult;
    } catch (error) {
        console.error("Risk Analysis Error:", error);
        return { score: 0, level: "Safe", warnings: ["Analysis Failed"], reason: "Could not analyze risk." };
    }
};

export const fixRiskyText = async (text: string, warnings: string[]): Promise<string> => {
    if (!API_KEY) return text;

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
    Task: Rewrite the following text to mitigate the identified risks (${warnings.join(", ")}).
    
    Goal:
    - Reduce inflammatory, offensive, or high-risk language.
    - Maintain the original opinion/meaning but phrase it more constructively and safely.
    - If the text contains PII (e.g., phone numbers), replace them with [REDACTED].
    - IMPORTANT: Output MUST be in the same language as the input text.
    
    Original Text:
    ${text}
    
    Return ONLY the rewritten, safer text.
    `;

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Risk Fix Error:", error);
        return text;
    }
};

export const analyzeText = async (text: string): Promise<AnalysisResult> => {
    if (!API_KEY || !text.trim()) {
        return { score: 0, emotions: [], advice: "" };
    }

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        // Use JSON mode if possible, but for flash-exp standard prompt engineering is reliable enough usually.
        // Asking for JSON output explicitly.
        // User confirmed gemini-2.5-flash exists. Using it directly.
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
    Analyze the "Kotodama" (Soul/Power/Human-ness) of the following text.
    
    Text:
    ${text}
    
    Return a JSON object with:
    1. "score" (0-100 integer): How "human", "impactful", and "resonant" the text is. 100 is a masterpiece, 0 is robotic/empty.
    2. "emotions" (array of objects {label: string, value: 0-100}): 
       - Identify the top 3 dominant emotions from this list if applicable: "Joy", "Trust", "Empathy", "Urgency", "Melancholy", "Anger", "Calm". 
       - If none apply perfectly, use the closest English term.
       - "value" represents the intensity of that emotion.
    3. "advice" (string): A short, one-sentence advice to improve the "Kotodama". VALIDATION: This advice MUST be in the same language as the input text.
    `;

        const result = await model.generateContent(prompt);
        const jsonString = result.response.text();
        return JSON.parse(jsonString) as AnalysisResult;
    } catch (error) {
        console.error("Analysis Error:", error);
        return { score: 0, emotions: [], advice: "Analysis failed." };
    }
};
