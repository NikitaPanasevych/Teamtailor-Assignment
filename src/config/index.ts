import dotenv from 'dotenv';

dotenv.config();

interface Config {
	port: number;
	nodeEnv: string;
	apiSecret: string;
	hostUrl: string;
	apiVersion: string;
}

const config: Config = {
	port: Number(process.env.PORT) || 3000,
	nodeEnv: process.env.NODE_ENV || 'development',
	apiSecret: process.env.API_SECRET || '',
	hostUrl: process.env.HOST_URL || '',
	apiVersion: process.env.API_VERSION || '',
};

export default config;
