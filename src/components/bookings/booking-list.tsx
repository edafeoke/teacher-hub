"use client";

import * as React from "react";
import { BookingCard } from "./booking-card";
import type { BookingWithUsers } from "@/server-actions/bookings/get-bookings";

interface BookingListProps {
  bookings: BookingWithUsers[];
  role: "teacher" | "student";
}

export function BookingList({ bookings, role }: BookingListProps) {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No bookings yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <BookingCard key={booking.id} booking={booking} role={role} />
      ))}
    </div>
  );
}

