import { SECTORS, STAGES, SECTOR_DISPLAY_NAMES, STAGE_DISPLAY_NAMES } from "./metadata";

// =============================================================================
// INTERNAL LINKING ENGINE
// =============================================================================

export interface InternalLink {
    href: string;
    label: string;
    description?: string;
}

/**
 * Generates hub page links for the main navigation.
 */
export function getHubLinks(): InternalLink[] {
    return [
        {
            href: "/pitch-deck-review",
            label: "Pitch Deck Review",
            description: "Get your pitch deck audited by AI VCs",
        },
        {
            href: "/pitch-deck-mistakes",
            label: "Common Mistakes",
            description: "Avoid the top pitch deck red flags",
        },
        {
            href: "/fundraising-guide",
            label: "Fundraising Guide",
            description: "Comprehensive startup fundraising resources",
        },
    ];
}

/**
 * Generates sector links for a hub page.
 */
export function getSectorLinks(currentSector?: string): InternalLink[] {
    return SECTORS.filter((s) => s !== currentSector).map((sector) => ({
        href: `/pitch-deck-review/${sector}`,
        label: `${SECTOR_DISPLAY_NAMES[sector]} Pitch Decks`,
        description: `Review and audit for ${SECTOR_DISPLAY_NAMES[sector]} startups`,
    }));
}

/**
 * Generates stage links for a sector page.
 */
export function getStageLinks(sector: string, currentStage?: string): InternalLink[] {
    const sectorDisplay = SECTOR_DISPLAY_NAMES[sector] || sector;

    return STAGES.filter((s) => s !== currentStage).map((stage) => ({
        href: `/pitch-deck-review/${sector}/${stage}`,
        label: `${STAGE_DISPLAY_NAMES[stage]} ${sectorDisplay}`,
        description: `${STAGE_DISPLAY_NAMES[stage]} stage pitch deck review`,
    }));
}

/**
 * Generates related page links based on current context.
 * Uses hub-and-spoke model: always link back to parent and sibling pages.
 */
export function getRelatedLinks(
    currentSector?: string,
    currentStage?: string
): InternalLink[] {
    const links: InternalLink[] = [];

    // Always link to the main hub
    links.push({
        href: "/pitch-deck-review",
        label: "All Pitch Deck Reviews",
        description: "Browse all sectors and stages",
    });

    // If on a sector page, show other sectors and stages within this sector
    if (currentSector) {
        // Sibling sectors
        const siblingCount = 3;
        const siblings = SECTORS.filter((s) => s !== currentSector).slice(0, siblingCount);
        siblings.forEach((sector) => {
            links.push({
                href: `/pitch-deck-review/${sector}`,
                label: `${SECTOR_DISPLAY_NAMES[sector]} Startups`,
            });
        });

        // Stages within this sector (if not already on a stage page)
        if (!currentStage) {
            STAGES.slice(0, 3).forEach((stage) => {
                links.push({
                    href: `/pitch-deck-review/${currentSector}/${stage}`,
                    label: `${STAGE_DISPLAY_NAMES[stage]} ${SECTOR_DISPLAY_NAMES[currentSector]}`,
                });
            });
        }
    }

    // If on a stage page, show sibling stages and parent sector
    if (currentSector && currentStage) {
        // Parent sector
        links.push({
            href: `/pitch-deck-review/${currentSector}`,
            label: `All ${SECTOR_DISPLAY_NAMES[currentSector]} Stages`,
        });

        // Sibling stages
        STAGES.filter((s) => s !== currentStage).forEach((stage) => {
            links.push({
                href: `/pitch-deck-review/${currentSector}/${stage}`,
                label: `${STAGE_DISPLAY_NAMES[stage]} Stage`,
            });
        });
    }

    return links;
}

/**
 * Generates breadcrumb items for a page.
 */
export function getBreadcrumbItems(
    sector?: string,
    stage?: string,
    intent?: string
): { name: string; url: string }[] {
    const items: { name: string; url: string }[] = [
        { name: "Home", url: "/" },
    ];

    if (sector || stage || intent) {
        items.push({ name: "Pitch Deck Review", url: "/pitch-deck-review" });
    }

    if (sector) {
        items.push({
            name: SECTOR_DISPLAY_NAMES[sector] || sector,
            url: `/pitch-deck-review/${sector}`,
        });
    }

    if (stage) {
        items.push({
            name: STAGE_DISPLAY_NAMES[stage] || stage,
            url: `/pitch-deck-review/${sector}/${stage}`,
        });
    }

    if (intent) {
        items.push({
            name: intent
                .split("-")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" "),
            url: `/pitch-deck-review/${sector}/${stage}/${intent}`,
        });
    }

    return items;
}

// =============================================================================
// CROSS-LINKING STRATEGIES
// =============================================================================

/**
 * Gets "You might also like" links based on content similarity.
 * In a real implementation, this would use vector similarity or co-occurrence.
 */
export function getSimilarContentLinks(
    currentSector: string,
    _currentStage: string,
    limit: number = 4
): InternalLink[] {
    // Simple heuristic: show stages in same sector + related sectors
    const links: InternalLink[] = [];

    // Other stages in same sector
    STAGES.slice(0, 2).forEach((stage) => {
        links.push({
            href: `/pitch-deck-review/${currentSector}/${stage}`,
            label: `${SECTOR_DISPLAY_NAMES[currentSector]} ${STAGE_DISPLAY_NAMES[stage]}`,
        });
    });

    // Related sectors (simple proximity in array)
    const currentIndex = SECTORS.indexOf(currentSector as typeof SECTORS[number]);
    const relatedIndices = [
        (currentIndex + 1) % SECTORS.length,
        (currentIndex + SECTORS.length - 1) % SECTORS.length,
    ];

    relatedIndices.forEach((idx) => {
        const sector = SECTORS[idx];
        links.push({
            href: `/pitch-deck-review/${sector}`,
            label: `${SECTOR_DISPLAY_NAMES[sector]} Pitch Decks`,
        });
    });

    return links.slice(0, limit);
}

/**
 * Gets bottom-of-funnel conversion links.
 */
export function getCtaLinks(): InternalLink[] {
    return [
        {
            href: "/roast",
            label: "Get Your Deck Reviewed",
            description: "Upload your pitch deck for an AI audit",
        },
        {
            href: "/compare",
            label: "Compare Two Decks",
            description: "See which deck is more fundable",
        },
    ];
}
