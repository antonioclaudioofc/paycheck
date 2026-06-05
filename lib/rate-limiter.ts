interface BucketState {
  tokens: number;
  lastRefill: number;
}

export interface RateLimiterResponse {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export class TokenBucket {
  private capacity: number;
  private refillRate: number;
  private store: Map<string, BucketState>;
  private maxKeys: number;

  constructor(capacity: number, refillRatePerSecond: number, maxKeys = 10000) {
    this.capacity = capacity;
    this.refillRate = refillRatePerSecond / 1000;
    this.store = new Map();
    this.maxKeys = maxKeys;
  }

  /**
   * Consume tokens for a given key.
   * @param key Unique identifier (IP or User ID)
   * @param tokensToConsume Amount of tokens to deduct (default 1)
   */
  public consume(key: string, tokensToConsume = 1): RateLimiterResponse {
    const now = Date.now();

    // Simple memory cleanup if store grows too large
    if (this.store.size >= this.maxKeys) {
      this.cleanup();
    }

    let state = this.store.get(key);

    if (!state) {
      state = {
        tokens: this.capacity,
        lastRefill: now,
      };
    } else {
      const elapsed = now - state.lastRefill;
      const refilledTokens = state.tokens + elapsed * this.refillRate;
      state.tokens = Math.min(this.capacity, refilledTokens);
      state.lastRefill = now;
    }

    let allowed = false;
    if (state.tokens >= tokensToConsume) {
      state.tokens -= tokensToConsume;
      allowed = true;
    }

    this.store.set(key, state);

    // Calculate when the bucket will be completely full again (in seconds)
    const tokensNeeded = this.capacity - state.tokens;
    const msToFull = tokensNeeded / this.refillRate;
    const resetUnixTime = Math.ceil((now + msToFull) / 1000);

    return {
      allowed,
      limit: this.capacity,
      remaining: Math.floor(state.tokens),
      reset: resetUnixTime,
    };
  }

  /**
   * Evicts the oldest 10% of records in the store to prevent memory leaks
   */
  private cleanup(): void {
    const keysToEvict = Math.ceil(this.maxKeys * 0.1);
    const keys = Array.from(this.store.keys());
    for (let i = 0; i < keysToEvict; i++) {
      this.store.delete(keys[i]);
    }
  }

  /**
   * Clears the limiter store (mostly for testing purposes)
   */
  public clear(): void {
    this.store.clear();
  }
}

export const apiLimiter = new TokenBucket(60, 1);
export const authLimiter = new TokenBucket(5, 5 / 60);
