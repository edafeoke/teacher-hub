import { getSessionWithProfiles } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { getContractById } from "@/server-actions/contracts/get-contracts";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Calendar, DollarSign, Clock } from "lucide-react";

export default async function ContractDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSessionWithProfiles();

  if (!session?.user) {
    redirect("/login");
  }

  const result = await getContractById(params.id);

  if (!result.success || !result.contract) {
    notFound();
  }

  const contract = result.contract;
  const isTeacher = contract.teacherId === session.user.id;
  const otherUser = isTeacher ? contract.student : contract.teacher;

  const getStatusBadge = () => {
    switch (contract.status) {
      case "DRAFT":
        return <Badge variant="secondary">Draft</Badge>;
      case "ACTIVE":
        return <Badge variant="default">Active</Badge>;
      case "COMPLETED":
        return <Badge variant="outline">Completed</Badge>;
      case "TERMINATED":
        return <Badge variant="destructive">Terminated</Badge>;
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
            <CardTitle className="text-2xl">{contract.title}</CardTitle>
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

          {contract.description && (
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Description</p>
              <p className="text-sm text-muted-foreground">{contract.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="font-medium">${contract.totalAmount}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Hourly Rate</p>
                <p className="font-medium">${contract.hourlyRate}/hr</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <p className="font-medium">{contract.totalHours} hours</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="font-medium">{format(new Date(contract.startDate), "MMMM d, yyyy")}</p>
              </div>
            </div>
            {contract.endDate && (
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">End Date</p>
                  <p className="font-medium">{format(new Date(contract.endDate), "MMMM d, yyyy")}</p>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Created: {format(new Date(contract.createdAt), "PPp")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

