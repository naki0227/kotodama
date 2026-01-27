import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

// CORS Headers for Kiro
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { text, tone = 'casual' } = body;

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400, headers: corsHeaders });
        }

        const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Server Config Error: GEMINI_API_KEY missing' }, { status: 500, headers: corsHeaders });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
        Rewrite the following text to be more "${tone}".
        Keep the original meaning but improve clarity and impact.
        Language: Japanese.
        
        Original Text:
        ${text}
        
        Return ONLY the rewritten text.
        `;

        const result = await model.generateContent(prompt);
        const rewritten = result.response.text();

        return NextResponse.json({ text: rewritten }, { headers: corsHeaders });

    } catch (error: any) {
        console.error('Kotodama API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500, headers: corsHeaders }
        );
    }
}
