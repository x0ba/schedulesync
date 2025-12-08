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
  base64Image: string
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
            text: `Analyze this class schedule image and extract all the events/classes shown. 
For each event, identify:
- The course name/title
- The day(s) of the week it occurs
- Start and end times (convert to 24-hour format HH:MM)
- Location/room if visible
- Instructor name if visible
- Course code if visible

If a class occurs on multiple days, create a separate event for each day.
Extract any visible semester or date range information.`,
          },
          imageData,
        ],
      },
    ],
  });

  return object;
}
