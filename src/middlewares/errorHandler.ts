import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction): void => {
	logger.error({ err: err.message, stack: err.stack, path: req.path, method: req.method }, 'Unhandled error');

	if (res.headersSent) {
		res.socket?.destroy();
		return;
	}

	res.status(500).json({ error: 'Internal Server Error' });
};
