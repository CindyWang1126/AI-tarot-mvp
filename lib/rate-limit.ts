type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 4;
const buckets = new Map<string, RateLimitEntry>();
const activeRequests = new Set<string>();

export function checkRateLimit(identifier: string, now = Date.now()) {
  const current = buckets.get(identifier);

  if (!current || current.resetAt <= now) {
    buckets.set(identifier, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (current.count >= MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

export function beginRequest(key: string): boolean {
  if (activeRequests.has(key)) return false;
  activeRequests.add(key);
  return true;
}

export function endRequest(key: string): void {
  activeRequests.delete(key);
}

export function resetRateLimitForTests(): void {
  buckets.clear();
  activeRequests.clear();
}
