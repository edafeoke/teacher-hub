import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  description?: string;
  className?: string;
}

export function StatsCard({
  icon: Icon,
  value,
  label,
  description,
  className,
}: StatsCardProps) {
  return (
    <Card
      className={cn(
        "group border-border/50 bg-card shadow-sm transition-all hover:shadow-md",
        className
      )}
    >
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-center">
          <div className="bg-primary/10 rounded-full p-3">
            <Icon className="text-primary size-6" />
          </div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold md:text-4xl">{value}</div>
          <div className="text-muted-foreground mt-2 text-sm font-medium">
            {label}
          </div>
          {description && (
            <div className="text-muted-foreground mt-1 text-xs">
              {description}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

