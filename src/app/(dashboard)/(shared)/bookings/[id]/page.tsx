import { getSessionWithProfiles } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { getBookingById } from "@/server-actions/bookings/get-bookings";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Calendar, Clock, DollarSign, BookOpen, User } from "lucide-react";

export default async function BookingDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSessionWithProfiles();

  if (!session?.user) {
    redirect("/login");
  }

  const result = await getBookingById(params.id);

  if (!result.success || !result.booking) {
    notFound();
  }

  const booking = result.booking;
  const isTeacher = booking.teacherId === session.user.id;
  const otherUser = isTeacher ? booking.student : booking.teacher;

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

  const initials = otherUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-2xl">Booking Details</CardTitle>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={otherUser.image || undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">
                {isTeacher ? "Student" : "Teacher"}: {otherUser.name}
              </h3>
              <p className="text-sm text-muted-foreground">{otherUser.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Subject</p>
                <p className="font-medium">{booking.subject}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="font-medium">${booking.price}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">{format(new Date(booking.startTime), "MMMM d, yyyy")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="font-medium">
                  {format(new Date(booking.startTime), "h:mm a")} - {format(new Date(booking.endTime), "h:mm a")}
                </p>
              </div>
            </div>
          </div>

          {booking.notes && (
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Notes</p>
              <p className="text-sm text-muted-foreground">{booking.notes}</p>
            </div>
          )}

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Created: {format(new Date(booking.createdAt), "PPp")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

