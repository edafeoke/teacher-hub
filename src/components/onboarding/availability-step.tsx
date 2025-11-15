"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  availabilitySchema,
  type AvailabilityData,
} from "@/lib/validations/onboarding";
import { Input } from "@/components/ui/input";
import { TagInput } from "@/components/ui/tag-input";
import { AvailabilityPicker } from "@/components/ui/availability-picker";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

interface AvailabilityStepProps {
  onNext: (data: AvailabilityData) => void;
  onBack: () => void;
  defaultValues?: AvailabilityData;
}

export function AvailabilityStep({
  onNext,
  onBack,
  defaultValues,
}: AvailabilityStepProps) {
  const form = useForm<AvailabilityData>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: defaultValues || {
      availability: [],
      languagesSpoken: [],
      phoneNumber: "",
    },
  });

  const onSubmit = (data: AvailabilityData) => {
    onNext(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Availability & Preferences</h2>
        <p className="text-muted-foreground">
          Set your availability and communication preferences
        </p>
      </div>

      <FieldGroup>
        <Controller
          name="availability"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Availability</FieldLabel>
              <AvailabilityPicker
                availability={field.value || []}
                onAvailabilityChange={field.onChange}
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="languagesSpoken"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="languagesSpoken">Languages Spoken</FieldLabel>
              <TagInput
                tags={field.value}
                onTagsChange={field.onChange}
                placeholder="e.g., English, Spanish, French..."
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="phoneNumber"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="phoneNumber">Phone Number</FieldLabel>
              <Input
                {...field}
                id="phoneNumber"
                type="tel"
                placeholder="+1 (555) 123-4567"
                aria-invalid={fieldState.invalid}
              />
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

