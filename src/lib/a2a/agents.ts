import { AgentCard } from "@a2a-js/sdk";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export const sarahCard: AgentCard = {
    name: "Sarah (Liquidator)",
    description: "Skeptical GP with 20 years experience focusing on risk assessment and execution gaps.",
    protocolVersion: "1.0.0",
    version: "1.0.0",
    url: `${BASE_URL}/api/roast/sarah`,
    defaultInputModes: ["text/plain"],
    defaultOutputModes: ["text/plain"],
    capabilities: { streaming: false },
    skills: [
        { id: "risk-audit", name: "Risk Audit", description: "In-depth risk assessment of startup narratives.", tags: ["risk", "vc"] },
        { id: "narrative-pressure-test", name: "Pressure Test", description: "Adversarial testing of pitch logic.", tags: ["narrative", "adversarial"] }
    ]
};

export const marcusCard: AgentCard = {
    name: "Marcus (The Hawk)",
    description: "Data-driven specialist focusing on TAM, unit economics, and competitive realism.",
    protocolVersion: "1.0.0",
    version: "1.0.0",
    url: `${BASE_URL}/api/roast/marcus`,
    defaultInputModes: ["text/plain"],
    defaultOutputModes: ["text/plain"],
    capabilities: { streaming: false },
    skills: [
        { id: "market-sizing", name: "Market Sizing", description: "Bottoms-up TAM and market realism check.", tags: ["market", "data"] },
        { id: "data-validation", name: "Data Validation", description: "Verification of unit economics and projections.", tags: ["economics", "validation"] }
    ]
};

export const leoCard: AgentCard = {
    name: "Leo (The Visionary)",
    description: "Product-obsessed partner looking for moonshots and 'Why Now' narratives.",
    protocolVersion: "1.0.0",
    version: "1.0.0",
    url: `${BASE_URL}/api/roast/leo`,
    defaultInputModes: ["text/plain"],
    defaultOutputModes: ["text/plain"],
    capabilities: { streaming: false },
    skills: [
        { id: "product-strategy", name: "Product Strategy", description: "Assessment of PMF and product-led growth potential.", tags: ["product", "strategy"] },
        { id: "vision-check", name: "Vision Check", description: "Validation of 'Why Now' and long-term moonshot potential.", tags: ["vision", "moonshot"] }
    ]
};

export const orchestratorCard: AgentCard = {
    name: "IC Orchestrator",
    description: "Synthesizer for the Multi-Agent Investment Committee.",
    protocolVersion: "1.0.0",
    version: "1.0.0",
    url: `${BASE_URL}/api/roast`,
    defaultInputModes: ["text/plain"],
    defaultOutputModes: ["application/json"],
    capabilities: { streaming: false },
    skills: [
        { id: "synthesis", name: "Report Synthesis", description: "Synthesizing divergent agent reports into a coordinated diagnostic.", tags: ["synthesis", "orchestration"] }
    ]
};

// Internal-Only Agent: The Oracle
// This agent extracts macro-level metadata for internal trend analysis.
// Its output is NEVER shared with users.
export const oracleCard: AgentCard = {
    name: "The Oracle",
    description: "Internal intelligence agent for sector classification, stage detection, and narrative fingerprinting.",
    protocolVersion: "1.0.0",
    version: "1.0.0",
    url: `${BASE_URL}/api/internal/oracle`,
    defaultInputModes: ["text/plain"],
    defaultOutputModes: ["application/json"],
    capabilities: { streaming: false },
    skills: [
        { id: "sector-classification", name: "Sector Classification", description: "Identifies the startup's primary industry and sub-sector.", tags: ["sector", "classification"] },
        { id: "stage-detection", name: "Stage Detection", description: "Determines the funding stage and requested capital.", tags: ["stage", "funding"] },
        { id: "narrative-fingerprinting", name: "Narrative Fingerprinting", description: "Extracts key claims and buzzwords from the pitch.", tags: ["narrative", "trends"] }
    ]
};
