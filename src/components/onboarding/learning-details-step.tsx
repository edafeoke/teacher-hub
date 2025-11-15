"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  studentLearningDetailsSchema,
  type StudentLearningDetailsData,
} from "@/lib/validations/onboarding";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/ui/tag-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

interface LearningDetailsStepProps {
  onNext: (data: StudentLearningDetailsData) => void;
  onBack: () => void;
  defaultValues?: StudentLearningDetailsData;
}

const LEARNING_LEVELS = [
  "Primary",
  "Secondary",
  "University",
  "Professional",
  "Beginner",
  "Intermediate",
  "Advanced",
];

const BUDGET_RANGES = [
  "$0 - $25/hour",
  "$25 - $50/hour",
  "$50 - $100/hour",
  "$100 - $200/hour",
  "$200+/hour",
  "Flexible",
];

export function LearningDetailsStep({
  onNext,
  onBack,
  defaultValues,
}: LearningDetailsStepProps) {
  const form = useForm<StudentLearningDetailsData>({
    resolver: zodResolver(studentLearningDetailsSchema),
    defaultValues: defaultValues || {
      subjectsOfInterest: [],
      learningLevel: "",
      learningGoals: "",
      preferredMode: undefined,
      budgetRange: "",
    },
  });

  const onSubmit = (data: StudentLearningDetailsData) => {
    onNext(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Learning Details</h2>
        <p className="text-muted-foreground">
          Tell us about your learning goals and preferences
        </p>
      </div>

      <FieldGroup>
        <Controller
          name="subjectsOfInterest"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="subjectsOfInterest">
                Subjects of Interest *
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

        <Controller
          name="learningLevel"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="learningLevel">Learning Level</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="learningLevel">
                  <SelectValue placeholder="Select your level" />
                </SelectTrigger>
                <SelectContent>
                  {LEARNING_LEVELS.map((level) => (
                    <SelectItem key={level} value={level.toLowerCase()}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="learningGoals"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="learningGoals">Learning Goals</FieldLabel>
              <Textarea
                {...field}
                id="learningGoals"
                placeholder="e.g., Exam preparation, skill improvement, hobby..."
                rows={4}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="preferredMode"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Preferred Mode</FieldLabel>
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2"
              >
                <div>
                  <RadioGroupItem value="online" id="mode-online" className="peer sr-only" />
                  <label
                    htmlFor="mode-online"
                    className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-background p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <span className="font-medium">Online</span>
                  </label>
                </div>
                <div>
                  <RadioGroupItem value="in-person" id="mode-in-person" className="peer sr-only" />
                  <label
                    htmlFor="mode-in-person"
                    className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-background p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <span className="font-medium">In-Person</span>
                  </label>
                </div>
                <div>
                  <RadioGroupItem value="hybrid" id="mode-hybrid" className="peer sr-only" />
                  <label
                    htmlFor="mode-hybrid"
                    className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-background p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <span className="font-medium">Hybrid</span>
                  </label>
                </div>
              </RadioGroup>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="budgetRange"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="budgetRange">Budget Range</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="budgetRange">
                  <SelectValue placeholder="Select budget range" />
                </SelectTrigger>
                <SelectContent>
                  {BUDGET_RANGES.map((range) => (
                    <SelectItem key={range} value={range}>
                      {range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
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

