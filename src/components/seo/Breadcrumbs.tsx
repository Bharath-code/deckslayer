"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
    name: string;
    url: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    className?: string;
}

/**
 * Semantic breadcrumb navigation component.
 * Renders as an ordered list with proper ARIA attributes for accessibility.
 * Schema markup is handled separately via SchemaScript component.
 */
export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
    return (
        <nav
            aria-label="Breadcrumb"
            className={`text-sm ${className}`}
        >
            <ol className="flex items-center gap-2 flex-wrap" itemScope itemType="https://schema.org/BreadcrumbList">
                {items.map((item, index) => (
                    <li
                        key={item.url}
                        className="flex items-center gap-2"
                        itemProp="itemListElement"
                        itemScope
                        itemType="https://schema.org/ListItem"
                    >
                        {index === 0 ? (
                            <Link
                                href={item.url}
                                className="text-muted hover:text-foreground transition-colors flex items-center gap-1"
                                itemProp="item"
                            >
                                <Home size={14} />
                                <span itemProp="name" className="sr-only">{item.name}</span>
                            </Link>
                        ) : (
                            <>
                                <ChevronRight size={14} className="text-muted/50" />
                                {index === items.length - 1 ? (
                                    <span
                                        className="text-foreground font-medium"
                                        itemProp="name"
                                        aria-current="page"
                                    >
                                        {item.name}
                                    </span>
                                ) : (
                                    <Link
                                        href={item.url}
                                        className="text-muted hover:text-foreground transition-colors"
                                        itemProp="item"
                                    >
                                        <span itemProp="name">{item.name}</span>
                                    </Link>
                                )}
                            </>
                        )}
                        <meta itemProp="position" content={String(index + 1)} />
                    </li>
                ))}
            </ol>
        </nav>
    );
}
