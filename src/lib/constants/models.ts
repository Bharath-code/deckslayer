/**
 * Centralized AI Model Configuration
 * Changing models here will update the entire application.
 */

export const AI_MODELS = {
    // Fast, cheap model for initial analysis and simple chat
    ANALYSIS_MODEL: "gemini-1.5-flash",

    // Powerhouse model for synthesis and complex reasoning
    ORCHESTRATOR_MODEL: "gemini-1.5-flash", // Can be upgraded to gemini-1.5-pro for higher fidelity

    // Advesarial model for the interrogation section
    ADVERSARIAL_MODEL: "gemini-1.5-flash",
} as const;

export type AIModelType = typeof AI_MODELS[keyof typeof AI_MODELS];
