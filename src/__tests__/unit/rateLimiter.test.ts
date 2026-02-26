import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { enforceRateLimit, _resetForTesting, MAX_REQUESTS, RATE_LIMIT_WINDOW_MS } from '@/utils/rateLimiter';

describe('rateLimiter', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		_resetForTesting();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('should resolve immediately when under the rate limit', async () => {
		const promise = enforceRateLimit();
		await expect(promise).resolves.toBeUndefined();
	});

	it('should allow up to MAX_REQUESTS calls without waiting', async () => {
		for (let i = 0; i < MAX_REQUESTS; i++) {
			await enforceRateLimit();
		}
	});

	it('should wait when rate limit is reached', async () => {
		for (let i = 0; i < MAX_REQUESTS; i++) {
			await enforceRateLimit();
		}

		let resolved = false;
		const promise = enforceRateLimit().then(() => {
			resolved = true;
		});

		expect(resolved).toBe(false);

		await vi.advanceTimersByTimeAsync(RATE_LIMIT_WINDOW_MS + 200);

		await promise;
		expect(resolved).toBe(true);
	});

	it('should prune old timestamps outside the window', async () => {
		for (let i = 0; i < 5; i++) {
			await enforceRateLimit();
		}
		vi.advanceTimersByTime(RATE_LIMIT_WINDOW_MS + 1);
		for (let i = 0; i < MAX_REQUESTS; i++) {
			await enforceRateLimit();
		}
	});

	it('should reset state correctly with _resetForTesting', async () => {
		for (let i = 0; i < MAX_REQUESTS; i++) {
			await enforceRateLimit();
		}

		_resetForTesting();

		const promise = enforceRateLimit();
		await expect(promise).resolves.toBeUndefined();
	});
});
