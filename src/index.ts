import { createEvents } from './scripts/index.js';

try {
	await createEvents();
} catch (error) {
	console.error(error);
}
