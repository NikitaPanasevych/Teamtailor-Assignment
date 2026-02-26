import express from 'express';
import config from '@/config';
import { exportRouter } from '@/controllers/export.controller';
import path from 'path';

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use('/download', exportRouter);

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(config.port, () => {
	console.log(`Server is running on port ${config.port}`);
});
