import { getSessionWithProfiles } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { getBookings } from "@/server-actions/bookings/get-bookings";
import { BookingList } from "@/components/bookings/booking-list";

export default async function TeacherSessionsPage() {
  const session = await getSessionWithProfiles();

  if (!session?.user) {
    redirect("/login");
  }

  if (!session.user.teacherProfile) {
    redirect("/onboarding");
  }

  const result = await getBookings({
    userId: session.user.id,
    role: "teacher",
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Sessions</h1>
        <p className="text-muted-foreground mt-2">
          Manage your teaching sessions and bookings
        </p>
      </div>

      {!result.success ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">{result.error || "Failed to load sessions"}</p>
        </div>
      ) : (
        <BookingList bookings={result.bookings || []} role="teacher" />
      )}
    </div>
  );
}
