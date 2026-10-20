import { afterEach, expect, it, vi } from 'vitest';

const { calendar, operations } = vi.hoisted(() => {
	const operations: string[] = [];
	return {
		operations,
		calendar: {
			events: {
				get: vi.fn().mockRejectedValue({ code: 404 }),
				insert: vi.fn(async () => {
					operations.push('insert');
					return { data: {} };
				}),
				list: vi.fn(async ({ pageToken }: { pageToken?: string }) => {
					operations.push('list');
					return (pageToken ?? '')
						? { data: { items: [{ id: '00000789' }] } }
						: {
								data: {
									items: [{ id: '00000123' }, { id: '00000456' }],
									nextPageToken: 'second-page',
								},
							};
				}),
				delete: vi.fn(async ({ eventId }: { eventId: string }) => {
					operations.push(`delete:${eventId}`);
					return { data: {} };
				}),
			},
		},
	};
});

vi.mock('googleapis', () => ({ google: { calendar: vi.fn(() => calendar) } }));
vi.mock('../utils/authorize.js', () => ({ authorize: vi.fn(async () => ({})) }));
vi.mock('../_data/characters.json', () => ({
	default: [{ id: 123, birthday: '2000-01-01', name: { ja: 'Example', ko: 'Example' } }],
}));

import { createEvents, logSkippedCharacter } from './createEvents.js';

afterEach(() => {
	operations.length = 0;
	vi.unstubAllEnvs();
	vi.restoreAllMocks();
});

it('deletes stale events after synchronizing characters across all pages', async () => {
	vi.stubEnv('GOOGLE_CALENDAR_ID', 'calendar-under-test');
	await createEvents();

	expect(operations).toEqual(['insert', 'list', 'list', 'delete:00000456', 'delete:00000789']);
	expect(calendar.events.list.mock.calls).toEqual([
		[{ calendarId: 'calendar-under-test' }],
		[{ calendarId: 'calendar-under-test', pageToken: 'second-page' }],
	]);
	expect(calendar.events.delete.mock.calls).toEqual([
		[{ calendarId: 'calendar-under-test', eventId: '00000456' }],
		[{ calendarId: 'calendar-under-test', eventId: '00000789' }],
	]);
});

it('skips calendar writes in dry run mode', async () => {
	vi.stubEnv('GOOGLE_CALENDAR_ID', 'calendar-under-test');
	vi.stubEnv('CALENDAR_DRY_RUN', 'true');
	await createEvents();

	expect(operations).toEqual(['list', 'list']);
	expect(calendar.events.get.mock.calls).toEqual([[{ calendarId: 'calendar-under-test', eventId: '00000123' }]]);
});

it('logs the skipped character name as an object', () => {
	const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);

	logSkippedCharacter({ id: 10100, name: { ko: '아로나', ja: 'アロナ' }, birthday: '2000-01-01' });

	expect(log).toHaveBeenCalledWith('skip:', 10100, { ko: '아로나', ja: 'アロナ' });
});
