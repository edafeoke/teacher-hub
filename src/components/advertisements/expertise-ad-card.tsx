"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DollarSign, Clock, BookOpen } from "lucide-react";
import type { ExpertiseAdvertisementWithTeacher } from "@/server-actions/advertisements/expertise";
import Link from "next/link";

interface ExpertiseAdCardProps {
  advertisement: ExpertiseAdvertisementWithTeacher;
}

export function ExpertiseAdCard({ advertisement }: ExpertiseAdCardProps) {
  const initials = advertisement.teacherProfile.user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={advertisement.teacherProfile.user.image || undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{advertisement.title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                by {advertisement.teacherProfile.user.name}
              </p>
            </div>
          </div>
          {advertisement.isActive ? (
            <Badge variant="default">Active</Badge>
          ) : (
            <Badge variant="secondary">Inactive</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">{advertisement.description}</p>

        <div className="flex flex-wrap gap-2">
          {advertisement.subjects.map((subject) => (
            <Badge key={subject} variant="outline">
              <BookOpen className="mr-1 h-3 w-3" />
              {subject}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">${advertisement.hourlyRate}/hr</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Available</span>
            </div>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={`/teachers/${advertisement.teacherProfile.id}`}>View Profile</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

