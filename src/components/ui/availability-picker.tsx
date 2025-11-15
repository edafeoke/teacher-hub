"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface AvailabilitySlot {
  day: string;
  timeSlots: { start: string; end: string }[];
}

interface AvailabilityPickerProps {
  availability: AvailabilitySlot[];
  onAvailabilityChange: (availability: AvailabilitySlot[]) => void;
  className?: string;
}

const DAYS = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

export function AvailabilityPicker({
  availability,
  onAvailabilityChange,
  className,
}: AvailabilityPickerProps) {
  const toggleDay = (day: string) => {
    const existingDay = availability.find((a) => a.day === day);
    if (existingDay) {
      onAvailabilityChange(availability.filter((a) => a.day !== day));
    } else {
      onAvailabilityChange([
        ...availability,
        { day, timeSlots: [{ start: "09:00", end: "17:00" }] },
      ]);
    }
  };

  const addTimeSlot = (day: string) => {
    onAvailabilityChange(
      availability.map((a) =>
        a.day === day
          ? { ...a, timeSlots: [...a.timeSlots, { start: "09:00", end: "17:00" }] }
          : a
      )
    );
  };

  const removeTimeSlot = (day: string, slotIndex: number) => {
    onAvailabilityChange(
      availability.map((a) =>
        a.day === day
          ? {
              ...a,
              timeSlots: a.timeSlots.filter((_, i) => i !== slotIndex),
            }
          : a
      )
    );
  };

  const updateTimeSlot = (
    day: string,
    slotIndex: number,
    field: "start" | "end",
    value: string
  ) => {
    onAvailabilityChange(
      availability.map((a) =>
        a.day === day
          ? {
              ...a,
              timeSlots: a.timeSlots.map((slot, i) =>
                i === slotIndex ? { ...slot, [field]: value } : slot
              ),
            }
          : a
      )
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {DAYS.map((day) => {
          const isSelected = availability.some((a) => a.day === day.value);
          return (
            <Button
              key={day.value}
              type="button"
              variant={isSelected ? "default" : "outline"}
              onClick={() => toggleDay(day.value)}
              className="w-full"
            >
              {day.label}
            </Button>
          );
        })}
      </div>

      <div className="space-y-4">
        {availability.map((dayAvailability) => {
          const dayLabel = DAYS.find((d) => d.value === dayAvailability.day)?.label;
          return (
            <div
              key={dayAvailability.day}
              className="rounded-lg border p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <Label className="font-semibold">{dayLabel}</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addTimeSlot(dayAvailability.day)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Time
                </Button>
              </div>
              <div className="space-y-2">
                {dayAvailability.timeSlots.map((slot, slotIndex) => (
                  <div
                    key={slotIndex}
                    className="flex items-center gap-2"
                  >
                    <Input
                      type="time"
                      value={slot.start}
                      onChange={(e) =>
                        updateTimeSlot(
                          dayAvailability.day,
                          slotIndex,
                          "start",
                          e.target.value
                        )
                      }
                      className="flex-1"
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="time"
                      value={slot.end}
                      onChange={(e) =>
                        updateTimeSlot(
                          dayAvailability.day,
                          slotIndex,
                          "end",
                          e.target.value
                        )
                      }
                      className="flex-1"
                    />
                    {dayAvailability.timeSlots.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          removeTimeSlot(dayAvailability.day, slotIndex)
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

