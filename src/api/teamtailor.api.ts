import config from '@/config';
import { enforceRateLimit } from '@/utils/rateLimiter';

export const getCandidates = async (currentUrl?: string) => {
	const { apiSecret, hostUrl, apiVersion } = config;

	const url =
		currentUrl ||
		`${hostUrl}/v1/candidates?page[size]=30&include=job-applications&fields[candidates]=first-name,last-name,email&fields[job-applications]=created-at`;

	await enforceRateLimit();

	const response = await fetch(url, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${apiSecret}`,
			'X-Api-Version': apiVersion,
		},
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Teamtailor API error: ${response.status} ${errorText}`);
	}

	return await response.json();
};
