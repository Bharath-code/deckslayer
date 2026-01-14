/**
 * In-Memory Rate Limiter
 * Uses a sliding window algorithm to limit requests per user.
 * 
 * NOTE: For production scale, replace with Redis (e.g., Upstash).
 * This implementation works for initial launch.
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

export const RATE_LIMIT_CONFIG = {
    ROAST_API: {
        maxRequests: 10,
        windowMs: 60 * 1000, // 1 minute
    },
    INTERROGATE_API: {
        maxRequests: 30,
        windowMs: 60 * 1000, // 1 minute
    },
} as const;

export interface RateLimitResult {
    success: boolean;
    remaining: number;
    resetIn: number; // milliseconds until reset
}

/**
 * Check if a request should be rate limited.
 * @param identifier - Unique identifier (e.g., user ID or IP address)
 * @param config - Rate limit configuration (maxRequests, windowMs)
 * @returns RateLimitResult indicating if request is allowed
 */
export function checkRateLimit(
    identifier: string,
    config: { maxRequests: number; windowMs: number }
): RateLimitResult {
    const now = Date.now();
    const entry = rateLimitMap.get(identifier);

    // If no entry or window has expired, create a fresh entry
    if (!entry || now > entry.resetTime) {
        rateLimitMap.set(identifier, {
            count: 1,
            resetTime: now + config.windowMs,
        });
        return {
            success: true,
            remaining: config.maxRequests - 1,
            resetIn: config.windowMs,
        };
    }

    // Check if limit is exceeded
    if (entry.count >= config.maxRequests) {
        return {
            success: false,
            remaining: 0,
            resetIn: entry.resetTime - now,
        };
    }

    // Increment count
    entry.count++;
    rateLimitMap.set(identifier, entry);

    return {
        success: true,
        remaining: config.maxRequests - entry.count,
        resetIn: entry.resetTime - now,
    };
}

/**
 * Clean up expired entries to prevent memory leaks.
 * Call this periodically (e.g., every 5 minutes).
 */
export function cleanupExpiredEntries(): void {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap.entries()) {
        if (now > entry.resetTime) {
            rateLimitMap.delete(key);
        }
    }
}

// Auto-cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
    setInterval(cleanupExpiredEntries, 5 * 60 * 1000);
}
