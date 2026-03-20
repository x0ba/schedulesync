"use client";

import { useCallback, useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Upload,
  X,
  Download,
  Calendar,
  Loader2,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import type { ScheduleEvent } from "@/server/services/schedule-analyzer";
import { format, parse, isBefore, startOfDay } from "date-fns";
import { useAuth, useClerk } from "@clerk/nextjs";

// Storage keys for persisting state across OAuth redirect
const STORAGE_KEYS = {
  preview: "schedulesync_preview",
  fileName: "schedulesync_fileName",
  events: "schedulesync_events",
  startDate: "schedulesync_startDate",
  endDate: "schedulesync_endDate",
} as const;

export function UploadZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [events, setEvents] = useState<ScheduleEvent[] | null>(null);
  const [calendarUrl, setCalendarUrl] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();

  // Restore state from sessionStorage only after OAuth redirect
  useEffect(() => {
    const oauthRedirect = sessionStorage.getItem("schedulesync_oauth_redirect");
    if (
      isSignedIn &&
      oauthRedirect === "true" &&
      preview === null &&
      fileName === null &&
      events === null
    ) {
      const savedPreview = sessionStorage.getItem(STORAGE_KEYS.preview);
      const savedFileName = sessionStorage.getItem(STORAGE_KEYS.fileName);
      const savedEvents = sessionStorage.getItem(STORAGE_KEYS.events);

      if (savedPreview) {
        setPreview(savedPreview);
        sessionStorage.removeItem(STORAGE_KEYS.preview);
      }
      if (savedFileName) {
        setFileName(savedFileName);
        sessionStorage.removeItem(STORAGE_KEYS.fileName);
      }
      if (savedEvents) {
        try {
          setEvents(JSON.parse(savedEvents) as ScheduleEvent[]);
        } catch {
          // Ignore parse errors
        }
        sessionStorage.removeItem(STORAGE_KEYS.events);
      }
      const savedStartDate = sessionStorage.getItem(STORAGE_KEYS.startDate);
      if (savedStartDate) {
        try {
          setStartDate(new Date(savedStartDate));
        } catch {
          // Ignore parse errors
        }
        sessionStorage.removeItem(STORAGE_KEYS.startDate);
      }
      const savedEndDate = sessionStorage.getItem(STORAGE_KEYS.endDate);
      if (savedEndDate) {
        try {
          setEndDate(new Date(savedEndDate));
        } catch {
          // Ignore parse errors
        }
        sessionStorage.removeItem(STORAGE_KEYS.endDate);
      }
      sessionStorage.removeItem("schedulesync_oauth_redirect");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn]);

  // Clear endDate if it becomes invalid (before startDate)
  useEffect(() => {
    if (
      startDate &&
      endDate &&
      isBefore(startOfDay(endDate), startOfDay(startDate))
    ) {
      setEndDate(undefined);
    }
  }, [startDate, endDate]);

  // Save state to sessionStorage before OAuth redirect
  const saveStateForSignIn = useCallback(() => {
    sessionStorage.setItem("schedulesync_oauth_redirect", "true");
    if (preview) {
      const previewSizeBytes = preview.length * 0.75;
      const maxPreviewSize = 4 * 1024 * 1024;
      if (previewSizeBytes > maxPreviewSize) {
        console.warn(
          "Preview image is too large to save in sessionStorage (exceeds 4MB). Skipping save.",
        );
      } else {
        try {
          sessionStorage.setItem(STORAGE_KEYS.preview, preview);
        } catch (e) {
          if (e instanceof DOMException && e.name === "QuotaExceededError") {
            console.error(
              "Failed to save preview: sessionStorage quota exceeded.",
            );
          } else {
            console.error("Failed to save preview to sessionStorage:", e);
          }
        }
      }
    }
    if (fileName) {
      try {
        sessionStorage.setItem(STORAGE_KEYS.fileName, fileName);
      } catch (e) {
        console.error("Failed to save fileName to sessionStorage:", e);
      }
    }
    if (events) {
      try {
        sessionStorage.setItem(STORAGE_KEYS.events, JSON.stringify(events));
      } catch (e) {
        console.error("Failed to save events to sessionStorage:", e);
      }
    }
    if (startDate) {
      try {
        sessionStorage.setItem(STORAGE_KEYS.startDate, startDate.toISOString());
      } catch (e) {
        console.error("Failed to save startDate to sessionStorage:", e);
      }
    }
    if (endDate) {
      try {
        sessionStorage.setItem(STORAGE_KEYS.endDate, endDate.toISOString());
      } catch (e) {
        console.error("Failed to save endDate to sessionStorage:", e);
      }
    }
  }, [preview, fileName, events, startDate, endDate]);

  const handleSignInClick = useCallback(() => {
    saveStateForSignIn();
    openSignIn();
  }, [saveStateForSignIn, openSignIn]);

  const analyzeSchedule = api.schedule.analyzeSchedule.useMutation({
    onSuccess: (data) => {
      setEvents(data.events);
      setCalendarUrl(null);
    },
  });

  const generateIcal = api.schedule.generateIcal.useMutation({
    onSuccess: (data) => {
      const blob = new Blob([data.icalContent], {
        type: "text/calendar;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "schedule.ics";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
  });

  const syncToGoogleCalendar = api.schedule.syncToGoogleCalendar.useMutation({
    onSuccess: (data) => {
      setCalendarUrl(data.calendarUrl);
    },
  });

  const handleFile = useCallback((file: File) => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
        setFileName(file.name);
        setEvents(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const clearPreview = useCallback(() => {
    setPreview(null);
    setFileName(null);
    setEvents(null);
  }, []);

  const handleAnalyze = useCallback(() => {
    if (!preview) return;
    analyzeSchedule.mutate({ imageBase64: preview });
  }, [preview, analyzeSchedule]);

  const handleDownloadIcal = useCallback(() => {
    if (!events || !startDate) return;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    generateIcal.mutate({ events, timezone, startDate, endDate });
  }, [events, startDate, endDate, generateIcal]);

  const handleSyncToGoogle = useCallback(() => {
    if (!events || !startDate) return;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    syncToGoogleCalendar.mutate({
      events,
      calendarName: "Class Schedule (Generated by ScheduleSync)",
      timezone,
      startDate,
      endDate,
    });
  }, [events, startDate, endDate, syncToGoogleCalendar]);

  return (
    <div className="space-y-4">
      {/* Upload area */}
      <div
        className={cn(
          "rounded-lg border-2 border-dashed transition-colors",
          isDragging ? "border-foreground bg-muted" : "border-border",
        )}
      >
        {preview ? (
          <div className="p-4">
            <div className="relative overflow-hidden rounded">
              <Image
                src={preview}
                alt="Schedule preview"
                className="max-h-64 w-full object-contain"
                width={800}
                height={256}
                unoptimized
              />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-muted-foreground truncate text-sm">
                {fileName}
              </span>
              <button
                onClick={clearPreview}
                className="text-muted-foreground hover:text-foreground ml-2 shrink-0 transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        ) : (
          <label
            htmlFor="schedule-upload"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className="flex cursor-pointer flex-col items-center gap-3 px-6 py-12"
          >
            <Upload
              className={cn(
                "size-6",
                isDragging ? "text-foreground" : "text-muted-foreground",
              )}
            />
            <div className="text-center">
              <p className="text-sm font-medium">
                {isDragging
                  ? "Drop your screenshot here"
                  : "Drop your schedule screenshot here"}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                or click to browse &middot; PNG, JPG, WebP
              </p>
            </div>

            <input
              id="schedule-upload"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleInputChange}
            />
          </label>
        )}
      </div>

      {/* Analyze Button */}
      {preview && !events && (
        <Button
          onClick={handleAnalyze}
          disabled={analyzeSchedule.isPending}
          className="w-full"
        >
          {analyzeSchedule.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Analyze Schedule"
          )}
        </Button>
      )}

      {/* Error Display */}
      {analyzeSchedule.isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700">
            Failed to analyze schedule. Please try again.
          </p>
        </div>
      )}

      {/* Extracted Events */}
      {events && events.length > 0 && (
        <div className="rounded-lg border">
          <div className="border-b px-4 py-3">
            <h3 className="text-sm font-medium">
              {events.length} event{events.length !== 1 ? "s" : ""} found
            </h3>
          </div>

          <div className="max-h-64 divide-y overflow-y-auto">
            {events.map((event, index) => (
              <div key={index} className="px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{event.title}</p>
                  {event.isOneTime && (
                    <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                      One-time
                    </span>
                  )}
                </div>
                <div className="text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    {event.isOneTime && event.date ? (
                      <span>
                        {(() => {
                          try {
                            const parsedDate = parse(
                              event.date,
                              "yyyy-MM-dd",
                              new Date(),
                            );
                            if (isNaN(parsedDate.getTime())) {
                              return "Invalid date";
                            }
                            return format(parsedDate, "MMM d, yyyy");
                          } catch {
                            return event.date;
                          }
                        })()}
                      </span>
                    ) : (
                      event.dayOfWeek
                    )}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    {event.startTime} - {event.endTime}
                  </span>
                  {event.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3" />
                      {event.location}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Start Date Picker */}
      {events && events.length > 0 && (
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            Semester start date <span className="text-red-500">*</span>
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground",
                )}
              >
                <CalendarDays className="mr-2 size-4" />
                {startDate ? format(startDate, "PPP") : "Select a date..."}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {!startDate && (
            <p className="text-muted-foreground text-xs">
              When do your classes begin?
            </p>
          )}
        </div>
      )}

      {/* End Date Picker */}
      {events && events.length > 0 && (
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            Semester end date{" "}
            <span className="text-muted-foreground font-normal">
              (optional)
            </span>
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !endDate && "text-muted-foreground",
                )}
              >
                <CalendarDays className="mr-2 size-4" />
                {endDate ? format(endDate, "PPP") : "Select a date..."}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
                disabled={
                  startDate
                    ? (date) =>
                        isBefore(startOfDay(date), startOfDay(startDate))
                    : undefined
                }
              />
            </PopoverContent>
          </Popover>
          {!endDate && (
            <p className="text-muted-foreground text-xs">
              Defaults to 16 weeks if not set
            </p>
          )}
        </div>
      )}

      {/* Export Buttons */}
      {events && events.length > 0 && (
        <div className="space-y-2 pt-2">
          <Button
            onClick={handleDownloadIcal}
            disabled={generateIcal.isPending || !startDate}
            className="w-full"
          >
            {generateIcal.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            Download .ics file
          </Button>

          {isSignedIn ? (
            <Button
              onClick={handleSyncToGoogle}
              disabled={syncToGoogleCalendar.isPending || !startDate}
              className="w-full"
              variant="outline"
            >
              {syncToGoogleCalendar.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Calendar className="size-4" />
                  Add to Google Calendar
                </>
              )}
            </Button>
          ) : (
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Google Calendar</p>
                <p className="text-muted-foreground text-xs">
                  Sign in to sync directly
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={handleSignInClick}>
                Sign in
              </Button>
            </div>
          )}

          {/* Success message */}
          {calendarUrl && (
            <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">
                  Added to Google Calendar
                </p>
                <a
                  href={calendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-green-700 underline underline-offset-2"
                >
                  Open in Google Calendar
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          )}

          {/* Error message for Google Calendar sync */}
          {syncToGoogleCalendar.isError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-700">
                {syncToGoogleCalendar.error?.message ||
                  "Failed to sync to Google Calendar. Please make sure you've connected your Google account with Calendar permissions."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
