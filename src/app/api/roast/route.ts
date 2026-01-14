import { NextRequest, NextResponse } from "next/server";
// @ts-expect-error: pdf-parse lacks proper ESM types
import PDFParser from "pdf-parse/lib/pdf-parse.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Standardized A2A Agent Configuration
const IC_AGENT_PROTOCOL = "a2a-v0.2";

export async function POST(req: NextRequest) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "mock_key");
  // Upgraded to SOTA Gemini 3 Pro for elite Investment Committee simulation
  const model = genAI.getGenerativeModel({ 
    model: "gemini-3-pro-preview",
    generationConfig: {
      responseMimeType: "application/json",
    }
  });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const data = await PDFParser(buffer);
    const deckText = data.text;

    // A2A Orchestration Prompt
    const prompt = `
      PROTOCOL: ${IC_AGENT_PROTOCOL}
      ROLE: Investment Committee Orchestrator
      
      Simulate an A2A (Agent-to-Agent) collaboration between three specialist agents:
      1. SARAH (Risk/GP Agent)
      2. MARCUS (Market/Data Agent)
      3. LEO (Product/Vision Agent)

      TASK: Analyze the provided deck text and return a coordinated diagnostic.
      
      You MUST return your response in the following JSON format:
      {
        "headline_burn": "Consensus summary",
        "fundability_score": number,
        "meeting_transcript": [
          { "partner": "SARAH", "comment": "Brutal critique", "a2a_status": "verified" },
          { "partner": "MARCUS", "comment": "Data critique", "a2a_status": "verified" },
          { "partner": "LEO", "comment": "Product critique", "a2a_status": "verified" }
        ],
        "red_flag_count": number,
        "red_flags": [
          { "title": "short title", "reason": "brief explanation" }
        ],
        "slayers_list": ["action 1", "action 2", "action 3"],
        "market_benchmark": "Market positioning",
        "narrative_delta": "Logic analysis",
        "killer_question": "Pressure test question",
        "a2a_metadata": {
          "protocol": "${IC_AGENT_PROTOCOL}",
          "agents_consulted": ["risk-gp-v1", "market-intel-v2", "product-vision-v1"]
        }
      }

      DECK TEXT:
      ${deckText.slice(0, 30000)}
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return NextResponse.json(JSON.parse(text));
  } catch (error) {
    console.error("Gemini Roast error:", error);
    return NextResponse.json({ error: "Roast failed" }, { status: 500 });
  }
}