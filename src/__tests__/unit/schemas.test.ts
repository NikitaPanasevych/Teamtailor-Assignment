import { describe, it, expect } from 'vitest';
import {
	TeamtailorResponseSchema,
	CandidateResourceSchema,
	JobApplicationResourceSchema,
	CandidateAttributesSchema,
} from '@/types';

describe('CandidateAttributesSchema', () => {
	it('should parse valid attributes', () => {
		const result = CandidateAttributesSchema.parse({
			'first-name': 'John',
			'last-name': 'Doe',
			email: 'john@example.com',
		});
		expect(result['first-name']).toBe('John');
	});

	it('should accept null values for all fields', () => {
		const result = CandidateAttributesSchema.parse({
			'first-name': null,
			'last-name': null,
			email: null,
		});
		expect(result['first-name']).toBeNull();
		expect(result['last-name']).toBeNull();
		expect(result.email).toBeNull();
	});

	it('should accept missing optional fields', () => {
		const result = CandidateAttributesSchema.parse({});
		expect(result['first-name']).toBeUndefined();
	});
});

describe('CandidateResourceSchema', () => {
	it('should parse a valid candidate', () => {
		const result = CandidateResourceSchema.parse({
			id: '123',
			type: 'candidates',
			attributes: { 'first-name': 'Jane', 'last-name': 'Doe', email: 'jane@test.com' },
		});
		expect(result.id).toBe('123');
		expect(result.type).toBe('candidates');
	});

	it('should reject invalid type literal', () => {
		expect(() =>
			CandidateResourceSchema.parse({
				id: '123',
				type: 'users',
				attributes: { 'first-name': 'Jane' },
			}),
		).toThrow();
	});

	it('should parse candidate with relationships', () => {
		const result = CandidateResourceSchema.parse({
			id: '1',
			type: 'candidates',
			attributes: { 'first-name': 'A' },
			relationships: {
				'job-applications': {
					data: [{ id: 'app-1', type: 'job-applications' }],
				},
			},
		});
		expect(result.relationships?.['job-applications']?.data).toHaveLength(1);
	});

	it('should parse candidate without relationships', () => {
		const result = CandidateResourceSchema.parse({
			id: '1',
			type: 'candidates',
			attributes: { 'first-name': 'A' },
		});
		expect(result.relationships).toBeUndefined();
	});
});

describe('JobApplicationResourceSchema', () => {
	it('should parse a valid job application', () => {
		const result = JobApplicationResourceSchema.parse({
			id: 'app-1',
			type: 'job-applications',
			attributes: { 'created-at': '2025-01-15T10:00:00Z' },
		});
		expect(result.id).toBe('app-1');
		expect(result.attributes['created-at']).toBe('2025-01-15T10:00:00Z');
	});

	it('should reject invalid type literal', () => {
		expect(() =>
			JobApplicationResourceSchema.parse({
				id: 'app-1',
				type: 'something-else',
				attributes: { 'created-at': '2025-01-15T10:00:00Z' },
			}),
		).toThrow();
	});

	it('should reject missing created-at', () => {
		expect(() =>
			JobApplicationResourceSchema.parse({
				id: 'app-1',
				type: 'job-applications',
				attributes: {},
			}),
		).toThrow();
	});
});

describe('TeamtailorResponseSchema', () => {
	it('should parse a full valid API response', () => {
		const result = TeamtailorResponseSchema.parse({
			data: [
				{
					id: '1',
					type: 'candidates',
					attributes: { 'first-name': 'Jane', 'last-name': 'Doe', email: 'jane@test.com' },
					relationships: {
						'job-applications': {
							data: [{ id: 'app-1', type: 'job-applications' }],
						},
					},
				},
			],
			included: [
				{
					id: 'app-1',
					type: 'job-applications',
					attributes: { 'created-at': '2025-03-10T08:00:00Z' },
				},
			],
			links: {
				first: 'https://api.teamtailor.com/v1/candidates?page=1',
				next: 'https://api.teamtailor.com/v1/candidates?page=2',
				last: 'https://api.teamtailor.com/v1/candidates?page=5',
			},
		});

		expect(result.data).toHaveLength(1);
		expect(result.included).toHaveLength(1);
		expect(result.links.next).toContain('page=2');
	});

	it('should parse response without included (optional)', () => {
		const result = TeamtailorResponseSchema.parse({
			data: [],
			links: {},
		});

		expect(result.data).toEqual([]);
		expect(result.included).toBeUndefined();
	});

	it('should parse response with null next link (last page)', () => {
		const result = TeamtailorResponseSchema.parse({
			data: [],
			links: { next: null },
		});

		expect(result.links.next).toBeNull();
	});

	it('should reject response missing data field', () => {
		expect(() =>
			TeamtailorResponseSchema.parse({
				links: {},
			}),
		).toThrow();
	});

	it('should reject response missing links field', () => {
		expect(() =>
			TeamtailorResponseSchema.parse({
				data: [],
			}),
		).toThrow();
	});
});
