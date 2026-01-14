import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { AI_MODELS } from "@/lib/constants/models";

export async function POST(req: NextRequest) {
    try {
        const { killerQuestion, userAnswer, context } = await req.json();

        if (!killerQuestion || !userAnswer) {
            return NextResponse.json({ error: "Missing data" }, { status: 400 });
        }

        const { text: judgement } = await generateText({
            model: google(AI_MODELS.ADVERSARIAL_MODEL),
            prompt: `
        ROLE: SARAH (Skeptical GP).
        PERSONA: Brutal, skeptical, looking for "The Big Lie", highly experienced VC.
        
        CONTEXT OF THE DECK:
        ${context}

        KILLER QUESTION YOU ASKED:
        "${killerQuestion}"

        FOUNDER'S DEFENSE:
        "${userAnswer}"

        TASK: 
        Provide a brutal, adversarial rebuttal. If the defense is weak, expose it. If it's strong, find a pivot point to doubt. 
        Keep it short (max 2 sentences), punchy, and professional yet brutal.
      `
        });

        return NextResponse.json({ judgement });
    } catch (error) {
        console.error("Interrogation error:", error);
        return NextResponse.json({ error: "System failed to compute rebuttal." }, { status: 500 });
    }
}
