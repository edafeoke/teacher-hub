"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, DollarSign, Award, CheckCircle2 } from "lucide-react";
import type { TeacherWithUser } from "@/server-actions/teachers/get-teachers";
import Link from "next/link";

interface TeacherCardProps {
  teacher: TeacherWithUser;
}

// Generate mock rating for now (since no reviews model exists)
function getMockRating(teacherId: string): number {
  // Generate consistent rating based on teacher ID
  const hash = teacherId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return 4.0 + (hash % 10) / 10; // Rating between 4.0 and 4.9
}

export function TeacherCard({ teacher }: TeacherCardProps) {
  const initials = teacher.user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const rating = getMockRating(teacher.id);
  const isVerified = teacher.verificationStatus === "verified";

  return (
    <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="h-16 w-16">
            <AvatarImage
              src={teacher.user.image || undefined}
              alt={teacher.user.name}
            />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold text-lg truncate">
                {teacher.user.name}
              </h3>
              {isVerified && (
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-1 mb-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium text-sm">{rating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">(No reviews yet)</span>
            </div>
          </div>
        </div>

        {teacher.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {teacher.bio}
          </p>
        )}

        {teacher.subjectsTaught.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {teacher.subjectsTaught.slice(0, 4).map((subject) => (
              <Badge key={subject} variant="secondary" className="text-xs">
                {subject}
              </Badge>
            ))}
            {teacher.subjectsTaught.length > 4 && (
              <Badge variant="secondary" className="text-xs">
                +{teacher.subjectsTaught.length - 4} more
              </Badge>
            )}
          </div>
        )}

        <div className="space-y-2 mb-4 flex-1">
          {(teacher.city || teacher.country) && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="truncate">
                {[teacher.city, teacher.country].filter(Boolean).join(", ") || "Location not specified"}
              </span>
            </div>
          )}

          {teacher.hourlyRate && (
            <div className="flex items-center gap-1 text-sm">
              <DollarSign className="h-3 w-3 text-muted-foreground" />
              <span className="font-medium">${teacher.hourlyRate}/hr</span>
            </div>
          )}

          {teacher.yearsOfExperience !== null && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Award className="h-3 w-3" />
              <span>{teacher.yearsOfExperience} years experience</span>
            </div>
          )}

          {teacher.levels.length > 0 && (
            <div className="text-xs text-muted-foreground">
              Levels: {teacher.levels.slice(0, 3).join(", ")}
              {teacher.levels.length > 3 && ` +${teacher.levels.length - 3} more`}
            </div>
          )}

          {teacher.languagesSpoken.length > 0 && (
            <div className="text-xs text-muted-foreground">
              Languages: {teacher.languagesSpoken.slice(0, 2).join(", ")}
              {teacher.languagesSpoken.length > 2 && ` +${teacher.languagesSpoken.length - 2} more`}
            </div>
          )}
        </div>

        <div className="mt-auto pt-4 border-t">
          <Button asChild variant="outline" className="w-full">
            <Link href={`/teachers/${teacher.id}`}>View Profile</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

