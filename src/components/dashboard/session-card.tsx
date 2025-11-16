import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface SessionCardProps {
  name: string;
  image?: string | null;
  date: Date;
  time: string;
  status?: "upcoming" | "completed" | "cancelled";
  subject?: string;
  className?: string;
}

export function SessionCard({
  name,
  image,
  date,
  time,
  status = "upcoming",
  subject,
  className,
}: SessionCardProps) {
  const statusVariants = {
    upcoming: "default",
    completed: "secondary",
    cancelled: "destructive",
  } as const;

  const statusLabels = {
    upcoming: "Upcoming",
    completed: "Completed",
    cancelled: "Cancelled",
  } as const;

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card
      className={cn(
        "border-border/50 bg-card transition-all hover:shadow-md",
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Avatar className="size-12">
            <AvatarImage src={image || undefined} alt={name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold truncate">{name}</h3>
              <Badge variant={statusVariants[status]}>
                {statusLabels[status]}
              </Badge>
            </div>
            {subject && (
              <p className="text-muted-foreground text-sm mt-1">{subject}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span>{format(date, "MMM d, yyyy")}</span>
              <span>•</span>
              <span>{time}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

