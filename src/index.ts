import { createEvents } from './scripts';

const main = async () => {
	await createEvents();
};

(async () => {
	await main();
})();
