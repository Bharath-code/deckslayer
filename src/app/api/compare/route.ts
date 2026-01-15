import { NextRequest, NextResponse } from "next/server";
// @ts-expect-error: pdf-parse lacks proper ESM types
import PDFParser from "pdf-parse/lib/pdf-parse.js";
import { generateObject, generateText } from "ai";
import { google } from "@ai-sdk/google";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { sarahCard, marcusCard, leoCard } from "@/lib/a2a/agents";
import { ComparisonReportSchema } from "@/lib/schemas/comparison";
import { AI_MODELS } from "@/lib/constants/models";

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
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            );
                        } catch { }
                    },
                },
            }
        );

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        // Check credits (2 credits for comparison - 1 per deck)
        const { data: ledger } = await supabase
            .from('credits_ledger')
            .select('amount')
            .eq('user_id', user.id);

        const totalCredits = ledger?.reduce((acc, curr) => acc + curr.amount, 0) || 0;

        if (totalCredits < 2) {
            return NextResponse.json({
                error: "Insufficient credits. Comparison requires 2 credits (1 per deck)."
            }, { status: 402 });
        }

        const formData = await req.formData();
        const deckA = formData.get("deck_a") as File;
        const deckB = formData.get("deck_b") as File;

        if (!deckA || !deckB) {
            return NextResponse.json({ error: "Two deck files are required" }, { status: 400 });
        }

        // Parse both PDFs in parallel
        const [bufferA, bufferB] = await Promise.all([
            Buffer.from(await deckA.arrayBuffer()),
            Buffer.from(await deckB.arrayBuffer()),
        ]);

        const [dataA, dataB] = await Promise.all([
            PDFParser(bufferA),
            PDFParser(bufferB),
        ]);

        const deckTextA = dataA.text.slice(0, 8000);
        const deckTextB = dataB.text.slice(0, 8000);
        const deckNameA = deckA.name;
        const deckNameB = deckB.name;

        // Run parallel A2A analysis for BOTH decks
        const [sarahA, sarahB, marcusA, marcusB, leoA, leoB] = await Promise.all([
            generateText({
                model: google(AI_MODELS.ANALYSIS_MODEL),
                prompt: `PROTOCOL: ${IC_AGENT_PROTOCOL}\nAGENT_CARD: ${JSON.stringify(sarahCard)}\nTASK: Perform risk audit. Rate 0-100. Be concise.\nDECK: ${deckTextA}`
            }),
            generateText({
                model: google(AI_MODELS.ANALYSIS_MODEL),
                prompt: `PROTOCOL: ${IC_AGENT_PROTOCOL}\nAGENT_CARD: ${JSON.stringify(sarahCard)}\nTASK: Perform risk audit. Rate 0-100. Be concise.\nDECK: ${deckTextB}`
            }),
            generateText({
                model: google(AI_MODELS.ANALYSIS_MODEL),
                prompt: `PROTOCOL: ${IC_AGENT_PROTOCOL}\nAGENT_CARD: ${JSON.stringify(marcusCard)}\nTASK: Perform market validation. Rate 0-100. Be concise.\nDECK: ${deckTextA}`
            }),
            generateText({
                model: google(AI_MODELS.ANALYSIS_MODEL),
                prompt: `PROTOCOL: ${IC_AGENT_PROTOCOL}\nAGENT_CARD: ${JSON.stringify(marcusCard)}\nTASK: Perform market validation. Rate 0-100. Be concise.\nDECK: ${deckTextB}`
            }),
            generateText({
                model: google(AI_MODELS.ANALYSIS_MODEL),
                prompt: `PROTOCOL: ${IC_AGENT_PROTOCOL}\nAGENT_CARD: ${JSON.stringify(leoCard)}\nTASK: Perform vision check. Rate 0-100. Be concise.\nDECK: ${deckTextA}`
            }),
            generateText({
                model: google(AI_MODELS.ANALYSIS_MODEL),
                prompt: `PROTOCOL: ${IC_AGENT_PROTOCOL}\nAGENT_CARD: ${JSON.stringify(leoCard)}\nTASK: Perform vision check. Rate 0-100. Be concise.\nDECK: ${deckTextB}`
            }),
        ]);

        // Generate comparative synthesis
        const { object: comparison } = await generateObject({
            model: google(AI_MODELS.SYNTHESIS_MODEL),
            schema: ComparisonReportSchema,
            prompt: `You are the Chief Investment Officer synthesizing a comparative analysis of two pitch decks.

DECK A (${deckNameA}):
Risk Analysis: ${sarahA.text}
Market Analysis: ${marcusA.text}
Vision Analysis: ${leoA.text}

DECK B (${deckNameB}):
Risk Analysis: ${sarahB.text}
Market Analysis: ${marcusB.text}
Vision Analysis: ${leoB.text}

Generate a comprehensive comparison report. Be adversarial and decisive.
- Assign scores 0-100 for each deck
- Determine a clear winner (avoid ties unless truly equal)
- Provide category-by-category breakdown
- List all red flags from both decks
- Give a definitive VC investment recommendation`
        });

        // Add deck names to the result
        const result = {
            ...comparison,
            deck_a_name: deckNameA,
            deck_b_name: deckNameB,
        };

        // Deduct 2 credits (1 per deck)
        await supabase.from('credits_ledger').insert({
            user_id: user.id,
            amount: -2,
            reason: `Comparative analysis: ${deckNameA} vs ${deckNameB}`,
        });

        // Save comparison to database
        const { data: savedComparison, error: saveError } = await supabase
            .from('comparisons')
            .insert({
                user_id: user.id,
                deck_a_name: deckNameA,
                deck_b_name: deckNameB,
                comparison_json: result,
            })
            .select('id')
            .single();

        if (saveError) {
            console.error('Failed to save comparison:', saveError);
        }

        return NextResponse.json({
            ...result,
            comparison_id: savedComparison?.id,
        });

    } catch (error) {
        console.error("Comparison error:", error);
        return NextResponse.json(
            { error: "Comparison failed. Please try again." },
            { status: 500 }
        );
    }
}
