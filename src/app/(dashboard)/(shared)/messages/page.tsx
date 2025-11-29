import { MessagesClient } from "@/components/messages/messages-client";
import { getSessionWithProfiles } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";

export default async function MessagesPage() {
  const session = await getSessionWithProfiles();
  
  if (!session?.user) {
    redirect("/login");
  }

  return <MessagesClient currentUserId={session.user.id} />;
}
