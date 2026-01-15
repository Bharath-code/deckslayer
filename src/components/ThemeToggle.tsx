"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-white/5 border border-white/10 hover:border-red-500/50 transition-all group"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
            {theme === "dark" ? (
                <Sun size={14} className="text-zinc-500 group-hover:text-yellow-500 transition-colors" />
            ) : (
                <Moon size={14} className="text-zinc-500 group-hover:text-blue-500 transition-colors" />
            )}
        </button>
    );
}
