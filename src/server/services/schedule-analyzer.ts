import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

// Schema for a single schedule event
export const scheduleEventSchema = z.object({
  title: z.string().describe("The course name or event title"),
  dayOfWeek: z
    .enum([
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ])
    .describe("The day of the week the event occurs"),
  startTime: z
    .string()
    .describe("Start time in 24-hour format (HH:MM), e.g., 09:30"),
  endTime: z
    .string()
    .describe("End time in 24-hour format (HH:MM), e.g., 10:45"),
  location: z
    .string()
    .optional()
    .describe("The room number, building, or location"),
  instructor: z
    .string()
    .optional()
    .describe("The instructor or professor name if visible"),
  courseCode: z
    .string()
    .optional()
    .describe("The course code if visible (e.g., CS 101)"),
  isOneTime: z
    .boolean()
    .optional()
    .describe(
      "True if this is a one-time event (e.g., Final Exam) rather than a recurring class",
    ),
  date: z
    .string()
    .optional()
    .describe(
      "For one-time events, the specific date in YYYY-MM-DD format (e.g., 2024-12-15)",
    ),
});

export const scheduleSchema = z.object({
  events: z.array(scheduleEventSchema).describe("List of all schedule events"),
  semesterInfo: z
    .string()
    .optional()
    .describe("Any semester or date range information visible"),
});

export type ScheduleEvent = z.infer<typeof scheduleEventSchema>;
export type Schedule = z.infer<typeof scheduleSchema>;

export async function analyzeScheduleImage(
  base64Image: string,
): Promise<Schedule> {
  // Validate input: check data URL format and restrict MIME types
  const dataUrlRegex = /^data:(image\/png|image\/jpeg|image\/webp|image\/gif);base64,([A-Za-z0-9+/=]+)$/;
  const matches = base64Image.match(dataUrlRegex);

  let imageData: { type: "image"; image: URL | Uint8Array; mimeType?: string };

  if (matches) {
    // Validate base64 size (limit to 5MB decoded)
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
    const mimeType = matches[1] as
      | "image/png"
      | "image/jpeg"
      | "image/webp"
      | "image/gif";
    const base64Data = matches[2]!;
    // Calculate decoded size
    const decodedSize = Math.floor(base64Data.length * 3 / 4) - (base64Data.endsWith('==') ? 2 : base64Data.endsWith('=') ? 1 : 0);
    if (decodedSize > MAX_IMAGE_SIZE) {
      throw new Error("Image size exceeds maximum allowed size of 5MB.");
    }
    let binaryString: string;
    try {
      binaryString = atob(base64Data);
    } catch (e) {
      throw new Error("Invalid base64 image data.");
    }
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    imageData = {
      type: "image",
      image: bytes,
      mimeType,
    };
  } else {
    // Assume it's a URL
    imageData = {
      type: "image",
      image: new URL(base64Image),
    };
  }

  const { object } = await generateObject({
    model: google("gemini-2.5-flash"),
    schema: scheduleSchema,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Analyze this class schedule image carefully and extract ALL events/classes shown, including final exams if they are visible.

STEP 1 - IDENTIFY THE SCHEDULE FORMAT:
First, determine the schedule layout:
- Weekly grid view (days as columns, times as rows)
- List view (events listed sequentially)
- Daily view (single day shown)

STEP 2 - IDENTIFY DAY HEADERS:
If this is a grid view, carefully read the day labels at the top of each column (Monday, Tuesday, etc.) or along the left side. Note their exact positions.

STEP 3 - EXTRACT ALL EVENTS:
Scan the ENTIRE schedule systematically from left-to-right and top-to-bottom. For each event:
- Determine which day column it falls under by its horizontal position relative to the day headers
- Read the start and end times from the time axis
- Extract the course name/title for the 'title' field. If a course code is visible (e.g., CS 101), extract it separately in the 'courseCode' field.
- Extract location/room if visible
- Extract instructor name if visible
- Extract course code if visible
- Determine whether this is a one-time event (e.g., "Final Exam", "Midterm", special lecture) - set isOneTime to true for these
- For one-time events, extract the specific date in YYYY-MM-DD format if visible (set in the 'date' field)

IMPORTANT GUIDELINES:
- Do NOT skip any events, even if they are small or partially visible
- Check for events at unusual times (early morning, late evening)
- Look for overlapping or stacked events in the same time slot
- If a class occurs on multiple days (e.g., "MWF" or listed separately), create SEPARATE events for each day
- Verify each event's day by double-checking which column header it aligns with horizontally
- Use 24-hour format for times (HH:MM)
- Distinguish between recurring classes and one-time events:
  * Regular recurring classes should have isOneTime set to false or omitted
  * One-time events like "Final Exam", "Midterm", or any event with a specific date should have isOneTime set to true
  * If you see a specific date for an event, extract it in YYYY-MM-DD format
  * For one-time events with a specific date, still provide the dayOfWeek field based on the date or the day column it appears in

Extract any visible semester or date range information.`,
          },
          imageData,
        ],
      },
    ],
  });

  return object;
}
