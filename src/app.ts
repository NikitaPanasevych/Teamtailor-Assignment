import express from 'express';
import { exportRouter } from '@/controllers/export.controller';
import path from 'path';
import pinoHttp from 'pino-http';
import { logger } from '@/utils/logger';
import { errorHandler } from '@/middlewares/errorHandler';

const app = express();

app.use(pinoHttp({ logger }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/download', exportRouter);

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(errorHandler);

export default app;
