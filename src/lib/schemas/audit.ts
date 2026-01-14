import { z } from "zod";

export const AuditReportSchema = z.object({
    headline_burn: z.string().describe("A brutal, punchy headline summarizing the deck's failure."),
    fundability_score: z.number().min(0).max(100).describe("Overall fundability score."),
    meeting_transcript: z.array(z.object({
        partner: z.enum(["SARAH", "MARCUS", "LEO"]),
        comment: z.string(),
        a2a_status: z.string().default("verified")
    })).describe("Simulated dialogue between the IC partners."),
    red_flag_count: z.number(),
    red_flags: z.array(z.object({
        title: z.string(),
        reason: z.string()
    })),
    slayers_list: z.array(z.string()).describe("List of critical points mentioned by the partners."),
    market_benchmark: z.string().describe("Contextual market valuation or benchmark."),
    narrative_delta: z.string().describe("The gap between stated problem and proposed solution."),
    killer_question: z.string().describe("The most difficult question the founder must answer."),
    slide_breakdown: z.array(z.object({
        slide: z.string(),
        critique: z.string(),
        score: z.number().min(0).max(100)
    })),
    a2a_metadata: z.object({
        protocol: z.string(),
        agents_consulted: z.array(z.string()),
        orchestrator: z.string()
    })
});

export type AuditReport = z.infer<typeof AuditReportSchema>;
