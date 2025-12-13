"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DollarSign, Clock, BookOpen } from "lucide-react";
import type { LearningNeedAdvertisementWithStudent } from "@/server-actions/advertisements/learning-needs";

interface LearningNeedCardProps {
  advertisement: LearningNeedAdvertisementWithStudent;
}

export function LearningNeedCard({ advertisement }: LearningNeedCardProps) {
  const initials = advertisement.studentProfile.user.name
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
              <AvatarImage src={advertisement.studentProfile.user.image || undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{advertisement.title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                by {advertisement.studentProfile.user.name}
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

        <div className="flex items-center gap-4 text-sm pt-2 border-t">
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Budget: {advertisement.budgetRange}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Schedule Available</span>
          </div>
        </div>

        {advertisement.learningGoals && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              <strong>Goals:</strong> {advertisement.learningGoals}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

