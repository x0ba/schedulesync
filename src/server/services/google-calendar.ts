import { google } from "googleapis";
import type { ScheduleEvent } from "./schedule-analyzer";
import { parse, addWeeks, format } from "date-fns";

/**
 * Creates a new Google Calendar
 */
export async function createCalendar(
  accessToken: string,
  calendarName: string,
): Promise<string> {
  const calendar = google.calendar({ version: "v3" });
  
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const response = await calendar.calendars.insert({
    auth,
    requestBody: {
      summary: calendarName,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  if (!response.data.id) {
    throw new Error("Failed to create calendar");
  }

  return response.data.id;
}

/**
 * Adds events to a Google Calendar
 */
export async function addEventsToCalendar(
  accessToken: string,
  calendarId: string,
  events: ScheduleEvent[],
  options: {
    repeatWeeks?: number;
    timezone?: string;
    startDate?: Date;
  } = {},
): Promise<void> {
  const calendar = google.calendar({ version: "v3" });
  
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const { repeatWeeks = 16, timezone = "UTC", startDate = new Date() } = options;

  // Process each event
  for (const event of events) {
    if (event.isOneTime && event.date) {
      // One-time event with a specific date
      await createOneTimeEvent(calendar, auth, calendarId, event, timezone);
    } else {
      // Recurring event
      await createRecurringEvent(
        calendar,
        auth,
        calendarId,
        event,
        timezone,
        startDate,
        repeatWeeks,
      );
    }
  }
}

/**
 * Creates a one-time event in Google Calendar
 */
async function createOneTimeEvent(
  calendar: ReturnType<typeof google.calendar>,
  auth: google.auth.OAuth2,
  calendarId: string,
  event: ScheduleEvent,
  timezone: string,
) {
  if (!event.date) return;

  const eventDate = parse(event.date, "yyyy-MM-dd", new Date());
  const startDateTime = parse(event.startTime, "HH:mm", eventDate);
  const endDateTime = parse(event.endTime, "HH:mm", eventDate);

  await calendar.events.insert({
    auth,
    calendarId,
    requestBody: {
      summary: event.title,
      location: event.location,
      description: buildEventDescription(event),
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: timezone,
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: timezone,
      },
    },
  });
}

/**
 * Creates a recurring event in Google Calendar
 */
async function createRecurringEvent(
  calendar: ReturnType<typeof google.calendar>,
  auth: any,
  calendarId: string,
  event: ScheduleEvent,
  timezone: string,
  startDate: Date,
  repeatWeeks: number,
) {
  // Find the next occurrence of this day of week
  const dayMap: Record<string, number> = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  const targetDay = dayMap[event.dayOfWeek];
  if (targetDay === undefined) return;

  // Calculate the first occurrence
  const firstOccurrence = new Date(startDate);
  const currentDay = firstOccurrence.getDay();
  const daysUntilTarget = (targetDay - currentDay + 7) % 7;
  firstOccurrence.setDate(firstOccurrence.getDate() + daysUntilTarget);

  // Parse start and end times
  const startDateTime = parse(event.startTime, "HH:mm", firstOccurrence);
  const endDateTime = parse(event.endTime, "HH:mm", firstOccurrence);

  // Calculate the last occurrence (until date)
  const lastOccurrence = addWeeks(firstOccurrence, repeatWeeks);

  // Create RRULE for weekly recurrence
  // Format lastOccurrence as UTC for RRULE UNTIL (RFC 5545 requires UTC if 'Z' is present)
  const untilUtc = lastOccurrence.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z').slice(0, 16);
  const rrule = `RRULE:FREQ=WEEKLY;UNTIL=${untilUtc}`;

  await calendar.events.insert({
    auth,
    calendarId,
    requestBody: {
      summary: event.title,
      location: event.location,
      description: buildEventDescription(event),
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: timezone,
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: timezone,
      },
      recurrence: [rrule],
    },
  });
}

/**
 * Builds a description for the event
 */
function buildEventDescription(event: ScheduleEvent): string {
  const parts: string[] = [];

  if (event.courseCode) {
    parts.push(`Course Code: ${event.courseCode}`);
  }

  if (event.instructor) {
    parts.push(`Instructor: ${event.instructor}`);
  }

  if (event.isOneTime) {
    parts.push("Type: One-time event");
  }

  return parts.join("\n");
}

