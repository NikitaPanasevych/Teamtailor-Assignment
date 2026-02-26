import config from '@/config';
import { enforceRateLimit } from '@/utils/rateLimiter';
import { TeamtailorResponseSchema } from '@/types';

export const getCandidates = async (currentUrl?: string, signal?: AbortSignal) => {
	const { apiSecret, hostUrl, apiVersion } = config;

	const url =
		currentUrl ||
		`${hostUrl}/v1/candidates?page[size]=30&include=job-applications&fields[candidates]=first-name,last-name,email,job-applications&fields[job-applications]=created-at`;

	await enforceRateLimit();

	const response = await fetch(url, {
		method: 'GET',
		signal,
		headers: {
			Authorization: `Bearer ${apiSecret}`,
			'X-Api-Version': apiVersion,
			'Accept-Encoding': 'gzip, deflate',
		},
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Teamtailor API error: ${response.status} ${errorText}`);
	}

	const rawData = await response.json();
	return TeamtailorResponseSchema.parse(rawData);
};
