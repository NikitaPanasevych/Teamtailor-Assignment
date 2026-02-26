import { z } from 'zod';

export const JsonApiLinkageSchema = z.object({
	id: z.string(),
	type: z.string(),
});
export type JsonApiLinkage = z.infer<typeof JsonApiLinkageSchema>;

export const CandidateAttributesSchema = z.object({
	'first-name': z.string().nullable().optional(),
	'last-name': z.string().nullable().optional(),
	email: z.string().nullable().optional(),
});
export type CandidateAttributes = z.infer<typeof CandidateAttributesSchema>;

export const JobApplicationAttributesSchema = z.object({
	'created-at': z.string(),
});
export type JobApplicationAttributes = z.infer<typeof JobApplicationAttributesSchema>;

export const CandidateResourceSchema = z.object({
	id: z.string(),
	type: z.literal('candidates'),
	attributes: CandidateAttributesSchema,
	relationships: z
		.object({
			'job-applications': z
				.object({
					data: z.array(JsonApiLinkageSchema),
				})
				.optional(),
		})
		.optional(),
});
export type CandidateResource = z.infer<typeof CandidateResourceSchema>;

export const JobApplicationResourceSchema = z.object({
	id: z.string(),
	type: z.literal('job-applications'),
	attributes: JobApplicationAttributesSchema,
});
export type JobApplicationResource = z.infer<typeof JobApplicationResourceSchema>;

export const TeamtailorResponseSchema = z.object({
	data: z.array(CandidateResourceSchema),
	included: z.array(JobApplicationResourceSchema).optional(),
	links: z.object({
		first: z.string().optional(),
		next: z.string().nullable().optional(),
		last: z.string().optional(),
	}),
});
export type TeamtailorResponse = z.infer<typeof TeamtailorResponseSchema>;
