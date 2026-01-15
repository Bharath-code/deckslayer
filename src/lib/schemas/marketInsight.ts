import { z } from "zod";

// Schema for internal market intelligence extraction.
// This data is NEVER exposed to users - only used for trend analysis.
export const MarketInsightSchema = z.object({
    // Sector Classification
    sector: z.enum([
        "SaaS",
        "Fintech",
        "AI/ML",
        "Crypto/Web3",
        "Healthcare",
        "E-commerce",
        "Consumer",
        "Climate/CleanTech",
        "Enterprise",
        "EdTech",
        "Other"
    ]).describe("Primary industry sector of the startup."),
    sub_sector: z.string().optional().describe("More granular sub-sector classification."),

    // Stage Detection
    stage: z.enum([
        "Pre-Seed",
        "Seed",
        "Series A",
        "Series B+",
        "Unknown"
    ]).describe("Funding stage of the startup."),
    funding_target_usd: z.number().optional().describe("Requested funding amount in USD."),

    // Narrative Fingerprinting
    narrative_tags: z.array(z.string()).describe("Key buzzwords and claims detected in the pitch."),
    primary_claim: z.string().describe("The single biggest claim made by the deck."),

    // Risk Severity
    red_flag_severity: z.enum(["low", "medium", "high", "critical"]).describe("Aggregated severity of red flags.")
});

export type MarketInsight = z.infer<typeof MarketInsightSchema>;
