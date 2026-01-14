import { NextRequest, NextResponse } from "next/server";
// @ts-expect-error: pdf-parse lacks proper ESM types
import PDFParser from "pdf-parse/lib/pdf-parse.js";
import { streamObject, generateText } from "ai";
import { google } from "@ai-sdk/google";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { sarahCard, marcusCard, leoCard, orchestratorCard } from "@/lib/a2a/agents";
import { AuditReportSchema } from "@/lib/schemas/audit";
import { AI_MODELS } from "@/lib/constants/models";

// Standardized A2A Agent Configuration
const IC_AGENT_PROTOCOL = "a2aproject-v1.0";

export async function POST(req: NextRequest) {
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
    const fileName = file.name;

    // 1. A2A Parallel Analysis Dispatch using Vercel AI SDK
    const [sarahResult, marcusResult, leoResult] = await Promise.all([
      generateText({
        model: google(AI_MODELS.ANALYSIS_MODEL),
        prompt: `PROTOCOL: ${IC_AGENT_PROTOCOL}\nAGENT_CARD: ${JSON.stringify(sarahCard)}\nTASK: Perform risk audit on this deck: ${deckText.slice(0, 8000)}`
      }),
      generateText({
        model: google(AI_MODELS.ANALYSIS_MODEL),
        prompt: `PROTOCOL: ${IC_AGENT_PROTOCOL}\nAGENT_CARD: ${JSON.stringify(marcusCard)}\nTASK: Perform market/data validation on this deck: ${deckText.slice(0, 8000)}`
      }),
      generateText({
        model: google(AI_MODELS.ANALYSIS_MODEL),
        prompt: `PROTOCOL: ${IC_AGENT_PROTOCOL}\nAGENT_CARD: ${JSON.stringify(leoCard)}\nTASK: Perform product/vision strategic check on this deck: ${deckText.slice(0, 8000)}`
      })
    ]);

    const sarahOpinion = sarahResult.text;
    const marcusOpinion = marcusResult.text;
    const leoOpinion = leoResult.text;

    // 2. Synthesized Decision Memo (Orchestrator) using streamObject for real-time output
    const result = streamObject({
      model: google(AI_MODELS.ORCHESTRATOR_MODEL),
      schema: AuditReportSchema,
      prompt: `
        PROTOCOL: ${IC_AGENT_PROTOCOL}
        ORCHESTRATOR_CARD: ${JSON.stringify(orchestratorCard)}
        
        You have received reports from three A2A-compliant agents on a pitch deck:
        
        REPORT [SARAH]: ${sarahOpinion}
        REPORT [MARCUS]: ${marcusOpinion}
        REPORT [LEO]: ${leoOpinion}

        TASK: Synthesize these into a coordinated A2A diagnostic report.
        
        Metadata for result:
        Protocol: ${IC_AGENT_PROTOCOL}
        Consulted: ${sarahCard.name}, ${marcusCard.name}, ${leoCard.name}
        Orchestrator: ${orchestratorCard.name}
      `,
      onFinish: async ({ object }) => {
        // Persist to DB after stream completes
        if (object) {
          // Consume 1 credit
          await supabase.from('credits_ledger').insert({
            user_id: user.id,
            amount: -1,
            type: 'consumption',
            description: `Audit of ${fileName}`
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
          await supabase
            .from('roasts')
            .insert({
              user_id: user.id,
              deck_name: fileName,
              result_json: object,
              pdf_unlocked: pdfUnlockedByBatch
            });
        }
      }
    });

    // Return the stream to the client
    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Vercel AI SDK Roast error:", error);
    return NextResponse.json({ error: "Roast failed" }, { status: 500 });
  }
}