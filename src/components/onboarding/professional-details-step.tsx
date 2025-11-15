"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  teacherProfessionalDetailsSchema,
  type TeacherProfessionalDetailsData,
} from "@/lib/validations/onboarding";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/ui/tag-input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface ProfessionalDetailsStepProps {
  onNext: (data: TeacherProfessionalDetailsData) => void;
  onBack: () => void;
  defaultValues?: TeacherProfessionalDetailsData;
}

const LEVELS = [
  "Primary",
  "Secondary",
  "University",
  "Professional",
  "All Levels",
];

export function ProfessionalDetailsStep({
  onNext,
  onBack,
  defaultValues,
}: ProfessionalDetailsStepProps) {
  const form = useForm<TeacherProfessionalDetailsData>({
    resolver: zodResolver(teacherProfessionalDetailsSchema),
    defaultValues: defaultValues || {
      subjectsTaught: [],
      levels: [],
      yearsOfExperience: undefined,
      qualifications: "",
      teachingStyle: "",
      hourlyRate: undefined,
      demoClassAvailable: false,
    },
  });

  const onSubmit = (data: TeacherProfessionalDetailsData) => {
    onNext(data);
  };

  const toggleLevel = (level: string) => {
    const currentLevels = form.getValues("levels");
    const newLevels = currentLevels.includes(level)
      ? currentLevels.filter((l) => l !== level)
      : [...currentLevels, level];
    form.setValue("levels", newLevels);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Professional Details</h2>
        <p className="text-muted-foreground">
          Tell us about your teaching experience and expertise
        </p>
      </div>

      <FieldGroup>
        <Controller
          name="subjectsTaught"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="subjectsTaught">
                Subjects / Skills Taught *
              </FieldLabel>
              <TagInput
                tags={field.value}
                onTagsChange={field.onChange}
                placeholder="e.g., Mathematics, English, Programming..."
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <div>
          <FieldLabel>Levels *</FieldLabel>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
            {LEVELS.map((level) => (
              <div key={level} className="flex items-center space-x-2">
                <Checkbox
                  id={`level-${level}`}
                  checked={form.watch("levels").includes(level)}
                  onCheckedChange={() => toggleLevel(level)}
                />
                <label
                  htmlFor={`level-${level}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {level}
                </label>
              </div>
            ))}
          </div>
          {form.formState.errors.levels && (
            <FieldError errors={[form.formState.errors.levels]} />
          )}
        </div>

        <Controller
          name="yearsOfExperience"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="yearsOfExperience">
                Years of Experience
              </FieldLabel>
              <Input
                {...field}
                id="yearsOfExperience"
                type="number"
                min="0"
                max="100"
                placeholder="5"
                value={field.value || ""}
                onChange={(e) =>
                  field.onChange(
                    e.target.value ? parseInt(e.target.value, 10) : undefined
                  )
                }
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="qualifications"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="qualifications">
                Qualifications / Certifications
              </FieldLabel>
              <Textarea
                {...field}
                id="qualifications"
                placeholder="e.g., Bachelor's in Mathematics, TEFL Certificate..."
                rows={3}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="teachingStyle"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="teachingStyle">
                Teaching Style / Methodology
              </FieldLabel>
              <Textarea
                {...field}
                id="teachingStyle"
                placeholder="Describe your teaching approach..."
                rows={3}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="hourlyRate"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="hourlyRate">Hourly Rate / Pricing</FieldLabel>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  {...field}
                  id="hourlyRate"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="50.00"
                  value={field.value || ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? parseFloat(e.target.value) : undefined
                    )
                  }
                  className="pl-7"
                  aria-invalid={fieldState.invalid}
                />
              </div>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="demoClassAvailable"
          control={form.control}
          render={({ field }) => (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="demoClassAvailable"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
              <label
                htmlFor="demoClassAvailable"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Demo Class Available
              </label>
            </div>
          )}
        />
      </FieldGroup>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">Continue</Button>
      </div>
    </form>
  );
}

