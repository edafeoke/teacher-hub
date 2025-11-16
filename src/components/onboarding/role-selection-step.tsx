"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { roleSelectionSchema, type RoleSelectionData } from "@/lib/validations/onboarding";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { GraduationCap, User } from "lucide-react";

interface RoleSelectionStepProps {
  onNext: (data: RoleSelectionData) => void;
  defaultValues?: RoleSelectionData;
  hasTeacherProfile?: boolean;
  hasStudentProfile?: boolean;
}

export function RoleSelectionStep({
  onNext,
  defaultValues,
  hasTeacherProfile = false,
  hasStudentProfile = false,
}: RoleSelectionStepProps) {
  const form = useForm<RoleSelectionData>({
    resolver: zodResolver(roleSelectionSchema),
    defaultValues: defaultValues || { role: undefined },
  });

  const onSubmit = (data: RoleSelectionData) => {
    // Prevent submission if user tries to select a role they already have
    if ((data.role === "teacher" && hasTeacherProfile) || 
        (data.role === "student" && hasStudentProfile)) {
      return;
    }
    onNext(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Choose Your Role</h2>
        <p className="text-muted-foreground">
          Select whether you want to teach or learn
        </p>
      </div>

      <FieldGroup>
        <Controller
          name="role"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem
                    value="teacher"
                    id="role-teacher"
                    className="peer sr-only"
                    disabled={hasTeacherProfile}
                  />
                  <Label
                    htmlFor="role-teacher"
                    className={`flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-background p-6 peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary ${
                      hasTeacherProfile
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-accent hover:text-accent-foreground cursor-pointer"
                    }`}
                  >
                    <GraduationCap className="mb-2 h-8 w-8" />
                    <span className="text-lg font-semibold">Teacher</span>
                    <span className="text-muted-foreground text-sm text-center mt-1">
                      {hasTeacherProfile
                        ? "You already have a teacher account"
                        : "Share your knowledge and teach students"}
                    </span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="student"
                    id="role-student"
                    className="peer sr-only"
                    disabled={hasStudentProfile}
                  />
                  <Label
                    htmlFor="role-student"
                    className={`flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-background p-6 peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary ${
                      hasStudentProfile
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-accent hover:text-accent-foreground cursor-pointer"
                    }`}
                  >
                    <User className="mb-2 h-8 w-8" />
                    <span className="text-lg font-semibold">Student</span>
                    <span className="text-muted-foreground text-sm text-center mt-1">
                      {hasStudentProfile
                        ? "You already have a student account"
                        : "Find teachers and learn new skills"}
                    </span>
                  </Label>
                </div>
              </RadioGroup>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
      </FieldGroup>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={!form.watch("role")}
        >
          Continue
        </Button>
      </div>
    </form>
  );
}

