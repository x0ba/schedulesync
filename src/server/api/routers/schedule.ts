import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  analyzeScheduleImage,
  scheduleEventSchema,
} from "@/server/services/schedule-analyzer";
import { generateICalFile } from "@/lib/ical";

const eventsInputSchema = z.array(scheduleEventSchema);

export const scheduleRouter = createTRPCRouter({
  // Analyze a schedule image and return structured events
  analyzeSchedule: publicProcedure
    .input(
      z.object({
        imageBase64: z.string().describe("Base64 encoded image data"),
      }),
    )
    .mutation(async ({ input }) => {
      const schedule = await analyzeScheduleImage(input.imageBase64);
      return schedule;
    }),

  // Generate an iCal file from events
  generateIcal: publicProcedure
    .input(
      z.object({
        events: eventsInputSchema,
        calendarName: z.string().optional(),
        repeatWeeks: z.number().optional().default(16),
        timezone: z.string().optional(),
      }),
    )
    .mutation(({ input }) => {
      const icalContent = generateICalFile({
        events: input.events,
        calendarName: input.calendarName,
        repeatWeeks: input.repeatWeeks,
        timezone: input.timezone,
      });
      return { icalContent };
    }),
});
