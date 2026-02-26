export const RATE_LIMIT_WINDOW_MS = 10000;
export const MAX_REQUESTS = 45;

const requestTimestamps: number[] = [];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

import { logger } from '@/utils/logger';

export const _resetForTesting = () => {
	requestTimestamps.length = 0;
};

export const enforceRateLimit = async (): Promise<void> => {
	const now = Date.now();

	while (requestTimestamps.length > 0 && now - requestTimestamps[0] > RATE_LIMIT_WINDOW_MS) {
		requestTimestamps.shift();
	}

	if (requestTimestamps.length >= MAX_REQUESTS) {
		const oldestTimestamp = requestTimestamps[0];
		const timeToWait = RATE_LIMIT_WINDOW_MS - (now - oldestTimestamp) + 100;

		logger.debug({ timeToWait, activeRequests: requestTimestamps.length }, 'Rate limit reached, delaying request');

		await sleep(timeToWait);

		return enforceRateLimit();
	}

	requestTimestamps.push(Date.now());
};
