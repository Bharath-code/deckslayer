"use client";

import { Suspense, useEffect, useState } from "react";
import { ArrowLeft, Loader2, Upload, Skull, Download, Zap, ShieldCheck, Twitter, FileText, Lock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { SlayerLogo } from "@/components/SlayerLogo";
import { createClient } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { useRouter, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { toast } from "sonner";

interface RoastData {
  headline_burn: string;
  fundability_score: number;
  market_benchmark: string;
  red_flag_count: number;
  red_flags: { title: string; reason: string }[];
  slayers_list: string[];
  narrative_delta: string;
  killer_question: string;
  meeting_transcript: { partner: string; comment: string; a2a_status: string }[];
  slide_breakdown?: { slide: string; critique: string; score: number }[];
  a2a_metadata: { protocol: string; agents_consulted: string[] };
  roast_id?: string;
  pdf_unlocked?: boolean;
}

function RoastPageContent() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RoastData | null>(null);
  const [answer, setAnswer] = useState("");
  const [judgement, setJudgement] = useState<string | null>(null);
  const [judging, setJudging] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState<number>(0);
  const [roastId, setRoastId] = useState<string | null>(null);
  const [pdfUnlocked, setPdfUnlocked] = useState(false);

  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentSuccess = searchParams.get("payment_success") === "true";

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      setUser(user);

      // Fetch credits
      const { data: ledger } = await supabase
        .from('credits_ledger')
        .select('amount')
        .eq('user_id', user.id);

      const total = ledger?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
      setCredits(total);

      const queryRoastId = searchParams.get("roast_id");
      if (queryRoastId) {
        const { data: roast } = await supabase
          .from('roasts')
          .select('pdf_unlocked, result_json')
          .eq('id', queryRoastId)
          .single();

        if (roast) {
          setData(roast.result_json);
          setPdfUnlocked(roast.pdf_unlocked);
          setRoastId(queryRoastId);
        }
      }
    };

    init();
  }, [supabase, router, searchParams]);

  const exportPDF = async () => {
    const reportElement = document.getElementById("diagnostic-report");
    if (!reportElement) return;

    setExporting(true);
    try {
      const canvas = await html2canvas(reportElement, {
        backgroundColor: "#000000",
        scale: 3,
        logging: false,
        useCORS: true,
        windowWidth: 1200,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`DECKSLAYER_DIAGNOSTIC_${new Date().getTime()}.pdf`);
    } catch (err) {
      console.error(err);
      toast.error("PDF Generation failed.");
    } finally {
      setExporting(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    posthog.capture('audit_initiated', { filename: file.name });
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/roast", {
        method: "POST",
        body: formData,
      });

      if (res.status === 402) {
        toast.error("Your audit quota has been depleted. Please purchase credits.");
        router.push("/#pricing");
        return;
      }

      if (res.status === 429) {
        toast.warning("Rate limit exceeded. Please wait a moment before trying again.");
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Roast failed");
      }

      // Handle streaming response
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulatedText += decoder.decode(value, { stream: true });

          // Try to parse the accumulated JSON (it might be partial)
          try {
            const partialData = JSON.parse(accumulatedText);
            setData(partialData);
          } catch {
            // JSON not complete yet, continue accumulating
          }
        }

        // Final parse
        try {
          const finalData = JSON.parse(accumulatedText);
          setData(finalData);
          posthog.capture('audit_completed', {
            score: finalData.fundability_score,
          });
        } catch {
          // If streaming didn't produce valid JSON, try to extract it
          console.error("Failed to parse final streamed data");
        }
      }

      // Optimistically decrement credit
      setCredits(prev => prev - 1);
    } catch (error: unknown) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "The diagnostic was interrupted. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  const handleInterrogation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;

    setJudging(true);
    try {
      const res = await fetch("/api/interrogate", {
        method: "POST",
        body: JSON.stringify({
          killerQuestion: data.killer_question,
          userAnswer: answer,
          context: `Headline: ${data.headline_burn}. Red Flags: ${data.red_flags.map(f => f.title).join(", ")}`
        }),
      });
      const result = await res.json();
      setJudgement(result.judgement);
      posthog.capture('interrogation_defense_delivered', {
        question: data.killer_question
      });
    } catch (err) {
      console.error(err);
      setJudgement("Sarah shakes her head. 'The system timed out, but your logic likely would have too. Try again.'");
    } finally {
      setJudging(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-mono selection:bg-red-500 transition-colors duration-300">
      <nav className="p-6 flex justify-between items-center border-b border-border transition-colors duration-300">
        <Link href="/" className="text-xl font-black tracking-tighter flex items-center gap-3">
          <SlayerLogo className="w-6 h-6" />
          DECKSLAYER
        </Link>
        <div className="flex items-center gap-8">
          <ThemeToggle />
          {user && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 px-4 py-1.5 rounded-full">
              <Zap size={12} className="text-red-500 fill-red-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-red-500">{credits} Credits</span>
            </div>
          )}
          <Link href="/history" className="text-[10px] uppercase tracking-widest text-muted flex items-center gap-2 hover:text-foreground transition-colors mr-6">
            <FileText size={12} /> History
          </Link>
          <Link href="/" className="text-[10px] uppercase tracking-widest text-muted flex items-center gap-2 hover:text-foreground transition-colors">
            <ArrowLeft size={12} /> Return
          </Link>
        </div>
      </nav>

      {paymentSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl mx-auto mt-10 p-4 bg-green-500/10 border border-green-500/20 flex items-center gap-4 text-green-500"
        >
          <CheckCircle2 size={20} />
          <div className="flex-grow">
            <p className="text-[10px] font-black uppercase tracking-widest">Protocol Authenticated</p>
            <p className="text-[8px] uppercase tracking-widest opacity-70">Payment successful. Credits added to your secure ledger.</p>
          </div>
        </motion.div>
      )}

      <main className="max-w-5xl mx-auto px-6 py-20">
        <AnimatePresence mode="wait">
          {!data ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12 max-w-2xl mx-auto"
            >
              <div className="space-y-4 text-center">
                <h2 className="text-4xl font-black uppercase italic tracking-tighter">Initiate Audit.</h2>
                <p className="text-zinc-500 text-[10px] tracking-[0.2em] uppercase font-bold">Secure PDF Upload // Adversarial Multi-Agent Protocol</p>
              </div>

              <form onSubmit={handleUpload} className="space-y-8">
                <div className="relative group">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="border border-border group-hover:border-red-500/50 p-24 flex flex-col items-center justify-center gap-6 transition-all bg-card/10 backdrop-blur-sm">
                    <Upload className="text-muted group-hover:text-red-500 transition-colors" size={32} />
                    <span className="text-muted uppercase tracking-[0.3em] text-[10px] font-black group-hover:text-foreground">
                      {file ? file.name : "Select Pitch Deck (PDF)"}
                    </span>
                  </div>
                </div>

                <button
                  disabled={!file || loading}
                  className="w-full bg-foreground text-background py-8 text-2xl font-black uppercase tracking-tighter disabled:opacity-20 hover:bg-red-500 hover:text-white transition-all transform active:scale-[0.99]"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-3">
                      <Loader2 className="animate-spin" />
                      Auditing...
                    </div>
                  ) : "Begin Diagnostic"}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-12"
            >
              {/* THE REPORT CONTAINER */}
              <div id="diagnostic-report" className="bg-background p-12 border-[12px] border-border relative overflow-hidden text-foreground transition-colors duration-300">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 text-muted opacity-5 text-[12rem] font-black pointer-events-none select-none uppercase">
                  Confidential
                </div>

                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-16 border-b border-border pb-10">
                    <div className="flex items-center gap-5">
                      <div className="bg-red-500 p-4">
                        <SlayerLogo className="text-white" />
                      </div>
                      <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">DECKSLAYER</h1>
                        <p className="text-[10px] text-muted uppercase tracking-[0.5em] font-black mt-1">Strategic Audit // V0.2.1</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-3">
                      <div className="flex items-center gap-2 bg-card px-4 py-1.5 border border-border">
                        <Zap size={10} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted font-mono">SOTA G-3-P Audit</span>
                      </div>
                      <p className="text-[9px] text-muted uppercase font-black tracking-[0.3em]">REF: DS-{Math.floor(Math.random() * 1000000)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
                    <div className="md:col-span-4 space-y-10">
                      <div className="p-10 border border-border bg-card relative overflow-hidden group hover:border-red-500/30 transition-all">
                        <h3 className="text-[9px] uppercase tracking-[0.4em] font-black mb-4 text-muted">Fundability Gauge</h3>
                        <div className="text-9xl font-black italic tracking-tighter mb-6 leading-none">
                          {data.fundability_score}%
                        </div>
                        <div className="h-1 bg-muted/10 w-full">
                          <div
                            style={{ width: `${data.fundability_score}%` }}
                            className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                          />
                        </div>
                        <div className="mt-6 flex items-center gap-2">
                          <ShieldCheck size={12} className="text-red-500" />
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted">IC Verified Output</span>
                        </div>
                      </div>

                      <div className="p-10 border border-red-500/20 bg-red-500/5 space-y-5">
                        <div className="flex items-center gap-3 text-red-500 font-black italic tracking-tighter text-2xl">
                          <Skull size={28} />
                          <span>Red Flags: {data.red_flag_count}</span>
                        </div>
                        <p className="text-[9px] text-zinc-500 uppercase leading-relaxed font-bold tracking-widest">
                          Critical structural failures that trigger immediate VC rejection patterns.
                        </p>
                      </div>

                      <div className="p-10 border border-border bg-card space-y-5">
                        <h3 className="text-[9px] uppercase tracking-[0.4em] font-black text-muted font-mono italic">Market Intel</h3>
                        <p className="text-[11px] text-muted leading-loose uppercase tracking-tighter border-l border-red-500/50 pl-6 opacity-80">
                          {data.market_benchmark}
                        </p>
                      </div>
                    </div>

                    <div className="md:col-span-8 space-y-20">
                      <section>
                        <div className="bg-red-500/5 border-l-[6px] border-red-500 p-10 mb-16 shadow-[10px_10px_0px_rgba(239,68,68,0.05)]">
                          <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-[0.9] text-white">
                            {data.headline_burn}
                          </h2>
                        </div>

                        <div className="space-y-12">
                          <h3 className="text-[10px] uppercase tracking-[0.6em] text-muted font-black flex items-center gap-4">
                            Investment Committee Debate <div className="h-px bg-border flex-grow" />
                          </h3>

                          <div className="space-y-16">
                            {data.meeting_transcript.map((item, i) => (
                              <div key={i} className="flex gap-10 group">
                                <div className="flex-shrink-0 w-16 h-16 bg-card border border-border flex items-center justify-center font-black text-2xl text-red-500 grayscale group-hover:grayscale-0 transition-all duration-300">
                                  {item.partner[0]}
                                </div>
                                <div className="space-y-4">
                                  <div className="flex items-center gap-4 text-foreground transition-colors duration-300">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500/70">{item.partner}</h4>
                                    <span className="text-[7px] bg-card text-muted px-2 py-0.5 uppercase font-black tracking-widest border border-border transition-colors duration-300">
                                      {item.a2a_status} via A2A
                                    </span>
                                  </div>
                                  <p className="text-muted leading-relaxed italic text-[15px] font-medium pr-12 transition-colors duration-300">
                                    &ldquo;{item.comment}&rdquo;
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </section>

                      <div className="grid grid-cols-1 gap-20 text-white">
                        <section className="space-y-8">
                          <h3 className="text-[10px] uppercase tracking-[0.6em] text-muted font-black border-b border-border pb-4 italic transition-colors duration-300">Narrative Logic Delta</h3>
                          <p className="text-[13px] text-muted leading-[1.8] font-medium bg-card p-10 italic border-r border-red-500/30 transition-colors duration-300">
                            {data.narrative_delta}
                          </p>
                        </section>

                        <section className="space-y-10">
                          <h3 className="text-[10px] uppercase tracking-[0.6em] text-muted font-black border-b border-border pb-4 transition-colors duration-300">The Slayer&apos;s List (To Fix)</h3>
                          <div className="grid grid-cols-1 gap-6">
                            {data.slayers_list.map((item, i) => (
                              <div key={i} className="flex items-start gap-6 bg-card p-6 border border-border hover:border-red-500/20 transition-all group">
                                <span className="text-red-500 font-black italic text-xl leading-none opacity-30 group-hover:opacity-100 transition-opacity">0{i + 1}</span>
                                <p className="text-[13px] text-muted font-bold uppercase tracking-tight leading-normal group-hover:text-foreground transition-colors duration-300">{item}</p>
                              </div>
                            ))}
                          </div>
                        </section>

                        {data.slide_breakdown && (
                          <section className="space-y-10 pt-10">
                            <h3 className="text-[10px] uppercase tracking-[0.6em] text-zinc-600 font-black border-b border-zinc-900 pb-4 italic">Strategic Slide Breakdown</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              {data.slide_breakdown.map((item, i) => (
                                <div key={i} className="p-8 border border-border bg-card space-y-4 transition-colors duration-300">
                                  <div className="flex justify-between items-center">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-red-500">{item.slide}</h4>
                                    <span className="text-xl font-black italic text-foreground">{item.score}%</span>
                                  </div>
                                  <p className="text-[11px] text-muted leading-relaxed uppercase font-bold tracking-tighter italic border-l border-border pl-4 transition-colors duration-300">
                                    {item.critique}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </section>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-32 pt-10 border-t border-border flex justify-between items-center opacity-30 italic font-mono transition-colors duration-300">
                    <p className="text-[7px] uppercase tracking-[0.4em]">DeckSlayer Protocol \u00a9 2026 // End Of Transmission</p>
                    <p className="text-[7px] uppercase tracking-[0.4em]">SOTA G-3-P VERIFIED</p>
                  </div>
                </div>
              </div>

              {/* INTERROGATION - INTERACTIVE ONLY */}
              <section className="p-16 border-2 border-red-500/30 bg-zinc-900/10 space-y-10 max-w-3xl mx-auto backdrop-blur-sm shadow-[0_0_50px_rgba(239,68,68,0.05)]">
                <div className="flex items-center gap-4 text-red-500">
                  <Skull size={32} />
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white">Sarah&apos;s Interrogation</h3>
                </div>
                <div className="space-y-8">
                  <p className="text-2xl text-white font-bold leading-tight underline decoration-red-500 decoration-4 underline-offset-8 italic">
                    &ldquo;{data.killer_question}&rdquo;
                  </p>
                  {!judgement ? (
                    <form onSubmit={handleInterrogation} className="space-y-8">
                      <textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Type your defense..."
                        className="w-full bg-background border border-border p-8 text-xl font-bold focus:border-red-500 outline-none transition-all h-56 resize-none placeholder:text-muted/20 text-foreground"
                      />
                      <button
                        disabled={!answer || judging}
                        className="w-full bg-white text-black py-8 text-2xl font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 active:scale-[0.98]"
                      >
                        {judging ? "Simulating Counter-Argument..." : "Deliver Defense"}
                      </button>
                    </form>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-10 bg-zinc-900 border-l-8 border-red-500 italic text-red-100 text-2xl leading-relaxed font-bold"
                    >
                      {judgement}
                    </motion.div>
                  )}
                </div>
              </section>

              <div className="pt-20 border-t border-zinc-900 flex flex-col md:row justify-between items-center gap-12 max-w-5xl mx-auto mb-40">
                <button
                  onClick={() => setData(null)}
                  className="text-muted hover:text-foreground transition-all duration-300 text-[10px] uppercase tracking-[0.4em] font-black"
                >
                  &larr; Slay another candidate
                </button>
                <div className="flex flex-col items-center gap-4">
                  {pdfUnlocked ? (
                    <button
                      onClick={exportPDF}
                      disabled={exporting}
                      className="bg-red-500 text-white px-16 py-8 font-black uppercase text-base tracking-[0.3em] hover:bg-white hover:text-black transition-all flex items-center gap-6 border-4 border-red-500 shadow-[12px_12px_0px_rgba(255,255,255,0.1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                    >
                      {exporting ? <Loader2 className="animate-spin" size={24} /> : <Download size={24} />}
                      {exporting ? "Generating Report..." : "Get PDF Diagnostic"}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        fetch("/api/checkout", {
                          method: "POST",
                          body: JSON.stringify({
                            productId: "p_pdf_export",
                            roastId: roastId
                          }),
                        })
                          .then(res => res.json())
                          .then(data => {
                            if (data.url) {
                              posthog.capture('pdf_unlock_initiated', { roast_id: roastId });
                              window.location.href = data.url;
                            }
                          });
                      }}
                      className="bg-zinc-800 text-white px-16 py-8 font-black uppercase text-base tracking-[0.3em] hover:bg-red-500 transition-all flex items-center gap-6 border-4 border-zinc-700 hover:border-red-500 shadow-[12px_12px_0px_rgba(255,255,255,0.1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                    >
                      <Lock size={24} className="text-red-500" />
                      Unlock PDF Diagnostic ($5)
                    </button>
                  )}
                  <p className="text-muted text-[8px] uppercase tracking-widest font-black opacity-50">VC-Ready Format // Confidential Memo Aesthetic</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="p-20 border-t border-border transition-colors duration-300 grid grid-cols-1 md:grid-cols-2 gap-12 text-muted font-mono">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <SlayerLogo className="w-5 h-5 opacity-30" />
            <span className="text-sm font-black uppercase tracking-widest opacity-30">DeckSlayer Diagnostic</span>
          </div>
          <p className="text-[8px] uppercase tracking-widest max-w-xs leading-loose">
            High-fidelity adversarial analysis platform. Proprietary benchmark database updated January 2026.
          </p>
        </div>
        <div className="flex flex-col md:items-end justify-center space-y-4">
          <div className="flex gap-8">
            <Link href="https://twitter.com/deckslayer" className="text-muted hover:text-red-500 transition-colors opacity-50 hover:opacity-100"><Twitter size={16} /></Link>
          </div>
          <p className="text-[8px] uppercase tracking-[0.3em] text-muted">Built for the hard truth.</p>
        </div>
      </footer>
    </div>
  );
}

export default function RoastPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center">
        <Loader2 className="animate-spin text-red-500" size={48} />
      </div>
    }>
      <RoastPageContent />
    </Suspense>
  );
}