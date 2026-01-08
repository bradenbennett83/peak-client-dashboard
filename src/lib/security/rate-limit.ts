/**
 * Simple in-memory rate limiter for API routes
 * 
 * For production with multiple instances, use Redis or Upstash Rate Limit
 * https://upstash.com/blog/rate-limiting-with-upstash-redis
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

interface RateLimitOptions {
  // Maximum requests per window
  limit: number;
  // Window duration in seconds
  windowSeconds: number;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

/**
 * Check rate limit for a given identifier
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { limit: 60, windowSeconds: 60 }
): RateLimitResult {
  const now = Date.now();
  const windowMs = options.windowSeconds * 1000;
  const key = identifier;

  const entry = rateLimitMap.get(key);

  // If no entry or window expired, create new entry
  if (!entry || now >= entry.resetTime) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitMap.set(key, newEntry);
    
    return {
      success: true,
      limit: options.limit,
      remaining: options.limit - 1,
      resetTime: newEntry.resetTime,
    };
  }

  // Increment count
  entry.count++;

  // Check if over limit
  if (entry.count > options.limit) {
    return {
      success: false,
      limit: options.limit,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  return {
    success: true,
    limit: options.limit,
    remaining: options.limit - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": Math.ceil(result.resetTime / 1000).toString(),
  };
}

/**
 * Clean up expired entries periodically
 * Call this on a schedule or let entries naturally expire
 */
export function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now >= entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}

// Periodic cleanup every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(cleanupExpiredEntries, 5 * 60 * 1000);
}

/**
 * Rate limit presets for different endpoints
 */
export const rateLimitPresets = {
  // Strict: Sensitive operations (login, password reset, payments)
  strict: { limit: 10, windowSeconds: 60 },
  
  // Standard: Normal API operations
  standard: { limit: 60, windowSeconds: 60 },
  
  // Relaxed: Read-heavy endpoints
  relaxed: { limit: 120, windowSeconds: 60 },
  
  // Webhooks: Higher limit for external services
  webhooks: { limit: 100, windowSeconds: 60 },
} as const;

