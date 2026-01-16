import { MetadataRoute } from "next";
import { SECTORS, STAGES, INTENTS, SITE_CONFIG } from "@/lib/seo/metadata";

/**
 * Dynamic sitemap generation for programmatic SEO.
 * Next.js will automatically serve this at /sitemap.xml
 */
export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = SITE_CONFIG.domain;
    const now = new Date();

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 1.0,
        },
        {
            url: `${baseUrl}/auth`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.3,
        },
    ];

    // Hub pages
    const hubPages: MetadataRoute.Sitemap = [
        {
            url: `${baseUrl}/pitch-deck-review`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.9,
        },
    ];

    // Sector pages
    const sectorPages: MetadataRoute.Sitemap = SECTORS.map((sector) => ({
        url: `${baseUrl}/pitch-deck-review/${sector}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
    }));

    // Stage pages (sector + stage combinations)
    const stagePages: MetadataRoute.Sitemap = [];
    for (const sector of SECTORS) {
        for (const stage of STAGES) {
            stagePages.push({
                url: `${baseUrl}/pitch-deck-review/${sector}/${stage}`,
                lastModified: now,
                changeFrequency: "weekly" as const,
                priority: 0.7,
            });
        }
    }

    // Intent pages (sector + stage + intent combinations)
    const intentPages: MetadataRoute.Sitemap = [];
    for (const sector of SECTORS) {
        for (const stage of STAGES) {
            for (const intent of INTENTS) {
                intentPages.push({
                    url: `${baseUrl}/pitch-deck-review/${sector}/${stage}/${intent}`,
                    lastModified: now,
                    changeFrequency: "monthly" as const,
                    priority: 0.6,
                });
            }
        }
    }

    return [...staticPages, ...hubPages, ...sectorPages, ...stagePages, ...intentPages];
}
