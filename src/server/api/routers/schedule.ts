import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import {
  analyzeScheduleImage,
  scheduleEventSchema,
} from "@/server/services/schedule-analyzer";
import { generateICalFile } from "@/lib/ical";
import {
  createCalendar,
  addEventsToCalendar,
} from "@/server/services/google-calendar";
import { clerkClient } from "@clerk/nextjs/server";

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

  // Sync events to Google Calendar
  syncToGoogleCalendar: protectedProcedure
    .input(
      z.object({
        events: eventsInputSchema,
        calendarName: z.string().default("My Schedule"),
        repeatWeeks: z.number().optional().default(16),
        timezone: z.string().optional(),
        startDate: z.date().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Get Google OAuth token from Clerk
        const client = await clerkClient();
        const tokenResponse = await client.users.getUserOauthAccessToken(
          ctx.auth.userId,
          "google",
        );

        if (!tokenResponse.data || tokenResponse.data.length === 0) {
          throw new Error(
            "No Google account connected. Please sign in with Google in your account settings.",
          );
        }

        const accessToken = tokenResponse.data[0]?.token;
        if (!accessToken) {
          throw new Error("Failed to retrieve Google access token.");
        }

        // Create a new calendar
        const timezone = input.timezone ?? "UTC";
        const calendarId = await createCalendar(
          accessToken,
          input.calendarName,
          timezone,
        );

        // Add events to the calendar
        await addEventsToCalendar(accessToken, calendarId, input.events, {
          repeatWeeks: input.repeatWeeks,
          timezone,
          startDate: input.startDate,
        });

        // Return the calendar URL
        const calendarUrl = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(calendarId)}`;

        return {
          success: true,
          calendarId,
          calendarUrl,
        };
      } catch (error) {
        // Provide better error messages for common issues
        if (error instanceof Error) {
          if (error.message.includes("insufficient authentication scopes")) {
            throw new Error(
              "Google Calendar permission not granted. Please reconnect your Google account with Calendar access enabled in Clerk Dashboard.",
            );
          }
          throw error;
        }
        throw new Error("Failed to sync to Google Calendar. Please try again.");
      }
    }),
});
