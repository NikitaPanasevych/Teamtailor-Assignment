import { defineConfig, configDefaults } from 'vitest/config';
import path from 'path';

export default defineConfig({
	test: {
		globals: true,
		exclude: [...configDefaults.exclude, 'dist/**'],
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src'),
		},
	},
});
