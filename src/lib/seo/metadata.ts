import { Metadata } from "next";

// =============================================================================
// CONSTANTS
// =============================================================================

export const SITE_CONFIG = {
    name: "DeckSlayer",
    domain: "https://deckslayer.com",
    twitterHandle: "@deckslayer",
    defaultOgImage: "/og-image.png",
};

export const SECTORS = [
    "saas",
    "fintech",
    "ai-ml",
    "crypto-web3",
    "healthcare",
    "ecommerce",
    "consumer",
    "climate-cleantech",
    "enterprise",
    "edtech",
] as const;

export const SECTOR_DISPLAY_NAMES: Record<string, string> = {
    "saas": "SaaS",
    "fintech": "Fintech",
    "ai-ml": "AI/ML",
    "crypto-web3": "Crypto & Web3",
    "healthcare": "Healthcare",
    "ecommerce": "E-commerce",
    "consumer": "Consumer",
    "climate-cleantech": "Climate & CleanTech",
    "enterprise": "Enterprise",
    "edtech": "EdTech",
};

export const STAGES = [
    "pre-seed",
    "seed",
    "series-a",
    "series-b-plus",
] as const;

export const STAGE_DISPLAY_NAMES: Record<string, string> = {
    "pre-seed": "Pre-Seed",
    "seed": "Seed",
    "series-a": "Series A",
    "series-b-plus": "Series B+",
};

export const INTENTS = [
    "common-mistakes",
    "tam-validation",
    "competitive-moat",
    "team-slide",
    "financial-projections",
    "use-of-funds",
    "traction-metrics",
    "go-to-market",
    "unit-economics",
    "why-now",
] as const;

export const INTENT_DISPLAY_NAMES: Record<string, string> = {
    "common-mistakes": "Common Mistakes to Avoid",
    "tam-validation": "TAM Validation & Market Sizing",
    "competitive-moat": "Competitive Moat & Differentiation",
    "team-slide": "Team Slide Best Practices",
    "financial-projections": "Financial Projections",
    "use-of-funds": "Use of Funds Breakdown",
    "traction-metrics": "Traction Metrics That Matter",
    "go-to-market": "Go-to-Market Strategy",
    "unit-economics": "Unit Economics & CAC/LTV",
    "why-now": "Why Now & Market Timing",
};

// =============================================================================
// METADATA GENERATORS
// =============================================================================

interface PageMetadataOptions {
    title: string;
    description: string;
    canonicalPath: string;
    ogImage?: string;
    noIndex?: boolean;
    keywords?: string[];
}

/**
 * Generates complete Next.js Metadata object for a page.
 * Centralizes all SEO metadata logic for consistency and maintainability.
 */
export function generatePageMetadata(options: PageMetadataOptions): Metadata {
    const {
        title,
        description,
        canonicalPath,
        ogImage = SITE_CONFIG.defaultOgImage,
        noIndex = false,
        keywords = [],
    } = options;

    const canonicalUrl = `${SITE_CONFIG.domain}${canonicalPath}`;
    const fullTitle = `${title} | ${SITE_CONFIG.name}`;

    return {
        title: fullTitle,
        description,
        keywords: [...keywords, "pitch deck", "startup", "VC", "fundraising"],
        authors: [{ name: SITE_CONFIG.name }],
        creator: SITE_CONFIG.name,
        metadataBase: new URL(SITE_CONFIG.domain),
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            type: "article",
            locale: "en_US",
            url: canonicalUrl,
            siteName: SITE_CONFIG.name,
            title: fullTitle,
            description,
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: fullTitle,
            description,
            images: [ogImage],
            creator: SITE_CONFIG.twitterHandle,
        },
        robots: noIndex
            ? { index: false, follow: false }
            : {
                index: true,
                follow: true,
                googleBot: {
                    index: true,
                    follow: true,
                    "max-video-preview": -1,
                    "max-image-preview": "large",
                    "max-snippet": -1,
                },
            },
    };
}

// =============================================================================
// PROGRAMMATIC PAGE METADATA TEMPLATES
// =============================================================================

/**
 * Generates metadata for sector hub pages.
 * Example: /pitch-deck-review/saas
 */
export function generateSectorMetadata(sector: string): Metadata {
    const displayName = SECTOR_DISPLAY_NAMES[sector] || sector;

    return generatePageMetadata({
        title: `${displayName} Pitch Deck Review & Audit`,
        description: `Get your ${displayName} pitch deck reviewed by AI VCs. Identify red flags, validate your market sizing, and get fundability scores before your investor meeting.`,
        canonicalPath: `/pitch-deck-review/${sector}`,
        keywords: [
            `${displayName.toLowerCase()} pitch deck`,
            `${displayName.toLowerCase()} startup funding`,
            `${displayName.toLowerCase()} vc`,
            "pitch deck review",
            "startup pitch",
        ],
    });
}

/**
 * Generates metadata for sector + stage pages.
 * Example: /pitch-deck-review/saas/seed
 */
export function generateStageMetadata(sector: string, stage: string): Metadata {
    const sectorDisplay = SECTOR_DISPLAY_NAMES[sector] || sector;
    const stageDisplay = STAGE_DISPLAY_NAMES[stage] || stage;

    return generatePageMetadata({
        title: `${sectorDisplay} ${stageDisplay} Pitch Deck Review`,
        description: `Expert AI review for ${stageDisplay} ${sectorDisplay} startups. Get your pitch deck audited against what VCs actually look for at the ${stageDisplay} stage.`,
        canonicalPath: `/pitch-deck-review/${sector}/${stage}`,
        keywords: [
            `${stageDisplay.toLowerCase()} pitch deck`,
            `${sectorDisplay.toLowerCase()} ${stageDisplay.toLowerCase()}`,
            "fundraising",
            "investor deck",
        ],
    });
}

/**
 * Generates metadata for intent-specific pages.
 * Example: /pitch-deck-review/saas/seed/common-mistakes
 */
export function generateIntentMetadata(
    sector: string,
    stage: string,
    intent: string,
    intentTitle: string
): Metadata {
    const sectorDisplay = SECTOR_DISPLAY_NAMES[sector] || sector;
    const stageDisplay = STAGE_DISPLAY_NAMES[stage] || stage;

    return generatePageMetadata({
        title: `${intentTitle} - ${sectorDisplay} ${stageDisplay}`,
        description: `Learn about ${intentTitle.toLowerCase()} for ${stageDisplay} ${sectorDisplay} startups. Data-driven insights from analyzing thousands of pitch decks.`,
        canonicalPath: `/pitch-deck-review/${sector}/${stage}/${intent}`,
        keywords: [
            intent.replace(/-/g, " "),
            `${sectorDisplay.toLowerCase()} startup`,
            "pitch deck tips",
        ],
    });
}

export type Sector = typeof SECTORS[number];
export type Stage = typeof STAGES[number];
