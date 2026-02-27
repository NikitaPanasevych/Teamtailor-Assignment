import { TeamtailorResponse } from '@/types';

export const mapCandidatesToCsvRows = (apiResponse: TeamtailorResponse) => {
	const rows = [];
	const applicationMap = new Map<string, string>();

	if (apiResponse.included) {
		for (const item of apiResponse.included) {
			if (item.type === 'job-applications') {
				applicationMap.set(item.id, item.attributes['created-at']);
			}
		}
	}

	for (const candidate of apiResponse.data) {
		const baseData = {
			candidate_id: candidate.id,
			first_name: candidate.attributes['first-name'] || '',
			last_name: candidate.attributes['last-name'] || '',
			email: candidate.attributes.email || '',
		};

		const applications = candidate.relationships?.['job-applications']?.data;

		if (!applications || applications.length === 0) {
			rows.push({
				...baseData,
				job_application_id: '',
				job_application_created_at: '',
			});
			continue;
		}

		for (const app of applications) {
			rows.push({
				...baseData,
				job_application_id: app.id,
				job_application_created_at: applicationMap.get(app.id) || '',
			});
		}
	}

	return rows;
};
