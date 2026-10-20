import { describe, expect, it } from 'vitest';
import { getStaleCalendarEventIds } from './calendar.js';

describe('getStaleCalendarEventIds', () => {
	it('selects event IDs absent from characters', () => {
		expect(getStaleCalendarEventIds([123, 456], ['00000123', '00000789', '00000456'])).toEqual(['00000789']);
	});

	it('keeps event IDs matching characters', () => {
		expect(getStaleCalendarEventIds([123, 456], ['00000123', '00000456'])).toEqual([]);
	});

	it('returns an empty list for empty events', () => {
		expect(getStaleCalendarEventIds([123], [])).toEqual([]);
	});
});
