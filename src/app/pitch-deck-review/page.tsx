import { Metadata } from "next";
import Link from "next/link";
import { SlayerLogo } from "@/components/SlayerLogo";
import { Breadcrumbs, FAQAccordion, SectorGrid, CTABanner } from "@/components/seo";
import {
    generatePageMetadata,
    SECTORS,
    SECTOR_DISPLAY_NAMES,
} from "@/lib/seo/metadata";
import { generateBreadcrumbSchema, generateItemListSchema, generateFAQSchema, SchemaScript } from "@/lib/seo/schema";
import type { FAQItem } from "@/lib/seo/schema";

// =============================================================================
// METADATA
// =============================================================================

export const metadata: Metadata = generatePageMetadata({
    title: "Pitch Deck Review & Audit",
    description:
        "Get your pitch deck reviewed by an AI Investment Committee. Identify red flags, validate your market sizing, and get fundability scores before your investor meeting.",
    canonicalPath: "/pitch-deck-review",
    keywords: [
        "pitch deck review",
        "pitch deck audit",
        "startup pitch deck",
        "VC pitch deck",
        "fundraising",
        "investor pitch",
    ],
});

// =============================================================================
// STATIC CONTENT
// =============================================================================

const INTRO_CONTENT = `
Your pitch deck is your first impression with investors. A single weak slide can kill a deal before it starts.

DeckSlayer's AI Investment Committee analyzes your deck through the lens of experienced VCs—identifying red flags, 
validating your market claims, and scoring your fundability before you walk into your partner meeting.

We've analyzed thousands of pitch decks across every sector and stage. Below, explore sector-specific insights 
or upload your deck for a personalized adversarial audit.
`;

const FAQS: FAQItem[] = [
    {
        question: "How does the AI pitch deck review work?",
        answer:
            "Our Multi-Agent A2A Protocol simulates an Investment Committee with three AI partners: Sarah (The Liquidator) focuses on risk, Marcus (The Hawk) validates market data, and Leo (The Visionary) evaluates product strategy. Each reviews your deck independently, then they synthesize a coordinated diagnostic.",
    },
    {
        question: "What makes this different from other pitch deck tools?",
        answer:
            "Most tools give you generic feedback. DeckSlayer is adversarial—we're designed to find the weaknesses VCs will find. Our AI has been trained on patterns that lead to rejection, not just what makes a 'good' deck.",
    },
    {
        question: "How long does a review take?",
        answer:
            "Our AI analysis completes in under 2 minutes. You'll receive a comprehensive diagnostic including fundability score, red flags, slide-by-slide critique, and specific recommendations.",
    },
    {
        question: "Is my pitch deck data secure?",
        answer:
            "Yes. We never share your pitch deck content with third parties. Your data is processed securely and you can delete it at any time.",
    },
    {
        question: "What sectors do you support?",
        answer:
            "We support all major startup sectors including SaaS, Fintech, AI/ML, Healthcare, E-commerce, Consumer, Enterprise, EdTech, Climate/CleanTech, and Crypto/Web3. Our AI is trained on sector-specific patterns.",
    },
];

// =============================================================================
// SCHEMAS
// =============================================================================

const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Pitch Deck Review", url: "/pitch-deck-review" },
]);

const sectorListSchema = generateItemListSchema(
    "Pitch Deck Review by Sector",
    SECTORS.map((sector) => ({
        name: `${SECTOR_DISPLAY_NAMES[sector]} Pitch Deck Review`,
        url: `/pitch-deck-review/${sector}`,
        description: `Expert AI review for ${SECTOR_DISPLAY_NAMES[sector]} pitch decks`,
    }))
);

const faqSchema = generateFAQSchema(FAQS);

// =============================================================================
// PAGE COMPONENT
// =============================================================================

export default function PitchDeckReviewHubPage() {
    const sectorData = SECTORS.map((sector) => ({
        slug: sector,
        name: SECTOR_DISPLAY_NAMES[sector],
    }));

    return (
        <>
            <SchemaScript schemas={[breadcrumbSchema, sectorListSchema, faqSchema]} />

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
                        ]}
                        className="mb-8"
                    />

                    {/* Hero */}
                    <section className="mb-16">
                        <h1 className="text-4xl md:text-5xl font-black italic mb-6">
                            Pitch Deck Review & Audit
                        </h1>
                        <p className="text-lg text-muted leading-relaxed max-w-3xl whitespace-pre-line">
                            {INTRO_CONTENT.trim()}
                        </p>
                    </section>

                    {/* Sector Grid */}
                    <section className="mb-16">
                        <h2 className="text-xl font-bold mb-6">Browse by Sector</h2>
                        <SectorGrid sectors={sectorData} />
                    </section>

                    {/* FAQs */}
                    <section className="mb-16">
                        <h2 className="text-xl font-bold mb-6">Frequently Asked Questions</h2>
                        <FAQAccordion faqs={FAQS} />
                    </section>

                    {/* CTA */}
                    <CTABanner
                        title="Ready for the brutal truth?"
                        description="Upload your pitch deck and get an adversarial AI audit in minutes. No more guessing what VCs really think."
                        primaryCta={{ href: "/roast", label: "Get Your Deck Reviewed" }}
                        secondaryCta={{ href: "/compare", label: "Compare Two Decks" }}
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
                            <Link href="/" className="hover:text-foreground transition-colors">
                                Home
                            </Link>
                            <Link href="/roast" className="hover:text-foreground transition-colors">
                                Review Deck
                            </Link>
                            <Link href="/auth" className="hover:text-foreground transition-colors">
                                Sign In
                            </Link>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
