import { createEvents } from './scripts';

(async () => {
	try {
		await createEvents();
	} catch (error) {
		console.error(error);
	}
})();
