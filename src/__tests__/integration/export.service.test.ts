import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PassThrough } from 'stream';
import type { Response } from 'express';
import type { TeamtailorResponse } from '@/types';

vi.mock('@/api/teamtailor.api');

import { getCandidates } from '@/api/teamtailor.api';
import { streamCandidatesAsCsv } from '@/services/export.service';

const mockedGetCandidates = vi.mocked(getCandidates);

const makeApiResponse = (
	candidates: TeamtailorResponse['data'],
	included: TeamtailorResponse['included'] = [],
	nextLink: string | null = null,
): TeamtailorResponse => ({
	data: candidates,
	included,
	links: {
		next: nextLink,
	},
});

const makeCandidate = (id: string, firstName: string, lastName: string, email: string, appIds: string[]) => ({
	id,
	type: 'candidates' as const,
	attributes: { 'first-name': firstName, 'last-name': lastName, email },
	relationships: appIds.length
		? { 'job-applications': { data: appIds.map((appId) => ({ id: appId, type: 'job-applications' })) } }
		: undefined,
});

const makeApp = (id: string, createdAt: string) => ({
	id,
	type: 'job-applications' as const,
	attributes: { 'created-at': createdAt },
});

function createMockResponse(): { res: Response; getOutput: () => string } {
	const stream = new PassThrough();
	const chunks: Buffer[] = [];

	stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));

	const res = stream as unknown as Response;
	res.status = vi.fn().mockReturnThis();
	res.json = vi.fn().mockReturnThis();
	res.setHeader = vi.fn();
	res.headersSent = false;
	Object.defineProperty(res, 'socket', { value: { destroy: vi.fn() }, writable: true });

	return {
		res,
		getOutput: () => Buffer.concat(chunks).toString('utf-8'),
	};
}

describe('export.service — streamCandidatesAsCsv', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should stream a valid CSV with headers and candidate data', async () => {
		mockedGetCandidates.mockResolvedValueOnce(
			makeApiResponse(
				[makeCandidate('1', 'Alice', 'Smith', 'alice@test.com', ['app-1'])],
				[makeApp('app-1', '2025-03-10T08:00:00Z')],
				null,
			),
		);

		const { res, getOutput } = createMockResponse();
		await streamCandidatesAsCsv(res);

		const output = getOutput();
		const lines = output
			.replace(/^\uFEFF/, '')
			.trim()
			.split('\n');

		expect(lines[0]).toBe('candidate_id,first_name,last_name,email,job_application_id,job_application_created_at');
		expect(lines[1]).toBe('1,Alice,Smith,alice@test.com,app-1,2025-03-10T08:00:00Z');
		expect(lines).toHaveLength(2);
	});

	it('should follow pagination across multiple pages', async () => {
		mockedGetCandidates
			.mockResolvedValueOnce(
				makeApiResponse(
					[makeCandidate('1', 'Alice', 'A', 'a@test.com', [])],
					[],
					'https://api.teamtailor.com/v1/candidates?page=2',
				),
			)
			.mockResolvedValueOnce(makeApiResponse([makeCandidate('2', 'Bob', 'B', 'b@test.com', [])], [], null));

		const { res, getOutput } = createMockResponse();
		await streamCandidatesAsCsv(res);

		const output = getOutput();
		const lines = output
			.replace(/^\uFEFF/, '')
			.trim()
			.split('\n');

		expect(lines).toHaveLength(3); // header + 2 candidates
		expect(lines[1]).toContain('Alice');
		expect(lines[2]).toContain('Bob');

		expect(mockedGetCandidates).toHaveBeenCalledTimes(2);
		expect(mockedGetCandidates.mock.calls[1][0]).toBe('https://api.teamtailor.com/v1/candidates?page=2');
	});

	it('should produce rows with empty app fields for candidates without applications', async () => {
		mockedGetCandidates.mockResolvedValueOnce(
			makeApiResponse([makeCandidate('1', 'Solo', 'Dev', 'solo@test.com', [])], [], null),
		);

		const { res, getOutput } = createMockResponse();
		await streamCandidatesAsCsv(res);

		const output = getOutput();
		const lines = output
			.replace(/^\uFEFF/, '')
			.trim()
			.split('\n');

		expect(lines[1]).toBe('1,Solo,Dev,solo@test.com,,');
	});

	it('should write BOM character at the start for Excel compatibility', async () => {
		mockedGetCandidates.mockResolvedValueOnce(makeApiResponse([], [], null));

		const { res, getOutput } = createMockResponse();
		await streamCandidatesAsCsv(res);

		const output = getOutput();
		expect(output.charCodeAt(0)).toBe(0xfeff);
	});

	it('should handle API errors gracefully when headers not sent', async () => {
		mockedGetCandidates.mockRejectedValueOnce(new Error('API down'));

		const { res } = createMockResponse();
		res.headersSent = false;

		await streamCandidatesAsCsv(res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({ error: 'Failed to initiate export' });
	});
});
