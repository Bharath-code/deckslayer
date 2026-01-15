"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { SlayerLogo } from "@/components/SlayerLogo";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import Link from "next/link";

export default function AuthPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const supabase = createClient();

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            setMessage(error.message);
        } else {
            setMessage("Check your email for the login link!");
        }
        setLoading(false);
    };

    const handleGoogleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-mono flex items-center justify-center p-6 transition-colors duration-300">
            <div className="w-full max-w-md space-y-12">
                <div className="flex flex-col items-center gap-6">
                    <Link href="/" className="flex flex-col items-center gap-4 group">
                        <SlayerLogo className="w-16 h-16 text-red-500 group-hover:scale-110 transition-transform" />
                        <span className="text-3xl font-black uppercase tracking-tighter">DECKSLAYER</span>
                    </Link>
                    <div className="text-center space-y-2">
                        <h1 className="text-xl font-black uppercase italic tracking-widest text-muted">Identify Yourself</h1>
                        <p className="text-[10px] text-muted uppercase tracking-[0.3em] opacity-70">Access the adversarial diagnostic engine.</p>
                    </div>
                </div>

                <div className="p-8 border border-border bg-card space-y-8 backdrop-blur-xl transition-colors duration-300">
                    <form onSubmit={handleEmailLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-[0.4em] font-black text-muted block">Work Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted opacity-50" size={16} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="founder@tomorrow.co"
                                    className="w-full bg-background border border-border p-4 pl-12 text-sm focus:border-red-500 outline-none transition-all placeholder:text-muted/30"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            className="w-full bg-foreground text-background py-4 font-black uppercase tracking-widest text-xs hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                        >
                            {loading ? <Loader2 className="animate-spin" size={16} /> : "Send Magic Link"}
                            <ArrowRight size={16} />
                        </button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border"></span>
                        </div>
                        <div className="relative flex justify-center text-[8px] uppercase tracking-widest">
                            <span className="bg-card px-4 text-muted font-black transition-colors duration-300">Or Protocol 02</span>
                        </div>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        className="w-full border border-border py-4 font-black uppercase tracking-widest text-xs hover:bg-background transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>

                    {message && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 text-[10px] uppercase tracking-widest text-red-500 text-center font-black">
                            {message}
                        </div>
                    )}
                </div>

                <p className="text-[8px] text-muted uppercase tracking-widest text-center leading-loose opacity-50">
                    By continuing, you agree to the Arena&apos;s Terms of Scrutiny. <br />
                    Data encryption: SOTA-AES-256.
                </p>
            </div>
        </div>
    );
}
