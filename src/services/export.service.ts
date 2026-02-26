import { Response } from 'express';
import { getCandidates } from '@/api/teamtailor.api';
import { mapCandidatesToCsvRows } from '@/utils/mapCandidatesToCsv';
import * as csv from 'fast-csv';

export const streamCandidatesAsCsv = async (res: Response): Promise<void> => {
	const abortController = new AbortController();
	const { signal } = abortController;

	const onClientClose = () => {
		console.log('[export] Client disconnected — aborting API requests');
		abortController.abort();
	};

	res.on('close', onClientClose);

	try {
		res.write('\uFEFF');

		const csvHeaders = [
			'candidate_id',
			'first_name',
			'last_name',
			'email',
			'job_application_id',
			'job_application_created_at',
		];

		const csvStream = csv.format({ headers: csvHeaders });
		csvStream.pipe(res);

		let currentUrl: string | undefined = undefined;

		while (true) {
			if (signal.aborted) break;

			const apiResponse = await getCandidates(currentUrl, signal);

			const rows = mapCandidatesToCsvRows(apiResponse);
			for (const row of rows) {
				csvStream.write(row);
			}

			if (apiResponse.links && apiResponse.links.next) {
				currentUrl = apiResponse.links.next;
			} else {
				break;
			}
		}

		csvStream.end();
	} catch (error) {
		if (signal.aborted) {
			console.log('[export] Export aborted due to client disconnect');
			return;
		}

		if (!res.headersSent) {
			res.status(500).json({ error: 'Failed to initiate export' });
		} else {
			res.socket?.destroy();
		}
	} finally {
		res.off('close', onClientClose);
	}
};
