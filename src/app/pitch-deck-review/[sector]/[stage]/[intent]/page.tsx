import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SlayerLogo } from "@/components/SlayerLogo";
import { Breadcrumbs, FAQAccordion, RelatedPages, CTABanner } from "@/components/seo";
import {
    generateIntentMetadata,
    SECTORS,
    STAGES,
    INTENTS,
    SECTOR_DISPLAY_NAMES,
    STAGE_DISPLAY_NAMES,
    INTENT_DISPLAY_NAMES,
} from "@/lib/seo/metadata";
import {
    generateBreadcrumbSchema,
    generateArticleSchema,
    generateFAQSchema,
    SchemaScript,
} from "@/lib/seo/schema";
import type { FAQItem } from "@/lib/seo/schema";
import { getRelatedLinks } from "@/lib/seo/internal-links";

// =============================================================================
// STATIC GENERATION CONFIG
// =============================================================================

/**
 * Generate static params for all sector + stage + intent combinations.
 * This creates 10 sectors × 4 stages × 10 intents = 400 static pages.
 */
export async function generateStaticParams() {
    const params: { sector: string; stage: string; intent: string }[] = [];

    for (const sector of SECTORS) {
        for (const stage of STAGES) {
            for (const intent of INTENTS) {
                params.push({ sector, stage, intent });
            }
        }
    }

    return params;
}

/**
 * ISR with 7-day revalidation for long-tail pages.
 */
export const revalidate = 604800; // 7 days

// =============================================================================
// DYNAMIC METADATA
// =============================================================================

interface PageProps {
    params: Promise<{ sector: string; stage: string; intent: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { sector, stage, intent } = await params;

    if (
        !SECTORS.includes(sector as typeof SECTORS[number]) ||
        !STAGES.includes(stage as typeof STAGES[number]) ||
        !INTENTS.includes(intent as typeof INTENTS[number])
    ) {
        return {};
    }

    const intentTitle = INTENT_DISPLAY_NAMES[intent] || intent;
    return generateIntentMetadata(sector, stage, intent, intentTitle);
}

// =============================================================================
// CONTENT GENERATORS
// =============================================================================

function generateIntentIntro(sector: string, stage: string, intent: string): string {
    const sectorDisplay = SECTOR_DISPLAY_NAMES[sector];
    const stageDisplay = STAGE_DISPLAY_NAMES[stage];

    const intros: Record<string, string> = {
        "common-mistakes": `The most fundable ${sectorDisplay} decks at the ${stageDisplay} stage avoid these critical errors. We've analyzed thousands of rejected decks to identify the patterns that kill deals before they start. Learn what VCs see as immediate red flags and how to fix them before your partner meeting.`,

        "tam-validation": `TAM slides are where most ${stageDisplay} ${sectorDisplay} founders lose credibility. Top-down market sizing using Gartner reports won't cut it anymore. VCs want to see bottoms-up analysis specific to your ICP. Here's how the best ${sectorDisplay} founders build TAM slides that withstand scrutiny.`,

        "competitive-moat": `At the ${stageDisplay} stage, ${sectorDisplay} investors are laser-focused on defensibility. What's your moat? Technology, network effects, regulatory advantage, or switching costs? Your competitive slide must answer "why won't Google just copy this?" Here's how to structure it.`,

        "team-slide": `Your team slide is often the first thing ${stageDisplay} investors look at in a ${sectorDisplay} deck. They're pattern-matching for domain expertise, execution capability, and founder-market fit. Here's what separates forgettable team slides from ones that create conviction.`,

        "financial-projections": `${stageDisplay} ${sectorDisplay} financial projections require a delicate balance. Too conservative and you're not ambitious enough. Too aggressive and you're delusional. Learn the frameworks top founders use to build credible projections that show both ambition and analytical rigor.`,

        "use-of-funds": `VCs want to know exactly how their capital will accelerate your ${sectorDisplay} startup. At the ${stageDisplay} stage, your use of funds should map directly to milestones that de-risk the next round. Here's how to structure this slide to demonstrate capital efficiency.`,

        "traction-metrics": `Which metrics actually matter for ${stageDisplay} ${sectorDisplay} startups? Revenue alone isn't enough. VCs want to see engagement, retention, and growth efficiency. Learn which metrics prove product-market fit and how to present them compellingly.`,

        "go-to-market": `Your GTM strategy at the ${stageDisplay} stage signals whether you can actually acquire customers profitably. For ${sectorDisplay} startups, the channel mix matters enormously. Here's how to structure a GTM slide that demonstrates you understand your customer acquisition engine.`,

        "unit-economics": `Unit economics are the foundation of ${sectorDisplay} startup valuations. At ${stageDisplay}, VCs want to see CAC/LTV ratios that make sense for your business model, with a clear path to improvement. Here's how to present compelling unit economics even with limited data.`,

        "why-now": `Timing is everything in ${sectorDisplay}. Your "Why Now" slide must answer why this opportunity exists today and why it will be too late in 2 years. The best ${stageDisplay} founders frame market timing as inevitability, not speculation.`,
    };

    return intros[intent] || `Learn how ${stageDisplay} ${sectorDisplay} startups should approach ${INTENT_DISPLAY_NAMES[intent]?.toLowerCase() || intent} in their pitch decks.`;
}

function generateIntentFAQs(sector: string, stage: string, intent: string): FAQItem[] {
    const sectorDisplay = SECTOR_DISPLAY_NAMES[sector];
    const stageDisplay = STAGE_DISPLAY_NAMES[stage];
    const intentDisplay = INTENT_DISPLAY_NAMES[intent];

    return [
        {
            question: `How important is ${intentDisplay?.toLowerCase()} for ${stageDisplay} ${sectorDisplay} decks?`,
            answer: `${intentDisplay} is one of the most scrutinized areas of ${stageDisplay} ${sectorDisplay} pitch decks. VCs consistently cite weaknesses in this area as a reason for passing. Getting this right can be the difference between a term sheet and a polite rejection.`,
        },
        {
            question: `What are the most common mistakes in ${intentDisplay?.toLowerCase()}?`,
            answer: `The most common mistakes include: being too generic without ${sectorDisplay}-specific context, lacking data to support claims, not anticipating obvious investor questions, and failing to connect this section to your overall narrative.`,
        },
        {
            question: `How many slides should I dedicate to ${intentDisplay?.toLowerCase()}?`,
            answer: `At the ${stageDisplay} stage, you should dedicate 1-2 slides to ${intentDisplay?.toLowerCase()}. The goal is to be comprehensive enough to answer key questions while leaving room for discussion. Appendix slides can provide deeper dives.`,
        },
        {
            question: `How does ${intentDisplay?.toLowerCase()} differ for ${sectorDisplay} vs other sectors?`,
            answer: `${sectorDisplay} startups have unique considerations for ${intentDisplay?.toLowerCase()}. Industry-specific benchmarks, competitive dynamics, and investor expectations all differ from other sectors. Our AI review is trained on these ${sectorDisplay}-specific patterns.`,
        },
    ];
}

function getIntentTips(intent: string): string[] {
    const tips: Record<string, string[]> = {
        "common-mistakes": [
            "Lead with your strongest metric, not your weakest excuse",
            "Never claim 'no competition' — it signals market naivety",
            "Avoid jargon that obscures rather than clarifies",
            "Show traction before you explain the product",
        ],
        "tam-validation": [
            "Use bottoms-up analysis starting from your ICP",
            "Show the serviceable market you can actually capture",
            "Reference credible third-party data sources",
            "Explain your path from SAM to TAM",
        ],
        "competitive-moat": [
            "Be honest about competitors — VCs will check",
            "Focus on your sustainable advantage, not features",
            "Explain what makes you defensible, not just different",
            "Show evidence your moat is working",
        ],
        "team-slide": [
            "Lead with domain expertise and relevant experience",
            "Show why this team will win, not just their backgrounds",
            "Include advisors strategically to fill gaps",
            "Highlight previous founder exits if applicable",
        ],
        "financial-projections": [
            "Build from unit economics, not top-down TAM capture",
            "Show 3-5 year projections with clear assumptions",
            "Include multiple scenarios if appropriate",
            "Connect spend to specific growth levers",
        ],
        "use-of-funds": [
            "Map spending to specific 18-month milestones",
            "Show capital efficiency vs. industry benchmarks",
            "Be specific about headcount vs. other spend",
            "Connect this round to next round metrics",
        ],
        "traction-metrics": [
            "Choose metrics that matter for your business model",
            "Show trends, not just snapshots",
            "Compare to relevant benchmarks",
            "Be honest about what's working and what's not",
        ],
        "go-to-market": [
            "Show evidence your GTM channels actually work",
            "Be specific about CAC by channel",
            "Explain your sales motion in detail",
            "Show how GTM scales with funding",
        ],
        "unit-economics": [
            "Show gross margin and contribution margin",
            "Include cohort data if available",
            "Be clear about CAC payback period",
            "Show path to improving unit economics",
        ],
        "why-now": [
            "Connect to macro trends with evidence",
            "Show why the timing is inevitable, not hopeful",
            "Explain why incumbents can't or won't respond",
            "Reference recent market shifts as proof points",
        ],
    };

    return tips[intent] || [];
}

// =============================================================================
// PAGE COMPONENT
// =============================================================================

export default async function IntentPage({ params }: PageProps) {
    const { sector, stage, intent } = await params;

    // Validate params
    if (
        !SECTORS.includes(sector as typeof SECTORS[number]) ||
        !STAGES.includes(stage as typeof STAGES[number]) ||
        !INTENTS.includes(intent as typeof INTENTS[number])
    ) {
        notFound();
    }

    const sectorDisplay = SECTOR_DISPLAY_NAMES[sector];
    const stageDisplay = STAGE_DISPLAY_NAMES[stage];
    const intentDisplay = INTENT_DISPLAY_NAMES[intent];
    const introContent = generateIntentIntro(sector, stage, intent);
    const faqs = generateIntentFAQs(sector, stage, intent);
    const tips = getIntentTips(intent);
    const relatedLinks = getRelatedLinks(sector, stage);

    const schemas = [
        generateBreadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Pitch Deck Review", url: "/pitch-deck-review" },
            { name: sectorDisplay, url: `/pitch-deck-review/${sector}` },
            { name: stageDisplay, url: `/pitch-deck-review/${sector}/${stage}` },
            { name: intentDisplay, url: `/pitch-deck-review/${sector}/${stage}/${intent}` },
        ]),
        generateArticleSchema({
            headline: `${intentDisplay} - ${sectorDisplay} ${stageDisplay}`,
            description: introContent.slice(0, 160),
            url: `/pitch-deck-review/${sector}/${stage}/${intent}`,
        }),
        generateFAQSchema(faqs),
    ];

    return (
        <>
            <SchemaScript schemas={schemas} />

            <div className="min-h-screen bg-background text-foreground font-mono">
                {/* Header */}
                <header className="border-b border-border">
                    <nav className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
                        <Link href="/" className="flex items-center gap-3 text-xl font-black tracking-tighter">
                            <SlayerLogo className="w-6 h-6" />
                            DECKSLAYER
                        </Link>
                        <Link
                            href="/roast"
                            className="px-4 py-2 bg-red-500 text-white text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-colors"
                        >
                            Review My Deck
                        </Link>
                    </nav>
                </header>

                {/* Main Content */}
                <main className="max-w-6xl mx-auto px-6 py-12">
                    {/* Breadcrumbs */}
                    <Breadcrumbs
                        items={[
                            { name: "Home", url: "/" },
                            { name: "Pitch Deck Review", url: "/pitch-deck-review" },
                            { name: sectorDisplay, url: `/pitch-deck-review/${sector}` },
                            { name: stageDisplay, url: `/pitch-deck-review/${sector}/${stage}` },
                            { name: intentDisplay, url: `/pitch-deck-review/${sector}/${stage}/${intent}` },
                        ]}
                        className="mb-8"
                    />

                    {/* Hero */}
                    <section className="mb-12">
                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest">
                                {sectorDisplay}
                            </span>
                            <span className="px-3 py-1 bg-foreground/10 border border-foreground/20 text-foreground text-xs font-bold uppercase tracking-widest">
                                {stageDisplay}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black italic mb-6">
                            {intentDisplay}
                        </h1>
                        <p className="text-lg text-muted leading-relaxed max-w-3xl">
                            {introContent}
                        </p>
                    </section>

                    {/* Quick Tips */}
                    {tips.length > 0 && (
                        <section className="mb-16">
                            <h2 className="text-xl font-bold mb-6">Quick Tips</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                {tips.map((tip, index) => (
                                    <div
                                        key={index}
                                        className="p-5 border border-border bg-card rounded-lg flex items-start gap-4"
                                    >
                                        <span className="text-red-500 font-black text-lg">
                                            {String(index + 1).padStart(2, "0")}
                                        </span>
                                        <span className="text-foreground">{tip}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Key Insight Box */}
                    <section className="mb-16 p-8 bg-gradient-to-r from-red-500/10 to-transparent border border-red-500/20 rounded-lg">
                        <h2 className="text-xl font-bold mb-4 text-red-500">
                            What Our AI Checks For
                        </h2>
                        <p className="text-muted mb-4">
                            When reviewing {intentDisplay.toLowerCase()} in {stageDisplay} {sectorDisplay} decks,
                            our AI Investment Committee specifically looks for:
                        </p>
                        <ul className="space-y-2 text-foreground">
                            <li className="flex items-start gap-2">
                                <span className="text-red-500">→</span>
                                <span>Industry-specific benchmarks and comparisons</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-500">→</span>
                                <span>Data-backed claims vs. aspirational statements</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-500">→</span>
                                <span>Logical consistency with other deck sections</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-500">→</span>
                                <span>Red flags that commonly lead to rejection</span>
                            </li>
                        </ul>
                    </section>

                    {/* FAQs */}
                    <section className="mb-16">
                        <h2 className="text-xl font-bold mb-6">
                            Frequently Asked Questions
                        </h2>
                        <FAQAccordion faqs={faqs} />
                    </section>

                    {/* Related Pages */}
                    <RelatedPages
                        title="Explore More Topics"
                        links={[
                            ...INTENTS.filter((i) => i !== intent)
                                .slice(0, 3)
                                .map((i) => ({
                                    href: `/pitch-deck-review/${sector}/${stage}/${i}`,
                                    label: INTENT_DISPLAY_NAMES[i],
                                })),
                            ...relatedLinks.slice(0, 2),
                        ]}
                        className="mb-16"
                    />

                    {/* CTA */}
                    <CTABanner
                        title={`Get your ${intentDisplay.toLowerCase()} reviewed`}
                        description={`Upload your ${sectorDisplay} pitch deck and get specific feedback on ${intentDisplay.toLowerCase()} from our AI Investment Committee.`}
                    />
                </main>

                {/* Footer */}
                <footer className="border-t border-border mt-20">
                    <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-3">
                            <SlayerLogo className="w-4 h-4 opacity-50" />
                            <span className="text-xs text-muted uppercase tracking-widest">
                                © 2026 DeckSlayer
                            </span>
                        </div>
                        <div className="flex gap-8 text-xs text-muted">
                            <Link href={`/pitch-deck-review/${sector}/${stage}`} className="hover:text-foreground transition-colors">
                                {stageDisplay} {sectorDisplay}
                            </Link>
                            <Link href="/pitch-deck-review" className="hover:text-foreground transition-colors">
                                All Sectors
                            </Link>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
