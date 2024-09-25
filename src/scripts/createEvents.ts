import GoogleApis, { google } from 'googleapis';
import characters from '../_data/characters.json';
import { Character } from '../types';
import { authorize, convertEventId } from '../utils';

type Calendar = GoogleApis.calendar_v3.Calendar;
type CalendarEvent = GoogleApis.calendar_v3.Schema$Event;

const calendarEventEquals = (p: CalendarEvent, q: CalendarEvent): boolean => {
	if (p.status === 'cancelled') {
		return false;
	}
	if (p.summary !== q.summary) {
		return false;
	}
	if (p.start?.dateTime !== q.start?.dateTime) {
		return false;
	}
	return true;
};

const getCalendarEvent = async (
	calendar: GoogleApis.calendar_v3.Calendar,
	characterId: number
): Promise<CalendarEvent | null> => {
	try {
		const res = await calendar.events.get({
			calendarId: process.env.GOOGLE_CALENDAR_ID,
			eventId: convertEventId(characterId),
		});
		return res.data;
	} catch (error) {
		if ((error as any).code === 404) {
			return null;
		}
		throw error;
	}
};

const createCalendarEvent = async (calendar: Calendar, event: CalendarEvent) => {
	console.log('create calendar event:', event);

	await calendar.events.insert({
		calendarId: process.env.GOOGLE_CALENDAR_ID,
		requestBody: event,
	});
};

const updateCalendarEvent = async (calendar: Calendar, event: CalendarEvent) => {
	console.log('update calendar event:', event);

	await calendar.events.update({
		calendarId: process.env.GOOGLE_CALENDAR_ID,
		eventId: event.id ?? undefined,
		requestBody: {
			...event,
			status: 'confirmed',
		},
	});
};

const convertCalendarEvent = async (character: Character): Promise<CalendarEvent | null> => {
	const [, month, date] = character.birthday.split('-');
	return {
		id: convertEventId(character.id),
		summary: `${character.name.ja}の誕生日 / ${character.name.ko}의 생일`,
		start: {
			date: character.birthday,
			timeZone: 'Asia/Tokyo',
		},
		end: {
			date: character.birthday,
			timeZone: 'Asia/Tokyo',
		},
		recurrence: [`RRULE:FREQ=YEARLY;BYMONTHDAY=${date}`],
	};
};

export const createEvents = async () => {
	const auth = await authorize();
	const calendar = google.calendar({ version: 'v3', auth });

	for (const character of characters) {
		console.log('character.id', character.id, character.birthday.slice(5), character.name.ja);

		if (character.id === 10100) {
			console.log(`skip: ${character.id} ${character.name}`);
			continue;
		}

		const prevEvent = await getCalendarEvent(calendar, character.id);
		const nextEvent = await convertCalendarEvent(character);

		if (!nextEvent) {
			console.log('cannot convert event', character);
			continue;
		}

		if (!prevEvent) {
			await createCalendarEvent(calendar, nextEvent);
			continue;
		}

		if (calendarEventEquals(prevEvent, nextEvent)) {
			continue;
		}

		await updateCalendarEvent(calendar, nextEvent);
	}
};
