import { SECTOR_DISPLAY_NAMES, STAGE_DISPLAY_NAMES } from "./metadata";
import type { FAQItem } from "./schema";

// =============================================================================
// CONTENT TEMPLATES FOR PROGRAMMATIC PAGES
// =============================================================================

/**
 * Generates unique intro content for a sector page.
 * Each sector gets customized content to avoid thin/duplicate pages.
 */
export function generateSectorIntro(sector: string): string {
    const displayName = SECTOR_DISPLAY_NAMES[sector] || sector;

    const intros: Record<string, string> = {
        saas: `SaaS pitch decks require a unique balance of product-market fit storytelling and hard unit economics. VCs expect to see clear ARR metrics, cohort retention data, and a defensible moat. Our AI Investment Committee has analyzed hundreds of ${displayName} decks and knows exactly what separates the funded from the passed.`,

        fintech: `Fintech founders face the dual challenge of explaining complex regulatory landscapes while demonstrating massive market opportunity. Your pitch deck must address compliance, trust, and scalability simultaneously. Our adversarial review identifies the gaps that kill ${displayName} deals before your partner meeting.`,

        "ai-ml": `AI/ML startups are under more scrutiny than ever. VCs are tired of wrapper companies and want to see genuine technical differentiation. Your deck must prove you have proprietary data, defensible models, and a clear path to production. Our AI reviewers know the difference between hype and substance.`,

        "crypto-web3": `Web3 pitch decks require a delicate balance between vision and pragmatism. VCs want to see token economics that make sense, a clear user acquisition strategy beyond speculation, and founders who understand both the technology and the market dynamics.`,

        healthcare: `Healthcare startups face extended timelines, regulatory hurdles, and complex stakeholder maps. Your pitch deck must address FDA pathways, reimbursement strategies, and clinical validation while still telling a compelling growth story.`,

        ecommerce: `E-commerce pitch decks must prove you can acquire customers profitably in an era of rising CAC. VCs want to see strong unit economics, brand differentiation, and a clear reason why you'll win in a crowded market.`,

        consumer: `Consumer startups need to demonstrate viral potential and deep user understanding. Your pitch deck must show engagement metrics that prove product love, not just downloads. VCs are looking for the next breakout, not the next also-ran.`,

        "climate-cleantech": `Climate tech is having its moment, but VCs are increasingly sophisticated. Your pitch deck must balance long-term impact with near-term unit economics. Hardware, regulatory, and go-to-market risks all need to be addressed head-on.`,

        enterprise: `Enterprise pitch decks must show you understand long sales cycles, complex procurement, and the land-and-expand motion. VCs want to see logos, not just pipeline, and a clear path from initial deal size to account expansion.`,

        edtech: `EdTech startups must navigate the gap between education and technology. Your pitch deck needs to address user acquisition in schools, district sales cycles, and the fundamental question: who pays, and who benefits?`,
    };

    return (
        intros[sector] ||
        `${displayName} startups face unique challenges when pitching to VCs. Our AI Investment Committee has analyzed thousands of decks in this sector to identify the patterns that lead to funding success or rejection.`
    );
}

/**
 * Generates unique intro content for a stage-specific page.
 */
export function generateStageIntro(sector: string, stage: string): string {
    const sectorDisplay = SECTOR_DISPLAY_NAMES[sector] || sector;
    const stageDisplay = STAGE_DISPLAY_NAMES[stage] || stage;

    const stageContent: Record<string, string> = {
        "pre-seed": `At the ${stageDisplay} stage, ${sectorDisplay} founders are selling a vision, not metrics. VCs are betting on the team and the insight. Your deck must demonstrate deep domain expertise, a clear problem understanding, and early signs of customer obsession. The bar is high even when the data is thin.`,

        seed: `${stageDisplay} ${sectorDisplay} decks need to show early traction alongside vision. VCs want to see initial customers or users, a coherent go-to-market strategy, and evidence that you can execute. This is the stage where your deck transitions from "promise" to "proof."`,

        "series-a": `${stageDisplay} is where ${sectorDisplay} startups prove they can scale. VCs are looking for strong unit economics, repeatable sales motion, and a clear path to market leadership. Your deck must be data-heavy and demonstrate that you've found product-market fit.`,

        "series-b-plus": `At ${stageDisplay}, ${sectorDisplay} companies are scaling machines. VCs want to see operational excellence, expanding margins, and a clear path to market dominance. Your deck should make the investment feel inevitable, not speculative.`,
    };

    return (
        stageContent[stage] ||
        `${stageDisplay} stage ${sectorDisplay} startups need to tailor their pitch to investor expectations at this specific stage. Our AI reviewers know what VCs are looking for.`
    );
}

/**
 * Generates FAQs for a sector page.
 */
export function generateSectorFAQs(sector: string): FAQItem[] {
    const displayName = SECTOR_DISPLAY_NAMES[sector] || sector;

    return [
        {
            question: `What do VCs look for in a ${displayName} pitch deck?`,
            answer: `VCs evaluating ${displayName} pitch decks focus on market size validation, competitive differentiation, unit economics, and team expertise. They want to see that you understand the specific dynamics of the ${displayName} market and have a defensible strategy to win.`,
        },
        {
            question: `How long should a ${displayName} pitch deck be?`,
            answer: `A ${displayName} pitch deck should be 10-15 slides for most stages. Focus on problem, solution, market, traction, team, and ask. Appendix slides can provide deeper dives for interested investors.`,
        },
        {
            question: `What are the most common mistakes in ${displayName} pitch decks?`,
            answer: `Common ${displayName} pitch deck mistakes include: overestimating TAM with top-down analysis, underestimating competition, lacking clear unit economics, and failing to explain why now is the right time for your solution.`,
        },
        {
            question: `How can I improve my ${displayName} pitch deck?`,
            answer: `Improve your ${displayName} pitch deck by leading with a compelling problem, showing traction (even early signals), demonstrating domain expertise, and making your ask clear and justified. Use our AI review to identify specific areas for improvement.`,
        },
        {
            question: `What metrics should a ${displayName} pitch deck include?`,
            answer: `Key metrics for ${displayName} pitch decks vary by stage but typically include: revenue/ARR, growth rate, CAC/LTV ratio, retention/churn, and relevant engagement metrics specific to your product category.`,
        },
    ];
}

/**
 * Generates FAQs for a stage-specific page.
 */
export function generateStageFAQs(sector: string, stage: string): FAQItem[] {
    const sectorDisplay = SECTOR_DISPLAY_NAMES[sector] || sector;
    const stageDisplay = STAGE_DISPLAY_NAMES[stage] || stage;

    return [
        {
            question: `What do VCs expect in a ${stageDisplay} ${sectorDisplay} pitch deck?`,
            answer: `At the ${stageDisplay} stage, VCs expect ${sectorDisplay} startups to demonstrate ${stage === "pre-seed" ? "vision and team strength" : stage === "seed" ? "early traction and product-market fit signals" : "strong growth metrics and scalable unit economics"}.`,
        },
        {
            question: `How much detail should a ${stageDisplay} pitch deck include?`,
            answer: `${stageDisplay} ${sectorDisplay} decks should balance depth with clarity. Earlier stages can be more vision-focused, while later stages require detailed metrics and financial projections.`,
        },
        {
            question: `What is the typical funding amount for ${stageDisplay} ${sectorDisplay} startups?`,
            answer: `${stageDisplay} ${sectorDisplay} rounds typically range from ${stage === "pre-seed" ? "$250K-$1M" : stage === "seed" ? "$1M-$4M" : stage === "series-a" ? "$5M-$15M" : "$15M-$50M+"} depending on market conditions and company traction.`,
        },
        {
            question: `How long does a ${stageDisplay} fundraise typically take?`,
            answer: `A ${stageDisplay} fundraise for ${sectorDisplay} startups typically takes 2-6 months from first meeting to close, depending on market conditions and investor interest.`,
        },
    ];
}

// =============================================================================
// BARREL EXPORT
// =============================================================================

export * from "./metadata";
export * from "./schema";
export * from "./internal-links";
