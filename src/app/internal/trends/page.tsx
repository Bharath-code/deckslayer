"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { SlayerLogo } from "@/components/SlayerLogo";
import { ArrowLeft, Database, TrendingUp, AlertTriangle, Zap, Loader2 } from "lucide-react";
import Link from "next/link";

interface MarketInsight {
    id: string;
    roast_id: string;
    sector: string;
    sub_sector: string | null;
    stage: string;
    funding_target_usd: number | null;
    narrative_tags: string[];
    primary_claim: string;
    fundability_score: number;
    red_flag_severity: string;
    created_at: string;
}

interface SectorStats {
    sector: string;
    count: number;
    avgScore: number;
}

export default function InternalTrendsPage() {
    const [insights, setInsights] = useState<MarketInsight[]>([]);
    const [loading, setLoading] = useState(true);
    const [sectorStats, setSectorStats] = useState<SectorStats[]>([]);
    const [narrativeTags, setNarrativeTags] = useState<{ tag: string; count: number }[]>([]);

    const supabase = createClient();

    useEffect(() => {
        const fetchInsights = async () => {
            const { data, error } = await supabase
                .from('market_insights')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Failed to fetch insights:", error);
                setLoading(false);
                return;
            }

            setInsights(data || []);

            // Calculate sector statistics
            const sectorMap = new Map<string, { count: number; totalScore: number }>();
            const tagMap = new Map<string, number>();

            data?.forEach(insight => {
                // Sector stats
                const existing = sectorMap.get(insight.sector) || { count: 0, totalScore: 0 };
                sectorMap.set(insight.sector, {
                    count: existing.count + 1,
                    totalScore: existing.totalScore + (insight.fundability_score || 0)
                });

                // Narrative tags
                insight.narrative_tags?.forEach((tag: string) => {
                    tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
                });
            });

            setSectorStats(
                Array.from(sectorMap.entries())
                    .map(([sector, stats]) => ({
                        sector,
                        count: stats.count,
                        avgScore: Math.round(stats.totalScore / stats.count)
                    }))
                    .sort((a, b) => b.count - a.count)
            );

            setNarrativeTags(
                Array.from(tagMap.entries())
                    .map(([tag, count]) => ({ tag, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 15)
            );

            setLoading(false);
        };

        fetchInsights();
    }, [supabase]);

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case "low": return "text-green-500";
            case "medium": return "text-yellow-500";
            case "high": return "text-orange-500";
            case "critical": return "text-red-500";
            default: return "text-muted";
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background text-foreground font-mono flex items-center justify-center">
                <Loader2 className="animate-spin text-red-500" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground font-mono">
            <nav className="p-6 flex justify-between items-center border-b border-border">
                <Link href="/" className="text-xl font-black tracking-tighter flex items-center gap-3">
                    <SlayerLogo className="w-6 h-6" />
                    DECKSLAYER <span className="text-red-500 text-xs ml-2">INTERNAL</span>
                </Link>
                <Link href="/" className="text-[10px] uppercase tracking-widest text-muted flex items-center gap-2 hover:text-foreground transition-colors">
                    <ArrowLeft size={12} /> Return
                </Link>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-16">
                <header className="mb-16 space-y-4">
                    <div className="flex items-center gap-4">
                        <TrendingUp size={32} className="text-red-500" />
                        <h1 className="text-4xl font-black uppercase italic tracking-tighter">Market Radar</h1>
                    </div>
                    <p className="text-muted text-[10px] tracking-[0.3em] uppercase font-bold">
                        Internal Intelligence // {insights.length} Decks Analyzed
                    </p>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {/* Sector Heatmap */}
                    <div className="p-8 border border-border bg-card space-y-6">
                        <div className="flex items-center gap-3">
                            <Database size={16} className="text-red-500" />
                            <h2 className="text-[10px] uppercase tracking-widest font-black text-muted">Sector Distribution</h2>
                        </div>
                        <div className="space-y-3">
                            {sectorStats.map(stat => (
                                <div key={stat.sector} className="flex justify-between items-center">
                                    <span className="text-sm font-bold">{stat.sector}</span>
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] text-muted">{stat.count} decks</span>
                                        <span className="text-xs font-black text-red-500">{stat.avgScore}%</span>
                                    </div>
                                </div>
                            ))}
                            {sectorStats.length === 0 && (
                                <p className="text-muted text-xs">No data yet</p>
                            )}
                        </div>
                    </div>

                    {/* Narrative Tags */}
                    <div className="p-8 border border-border bg-card space-y-6">
                        <div className="flex items-center gap-3">
                            <Zap size={16} className="text-yellow-500" />
                            <h2 className="text-[10px] uppercase tracking-widest font-black text-muted">Trending Narratives</h2>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {narrativeTags.map(({ tag, count }) => (
                                <span key={tag} className="px-3 py-1 bg-background border border-border text-[10px] font-bold uppercase tracking-widest">
                                    {tag} <span className="text-red-500">({count})</span>
                                </span>
                            ))}
                            {narrativeTags.length === 0 && (
                                <p className="text-muted text-xs">No narrative data yet</p>
                            )}
                        </div>
                    </div>

                    {/* Risk Overview */}
                    <div className="p-8 border border-border bg-card space-y-6">
                        <div className="flex items-center gap-3">
                            <AlertTriangle size={16} className="text-orange-500" />
                            <h2 className="text-[10px] uppercase tracking-widest font-black text-muted">Risk Distribution</h2>
                        </div>
                        <div className="space-y-3">
                            {["critical", "high", "medium", "low"].map(severity => {
                                const count = insights.filter(i => i.red_flag_severity === severity).length;
                                return (
                                    <div key={severity} className="flex justify-between items-center">
                                        <span className={`text-sm font-bold capitalize ${getSeverityColor(severity)}`}>{severity}</span>
                                        <span className="text-[10px] text-muted">{count} decks</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Recent Insights Table */}
                <section className="space-y-8">
                    <h2 className="text-[10px] uppercase tracking-[0.6em] text-muted font-black border-b border-border pb-4">
                        Recent Intelligence
                    </h2>

                    {insights.length === 0 ? (
                        <div className="text-center py-20 border border-border bg-card">
                            <p className="text-muted uppercase tracking-widest text-[10px] font-black">No market intelligence collected yet.</p>
                            <p className="text-muted text-[9px] mt-2">Run audits to start building the trend database.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {insights.slice(0, 20).map(insight => (
                                <div key={insight.id} className="p-6 border border-border bg-card hover:border-red-500/30 transition-all">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-4 mb-2">
                                                <span className="text-xs font-black uppercase text-red-500">{insight.sector}</span>
                                                <span className="text-[10px] text-muted uppercase">{insight.stage}</span>
                                                <span className={`text-[10px] font-bold uppercase ${getSeverityColor(insight.red_flag_severity)}`}>
                                                    {insight.red_flag_severity} risk
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted italic">&ldquo;{insight.primary_claim}&rdquo;</p>
                                            <div className="flex flex-wrap gap-1 mt-3">
                                                {insight.narrative_tags?.slice(0, 5).map(tag => (
                                                    <span key={tag} className="px-2 py-0.5 bg-background border border-border text-[8px] font-bold uppercase">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-2xl font-black italic">{insight.fundability_score}%</span>
                                            <p className="text-[8px] text-muted uppercase tracking-widest">Fundability</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            <footer className="p-10 border-t border-border text-center">
                <p className="text-[8px] text-muted uppercase tracking-widest font-black">
                    DeckSlayer Internal Intelligence // Confidential
                </p>
            </footer>
        </div>
    );
}
