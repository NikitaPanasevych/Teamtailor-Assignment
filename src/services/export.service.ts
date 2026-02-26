import { Response } from 'express';
import { getCandidates } from '@/api/teamtailor.api';
import { mapCandidatesToCsvRows } from '@/utils/mapCandidatesToCsv';
import * as csv from 'fast-csv';
import { logger } from '@/utils/logger';

export const streamCandidatesAsCsv = async (res: Response): Promise<void> => {
	const abortController = new AbortController();
	const { signal } = abortController;

	const onClientClose = () => {
		logger.info('Client disconnected — aborting API requests');
		abortController.abort();
	};

	res.on('close', onClientClose);

	try {
		logger.info('Starting candidate export stream');
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
		let totalRows = 0;

		while (true) {
			if (signal.aborted) break;

			const apiResponse = await getCandidates(currentUrl, signal);

			const rows = mapCandidatesToCsvRows(apiResponse);
			for (const row of rows) {
				csvStream.write(row);
				totalRows++;
			}

			if (apiResponse.links && apiResponse.links.next) {
				currentUrl = apiResponse.links.next;
			} else {
				break;
			}
		}

		csvStream.end();
		if (!signal.aborted) {
			logger.info({ totalRows }, 'Candidate export completed successfully');
		}
	} catch (error) {
		if (signal.aborted) {
			logger.info('Export aborted due to client disconnect');
			return;
		}

		logger.error({ err: error instanceof Error ? error.message : String(error) }, 'Export streaming failed');

		if (!res.headersSent) {
			res.status(500).json({ error: 'Failed to initiate export' });
		} else {
			res.socket?.destroy();
		}
	} finally {
		res.off('close', onClientClose);
	}
};
