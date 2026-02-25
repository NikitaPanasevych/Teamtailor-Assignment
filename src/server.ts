import express from 'express';
import config from '@/config';
import { getCandidates } from '@/api/teamtailor.api';

const app = express();

app.get('/', (req, res) => {
	res.send('Hello World!');
});

app.get('/candidates', async (req, res) => {
	try {
		const data = await getCandidates();
		res.json(data);
		console.log(data.data.length);
		console.log(data.included.length);
	} catch (error: any) {
		console.log(error);
		res.status(500).json({ error: error.message });
	}
});

app.listen(config.port, () => {
	console.log(`Server is running on port ${config.port}`);
});
