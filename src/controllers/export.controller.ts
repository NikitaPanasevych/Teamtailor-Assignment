import { Request, Response, Router } from 'express';
import { streamCandidatesAsCsv } from '@/services/export.service';

export const exportRouter = Router();

export const downloadCandidates = async (req: Request, res: Response): Promise<void> => {
	res.setHeader('Content-Type', 'text/csv; charset=utf-8');
	res.setHeader('Content-Disposition', 'attachment; filename="candidates.csv"');
	res.setHeader('Transfer-Encoding', 'chunked');

	await streamCandidatesAsCsv(res);
};

exportRouter.get('/', downloadCandidates);
