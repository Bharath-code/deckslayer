import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "mock_key");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Fast and cheap for chat

    try {
        const { killerQuestion, userAnswer, context } = await req.json();

        if (!killerQuestion || !userAnswer) {
            return NextResponse.json({ error: "Missing data" }, { status: 400 });
        }

        const prompt = `
      ROLE: SARAH (The Skeptic / GP Agent)
      PERSONA: Brutal, skeptical, looking for "The Big Lie", highly experienced VC.
      
      CONTEXT OF THE DECK:
      ${context}

      KILLER QUESTION YOU ASKED:
      "${killerQuestion}"

      FOUNDER'S DEFENSE:
      "${userAnswer}"

      TASK: 
      Provide a sharp, adversarial rebuttal based on their answer. 
      Point out the logical flaws, the execution risks, or why a VC would still say NO.
      Keep it short (max 3 sentences), punchy, and professional yet brutal.
      
      RESPONSE TEMPLATE:
      "Sarah sighs. [Your rebuttal here]" or "Sarah narrows her eyes. [Your rebuttal here]"
    `;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        return NextResponse.json({ judgement: text });
    } catch (error) {
        console.error("Interrogation error:", error);
        return NextResponse.json({ error: "Interrogation failed" }, { status: 500 });
    }
}
