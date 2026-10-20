import { convertEventId } from './convert.js';

export const getStaleCalendarEventIds = (characterIds: number[], eventIds: string[]): string[] => {
	const currentEventIds = new Set(characterIds.map(convertEventId));
	return eventIds.filter((eventId) => !currentEventIds.has(eventId));
};
