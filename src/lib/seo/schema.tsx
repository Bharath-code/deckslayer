import React from "react";
import { SITE_CONFIG, SECTOR_DISPLAY_NAMES, STAGE_DISPLAY_NAMES } from "./metadata";

// =============================================================================
// JSON-LD SCHEMA GENERATORS
// =============================================================================

/**
 * Breadcrumb schema for hierarchical navigation.
 * Critical for Google to understand page relationships.
 */
export interface BreadcrumbItem {
    name: string;
    url: string;
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]): object {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: `${SITE_CONFIG.domain}${item.url}`,
        })),
    };
}

/**
 * Article schema for content pages.
 */
export interface ArticleSchemaOptions {
    headline: string;
    description: string;
    url: string;
    datePublished?: string;
    dateModified?: string;
    author?: string;
    image?: string;
}

export function generateArticleSchema(options: ArticleSchemaOptions): object {
    const {
        headline,
        description,
        url,
        datePublished = new Date().toISOString(),
        dateModified = new Date().toISOString(),
        author = SITE_CONFIG.name,
        image = SITE_CONFIG.defaultOgImage,
    } = options;

    return {
        "@context": "https://schema.org",
        "@type": "Article",
        headline,
        description,
        url: `${SITE_CONFIG.domain}${url}`,
        datePublished,
        dateModified,
        author: {
            "@type": "Organization",
            name: author,
            url: SITE_CONFIG.domain,
        },
        publisher: {
            "@type": "Organization",
            name: SITE_CONFIG.name,
            logo: {
                "@type": "ImageObject",
                url: `${SITE_CONFIG.domain}/logo.png`,
            },
        },
        image: `${SITE_CONFIG.domain}${image}`,
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `${SITE_CONFIG.domain}${url}`,
        },
    };
}

/**
 * FAQ schema for pages with Q&A content.
 */
export interface FAQItem {
    question: string;
    answer: string;
}

export function generateFAQSchema(faqs: FAQItem[]): object {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
            },
        })),
    };
}

/**
 * HowTo schema for guide/tutorial pages.
 */
export interface HowToStep {
    name: string;
    text: string;
    url?: string;
}

export function generateHowToSchema(
    name: string,
    description: string,
    steps: HowToStep[]
): object {
    return {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name,
        description,
        step: steps.map((step, index) => ({
            "@type": "HowToStep",
            position: index + 1,
            name: step.name,
            text: step.text,
            url: step.url ? `${SITE_CONFIG.domain}${step.url}` : undefined,
        })),
    };
}

/**
 * Service schema for the main product offering.
 */
export function generateServiceSchema(): object {
    return {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Pitch Deck Review & Audit",
        provider: {
            "@type": "Organization",
            name: SITE_CONFIG.name,
            url: SITE_CONFIG.domain,
        },
        description:
            "AI-powered adversarial pitch deck audit using multi-agent investment committee simulation.",
        areaServed: "Worldwide",
        serviceType: "Pitch Deck Review",
    };
}

/**
 * ItemList schema for hub pages with multiple items.
 */
export function generateItemListSchema(
    name: string,
    items: { name: string; url: string; description?: string }[]
): object {
    return {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name,
        numberOfItems: items.length,
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            url: `${SITE_CONFIG.domain}${item.url}`,
            description: item.description,
        })),
    };
}

// =============================================================================
// COMBINED SCHEMA GENERATORS FOR PAGE TYPES
// =============================================================================

/**
 * Generates all schemas for a sector hub page.
 */
export function generateSectorPageSchemas(
    sector: string,
    faqs: FAQItem[]
): object[] {
    const displayName = SECTOR_DISPLAY_NAMES[sector] || sector;
    const url = `/pitch-deck-review/${sector}`;

    const schemas: object[] = [
        generateBreadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Pitch Deck Review", url: "/pitch-deck-review" },
            { name: displayName, url },
        ]),
        generateArticleSchema({
            headline: `${displayName} Pitch Deck Review & Audit`,
            description: `Expert AI review for ${displayName} pitch decks`,
            url,
        }),
    ];

    if (faqs.length > 0) {
        schemas.push(generateFAQSchema(faqs));
    }

    return schemas;
}

/**
 * Generates all schemas for a stage-specific page.
 */
export function generateStagePageSchemas(
    sector: string,
    stage: string,
    faqs: FAQItem[]
): object[] {
    const sectorDisplay = SECTOR_DISPLAY_NAMES[sector] || sector;
    const stageDisplay = STAGE_DISPLAY_NAMES[stage] || stage;
    const url = `/pitch-deck-review/${sector}/${stage}`;

    const schemas: object[] = [
        generateBreadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Pitch Deck Review", url: "/pitch-deck-review" },
            { name: sectorDisplay, url: `/pitch-deck-review/${sector}` },
            { name: stageDisplay, url },
        ]),
        generateArticleSchema({
            headline: `${sectorDisplay} ${stageDisplay} Pitch Deck Review`,
            description: `Expert AI review for ${stageDisplay} ${sectorDisplay} startups`,
            url,
        }),
    ];

    if (faqs.length > 0) {
        schemas.push(generateFAQSchema(faqs));
    }

    return schemas;
}

/**
 * React component to render JSON-LD schemas in the head.
 */
export function SchemaScript({ schemas }: { schemas: object[] }): React.ReactNode {
    return (
        <>
            {
                schemas.map((schema, index) => (
                    <script
                        key={index}
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                    />
                ))
            }
        </>
    );
}
