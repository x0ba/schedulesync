import ical, { ICalEventRepeatingFreq, ICalWeekday } from "ical-generator";
import type { ScheduleEvent } from "@/server/services/schedule-analyzer";
import {
  addDays,
  addWeeks,
  getDay,
  parse,
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
} from "date-fns";

const dayToICalDay: Record<string, ICalWeekday> = {
  Monday: ICalWeekday.MO,
  Tuesday: ICalWeekday.TU,
  Wednesday: ICalWeekday.WE,
  Thursday: ICalWeekday.TH,
  Friday: ICalWeekday.FR,
  Saturday: ICalWeekday.SA,
  Sunday: ICalWeekday.SU,
};

const dayToOffset: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

function getNextOccurrence(dayOfWeek: string, time: string): Date {
  const now = new Date();
  const targetDay = dayToOffset[dayOfWeek]!;
  const currentDay = getDay(now);

  let daysUntilTarget = targetDay - currentDay;
  if (daysUntilTarget <= 0) {
    daysUntilTarget += 7;
  }

  const [hours, minutes] = time.split(":").map(Number);
  if (
    hours === undefined ||
    minutes === undefined ||
    isNaN(hours) ||
    isNaN(minutes)
  ) {
    throw new Error(`Invalid time format: ${time}`);
  }

  let targetDate = addDays(now, daysUntilTarget);
  targetDate = setHours(targetDate, hours);
  targetDate = setMinutes(targetDate, minutes);
  targetDate = setSeconds(targetDate, 0);
  targetDate = setMilliseconds(targetDate, 0);

  return targetDate;
}

export interface GenerateICalOptions {
  events: ScheduleEvent[];
  calendarName?: string;
  semesterEndDate?: Date;
  repeatWeeks?: number;
  timezone?: string;
}

export function generateICalFile(options: GenerateICalOptions): string {
  const {
    events,
    calendarName = "Class Schedule",
    semesterEndDate,
    repeatWeeks = 16,
    timezone,
  } = options;

  const calendar = ical({
    name: calendarName,
    timezone: timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  // Calculate default end date (repeatWeeks from now)
  const defaultEndDate = addWeeks(new Date(), repeatWeeks);
  const untilDate = semesterEndDate ?? defaultEndDate;

  for (const event of events) {
    let startDate: Date;
    let endDate: Date;

    // Handle one-time events differently
    if (event.isOneTime && event.date) {
      // Parse the specific date for one-time events with validation
      const date = parse(event.date, "yyyy-MM-dd", new Date());

      // Validate date validity
      if (isNaN(date.getTime())) {
        throw new Error(`Invalid date values: ${event.date}`);
      }

      // Validate and parse startTime
      const startTimeParts = event.startTime.split(":");
      if (startTimeParts.length !== 2) {
        throw new Error(
          `Invalid time format for startTime: ${event.startTime}`,
        );
      }
      const [startHours, startMinutes] = startTimeParts.map(Number);
      if (
        startHours === undefined ||
        startMinutes === undefined ||
        isNaN(startHours) ||
        isNaN(startMinutes)
      ) {
        throw new Error(
          `Invalid time values for startTime: ${event.startTime}`,
        );
      }

      // Validate and parse endTime
      const endTimeParts = event.endTime.split(":");
      if (endTimeParts.length !== 2) {
        throw new Error(`Invalid time format for endTime: ${event.endTime}`);
      }
      const [endHours, endMinutes] = endTimeParts.map(Number);
      if (
        endHours === undefined ||
        endMinutes === undefined ||
        isNaN(endHours) ||
        isNaN(endMinutes)
      ) {
        throw new Error(`Invalid time values for endTime: ${event.endTime}`);
      }

      startDate = setHours(setMinutes(date, startMinutes), startHours);
      endDate = setHours(setMinutes(date, endMinutes), endHours);
    } else if (event.isOneTime) {
      // One-time event without a specific date - use next occurrence of that day
      if (!event.dayOfWeek) {
        throw new Error("One-time event without date must have dayOfWeek");
      }
      startDate = getNextOccurrence(event.dayOfWeek, event.startTime);
      endDate = getNextOccurrence(event.dayOfWeek, event.endTime);
    } else {
      // Regular recurring event
      startDate = getNextOccurrence(event.dayOfWeek, event.startTime);
      endDate = getNextOccurrence(event.dayOfWeek, event.endTime);
    }

    // Build description
    const descriptionParts: string[] = [];
    if (event.courseCode) descriptionParts.push(`Course: ${event.courseCode}`);
    if (event.instructor)
      descriptionParts.push(`Instructor: ${event.instructor}`);

    // Create event with or without recurrence based on event type
    if (event.isOneTime) {
      calendar.createEvent({
        start: startDate,
        end: endDate,
        summary: event.title,
        location: event.location,
        description:
          descriptionParts.length > 0 ? descriptionParts.join("\n") : undefined,
      });
    } else {
      calendar.createEvent({
        start: startDate,
        end: endDate,
        summary: event.title,
        location: event.location,
        description:
          descriptionParts.length > 0 ? descriptionParts.join("\n") : undefined,
        repeating: {
          freq: ICalEventRepeatingFreq.WEEKLY,
          byDay: [dayToICalDay[event.dayOfWeek]!],
          until: untilDate,
        },
      });
    }
  }

  return calendar.toString();
}

export function generateICalBlob(options: GenerateICalOptions): Blob {
  const icalString = generateICalFile(options);
  return new Blob([icalString], { type: "text/calendar;charset=utf-8" });
}
