import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SlayerLogo } from "@/components/SlayerLogo";
import { Breadcrumbs, FAQAccordion, RelatedPages, CTABanner } from "@/components/seo";
import {
    generateSectorMetadata,
    SECTORS,
    STAGES,
    SECTOR_DISPLAY_NAMES,
    STAGE_DISPLAY_NAMES,
} from "@/lib/seo/metadata";
import {
    generateSectorPageSchemas,
    SchemaScript,
} from "@/lib/seo/schema";
import {
    generateSectorIntro,
    generateSectorFAQs,
} from "@/lib/seo/content-templates";
import { getStageLinks, getSimilarContentLinks } from "@/lib/seo/internal-links";

// =============================================================================
// STATIC GENERATION CONFIG
// =============================================================================

/**
 * Generate static params for all sectors at build time.
 * This creates 10 static pages (one per sector).
 */
export async function generateStaticParams() {
    return SECTORS.map((sector) => ({
        sector,
    }));
}

/**
 * Enable ISR with 24-hour revalidation for freshness.
 */
export const revalidate = 86400; // 24 hours

// =============================================================================
// DYNAMIC METADATA
// =============================================================================

interface PageProps {
    params: Promise<{ sector: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { sector } = await params;

    if (!SECTORS.includes(sector as typeof SECTORS[number])) {
        return {};
    }

    return generateSectorMetadata(sector);
}

// =============================================================================
// PAGE COMPONENT
// =============================================================================

export default async function SectorPage({ params }: PageProps) {
    const { sector } = await params;

    // Validate sector
    if (!SECTORS.includes(sector as typeof SECTORS[number])) {
        notFound();
    }

    const displayName = SECTOR_DISPLAY_NAMES[sector];
    const introContent = generateSectorIntro(sector);
    const faqs = generateSectorFAQs(sector);
    const schemas = generateSectorPageSchemas(sector, faqs);
    const stageLinks = getStageLinks(sector);
    const relatedLinks = getSimilarContentLinks(sector, "");

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
                            { name: displayName, url: `/pitch-deck-review/${sector}` },
                        ]}
                        className="mb-8"
                    />

                    {/* Hero */}
                    <section className="mb-12">
                        <h1 className="text-4xl md:text-5xl font-black italic mb-6">
                            {displayName} Pitch Deck Review
                        </h1>
                        <p className="text-lg text-muted leading-relaxed max-w-3xl">
                            {introContent}
                        </p>
                    </section>

                    {/* Stage Selection */}
                    <section className="mb-16">
                        <h2 className="text-xl font-bold mb-6">Select Your Funding Stage</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {STAGES.map((stage) => (
                                <Link
                                    key={stage}
                                    href={`/pitch-deck-review/${sector}/${stage}`}
                                    className="group p-6 border border-border bg-card rounded-lg text-center hover:border-red-500/30 transition-all"
                                >
                                    <span className="font-bold text-foreground group-hover:text-red-500 transition-colors">
                                        {STAGE_DISPLAY_NAMES[stage]}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* Key Insights Section */}
                    <section className="mb-16 p-8 bg-card border border-border rounded-lg">
                        <h2 className="text-xl font-bold mb-4">
                            What VCs Look for in {displayName} Decks
                        </h2>
                        <div className="grid md:grid-cols-3 gap-6 text-sm">
                            <div>
                                <h3 className="font-bold text-red-500 mb-2">Market Validation</h3>
                                <p className="text-muted">
                                    Bottoms-up TAM analysis with clear segmentation specific to the{" "}
                                    {displayName.toLowerCase()} market.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-bold text-red-500 mb-2">Competitive Moat</h3>
                                <p className="text-muted">
                                    What makes you defensible in a crowded {displayName.toLowerCase()}{" "}
                                    landscape? Tech, network effects, or regulatory advantage?
                                </p>
                            </div>
                            <div>
                                <h3 className="font-bold text-red-500 mb-2">Unit Economics</h3>
                                <p className="text-muted">
                                    CAC/LTV ratios that make sense for{" "}
                                    {displayName.toLowerCase()} business models.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* FAQs */}
                    <section className="mb-16">
                        <h2 className="text-xl font-bold mb-6">
                            {displayName} Pitch Deck FAQs
                        </h2>
                        <FAQAccordion faqs={faqs} />
                    </section>

                    {/* Related Pages */}
                    <RelatedPages
                        title="Explore More"
                        links={[...stageLinks.slice(0, 2), ...relatedLinks.slice(0, 2)]}
                        className="mb-16"
                    />

                    {/* CTA */}
                    <CTABanner
                        title={`Get your ${displayName} deck reviewed`}
                        description={`Upload your ${displayName.toLowerCase()} pitch deck and get sector-specific feedback from our AI Investment Committee.`}
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
                            <Link href="/pitch-deck-review" className="hover:text-foreground transition-colors">
                                All Sectors
                            </Link>
                            <Link href="/roast" className="hover:text-foreground transition-colors">
                                Review Deck
                            </Link>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
