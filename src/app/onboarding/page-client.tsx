"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { RoleSelectionStep } from "@/components/onboarding/role-selection-step";
import { BasicInfoStep } from "@/components/onboarding/basic-info-step";
import { ProfessionalDetailsStep } from "@/components/onboarding/professional-details-step";
import { LearningDetailsStep } from "@/components/onboarding/learning-details-step";
import { AvailabilityStep } from "@/components/onboarding/availability-step";
import { ReviewStep } from "@/components/onboarding/review-step";
import {
  createTeacherProfile,
  createStudentProfile,
} from "@/server-actions/onboarding";
import type {
  RoleSelectionData,
  BasicInfoData,
  TeacherProfessionalDetailsData,
  StudentLearningDetailsData,
  AvailabilityData,
  TeacherOnboardingData,
  StudentOnboardingData,
} from "@/lib/validations/onboarding";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const STEPS = ["Role", "Basic Info", "Details", "Availability", "Review"];

interface OnboardingPageProps {
  userName: string;
  userImage?: string | null;
  hasTeacherProfile: boolean;
  hasStudentProfile: boolean;
  defaultRole?: "teacher" | "student";
}

export default function OnboardingPage({ 
  userName, 
  userImage, 
  hasTeacherProfile, 
  hasStudentProfile,
  defaultRole
}: OnboardingPageProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [role, setRole] = useState<"teacher" | "student" | null>(defaultRole || null);
  const [formData, setFormData] = useState<{
    role?: RoleSelectionData;
    basicInfo?: BasicInfoData;
    professionalDetails?: TeacherProfessionalDetailsData;
    learningDetails?: StudentLearningDetailsData;
    availability?: AvailabilityData;
  }>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleSelection = (data: RoleSelectionData) => {
    setRole(data.role);
    setFormData((prev) => ({ ...prev, role: data }));
    setCurrentStep(2);
  };

  const handleBasicInfo = (data: BasicInfoData) => {
    setFormData((prev) => ({ ...prev, basicInfo: data }));
    setCurrentStep(3);
  };

  const handleProfessionalDetails = (data: TeacherProfessionalDetailsData) => {
    setFormData((prev) => ({ ...prev, professionalDetails: data }));
    setCurrentStep(4);
  };

  const handleLearningDetails = (data: StudentLearningDetailsData) => {
    setFormData((prev) => ({ ...prev, learningDetails: data }));
    setCurrentStep(4);
  };

  const handleAvailability = (data: AvailabilityData) => {
    setFormData((prev) => ({ ...prev, availability: data }));
    setCurrentStep(5);
  };

  const handleSubmit = async () => {
    if (!formData.role || !formData.basicInfo || !formData.availability) {
      setError("Please complete all required steps");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (role === "teacher") {
        if (!formData.professionalDetails) {
          setError("Please complete all required steps");
          setIsSubmitting(false);
          return;
        }

        const teacherData: TeacherOnboardingData = {
          role: "teacher",
          basicInfo: formData.basicInfo,
          professionalDetails: formData.professionalDetails,
          availability: formData.availability,
        };

        const result = await createTeacherProfile(teacherData);
        if (result.success) {
          router.push("/teacher");
        } else {
          setError(result.error || "Failed to create teacher profile");
          setIsSubmitting(false);
        }
      } else if (role === "student") {
        if (!formData.learningDetails) {
          setError("Please complete all required steps");
          setIsSubmitting(false);
          return;
        }

        const studentData: StudentOnboardingData = {
          role: "student",
          basicInfo: formData.basicInfo,
          learningDetails: formData.learningDetails,
          availability: formData.availability,
        };

        const result = await createStudentProfile(studentData);
        if (result.success) {
          router.push("/student");
        } else {
          setError(result.error || "Failed to create student profile");
          setIsSubmitting(false);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Auto-advance if role is pre-selected
  React.useEffect(() => {
    if (defaultRole && !formData.role && currentStep === 1) {
      const roleData: RoleSelectionData = { role: defaultRole };
      handleRoleSelection(roleData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultRole]);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <RoleSelectionStep
            onNext={handleRoleSelection}
            defaultValues={formData.role || (defaultRole ? { role: defaultRole } : undefined)}
            hasTeacherProfile={hasTeacherProfile}
            hasStudentProfile={hasStudentProfile}
          />
        );
      case 2:
        return (
          <BasicInfoStep
            onNext={handleBasicInfo}
            onBack={handleBack}
            defaultValues={formData.basicInfo}
            userName={userName}
            userImage={userImage}
          />
        );
      case 3:
        return role === "teacher" ? (
          <ProfessionalDetailsStep
            onNext={handleProfessionalDetails}
            onBack={handleBack}
            defaultValues={formData.professionalDetails}
          />
        ) : (
          <LearningDetailsStep
            onNext={handleLearningDetails}
            onBack={handleBack}
            defaultValues={formData.learningDetails}
          />
        );
      case 4:
        return (
          <AvailabilityStep
            onNext={handleAvailability}
            onBack={handleBack}
            defaultValues={formData.availability}
          />
        );
      case 5:
        if (!formData.role || !formData.basicInfo || !formData.availability) {
          return null;
        }
        const reviewData =
          role === "teacher"
            ? ({
                role: "teacher",
                basicInfo: formData.basicInfo,
                professionalDetails: formData.professionalDetails!,
                availability: formData.availability,
              } as TeacherOnboardingData)
            : ({
                role: "student",
                basicInfo: formData.basicInfo,
                learningDetails: formData.learningDetails!,
                availability: formData.availability,
              } as StudentOnboardingData);

        return (
          <ReviewStep
            data={reviewData}
            onBack={handleBack}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            userName={userName}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
      <div className="mx-auto max-w-3xl">
        <div className="bg-card rounded-[calc(var(--radius)+.125rem)] border p-8 shadow-md">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="mb-8">
            <ProgressSteps steps={STEPS} currentStep={currentStep} />
          </div>

          <div>{renderStep()}</div>
        </div>
      </div>
    </div>
  );
}
