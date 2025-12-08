"use client";

import { useCallback, useState } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import type { ScheduleEvent } from "@/server/services/schedule-analyzer";

export function UploadZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [events, setEvents] = useState<ScheduleEvent[] | null>(null);

  const analyzeSchedule = api.schedule.analyzeSchedule.useMutation({
    onSuccess: (data) => {
      setEvents(data.events);
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
    [handleFile]
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
    [handleFile]
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
    generateIcal.mutate({ events });
  }, [events, generateIcal]);

  return (
    <div className="space-y-6">
      <Card
        className={cn(
          "relative overflow-hidden border-2 border-dashed transition-all duration-300",
          isDragging
            ? "border-orange-500 bg-orange-50/50 shadow-lg shadow-orange-500/10"
            : "border-border hover:border-orange-400/50 hover:shadow-md"
        )}
      >
        <CardContent className="p-0">
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Schedule preview"
                className="max-h-80 w-full object-contain"
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
                    : "bg-gradient-to-br from-amber-100 to-orange-100 text-orange-600"
                )}
              >
                {isDragging ? (
                  <Upload className="size-7 animate-bounce" />
                ) : (
                  <ImageIcon className="size-7" />
                )}
              </div>

              <div className="text-center">
                <p className="text-base font-medium text-foreground">
                  {isDragging
                    ? "Drop your screenshot here"
                    : "Drop your schedule screenshot"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  or click to browse from your device
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
                <span className="rounded-full bg-muted px-2 py-0.5">PNG</span>
                <span className="rounded-full bg-muted px-2 py-0.5">JPG</span>
                <span className="rounded-full bg-muted px-2 py-0.5">WebP</span>
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
              Analyzing schedule...
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
                      : "border-transparent bg-muted/30",
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
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3.5" />
                      {event.isOneTime && event.date ? (
                        <span>
                          {new Date(
                            event.date + "T12:00:00",
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
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

      {/* Export Button */}
      {events && events.length > 0 && (
        <Button
          onClick={handleDownloadIcal}
          disabled={generateIcal.isPending}
          className="w-full gap-2"
        >
          {generateIcal.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          Download iCal
        </Button>
      )}
    </div>
  );
}
