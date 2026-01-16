import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface RelatedLink {
    href: string;
    label: string;
    description?: string;
}

interface RelatedPagesProps {
    title?: string;
    links: RelatedLink[];
    className?: string;
}

/**
 * Related pages grid component for internal linking.
 * Implements hub-and-spoke linking strategy for topical authority.
 */
export function RelatedPages({
    title = "Related Topics",
    links,
    className = "",
}: RelatedPagesProps) {
    if (links.length === 0) return null;

    return (
        <section className={`${className}`}>
            <h2 className="text-lg font-bold text-foreground mb-6">{title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className="group p-6 border border-border bg-card rounded-lg hover:border-red-500/30 transition-all duration-300"
                    >
                        <div className="flex items-center justify-between">
                            <span className="font-medium text-foreground group-hover:text-red-500 transition-colors">
                                {link.label}
                            </span>
                            <ArrowRight
                                size={16}
                                className="text-muted group-hover:text-red-500 group-hover:translate-x-1 transition-all"
                            />
                        </div>
                        {link.description && (
                            <p className="mt-2 text-sm text-muted line-clamp-2">
                                {link.description}
                            </p>
                        )}
                    </Link>
                ))}
            </div>
        </section>
    );
}

/**
 * Sector grid for hub pages - shows all available sectors.
 */
interface SectorGridProps {
    sectors: { slug: string; name: string; description?: string }[];
    basePath?: string;
    className?: string;
}

export function SectorGrid({
    sectors,
    basePath = "/pitch-deck-review",
    className = "",
}: SectorGridProps) {
    return (
        <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 ${className}`}>
            {sectors.map((sector) => (
                <Link
                    key={sector.slug}
                    href={`${basePath}/${sector.slug}`}
                    className="group p-6 border border-border bg-card rounded-lg text-center hover:border-red-500/30 hover:bg-card/80 transition-all duration-300"
                >
                    <span className="font-bold text-foreground group-hover:text-red-500 transition-colors">
                        {sector.name}
                    </span>
                    {sector.description && (
                        <p className="mt-1 text-xs text-muted">{sector.description}</p>
                    )}
                </Link>
            ))}
        </div>
    );
}

/**
 * CTA banner for conversion at bottom of SEO pages.
 */
interface CTABannerProps {
    title?: string;
    description?: string;
    primaryCta?: { href: string; label: string };
    secondaryCta?: { href: string; label: string };
    className?: string;
}

export function CTABanner({
    title = "Ready to get your deck reviewed?",
    description = "Upload your pitch deck and get an adversarial AI audit in minutes.",
    primaryCta = { href: "/roast", label: "Get Your Deck Reviewed" },
    secondaryCta,
    className = "",
}: CTABannerProps) {
    return (
        <section
            className={`p-10 bg-gradient-to-r from-red-500/10 to-transparent border border-red-500/20 rounded-lg ${className}`}
        >
            <div className="max-w-2xl">
                <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
                <p className="text-muted mb-6">{description}</p>
                <div className="flex flex-wrap gap-4">
                    <Link
                        href={primaryCta.href}
                        className="px-6 py-3 bg-red-500 text-white font-bold text-sm uppercase tracking-widest hover:bg-red-600 transition-colors rounded"
                    >
                        {primaryCta.label}
                    </Link>
                    {secondaryCta && (
                        <Link
                            href={secondaryCta.href}
                            className="px-6 py-3 border border-border text-foreground font-bold text-sm uppercase tracking-widest hover:border-foreground transition-colors rounded"
                        >
                            {secondaryCta.label}
                        </Link>
                    )}
                </div>
            </div>
        </section>
    );
}
