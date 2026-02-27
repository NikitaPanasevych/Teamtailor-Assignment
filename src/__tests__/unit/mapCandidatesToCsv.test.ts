import { describe, it, expect } from 'vitest';
import { mapCandidatesToCsvRows } from '@/utils/mapCandidatesToCsv';
import type { TeamtailorResponse } from '@/types';

const makeResponse = (overrides: Partial<TeamtailorResponse> = {}): TeamtailorResponse => ({
	data: [],
	links: {},
	...overrides,
});

const makeCandidate = (
	id: string,
	attrs: Partial<{ 'first-name': string | null; 'last-name': string | null; email: string | null }> = {},
	applicationIds: string[] = [],
) => ({
	id,
	type: 'candidates' as const,
	attributes: {
		'first-name': 'first-name' in attrs ? attrs['first-name']! : 'John',
		'last-name': 'last-name' in attrs ? attrs['last-name']! : 'Doe',
		email: 'email' in attrs ? attrs.email! : 'john@example.com',
	},
	relationships: applicationIds.length
		? { 'job-applications': { data: applicationIds.map((appId) => ({ id: appId, type: 'job-applications' })) } }
		: undefined,
});

const makeIncludedApp = (id: string, createdAt: string = '2025-01-15T10:00:00Z') => ({
	id,
	type: 'job-applications' as const,
	attributes: { 'created-at': createdAt },
});

describe('mapCandidatesToCsvRows', () => {
	it('should return empty array when there are no candidates', () => {
		const response = makeResponse({ data: [] });
		const rows = mapCandidatesToCsvRows(response);
		expect(rows).toEqual([]);
	});

	it('should map a candidate with one application', () => {
		const response = makeResponse({
			data: [makeCandidate('1', {}, ['app-1'])],
			included: [makeIncludedApp('app-1', '2025-03-10T08:00:00Z')],
		});

		const rows = mapCandidatesToCsvRows(response);

		expect(rows).toEqual([
			{
				candidate_id: '1',
				first_name: 'John',
				last_name: 'Doe',
				email: 'john@example.com',
				job_application_id: 'app-1',
				job_application_created_at: '2025-03-10T08:00:00Z',
			},
		]);
	});

	it('should produce multiple rows for candidate with multiple applications', () => {
		const response = makeResponse({
			data: [makeCandidate('1', {}, ['app-1', 'app-2'])],
			included: [
				makeIncludedApp('app-1', '2025-01-01T00:00:00Z'),
				makeIncludedApp('app-2', '2025-06-15T12:00:00Z'),
			],
		});

		const rows = mapCandidatesToCsvRows(response);

		expect(rows).toHaveLength(2);
		expect(rows[0].job_application_id).toBe('app-1');
		expect(rows[1].job_application_id).toBe('app-2');
		expect(rows[0].candidate_id).toBe('1');
		expect(rows[1].candidate_id).toBe('1');
	});

	it('should produce a row with empty application fields when candidate has no applications', () => {
		const response = makeResponse({
			data: [makeCandidate('1', {}, [])],
		});

		const rows = mapCandidatesToCsvRows(response);

		expect(rows).toHaveLength(1);
		expect(rows[0]).toEqual({
			candidate_id: '1',
			first_name: 'John',
			last_name: 'Doe',
			email: 'john@example.com',
			job_application_id: '',
			job_application_created_at: '',
		});
	});

	it('should default null/missing attributes to empty strings', () => {
		const response = makeResponse({
			data: [makeCandidate('1', { 'first-name': null, 'last-name': null, email: null }, [])],
		});

		const rows = mapCandidatesToCsvRows(response);

		expect(rows[0].first_name).toBe('');
		expect(rows[0].last_name).toBe('');
		expect(rows[0].email).toBe('');
	});

	it('should return empty created_at when application is in relationship but missing from included', () => {
		const response = makeResponse({
			data: [makeCandidate('1', {}, ['app-missing'])],
			included: [],
		});

		const rows = mapCandidatesToCsvRows(response);

		expect(rows).toHaveLength(1);
		expect(rows[0].job_application_id).toBe('app-missing');
		expect(rows[0].job_application_created_at).toBe('');
	});

	it('should handle multiple candidates correctly', () => {
		const response = makeResponse({
			data: [
				makeCandidate('1', { 'first-name': 'Alice', 'last-name': 'A', email: 'alice@test.com' }, ['app-1']),
				makeCandidate('2', { 'first-name': 'Bob', 'last-name': 'B', email: 'bob@test.com' }, []),
			],
			included: [makeIncludedApp('app-1')],
		});

		const rows = mapCandidatesToCsvRows(response);

		expect(rows).toHaveLength(2);
		expect(rows[0].candidate_id).toBe('1');
		expect(rows[0].first_name).toBe('Alice');
		expect(rows[1].candidate_id).toBe('2');
		expect(rows[1].job_application_id).toBe('');
	});

	it('should handle response with no included field', () => {
		const response = makeResponse({
			data: [makeCandidate('1', {}, ['app-1'])],
			// included is undefined
		});

		const rows = mapCandidatesToCsvRows(response);

		expect(rows).toHaveLength(1);
		expect(rows[0].job_application_id).toBe('app-1');
		expect(rows[0].job_application_created_at).toBe('');
	});
});
