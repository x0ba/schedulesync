"use client";

import { useCallback, useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Upload,
  ImageIcon,
  X,
  Sparkles,
  Download,
  Calendar,
  Loader2,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import type { ScheduleEvent } from "@/server/services/schedule-analyzer";
import { format, parse } from "date-fns";
import { useAuth, useClerk } from "@clerk/nextjs";

// Storage keys for persisting state across OAuth redirect
const STORAGE_KEYS = {
  preview: "schedulesync_preview",
  fileName: "schedulesync_fileName",
  events: "schedulesync_events",
} as const;

export function UploadZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [events, setEvents] = useState<ScheduleEvent[] | null>(null);
  const [calendarUrl, setCalendarUrl] = useState<string | null>(null);

  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();

  // Restore state from sessionStorage only after OAuth redirect
  useEffect(() => {
    // Check for OAuth redirect flag in sessionStorage
    const oauthRedirect = sessionStorage.getItem("schedulesync_oauth_redirect");
    // Only restore if user is signed in, redirect flag is set, and state is not already set
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
      // Remove the redirect flag after restoring
      sessionStorage.removeItem("schedulesync_oauth_redirect");
    }
    // Intentionally only depend on isSignedIn. We check preview/fileName/events for null
    // to determine if restoration is needed, but don't want to re-run when they change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn]);

  // Save state to sessionStorage before OAuth redirect
  const saveStateForSignIn = useCallback(() => {
    // Set OAuth redirect flag
    sessionStorage.setItem("schedulesync_oauth_redirect", "true");
    if (preview) {
      // Check size before saving (limit to 4MB for safety)
      const previewSizeBytes = preview.length * 0.75; // base64 overhead: 4/3, so 0.75 to get bytes
      const maxPreviewSize = 4 * 1024 * 1024; // 4MB
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
  }, [preview, fileName, events]);

  // Combined handler that saves state first, then opens sign-in modal
  const handleSignInClick = useCallback(() => {
    saveStateForSignIn();
    openSignIn();
  }, [saveStateForSignIn, openSignIn]);

  const analyzeSchedule = api.schedule.analyzeSchedule.useMutation({
    onSuccess: (data) => {
      setEvents(data.events);
      setCalendarUrl(null); // Reset calendar URL when new events are analyzed
    },
  });

  const generateIcal = api.schedule.generateIcal.useMutation({
    onSuccess: (data) => {
      // Download the iCal file
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
    if (!events) return;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    generateIcal.mutate({ events, timezone });
  }, [events, generateIcal]);

  const handleSyncToGoogle = useCallback(() => {
    if (!events) return;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    syncToGoogleCalendar.mutate({
      events,
      calendarName: "Class Schedule (Generated by ScheduleSync)",
      timezone,
      startDate: new Date(),
    });
  }, [events, syncToGoogleCalendar]);

  return (
    <div className="space-y-6">
      <Card
        className={cn(
          "relative overflow-hidden border-2 border-dashed transition-all duration-300",
          isDragging
            ? "border-orange-500 bg-orange-50/50 shadow-lg shadow-orange-500/10"
            : "border-border hover:border-orange-400/50 hover:shadow-md",
        )}
      >
        <CardContent className="p-0">
          {preview ? (
            <div className="relative">
              <Image
                src={preview}
                alt="Schedule preview"
                className="max-h-80 w-full object-contain"
                width={800}
                height={320}
                unoptimized
              />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent p-4 pt-8">
                <span className="truncate text-sm font-medium text-white">
                  {fileName}
                </span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={clearPreview}
                  className="text-white hover:bg-white/20 hover:text-white"
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>
          ) : (
            <label
              htmlFor="schedule-upload"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className="flex cursor-pointer flex-col items-center gap-4 px-8 py-16"
            >
              <div
                className={cn(
                  "flex size-16 items-center justify-center rounded-2xl transition-all duration-300",
                  isDragging
                    ? "scale-110 bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                    : "bg-gradient-to-br from-amber-100 to-orange-100 text-orange-600",
                )}
              >
                {isDragging ? (
                  <Upload className="size-7 animate-bounce" />
                ) : (
                  <ImageIcon className="size-7" />
                )}
              </div>

              <div className="text-center">
                <p className="text-foreground text-base font-medium">
                  {isDragging
                    ? "Drop your screenshot here"
                    : "Drop your schedule screenshot"}
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  or click to browse from your device
                </p>
              </div>

              <div className="text-muted-foreground/70 flex items-center gap-2 text-xs">
                <span className="bg-muted rounded-full px-2 py-0.5">PNG</span>
                <span className="bg-muted rounded-full px-2 py-0.5">JPG</span>
                <span className="bg-muted rounded-full px-2 py-0.5">WebP</span>
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
        </CardContent>
      </Card>

      {/* Analyze Button */}
      {preview && !events && (
        <Button
          onClick={handleAnalyze}
          disabled={analyzeSchedule.isPending}
          className="w-full gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600"
          size="lg"
        >
          {analyzeSchedule.isPending ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              Analyzing schedule... Don&apos;t close the page.
            </>
          ) : (
            <>
              <Sparkles className="size-5" />
              Analyze Schedule
            </>
          )}
        </Button>
      )}

      {/* Error Display */}
      {analyzeSchedule.isError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-sm text-red-600">
              Failed to analyze schedule. Please try again.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Extracted Events */}
      {events && events.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="mb-4 flex items-center gap-2">
              <CheckCircle2 className="size-5 text-green-500" />
              <h3 className="font-semibold">
                Found {events.length} event{events.length !== 1 ? "s" : ""}
              </h3>
            </div>

            <div className="max-h-64 space-y-3 overflow-y-auto">
              {events.map((event, index) => (
                <div
                  key={index}
                  className={cn(
                    "rounded-lg border p-3 text-sm transition-colors",
                    event.isOneTime
                      ? "border-blue-100 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20"
                      : "bg-muted/30 border-transparent",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium">{event.title}</p>
                    {event.isOneTime && (
                      <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        One-time
                      </span>
                    )}
                  </div>
                  <div className="text-muted-foreground mt-1 flex flex-wrap gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3.5" />
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
                              return event.date; // Fallback to raw string
                            }
                          })()}
                        </span>
                      ) : (
                        event.dayOfWeek
                      )}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3.5" />
                      {event.startTime} - {event.endTime}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3.5" />
                        {event.location}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export Buttons */}
      {events && events.length > 0 && (
        <div className="space-y-3">
          <Button
            onClick={handleDownloadIcal}
            disabled={generateIcal.isPending}
            className="w-full gap-2"
            variant="outline"
          >
            {generateIcal.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            Download iCal
          </Button>

          {isSignedIn ? (
            <Button
              onClick={handleSyncToGoogle}
              disabled={syncToGoogleCalendar.isPending}
              className="w-full gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600"
            >
              {syncToGoogleCalendar.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Syncing to Google Calendar...
                </>
              ) : (
                <>
                  <Calendar className="size-4" />
                  Add to Google Calendar
                </>
              )}
            </Button>
          ) : (
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="size-5 text-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">
                      Want to add directly to Google Calendar?
                    </p>
                    <p className="text-xs text-blue-700">
                      Sign in with your Google account to sync events
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={handleSignInClick}
                  >
                    Sign in
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Success message with calendar link */}
          {calendarUrl && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="size-5 shrink-0 text-green-500" />
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium text-green-900">
                      Successfully added to Google Calendar!
                    </p>
                    <a
                      href={calendarUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-green-700 underline hover:text-green-800"
                    >
                      Open in Google Calendar
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error message for Google Calendar sync */}
          {syncToGoogleCalendar.isError && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-sm text-red-600">
                  {syncToGoogleCalendar.error?.message ||
                    "Failed to sync to Google Calendar. Please make sure you've connected your Google account with Calendar permissions."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
