"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, DollarSign, BookOpen } from "lucide-react";
import { format } from "date-fns";
import type { BookingWithUsers } from "@/server-actions/bookings/get-bookings";
import { updateBooking, cancelBooking } from "@/server-actions/bookings/update-booking";
import { toast } from "sonner";
import Link from "next/link";

interface BookingCardProps {
  booking: BookingWithUsers;
  role: "teacher" | "student";
}

export function BookingCard({ booking, role }: BookingCardProps) {
  const [isUpdating, setIsUpdating] = React.useState(false);
  const otherUser = role === "teacher" ? booking.student : booking.teacher;
  const initials = otherUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleConfirm = async () => {
    setIsUpdating(true);
    try {
      const result = await updateBooking(booking.id, { status: "CONFIRMED" });
      if (result.success) {
        toast.success("Booking confirmed");
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to confirm booking");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    setIsUpdating(true);
    try {
      const result = await cancelBooking(booking.id);
      if (result.success) {
        toast.success("Booking cancelled");
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to cancel booking");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = () => {
    switch (booking.status) {
      case "PENDING":
        return <Badge variant="secondary">Pending</Badge>;
      case "CONFIRMED":
        return <Badge variant="default">Confirmed</Badge>;
      case "COMPLETED":
        return <Badge variant="outline">Completed</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={otherUser.image || undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">
                {role === "teacher" ? "Student" : "Teacher"}: {otherUser.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{otherUser.email}</p>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Subject:</span>
            <span className="font-medium">{booking.subject}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Price:</span>
            <span className="font-medium">${booking.price}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Date:</span>
            <span className="font-medium">{format(new Date(booking.startTime), "MMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Time:</span>
            <span className="font-medium">
              {format(new Date(booking.startTime), "h:mm a")} - {format(new Date(booking.endTime), "h:mm a")}
            </span>
          </div>
        </div>

        {booking.notes && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground">
              <strong>Notes:</strong> {booking.notes}
            </p>
          </div>
        )}

        <div className="flex gap-2 pt-2 border-t">
          {role === "teacher" && booking.status === "PENDING" && (
            <Button onClick={handleConfirm} disabled={isUpdating} size="sm">
              Confirm
            </Button>
          )}
          {booking.status !== "CANCELLED" && booking.status !== "COMPLETED" && (
            <Button onClick={handleCancel} disabled={isUpdating} variant="destructive" size="sm">
              Cancel
            </Button>
          )}
          <Button asChild variant="outline" size="sm">
            <Link href={`/bookings/${booking.id}`}>View Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

