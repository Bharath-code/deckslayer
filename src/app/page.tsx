"use client";

import { Skull, ArrowRight, Loader2, Twitter, BarChart3, Globe, Download, LogOut, FileText } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SlayerLogo } from "@/components/SlayerLogo";
import { createClient } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export default function Home() {
  const [loading, setLoading] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState<number>(0);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Fetch credits
        const { data: ledger } = await supabase
          .from('credits_ledger')
          .select('amount')
          .eq('user_id', user.id);

        const total = ledger?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
        setCredits(total);
      }
    };

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // Refresh credits on auth change
        fetchUser();
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  const handleCheckout = async (productId: string) => {
    if (!user) {
      router.push("/auth");
      return;
    }
    setLoading(productId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      alert("System overload. High demand detected.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono selection:bg-red-500 selection:text-white overflow-x-hidden">
      {/* GLOBAL STATUS BAR */}
      <div className="w-full bg-red-500 text-black py-1 px-6 text-[10px] font-black uppercase tracking-[0.3em] flex justify-between items-center">
        <span>SOTA G-3-P ENGINE: OPERATIONAL</span>
        <span className="hidden md:block">MARKET SENTIMENT: BEARISH // BAR IS HIGH</span>
        <span>A2A PROTOCOL V0.2.1</span>
      </div>

      <nav className="p-8 flex justify-between items-center border-b border-white/5 sticky top-0 bg-black/80 backdrop-blur-xl z-50">
        <div className="text-2xl font-black tracking-tighter flex items-center gap-3">
          <SlayerLogo className="w-8 h-8" />
          DECKSLAYER
        </div>
        <div className="hidden md:flex gap-12 text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold items-center">
          <Link href="#methodology" className="hover:text-red-500 transition-colors">Methodology</Link>
          <Link href="#agents" className="hover:text-red-500 transition-colors">The Partners</Link>
          {user && (
            <Link href="/history" className="hover:text-red-500 transition-colors flex items-center gap-2">
              <FileText size={12} /> Archives
            </Link>
          )}
          {user ? (
            <div className="flex items-center gap-6 border-l border-white/10 pl-12">
              <div className="flex flex-col items-end">
                <span className="text-white font-black">{user.email?.split('@')[0]}</span>
                <span className="text-red-500 text-[8px] tracking-[0.2em]">{credits} CREDITS</span>
              </div>
              <button onClick={handleLogout} className="text-zinc-700 hover:text-white transition-colors">
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <Link href="/auth" className="hover:text-white transition-colors border-b border-red-500/50 pb-1 text-white">Login / Audit</Link>
          )}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pt-40 pb-40">
        {/* HERO SECTION */}
        <section className="space-y-12 relative">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-red-500/5 blur-[120px] rounded-full -z-10" />

          <div className="space-y-6">
            <h1 className="text-7xl md:text-[10rem] font-black tracking-tighter leading-[0.8] uppercase italic">
              KILL THE <br />
              <span className="text-red-500">DELUSION.</span>
            </h1>
            <p className="text-xl md:text-2xl text-zinc-400 max-w-3xl leading-relaxed font-light">
              Your deck isn&apos;t a pitch; it&apos;s a liability. We use adversarial AI to simulate a Tier-1 Investment Committee. Find the structural flaws before they kill your round.
            </p>
          </div>

          <div className="pt-8 flex flex-col md:flex-row gap-8 items-start md:items-center">
            <button
              onClick={() => handleCheckout("p_one_shot")}
              className="group relative inline-flex items-center gap-8 bg-white text-black px-16 py-10 text-3xl font-black uppercase tracking-tighter hover:bg-red-500 hover:text-white transition-all duration-500 shadow-[15px_15px_0px_rgba(239,68,68,0.2)] active:shadow-none active:translate-x-2 active:translate-y-2"
            >
              {loading === "p_one_shot" ? <Loader2 className="animate-spin" /> : "Initiate Diagnostic"}
              <ArrowRight className="group-hover:translate-x-4 transition-transform" size={32} />
            </button>
            <div className="text-[10px] text-zinc-600 uppercase tracking-widest leading-loose">
              NO WAITLISTS. <br />
              NO SALES CALLS. <br />
              JUST THE BRUTAL TRUTH.
            </div>
          </div>
        </section>

        {/* LOGO CLOUD / SOCIAL PROOF */}
        <section className="mt-40 border-y border-white/5 py-12 opacity-30 grayscale hover:opacity-100 transition-opacity duration-1000">
          <p className="text-center text-[10px] uppercase tracking-[0.5em] mb-8 font-black text-zinc-500">Designed for founders targeting</p>
          <div className="flex flex-wrap justify-center gap-16 md:gap-32 text-2xl font-black tracking-tighter italic italic">
            <span>YC</span>
            <span>A16Z</span>
            <span>SEQUOIA</span>
            <span>INDEX</span>
            <span>ACCEL</span>
          </div>
        </section>

        {/* METHODOLOGY SECTION */}
        <section id="methodology" className="mt-60 space-y-24">
          <div className="max-w-2xl space-y-6">
            <h2 className="text-4xl font-black uppercase italic tracking-tight border-l-4 border-red-500 pl-8">The Adversarial Moat</h2>
            <p className="text-zinc-500 leading-relaxed">
              Standard LLMs are aligned for user retention through positive reinforcement. They are fundamentally incapable of giving you the critique a GP gives a Principal when the door is closed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 border border-white/5">
            <div className="p-16 bg-black space-y-6 group hover:bg-zinc-950 transition-colors border-b border-r border-white/5">
              <div className="w-12 h-12 bg-red-500/10 flex items-center justify-center text-red-500 mb-8 border border-red-500/20 group-hover:scale-110 transition-transform">
                <BarChart3 size={24} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tighter italic text-red-500">Structural Diagnostic</h3>
              <p className="text-zinc-500 text-[10px] leading-loose uppercase tracking-widest leading-relaxed">
                Our engine performs a slide-by-slide logic audit. We identify the precise moment your narrative loses the room. Most decks fail not on vision, but on internal consistency.
              </p>
            </div>
            <div className="p-16 bg-black space-y-6 group hover:bg-zinc-950 transition-colors border-b border-white/5">
              <div className="w-12 h-12 bg-red-500/10 flex items-center justify-center text-red-500 mb-8 border border-red-500/20 group-hover:scale-110 transition-transform">
                <Skull size={24} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tighter italic text-red-500">The Interrogation</h3>
              <p className="text-zinc-500 text-[10px] leading-loose uppercase tracking-widest text-white/80">
                You don&apos;t just read a report. Sarah (The Skeptic) will ask you the single hardest question about your business. Defend your thesis in real-time or lose the room.
              </p>
            </div>
            <div className="p-16 bg-black space-y-6 group hover:bg-zinc-950 transition-colors border-r border-white/5">
              <div className="w-12 h-12 bg-red-500/10 flex items-center justify-center text-red-500 mb-8 border border-red-500/20 group-hover:scale-110 transition-transform">
                <Globe size={24} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tighter italic text-red-500">A2A Verification</h3>
              <p className="text-zinc-500 text-[10px] leading-loose uppercase tracking-widest">
                Utilizing the Google A2A SDK, we consult specialized autonomous agents for market validation, unit economic sanity, and competitive landscape accuracy.
              </p>
            </div>
            <div className="p-16 bg-black space-y-6 group hover:bg-zinc-950 transition-colors">
              <div className="w-12 h-12 bg-red-500/10 flex items-center justify-center text-red-500 mb-8 border border-red-500/20 group-hover:scale-110 transition-transform">
                <Download size={24} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tighter italic text-red-500">Confidential Memo</h3>
              <p className="text-zinc-500 text-[10px] leading-loose uppercase tracking-widest">
                Export your diagnostic as a professional, watermarked internal VC memo. Perfect for sharing with co-founders or preparing for the real IC meeting.
              </p>
            </div>
          </div>
        </section>

        {/* AGENT PROFILES */}
        <section id="agents" className="mt-60 space-y-24">
          <div className="text-center space-y-4">
            <h2 className="text-5xl font-black uppercase tracking-tighter italic">Meet the Partners.</h2>
            <p className="text-zinc-600 uppercase tracking-[0.3em] text-[10px] font-bold">The simulated Investment Committee that decides your fate.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-6 text-center md:text-left">
              <div className="aspect-square bg-zinc-900 border border-white/5 flex items-center justify-center text-6xl font-black text-red-500 grayscale opacity-50">S</div>
              <div className="space-y-2">
                <h4 className="font-black uppercase tracking-widest text-red-500 italic">Sarah // The Liquidator</h4>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest leading-loose">
                  GP at a SOTA fund. Her job is to filter noise. She looks for &ldquo;The Big Lie&rdquo; and execution gaps. If she doesn&apos;t believe you, no one will.
                </p>
              </div>
            </div>
            <div className="space-y-6 text-center md:text-left">
              <div className="aspect-square bg-zinc-900 border border-white/5 flex items-center justify-center text-6xl font-black text-red-500 grayscale opacity-50">M</div>
              <div className="space-y-2">
                <h4 className="font-black uppercase tracking-widest text-red-500 italic">Marcus // The Hawk</h4>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest leading-loose">
                  Data specialist. He obsessively checks TAM math, bottoms-up projections, and your competitive moat. He hates vague charts.
                </p>
              </div>
            </div>
            <div className="space-y-6 text-center md:text-left">
              <div className="aspect-square bg-zinc-900 border border-white/5 flex items-center justify-center text-6xl font-black text-red-500 grayscale opacity-50">L</div>
              <div className="space-y-2">
                <h4 className="font-black uppercase tracking-widest text-red-500 italic">Leo // The Visionary</h4>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest leading-loose">
                  Looking for the next moonshot. He cares about &ldquo;Why Now&rdquo; and &ldquo;Product Obsession.&rdquo; He is your best hope, but he&apos;s easily bored.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section id="pricing" className="mt-60">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 border border-white/5">
            <div className="p-20 bg-black space-y-10">
              <h4 className="font-black uppercase tracking-widest text-[10px] text-zinc-600">Protocol 01 // The Reckoning</h4>
              <div className="space-y-2">
                <div className="text-8xl font-black tracking-tighter leading-none italic italic italic">$9</div>
                <p className="text-[10px] text-zinc-600 uppercase tracking-[0.4em] font-black">Per Diagnostic</p>
              </div>
              <ul className="text-[10px] text-zinc-500 space-y-6 uppercase tracking-widest font-black">
                <li className="flex items-center gap-4"><div className="w-1.5 h-1.5 bg-red-500" /> Multi-Agent IC Transcript</li>
                <li className="flex items-center gap-4"><div className="w-1.5 h-1.5 bg-red-500" /> Killer Question Interrogation</li>
                <li className="flex items-center gap-4"><div className="w-1.5 h-1.5 bg-red-500" /> Full Slayer&apos;s List</li>
              </ul>
              <button
                onClick={() => handleCheckout("p_one_shot")}
                className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.2em] text-sm hover:bg-red-500 hover:text-white transition-all duration-500"
              >
                {loading === "p_one_shot" ? "Authenticating..." : "Purchase Access"}
              </button>
            </div>

            <div className="p-20 bg-zinc-950 space-y-10 relative overflow-hidden border-l border-white/5">
              <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-8 py-2 font-black uppercase tracking-[0.3em]">High Intent</div>
              <h4 className="font-black uppercase tracking-widest text-[10px] text-red-500">Protocol 02 // Total Dominance</h4>
              <div className="space-y-2">
                <div className="text-8xl font-black tracking-tighter leading-none italic italic italic">$19</div>
                <p className="text-[10px] text-zinc-600 uppercase tracking-[0.4em] font-black">Three Audit Credits</p>
              </div>
              <ul className="text-[10px] text-zinc-400 space-y-6 uppercase tracking-widest font-black">
                <li className="flex items-center gap-4"><div className="w-1.5 h-1.5 bg-red-500" /> All Protocol 01 Features</li>
                <li className="flex items-center gap-4"><div className="w-1.5 h-1.5 bg-red-500" /> 3 Audit Credits ($6 Savings)</li>
                <li className="flex items-center gap-4"><div className="w-1.5 h-1.5 bg-red-500" /> Confidential PDF Exports</li>
              </ul>
              <button
                onClick={() => handleCheckout("p_batch")}
                className="w-full py-6 bg-red-500 text-white font-black uppercase tracking-[0.2em] text-sm hover:bg-white hover:text-black transition-all duration-500 shadow-[10px_10px_0px_rgba(255,255,255,0.1)]"
              >
                {loading === "p_batch" ? "Authenticating..." : "Select Iteration"}
              </button>
            </div>
          </div>
        </section>

        {/* FAQ / REBUTTAL SECTION */}
        <section className="mt-60 max-w-3xl mx-auto space-y-20">
          <h2 className="text-3xl font-black uppercase tracking-tighter italic border-b border-white/10 pb-4">Internal Objections</h2>
          <div className="space-y-16">
            <div className="space-y-4">
              <h4 className="text-red-500 font-black uppercase text-xs tracking-widest">Q: Why not just use Gemini or ChatGPT?</h4>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Consumer models are optimized for engagement and safety. They are RLHF-trained to be supportive. DeckSlayer is configured for <span className="text-white underline decoration-red-500/50">adversarial verification</span>. If a GP wouldn&apos;t buy your logic, neither will we.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-red-500 font-black uppercase text-xs tracking-widest">Q: Do you share my data with VCs?</h4>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Negative. All data is encrypted and used solely for your diagnostic. We aggregate anonymized metadata to build the market benchmark, but your secrets stay yours.
              </p>
            </div>
            <div className="space-y-4 text-center pt-10">
              <p className="text-[10px] text-zinc-700 uppercase tracking-[0.5em] font-black italic">No more excuses. Just results.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="p-24 border-t border-white/5 bg-zinc-950">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-24">
          <div className="space-y-8">
            <div className="text-2xl font-black tracking-tighter flex items-center gap-3">
              <SlayerLogo className="w-8 h-8" />
              DECKSLAYER
            </div>
            <p className="text-[10px] text-zinc-600 uppercase leading-loose max-w-sm tracking-[0.2em]">
              The world&apos;s first adversarial diagnostic for venture capital readiness. Built in India for the global founder elite.
            </p>
          </div>
          <div className="flex flex-col md:items-end justify-center space-y-10">
            <div className="flex gap-10">
              <Link href="https://twitter.com/deckslayer" className="text-zinc-500 hover:text-red-500 transition-all transform hover:scale-125">
                <Twitter size={24} />
              </Link>
            </div>
            <div className="text-right space-y-2">
              <p className="text-[9px] text-zinc-700 uppercase tracking-widest font-black">
                &copy; {new Date().getFullYear()} DeckSlayer Strategic Unit.
              </p>
              <p className="text-[9px] text-zinc-800 uppercase tracking-widest">
                All rights reserved. Property of the Arena.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
