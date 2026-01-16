import { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/seo/metadata";

/**
 * Robots.txt configuration for SEO.
 * Next.js will automatically serve this at /robots.txt
 */
export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: ["/", "/pitch-deck-review/"],
                disallow: [
                    "/api/",
                    "/roast",
                    "/compare",
                    "/history",
                    "/internal/",
                    "/auth/callback",
                ],
            },
        ],
        sitemap: `${SITE_CONFIG.domain}/sitemap.xml`,
    };
}
