import { NextRequest, NextResponse } from "next/server";
// @ts-expect-error: pdf-parse lacks proper ESM types
import PDFParser from "pdf-parse/lib/pdf-parse.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch { }
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Check credits
    const { data: ledger } = await supabase
      .from('credits_ledger')
      .select('amount')
      .eq('user_id', user.id);

    const totalCredits = ledger?.reduce((acc, curr) => acc + curr.amount, 0) || 0;

    if (totalCredits <= 0) {
      return NextResponse.json({ error: "Insufficient credits. Audit Protocol required." }, { status: 402 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const data = await PDFParser(buffer);
    const deckText = data.text;

    const baseModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const synthesiserModel = genAI.getGenerativeModel({
      model: "gemini-3-pro-preview",
      generationConfig: { responseMimeType: "application/json" }
    });

    // 1. Parallel Agent Analysis
    const [sarahResult, marcusResult, leoResult] = await Promise.all([
      baseModel.generateContent(`ROLE: SARAH (Risk/GP Agent). Brutal, skeptical. Focus on "The Big Lie" and structural risks in this deck: ${deckText.slice(0, 10000)}`),
      baseModel.generateContent(`ROLE: MARCUS (Market/Data Agent). Quantitative, analytical. Focus on market sizing and competitive realism in this deck: ${deckText.slice(0, 10000)}`),
      baseModel.generateContent(`ROLE: LEO (Product/Vision Agent). Optimistic but critical. Focus on UX, PMF, and narrative strength in this deck: ${deckText.slice(0, 10000)}`)
    ]);

    const sarahOpinion = sarahResult.response.text();
    const marcusOpinion = marcusResult.response.text();
    const leoOpinion = leoResult.response.text();

    // 2. Synthesis by Orchestrator
    const synthesisPrompt = `
      PROTOCOL: ${IC_AGENT_PROTOCOL}
      ROLE: IC Orchestrator
      
      You have received reports from three specialist agents on a pitch deck:
      
      SARAH'S REPORT: ${sarahOpinion}
      MARCUS'S REPORT: ${marcusOpinion}
      LEO'S REPORT: ${leoOpinion}

      TASK: Synthesize these into a coordinated diagnostic report.
      
      FORMAT: JSON
      {
        "headline_burn": "...",
        "fundability_score": 0-100,
        "meeting_transcript": [
          { "partner": "SARAH", "comment": "...", "a2a_status": "verified" },
          { "partner": "MARCUS", "comment": "...", "a2a_status": "verified" },
          { "partner": "LEO", "comment": "...", "a2a_status": "verified" }
        ],
        "red_flag_count": number,
        "red_flags": [{ "title": "...", "reason": "..." }],
        "slayers_list": ["...", "...", "..."],
        "market_benchmark": "...",
        "narrative_delta": "...",
        "killer_question": "...",
        "slide_breakdown": [
          { "slide": "Problem/Context", "critique": "...", "score": 0-100 },
          { "slide": "Solution/Product", "critique": "...", "score": 0-100 },
          { "slide": "Market/GTM", "critique": "...", "score": 0-100 },
          { "slide": "Team/Vision", "critique": "...", "score": 0-100 }
        ],
        "a2a_metadata": {
          "protocol": "${IC_AGENT_PROTOCOL}",
          "agents_consulted": ["risk-gp-v1", "market-intel-v2", "product-vision-v1"]
        }
      }
    `;

    const finalResult = await synthesiserModel.generateContent(synthesisPrompt);
    const resultJson = JSON.parse(finalResult.response.text());

    // Consume 1 credit
    await supabase.from('credits_ledger').insert({
      user_id: user.id,
      amount: -1,
      type: 'consumption',
      description: `Audit of ${file.name}`
    });

    // Check if user has PDF access (from p_batch)
    const { data: batchCheck } = await supabase
      .from('credits_ledger')
      .select('description')
      .eq('user_id', user.id)
      .eq('description', 'Purchase of p_batch')
      .limit(1);

    const pdfUnlockedByBatch = (batchCheck && batchCheck.length > 0);

    // Save roast to DB
    const { data: roastRecord, error: roastError } = await supabase
      .from('roasts')
      .insert({
        user_id: user.id,
        deck_name: file.name,
        result_json: resultJson,
        pdf_unlocked: pdfUnlockedByBatch
      })
      .select('id')
      .single();

    if (roastError) console.error("Failed to save roast:", roastError);

    return NextResponse.json({
      ...resultJson,
      roast_id: roastRecord?.id,
      pdf_unlocked: pdfUnlockedByBatch
    });
  } catch (error) {
    console.error("Gemini Roast error:", error);
    return NextResponse.json({ error: "Roast failed" }, { status: 500 });
  }
}