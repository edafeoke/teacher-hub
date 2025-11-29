"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Star,
  MapPin,
  DollarSign,
  Award,
  CheckCircle2,
  BookOpen,
  Languages,
  GraduationCap,
  Clock,
  Video,
  Mail,
  ArrowLeft,
} from "lucide-react";
import type { TeacherWithUser } from "@/server-actions/teachers/get-teachers";
import Link from "next/link";

interface TeacherProfileViewProps {
  teacher: TeacherWithUser;
}

// Generate mock rating for now (since no reviews model exists)
function getMockRating(teacherId: string): number {
  const hash = teacherId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return 4.0 + (hash % 10) / 10; // Rating between 4.0 and 4.9
}

export function TeacherProfileView({ teacher }: TeacherProfileViewProps) {
  const initials = teacher.user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const rating = getMockRating(teacher.id);
  const isVerified = teacher.verificationStatus === "verified";

  return (
    <div className="container mx-auto px-4 py-8 flex-1">
      {/* Back Button */}
      <Link href="/teachers">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Teachers
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Header */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage
                    src={teacher.user.image || undefined}
                    alt={teacher.user.name}
                  />
                  <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                </Avatar>

                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <h1 className="text-2xl font-bold">{teacher.user.name}</h1>
                    {isVerified && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{rating.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">(No reviews yet)</span>
                  </div>

                  {(teacher.city || teacher.country) && (
                    <div className="flex items-center justify-center gap-1 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {[teacher.city, teacher.country].filter(Boolean).join(", ") || "Location not specified"}
                      </span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="w-full space-y-3">
                  {teacher.hourlyRate && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span>Hourly Rate</span>
                      </div>
                      <span className="font-semibold">${teacher.hourlyRate}/hr</span>
                    </div>
                  )}

                  {teacher.yearsOfExperience !== null && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Award className="h-4 w-4" />
                        <span>Experience</span>
                      </div>
                      <span className="font-semibold">{teacher.yearsOfExperience} years</span>
                    </div>
                  )}

                  {teacher.demoClassAvailable && (
                    <Badge variant="secondary" className="w-full justify-center">
                      <Video className="mr-2 h-3 w-3" />
                      Demo Class Available
                    </Badge>
                  )}
                </div>

                <Button className="w-full" size="lg">
                  Contact Teacher
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Intro Video */}
          {teacher.introVideoUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Introduction Video
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  <video
                    src={teacher.introVideoUrl}
                    controls
                    className="w-full h-full object-cover"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bio */}
          {teacher.bio && (
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{teacher.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Subjects */}
          {teacher.subjectsTaught.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Subjects Taught
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {teacher.subjectsTaught.map((subject) => (
                    <Badge key={subject} variant="secondary" className="text-sm">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Teaching Levels */}
          {teacher.levels.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Teaching Levels
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {teacher.levels.map((level) => (
                    <Badge key={level} variant="outline" className="text-sm">
                      {level}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Languages */}
          {teacher.languagesSpoken.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="h-5 w-5" />
                  Languages Spoken
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {teacher.languagesSpoken.map((language) => (
                    <Badge key={language} variant="outline" className="text-sm">
                      {language}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Qualifications */}
          {teacher.qualifications && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Qualifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {teacher.qualifications}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Teaching Style */}
          {teacher.teachingStyle && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Teaching Style
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{teacher.teachingStyle}</p>
              </CardContent>
            </Card>
          )}

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{teacher.user.email}</span>
                </div>
                {teacher.phoneNumber && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{teacher.phoneNumber}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

