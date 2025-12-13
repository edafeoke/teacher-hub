"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createExpertiseAd, updateExpertiseAd, type ExpertiseAdData, type ExpertiseAdvertisementWithTeacher } from "@/server-actions/advertisements/expertise";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ExpertiseAdFormProps {
  initialData?: ExpertiseAdvertisementWithTeacher;
  onSuccess?: () => void;
}

export function ExpertiseAdForm({ initialData, onSuccess }: ExpertiseAdFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [title, setTitle] = React.useState(initialData?.title || "");
  const [description, setDescription] = React.useState(initialData?.description || "");
  const [subjects, setSubjects] = React.useState<string[]>(initialData?.subjects || []);
  const [subjectInput, setSubjectInput] = React.useState("");
  const [hourlyRate, setHourlyRate] = React.useState(initialData?.hourlyRate?.toString() || "");
  const [availableTimeSlots, setAvailableTimeSlots] = React.useState<any>(
    initialData?.availableTimeSlots || { days: [], times: [] }
  );
  const [specialOffers, setSpecialOffers] = React.useState(initialData?.specialOffers || null);

  const handleAddSubject = () => {
    if (subjectInput.trim() && !subjects.includes(subjectInput.trim())) {
      setSubjects([...subjects, subjectInput.trim()]);
      setSubjectInput("");
    }
  };

  const handleRemoveSubject = (subject: string) => {
    setSubjects(subjects.filter((s) => s !== subject));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data: ExpertiseAdData = {
        title,
        description,
        subjects,
        hourlyRate: parseFloat(hourlyRate),
        availableTimeSlots,
        specialOffers: specialOffers || undefined,
      };

      let result;
      if (initialData) {
        result = await updateExpertiseAd(initialData.id, data);
      } else {
        result = await createExpertiseAd(data);
      }

      if (result.success) {
        toast.success(initialData ? "Advertisement updated successfully" : "Advertisement created successfully");
        onSuccess?.();
      } else {
        toast.error(result.error || "Failed to save advertisement");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit Expertise Advertisement" : "Create Expertise Advertisement"}</CardTitle>
        <CardDescription>
          {initialData
            ? "Update your expertise advertisement"
            : "Create an advertisement to showcase your teaching expertise"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g., Expert Math Tutor Available"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              placeholder="Describe your expertise, teaching style, and what students can expect..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subjects">Subjects</Label>
            <div className="flex gap-2">
              <Input
                id="subjects"
                value={subjectInput}
                onChange={(e) => setSubjectInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSubject();
                  }
                }}
                placeholder="Add a subject"
              />
              <Button type="button" onClick={handleAddSubject} variant="outline">
                Add
              </Button>
            </div>
            {subjects.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {subjects.map((subject) => (
                  <span
                    key={subject}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-sm"
                  >
                    {subject}
                    <button
                      type="button"
                      onClick={() => handleRemoveSubject(subject)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="hourlyRate">Hourly Rate (USD)</Label>
            <Input
              id="hourlyRate"
              type="number"
              step="0.01"
              min="0"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              required
              placeholder="50.00"
            />
          </div>

          <div className="space-y-2">
            <Label>Available Time Slots</Label>
            <Textarea
              value={JSON.stringify(availableTimeSlots, null, 2)}
              onChange={(e) => {
                try {
                  setAvailableTimeSlots(JSON.parse(e.target.value));
                } catch {
                  // Invalid JSON, ignore
                }
              }}
              rows={4}
              placeholder='{"days": ["Monday", "Wednesday", "Friday"], "times": ["10:00-12:00", "14:00-16:00"]}'
            />
            <p className="text-xs text-muted-foreground">
              Enter time slots as JSON. Example: {"{"}"days": ["Monday", "Wednesday"], "times": ["10:00-12:00"]{"}"}
            </p>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? "Update Advertisement" : "Create Advertisement"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onSuccess?.()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

