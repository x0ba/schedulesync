import ical, { ICalEventRepeatingFreq, ICalWeekday } from "ical-generator";
import type { ScheduleEvent } from "@/server/services/schedule-analyzer";

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
  const currentDay = now.getDay();

  let daysUntilTarget = targetDay - currentDay;
  if (daysUntilTarget <= 0) {
    daysUntilTarget += 7;
  }

  const [hours, minutes] = time.split(":").map(Number);
  const targetDate = new Date(now);
  targetDate.setDate(now.getDate() + daysUntilTarget);
  targetDate.setHours(hours!, minutes!, 0, 0);

  return targetDate;
}

export interface GenerateICalOptions {
  events: ScheduleEvent[];
  calendarName?: string;
  semesterEndDate?: Date;
  repeatWeeks?: number;
}

export function generateICalFile(options: GenerateICalOptions): string {
  const {
    events,
    calendarName = "Class Schedule",
    semesterEndDate,
    repeatWeeks = 16,
  } = options;

  const calendar = ical({ name: calendarName });

  // Calculate default end date (repeatWeeks from now)
  const defaultEndDate = new Date();
  defaultEndDate.setDate(defaultEndDate.getDate() + repeatWeeks * 7);
  const untilDate = semesterEndDate ?? defaultEndDate;

  for (const event of events) {
    let startDate: Date;
    let endDate: Date;

    // Handle one-time events differently
    if (event.isOneTime && event.date) {
      // Parse the specific date for one-time events with validation
      const dateParts = event.date.split("-");
      if (dateParts.length !== 3) {
        throw new Error(`Invalid date format: ${event.date}`);
      }
      const [year, month, day] = dateParts.map(Number);
      if (!year || !month || !day || isNaN(year) || isNaN(month) || isNaN(day)) {
        throw new Error(`Invalid date values: ${event.date}`);
      }

      // Validate and parse startTime
      const startTimeParts = event.startTime.split(":");
      if (startTimeParts.length !== 2) {
        throw new Error(`Invalid time format for startTime: ${event.startTime}`);
      }
      const [startHours, startMinutes] = startTimeParts.map(Number);
      if (isNaN(startHours) || isNaN(startMinutes)) {
        throw new Error(`Invalid time values for startTime: ${event.startTime}`);
      }

      // Validate and parse endTime
      const endTimeParts = event.endTime.split(":");
      if (endTimeParts.length !== 2) {
        throw new Error(`Invalid time format for endTime: ${event.endTime}`);
      }
      const [endHours, endMinutes] = endTimeParts.map(Number);
      if (isNaN(endHours) || isNaN(endMinutes)) {
        throw new Error(`Invalid time values for endTime: ${event.endTime}`);
      }
      startDate = new Date(year, month - 1, day, startHours, startMinutes);
      endDate = new Date(year, month - 1, day, endHours, endMinutes);
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
          descriptionParts.length > 0
            ? descriptionParts.join("\n")
            : undefined,
      });
    } else {
      calendar.createEvent({
        start: startDate,
        end: endDate,
        summary: event.title,
        location: event.location,
        description:
          descriptionParts.length > 0
            ? descriptionParts.join("\n")
            : undefined,
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

