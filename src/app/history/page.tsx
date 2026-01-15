"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { ArrowLeft, FileText, Lock, Unlock } from "lucide-react";
import Link from "next/link";
import { SlayerLogo } from "@/components/SlayerLogo";
import { useRouter } from "next/navigation";
import { HistoryPageSkeleton } from "@/components/Skeleton";
import { ThemeToggle } from "@/components/ThemeToggle";

interface RoastRecord {
    id: string;
    deck_name: string;
    created_at: string;
    pdf_unlocked: boolean;
    result_json: { fundability_score: number };
}

export default function HistoryPage() {
    const [roasts, setRoasts] = useState<RoastRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/auth");
                return;
            }

            const { data: roastData } = await supabase
                .from('roasts')
                .select('*')
                .order('created_at', { ascending: false });

            setRoasts(roastData || []);
            setLoading(false);
        };

        init();
    }, [supabase, router]);

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-mono selection:bg-red-500">
            <nav className="p-6 flex justify-between items-center border-b border-[var(--border)]">
                <Link href="/" className="text-xl font-black tracking-tighter flex items-center gap-3">
                    <SlayerLogo className="w-6 h-6" />
                    DECKSLAYER
                </Link>
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <Link href="/" className="text-[10px] uppercase tracking-widest text-zinc-500 flex items-center gap-2 hover:text-[var(--foreground)] transition-colors">
                        <ArrowLeft size={12} /> Return
                    </Link>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-6 py-20">
                <header className="mb-16 space-y-4">
                    <h1 className="text-5xl font-black uppercase italic tracking-tighter">Audit Archives.</h1>
                    <p className="text-zinc-500 text-[10px] tracking-[0.3em] uppercase font-bold">Confidential History {"//"} {roasts.length} Records Detected</p>
                </header>

                {loading ? (
                    <HistoryPageSkeleton />
                ) : roasts.length === 0 ? (
                    <div className="text-center py-40 border border-zinc-900 bg-[var(--card)]">
                        <p className="text-zinc-600 uppercase tracking-widest text-[10px] font-black">No diagnostic records found.</p>
                        <Link href="/roast" className="mt-8 inline-block bg-[var(--foreground)] text-[var(--background)] px-10 py-4 font-black uppercase text-[10px] tracking-widest hover:bg-red-500 hover:text-white transition-all">
                            Initiate First Audit
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {roasts.map((roast) => (
                            <Link
                                key={roast.id}
                                href={`/roast?roast_id=${roast.id}`}
                                className="group p-8 border border-[var(--border)] bg-[var(--card)] hover:border-red-500/30 transition-all flex items-center justify-between"
                            >
                                <div className="flex items-center gap-8">
                                    <div className="w-12 h-12 bg-zinc-900 border border-white/5 flex items-center justify-center group-hover:bg-red-500/10 transition-colors">
                                        <FileText size={20} className="text-zinc-700 group-hover:text-red-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tight group-hover:text-red-500 transition-colors">{roast.deck_name}</h3>
                                        <p className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest mt-1">
                                            Audited on {new Date(roast.created_at).toLocaleDateString()} {"//"} Ref: {roast.id.slice(0, 8)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-10">
                                    <div className="flex flex-col items-end">
                                        <span className="text-2xl font-black italic text-zinc-400 group-hover:text-[var(--foreground)] transition-colors">{roast.result_json.fundability_score}%</span>
                                        <span className="text-[8px] uppercase tracking-widest text-zinc-700 font-black">Fundability</span>
                                    </div>
                                    <div className="h-10 w-px bg-zinc-900" />
                                    {roast.pdf_unlocked ? (
                                        <Unlock size={16} className="text-green-500/50" />
                                    ) : (
                                        <Lock size={16} className="text-zinc-800" />
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>

            <footer className="p-10 border-t border-[var(--border)] text-center">
                <p className="text-[8px] text-zinc-800 uppercase tracking-widest font-black">DeckSlayer Protocol {"//"} Secure Archives</p>
            </footer>
        </div>
    );
}
