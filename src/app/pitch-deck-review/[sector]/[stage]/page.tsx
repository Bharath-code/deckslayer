import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SlayerLogo } from "@/components/SlayerLogo";
import { Breadcrumbs, FAQAccordion, RelatedPages, CTABanner } from "@/components/seo";
import {
    generateStageMetadata,
    SECTORS,
    STAGES,
    SECTOR_DISPLAY_NAMES,
    STAGE_DISPLAY_NAMES,
} from "@/lib/seo/metadata";
import {
    generateStagePageSchemas,
    SchemaScript,
} from "@/lib/seo/schema";
import {
    generateStageIntro,
    generateStageFAQs,
} from "@/lib/seo/content-templates";
import { getRelatedLinks } from "@/lib/seo/internal-links";

// =============================================================================
// STATIC GENERATION CONFIG
// =============================================================================

/**
 * Generate static params for all sector + stage combinations.
 * This creates 10 sectors × 4 stages = 40 static pages.
 */
export async function generateStaticParams() {
    const params: { sector: string; stage: string }[] = [];

    for (const sector of SECTORS) {
        for (const stage of STAGES) {
            params.push({ sector, stage });
        }
    }

    return params;
}

/**
 * ISR with 24-hour revalidation.
 */
export const revalidate = 86400;

// =============================================================================
// DYNAMIC METADATA
// =============================================================================

interface PageProps {
    params: Promise<{ sector: string; stage: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { sector, stage } = await params;

    if (
        !SECTORS.includes(sector as typeof SECTORS[number]) ||
        !STAGES.includes(stage as typeof STAGES[number])
    ) {
        return {};
    }

    return generateStageMetadata(sector, stage);
}

// =============================================================================
// PAGE COMPONENT
// =============================================================================

export default async function StagePage({ params }: PageProps) {
    const { sector, stage } = await params;

    // Validate params
    if (
        !SECTORS.includes(sector as typeof SECTORS[number]) ||
        !STAGES.includes(stage as typeof STAGES[number])
    ) {
        notFound();
    }

    const sectorDisplay = SECTOR_DISPLAY_NAMES[sector];
    const stageDisplay = STAGE_DISPLAY_NAMES[stage];
    const introContent = generateStageIntro(sector, stage);
    const faqs = generateStageFAQs(sector, stage);
    const schemas = generateStagePageSchemas(sector, stage, faqs);
    const relatedLinks = getRelatedLinks(sector, stage);

    // Stage-specific expectations
    const stageExpectations: Record<string, string[]> = {
        "pre-seed": [
            "Strong founding team with domain expertise",
            "Clear problem definition and insight",
            "Early customer discovery signals",
            "Coherent vision for the market",
        ],
        "seed": [
            "Product-market fit signals",
            "Early traction metrics",
            "Go-to-market strategy",
            "12-18 month runway plan",
        ],
        "series-a": [
            "Proven unit economics",
            "Repeatable sales motion",
            "Strong cohort retention",
            "Clear path to $10M ARR",
        ],
        "series-b-plus": [
            "Market leadership evidence",
            "Operational excellence",
            "Expanding margins",
            "International expansion plans",
        ],
    };

    const expectations = stageExpectations[stage] || [];

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
                        ]}
                        className="mb-8"
                    />

                    {/* Hero */}
                    <section className="mb-12">
                        <div className="inline-block px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest mb-4">
                            {stageDisplay} Stage
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black italic mb-6">
                            {sectorDisplay} {stageDisplay} Pitch Deck Review
                        </h1>
                        <p className="text-lg text-muted leading-relaxed max-w-3xl">
                            {introContent}
                        </p>
                    </section>

                    {/* What VCs Expect */}
                    <section className="mb-16">
                        <h2 className="text-xl font-bold mb-6">
                            What VCs Expect at {stageDisplay}
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {expectations.map((item, index) => (
                                <div
                                    key={index}
                                    className="p-5 border border-border bg-card rounded-lg flex items-start gap-3"
                                >
                                    <span className="text-red-500 font-black text-sm">
                                        {String(index + 1).padStart(2, "0")}
                                    </span>
                                    <span className="text-foreground">{item}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Key Metrics Section */}
                    <section className="mb-16 p-8 bg-gradient-to-r from-card to-transparent border border-border rounded-lg">
                        <h2 className="text-xl font-bold mb-4">
                            Key Metrics for {stageDisplay} {sectorDisplay} Decks
                        </h2>
                        <p className="text-muted mb-6">
                            At the {stageDisplay.toLowerCase()} stage, {sectorDisplay.toLowerCase()}{" "}
                            investors focus on specific metrics that indicate readiness to scale.
                        </p>
                        <div className="grid md:grid-cols-3 gap-6 text-sm">
                            <div>
                                <h3 className="font-bold text-foreground mb-1">
                                    {stage === "pre-seed" ? "Team Score" : "ARR/MRR"}
                                </h3>
                                <p className="text-muted">
                                    {stage === "pre-seed"
                                        ? "Founder background, domain expertise, and execution capability"
                                        : "Current revenue run rate and month-over-month growth"}
                                </p>
                            </div>
                            <div>
                                <h3 className="font-bold text-foreground mb-1">
                                    {stage === "pre-seed" ? "Problem Clarity" : "CAC/LTV Ratio"}
                                </h3>
                                <p className="text-muted">
                                    {stage === "pre-seed"
                                        ? "How well you understand and articulate the problem"
                                        : "Customer acquisition cost vs lifetime value (target 3:1+)"}
                                </p>
                            </div>
                            <div>
                                <h3 className="font-bold text-foreground mb-1">
                                    {stage === "pre-seed" ? "Market Insight" : "Net Revenue Retention"}
                                </h3>
                                <p className="text-muted">
                                    {stage === "pre-seed"
                                        ? "Unique insight that makes your timing right"
                                        : "Revenue retention from existing customers (target 100%+)"}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* FAQs */}
                    <section className="mb-16">
                        <h2 className="text-xl font-bold mb-6">
                            {stageDisplay} {sectorDisplay} FAQs
                        </h2>
                        <FAQAccordion faqs={faqs} />
                    </section>

                    {/* Related Pages */}
                    <RelatedPages
                        title="Explore Related Topics"
                        links={relatedLinks.slice(0, 6)}
                        className="mb-16"
                    />

                    {/* CTA */}
                    <CTABanner
                        title={`Get your ${stageDisplay} deck reviewed`}
                        description={`Our AI knows exactly what VCs expect from ${stageDisplay.toLowerCase()} ${sectorDisplay.toLowerCase()} startups. Upload your deck for targeted feedback.`}
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
                            <Link href={`/pitch-deck-review/${sector}`} className="hover:text-foreground transition-colors">
                                {sectorDisplay}
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
