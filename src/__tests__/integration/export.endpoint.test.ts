import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import type { TeamtailorResponse } from '@/types';

vi.mock('@/api/teamtailor.api');

import { getCandidates } from '@/api/teamtailor.api';
import app from '@/app';

const mockedGetCandidates = vi.mocked(getCandidates);

const makeApiResponse = (
	candidates: TeamtailorResponse['data'],
	included: TeamtailorResponse['included'] = [],
	nextLink: string | null = null,
): TeamtailorResponse => ({
	data: candidates,
	included,
	links: { next: nextLink },
});

const makeCandidate = (id: string, firstName: string, appIds: string[]) => ({
	id,
	type: 'candidates' as const,
	attributes: { 'first-name': firstName, 'last-name': 'Test', email: `${firstName.toLowerCase()}@test.com` },
	relationships: appIds.length
		? { 'job-applications': { data: appIds.map((appId) => ({ id: appId, type: 'job-applications' })) } }
		: undefined,
});

const makeApp = (id: string, createdAt: string) => ({
	id,
	type: 'job-applications' as const,
	attributes: { 'created-at': createdAt },
});

describe('GET /download', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it('should return 200 with correct CSV headers', async () => {
		mockedGetCandidates.mockResolvedValueOnce(makeApiResponse([], [], null));

		const res = await request(app).get('/download');

		expect(res.status).toBe(200);
		expect(res.headers['content-type']).toContain('text/csv');
		expect(res.headers['content-disposition']).toContain('candidates.csv');
	});

	it('should return valid CSV body with candidate data', async () => {
		mockedGetCandidates.mockResolvedValueOnce(
			makeApiResponse([makeCandidate('42', 'Jane', ['app-7'])], [makeApp('app-7', '2025-06-01T09:00:00Z')], null),
		);

		const res = await request(app).get('/download');

		const body = res.text.replace(/^\uFEFF/, '');
		const lines = body.trim().split('\n');

		expect(lines[0]).toBe('candidate_id,first_name,last_name,email,job_application_id,job_application_created_at');
		expect(lines[1]).toBe('42,Jane,Test,jane@test.com,app-7,2025-06-01T09:00:00Z');
	});

	it('should handle multi-page pagination end-to-end', async () => {
		mockedGetCandidates
			.mockResolvedValueOnce(
				makeApiResponse(
					[makeCandidate('1', 'Page1', [])],
					[],
					'https://api.teamtailor.com/v1/candidates?page=2',
				),
			)
			.mockResolvedValueOnce(makeApiResponse([makeCandidate('2', 'Page2', [])], [], null));

		const res = await request(app).get('/download');

		const body = res.text.replace(/^\uFEFF/, '');
		const lines = body.trim().split('\n');

		expect(lines).toHaveLength(3);
		expect(lines[1]).toContain('Page1');
		expect(lines[2]).toContain('Page2');
	});
});
