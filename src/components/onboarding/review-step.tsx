"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  TeacherOnboardingData,
  StudentOnboardingData,
} from "@/lib/validations/onboarding";
import { format } from "date-fns";

interface ReviewStepProps {
  data: TeacherOnboardingData | StudentOnboardingData;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  userName: string;
}

export function ReviewStep({
  data,
  onBack,
  onSubmit,
  isSubmitting = false,
  userName,
}: ReviewStepProps) {
  const isTeacher = data.role === "teacher";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Review Your Information</h2>
        <p className="text-muted-foreground">
          Please review your information before submitting
        </p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">Full Name:</span> {userName}
            </div>
            {data.basicInfo.gender && (
              <div>
                <span className="font-medium">Gender:</span>{" "}
                {data.basicInfo.gender}
              </div>
            )}
            {data.basicInfo.dateOfBirth && (
              <div>
                <span className="font-medium">Date of Birth:</span>{" "}
                {format(data.basicInfo.dateOfBirth as Date, "PPP")}
              </div>
            )}
            {data.basicInfo.city && data.basicInfo.country && (
              <div>
                <span className="font-medium">Location:</span>{" "}
                {data.basicInfo.city}, {data.basicInfo.country}
              </div>
            )}
            {data.basicInfo.bio && (
              <div>
                <span className="font-medium">Bio:</span> {data.basicInfo.bio}
              </div>
            )}
          </CardContent>
        </Card>

        {isTeacher ? (
          <Card>
            <CardHeader>
              <CardTitle>Professional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="font-medium">Subjects Taught:</span>{" "}
                {data.professionalDetails.subjectsTaught.join(", ")}
              </div>
              <div>
                <span className="font-medium">Levels:</span>{" "}
                {data.professionalDetails.levels.join(", ")}
              </div>
              {data.professionalDetails.yearsOfExperience && (
                <div>
                  <span className="font-medium">Years of Experience:</span>{" "}
                  {data.professionalDetails.yearsOfExperience}
                </div>
              )}
              {data.professionalDetails.hourlyRate && (
                <div>
                  <span className="font-medium">Hourly Rate:</span> $
                  {data.professionalDetails.hourlyRate}
                </div>
              )}
              {data.professionalDetails.qualifications && (
                <div>
                  <span className="font-medium">Qualifications:</span>{" "}
                  {data.professionalDetails.qualifications}
                </div>
              )}
              {data.professionalDetails.teachingStyle && (
                <div>
                  <span className="font-medium">Teaching Style:</span>{" "}
                  {data.professionalDetails.teachingStyle}
                </div>
              )}
              <div>
                <span className="font-medium">Demo Class Available:</span>{" "}
                {data.professionalDetails.demoClassAvailable ? "Yes" : "No"}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Learning Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="font-medium">Subjects of Interest:</span>{" "}
                {data.learningDetails.subjectsOfInterest.join(", ")}
              </div>
              {data.learningDetails.learningLevel && (
                <div>
                  <span className="font-medium">Learning Level:</span>{" "}
                  {data.learningDetails.learningLevel}
                </div>
              )}
              {data.learningDetails.preferredMode && (
                <div>
                  <span className="font-medium">Preferred Mode:</span>{" "}
                  {data.learningDetails.preferredMode}
                </div>
              )}
              {data.learningDetails.budgetRange && (
                <div>
                  <span className="font-medium">Budget Range:</span>{" "}
                  {data.learningDetails.budgetRange}
                </div>
              )}
              {data.learningDetails.learningGoals && (
                <div>
                  <span className="font-medium">Learning Goals:</span>{" "}
                  {data.learningDetails.learningGoals}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Availability & Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.availability.availability &&
              data.availability.availability.length > 0 && (
                <div>
                  <span className="font-medium">Availability:</span>
                  <ul className="list-disc list-inside mt-1 ml-2">
                    {data.availability.availability.map((slot, idx) => (
                      <li key={idx}>
                        {slot.day}:{" "}
                        {slot.timeSlots
                          .map((ts) => `${ts.start} - ${ts.end}`)
                          .join(", ")}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            {data.availability.languagesSpoken.length > 0 && (
              <div>
                <span className="font-medium">Languages Spoken:</span>{" "}
                {data.availability.languagesSpoken.join(", ")}
              </div>
            )}
            {data.availability.phoneNumber && (
              <div>
                <span className="font-medium">Phone Number:</span>{" "}
                {data.availability.phoneNumber}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Complete Profile"}
        </Button>
      </div>
    </div>
  );
}

