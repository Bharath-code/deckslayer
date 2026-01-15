"use client";

import { useState } from "react";
import { ArrowLeft, Upload, Loader2, Trophy, AlertTriangle, Scale, FileText, Skull } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { SlayerLogo } from "@/components/SlayerLogo";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ComparisonReport } from "@/lib/schemas/comparison";

interface ComparisonResult extends ComparisonReport {
    comparison_id?: string;
}

export default function ComparePage() {
    const [deckA, setDeckA] = useState<File | null>(null);
    const [deckB, setDeckB] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ComparisonResult | null>(null);

    const router = useRouter();

    const handleCompare = async () => {
        if (!deckA || !deckB) {
            toast.error("Please upload both decks to compare.");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("deck_a", deckA);
        formData.append("deck_b", deckB);

        try {
            const res = await fetch("/api/compare", {
                method: "POST",
                body: formData,
            });

            if (res.status === 401) {
                router.push("/auth");
                return;
            }

            if (res.status === 402) {
                toast.error("Insufficient credits. Comparison requires 2 credits.");
                return;
            }

            if (!res.ok) {
                throw new Error("Comparison failed");
            }

            const data = await res.json();
            setResult(data);
            toast.success("Comparative analysis complete!");
        } catch {
            toast.error("Failed to compare decks. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const getWinnerColor = (winner: string, deck: 'deck_a' | 'deck_b') => {
        if (winner === deck) return "text-green-500";
        if (winner === 'tie') return "text-yellow-500";
        return "text-red-500";
    };

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-mono">
            <nav className="p-6 flex justify-between items-center border-b border-[var(--border)]">
                <Link href="/" className="text-xl font-black tracking-tighter flex items-center gap-3">
                    <SlayerLogo className="w-6 h-6" />
                    DECKSLAYER
                </Link>
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <Link href="/" className="text-[10px] uppercase tracking-widest text-muted flex items-center gap-2 hover:text-foreground transition-colors">
                        <ArrowLeft size={12} /> Return
                    </Link>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 py-12">
                <header className="text-center mb-16 space-y-4">
                    <h1 className="text-5xl font-black uppercase italic tracking-tighter">
                        <Scale className="inline-block mr-4 text-red-500" size={48} />
                        Comparative Analysis
                    </h1>
                    <p className="text-zinc-500 text-sm max-w-xl mx-auto">
                        Upload two pitch decks side-by-side. Our Investment Committee will determine the winner.
                    </p>
                    <p className="text-[10px] text-red-500 uppercase tracking-widest font-bold">
                        Cost: 2 Credits (1 per deck)
                    </p>
                </header>

                {!result ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        {/* Deck A Upload */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold uppercase tracking-widest text-center">
                                Deck A
                            </h2>
                            <label
                                htmlFor="deck-a"
                                className={`block border-2 border-dashed p-12 text-center cursor-pointer transition-all ${deckA
                                    ? "border-green-500 bg-green-500/5"
                                    : "border-border hover:border-red-500/50"
                                    }`}
                            >
                                <input
                                    type="file"
                                    id="deck-a"
                                    accept=".pdf"
                                    className="hidden"
                                    onChange={(e) => setDeckA(e.target.files?.[0] || null)}
                                />
                                {deckA ? (
                                    <div className="space-y-2">
                                        <FileText size={32} className="mx-auto text-green-500" />
                                        <p className="text-sm font-bold truncate">{deckA.name}</p>
                                        <p className="text-[10px] text-zinc-500 uppercase">Click to change</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Upload size={32} className="mx-auto text-zinc-700" />
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Upload Deck A</p>
                                    </div>
                                )}
                            </label>
                        </div>

                        {/* Deck B Upload */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold uppercase tracking-widest text-center">
                                Deck B
                            </h2>
                            <label
                                htmlFor="deck-b"
                                className={`block border-2 border-dashed p-12 text-center cursor-pointer transition-all ${deckB
                                    ? "border-green-500 bg-green-500/5"
                                    : "border-border hover:border-red-500/50"
                                    }`}
                            >
                                <input
                                    type="file"
                                    id="deck-b"
                                    accept=".pdf"
                                    className="hidden"
                                    onChange={(e) => setDeckB(e.target.files?.[0] || null)}
                                />
                                {deckB ? (
                                    <div className="space-y-2">
                                        <FileText size={32} className="mx-auto text-green-500" />
                                        <p className="text-sm font-bold truncate">{deckB.name}</p>
                                        <p className="text-[10px] text-zinc-500 uppercase">Click to change</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Upload size={32} className="mx-auto text-zinc-700" />
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Upload Deck B</p>
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>
                ) : null}

                {!result && (
                    <div className="text-center">
                        <button
                            onClick={handleCompare}
                            disabled={!deckA || !deckB || loading}
                            className="bg-red-500 text-white px-12 py-4 font-black uppercase text-sm tracking-widest hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? (
                                <span className="flex items-center gap-3">
                                    <Loader2 className="animate-spin" size={18} />
                                    Analyzing Both Decks...
                                </span>
                            ) : (
                                <span className="flex items-center gap-3">
                                    <Skull size={18} />
                                    Compare Decks
                                </span>
                            )}
                        </button>
                    </div>
                )}

                {/* Results */}
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-12"
                        >
                            {/* Winner Banner */}
                            <div className="text-center p-8 border border-[var(--border)] bg-[var(--card)]">
                                <Trophy size={48} className="mx-auto text-yellow-500 mb-4" />
                                <h2 className="text-3xl font-black uppercase italic">
                                    {result.winner === 'tie' ? (
                                        "It&apos;s a Tie"
                                    ) : result.winner === 'deck_a' ? (
                                        <span className="text-green-500">{result.deck_a_name} Wins</span>
                                    ) : (
                                        <span className="text-green-500">{result.deck_b_name} Wins</span>
                                    )}
                                </h2>
                                <p className="text-zinc-500 mt-4 max-w-2xl mx-auto">
                                    {result.winner_reasoning}
                                </p>
                            </div>

                            {/* Score Comparison */}
                            <div className="grid grid-cols-2 gap-8">
                                <div className={`p-8 border text-center ${result.winner === 'deck_a' ? 'border-green-500' : 'border-[var(--border)]'}`}>
                                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Deck A</p>
                                    <h3 className="text-lg font-bold truncate mb-4">{result.deck_a_name}</h3>
                                    <p className={`text-5xl font-black italic ${getWinnerColor(result.winner, 'deck_a')}`}>
                                        {result.deck_a_score}%
                                    </p>
                                </div>
                                <div className={`p-8 border text-center ${result.winner === 'deck_b' ? 'border-green-500' : 'border-[var(--border)]'}`}>
                                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Deck B</p>
                                    <h3 className="text-lg font-bold truncate mb-4">{result.deck_b_name}</h3>
                                    <p className={`text-5xl font-black italic ${getWinnerColor(result.winner, 'deck_b')}`}>
                                        {result.deck_b_score}%
                                    </p>
                                </div>
                            </div>

                            {/* Category Breakdown */}
                            <div className="border border-[var(--border)] p-8">
                                <h3 className="text-xl font-black uppercase mb-6">Category Breakdown</h3>
                                <div className="space-y-4">
                                    {result.category_breakdown.map((cat, i) => (
                                        <div key={i} className="grid grid-cols-3 gap-4 p-4 bg-[var(--card)] border border-[var(--border)]">
                                            <div className="text-center">
                                                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Deck A</p>
                                                <p className={`font-bold ${getWinnerColor(cat.winner, 'deck_a')}`}>
                                                    {cat.deck_a_score}%
                                                </p>
                                                <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{cat.deck_a_verdict}</p>
                                            </div>
                                            <div className="text-center flex flex-col justify-center">
                                                <p className="text-sm font-black uppercase">{cat.category}</p>
                                                {cat.winner !== 'tie' && (
                                                    <Trophy size={16} className={`mx-auto mt-2 ${cat.winner === 'deck_a' ? 'text-green-500' : 'text-green-500'}`} />
                                                )}
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Deck B</p>
                                                <p className={`font-bold ${getWinnerColor(cat.winner, 'deck_b')}`}>
                                                    {cat.deck_b_score}%
                                                </p>
                                                <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{cat.deck_b_verdict}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Combined Red Flags */}
                            {result.combined_red_flags.length > 0 && (
                                <div className="border border-red-500/30 p-8 bg-red-500/5">
                                    <h3 className="text-xl font-black uppercase mb-6 flex items-center gap-3">
                                        <AlertTriangle className="text-red-500" />
                                        Combined Red Flags
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {result.combined_red_flags.map((flag, i) => (
                                            <div key={i} className="p-4 border border-red-500/20 bg-[var(--card)]">
                                                <span className={`text-[10px] uppercase tracking-widest font-bold ${flag.deck === 'deck_a' ? 'text-blue-400' : 'text-purple-400'
                                                    }`}>
                                                    {flag.deck === 'deck_a' ? result.deck_a_name : result.deck_b_name}
                                                </span>
                                                <p className="text-sm mt-1">{flag.flag}</p>
                                                <span className={`text-[8px] uppercase mt-2 inline-block px-2 py-1 ${flag.severity === 'critical' ? 'bg-red-500 text-white' :
                                                    flag.severity === 'major' ? 'bg-orange-500 text-white' :
                                                        'bg-yellow-500 text-black'
                                                    }`}>
                                                    {flag.severity}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* VC Verdict */}
                            <div className="border border-[var(--border)] p-8 bg-[var(--card)]">
                                <h3 className="text-xl font-black uppercase mb-4">VC Verdict</h3>
                                <p className="text-zinc-400 italic">&quot;{result.vc_verdict}&quot;</p>
                                <div className="mt-6 p-4 border border-green-500/30 bg-green-500/5">
                                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Investment Recommendation</p>
                                    <p className="font-bold text-green-500">
                                        {result.investment_recommendation.recommended_deck === 'neither'
                                            ? 'Pass on both'
                                            : result.investment_recommendation.recommended_deck === 'deck_a'
                                                ? result.deck_a_name
                                                : result.deck_b_name
                                        }
                                        <span className="text-zinc-500 ml-2">
                                            ({result.investment_recommendation.confidence}% confidence)
                                        </span>
                                    </p>
                                    <p className="text-sm text-zinc-500 mt-2">{result.investment_recommendation.rationale}</p>
                                </div>
                            </div>

                            {/* New Comparison Button */}
                            <div className="text-center">
                                <button
                                    onClick={() => {
                                        setResult(null);
                                        setDeckA(null);
                                        setDeckB(null);
                                    }}
                                    className="border border-[var(--border)] px-8 py-3 font-bold uppercase text-sm tracking-widest hover:border-red-500 transition-colors"
                                >
                                    Compare Different Decks
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <footer className="p-10 border-t border-border text-center transition-colors duration-300">
                <p className="text-[8px] text-muted uppercase tracking-widest font-black">
                    DeckSlayer Protocol {"//"} Comparative Analysis Engine
                </p>
            </footer>
        </div>
    );
}
