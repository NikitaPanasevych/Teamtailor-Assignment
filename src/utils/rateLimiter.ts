const RATE_LIMIT_WINDOW_MS = 10000;
const MAX_REQUESTS = 45;

const requestTimestamps: number[] = [];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const enforceRateLimit = async (): Promise<void> => {
	let now = Date.now();

	while (requestTimestamps.length > 0 && now - requestTimestamps[0] > RATE_LIMIT_WINDOW_MS) {
		requestTimestamps.shift();
	}

	if (requestTimestamps.length >= MAX_REQUESTS) {
		const oldestTimestamp = requestTimestamps[0];
		const timeToWait = RATE_LIMIT_WINDOW_MS - (now - oldestTimestamp) + 100;

		await sleep(timeToWait);

		return enforceRateLimit();
	}

	requestTimestamps.push(Date.now());
};
