import { z } from 'zod';

export const ComparisonReportSchema = z.object({
    deck_a_name: z.string(),
    deck_b_name: z.string(),
    deck_a_score: z.number().min(0).max(100),
    deck_b_score: z.number().min(0).max(100),
    winner: z.enum(['deck_a', 'deck_b', 'tie']),
    winner_reasoning: z.string(),
    score_delta: z.number(),
    category_breakdown: z.array(z.object({
        category: z.string(),
        deck_a_verdict: z.string(),
        deck_b_verdict: z.string(),
        deck_a_score: z.number(),
        deck_b_score: z.number(),
        winner: z.enum(['deck_a', 'deck_b', 'tie']),
    })),
    combined_red_flags: z.array(z.object({
        deck: z.enum(['deck_a', 'deck_b']),
        flag: z.string(),
        severity: z.enum(['critical', 'major', 'minor']),
    })),
    vc_verdict: z.string(),
    investment_recommendation: z.object({
        recommended_deck: z.enum(['deck_a', 'deck_b', 'neither']),
        confidence: z.number().min(0).max(100),
        rationale: z.string(),
    }),
});

export type ComparisonReport = z.infer<typeof ComparisonReportSchema>;
