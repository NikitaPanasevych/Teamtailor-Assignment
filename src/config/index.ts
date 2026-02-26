import dotenv from 'dotenv';

dotenv.config();

import { z } from 'zod';

const EnvSchema = z.object({
	PORT: z
		.string()
		.optional()
		.transform((val) => (val ? Number(val) : 3000)),
	NODE_ENV: z.string().default('development'),
	LOG_LEVEL: z.string().default('info'),
	API_SECRET: z.string().min(1, 'API_SECRET is required'),
	HOST_URL: z.string().url('HOST_URL must be a valid URL'),
	API_VERSION: z.string().min(1, 'API_VERSION is required'),
});

const parsedEnv = EnvSchema.safeParse(process.env);

if (!parsedEnv.success) {
	console.error('Invalid environment variables', parsedEnv.error.format());
	process.exit(1);
}

const env = parsedEnv.data;

export interface Config {
	port: number;
	nodeEnv: string;
	logLevel: string;
	apiSecret: string;
	hostUrl: string;
	apiVersion: string;
}

const config: Config = {
	port: env.PORT,
	nodeEnv: env.NODE_ENV,
	logLevel: env.LOG_LEVEL,
	apiSecret: env.API_SECRET,
	hostUrl: env.HOST_URL,
	apiVersion: env.API_VERSION,
};

export default config;
