"use client";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { ReactNode, useEffect } from "react";

if (typeof window !== "undefined") {
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";

    if (posthogKey) {
        posthog.init(posthogKey, {
            api_host: posthogHost,
            person_profiles: "identified_only",
            capture_pageview: false, // We'll handle this manually for better accuracy
        });
    }
}

export function CSPostHogProvider({ children }: { children: ReactNode }) {
    useEffect(() => {
        // Basic pageview tracking on client
        posthog.capture("$pageview");
    }, []);

    return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
