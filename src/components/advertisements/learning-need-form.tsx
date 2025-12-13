"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createLearningNeedAd, updateLearningNeedAd, type LearningNeedAdData, type LearningNeedAdvertisementWithStudent } from "@/server-actions/advertisements/learning-needs";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface LearningNeedFormProps {
  initialData?: LearningNeedAdvertisementWithStudent;
  onSuccess?: () => void;
}

export function LearningNeedForm({ initialData, onSuccess }: LearningNeedFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [title, setTitle] = React.useState(initialData?.title || "");
  const [description, setDescription] = React.useState(initialData?.description || "");
  const [subjects, setSubjects] = React.useState<string[]>(initialData?.subjects || []);
  const [subjectInput, setSubjectInput] = React.useState("");
  const [budgetRange, setBudgetRange] = React.useState(initialData?.budgetRange || "");
  const [preferredSchedule, setPreferredSchedule] = React.useState<any>(
    initialData?.preferredSchedule || { days: [], times: [] }
  );
  const [learningGoals, setLearningGoals] = React.useState(initialData?.learningGoals || "");

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
      const data: LearningNeedAdData = {
        title,
        description,
        subjects,
        budgetRange,
        preferredSchedule,
        learningGoals: learningGoals || undefined,
      };

      let result;
      if (initialData) {
        result = await updateLearningNeedAd(initialData.id, data);
      } else {
        result = await createLearningNeedAd(data);
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
        <CardTitle>{initialData ? "Edit Learning Need Advertisement" : "Create Learning Need Advertisement"}</CardTitle>
        <CardDescription>
          {initialData
            ? "Update your learning need advertisement"
            : "Create an advertisement to find the perfect teacher for your learning needs"}
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
              placeholder="e.g., Looking for Math Tutor"
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
              placeholder="Describe what you're looking for in a teacher..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subjects">Subjects Needed</Label>
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
            <Label htmlFor="budgetRange">Budget Range</Label>
            <Input
              id="budgetRange"
              value={budgetRange}
              onChange={(e) => setBudgetRange(e.target.value)}
              required
              placeholder="e.g., $30-50/hour"
            />
          </div>

          <div className="space-y-2">
            <Label>Preferred Schedule</Label>
            <Textarea
              value={JSON.stringify(preferredSchedule, null, 2)}
              onChange={(e) => {
                try {
                  setPreferredSchedule(JSON.parse(e.target.value));
                } catch {
                  // Invalid JSON, ignore
                }
              }}
              rows={4}
              placeholder='{"days": ["Monday", "Wednesday"], "times": ["10:00-12:00"]}'
            />
            <p className="text-xs text-muted-foreground">
              Enter preferred schedule as JSON. Example: {"{"}"days": ["Monday", "Wednesday"], "times": ["10:00-12:00"]{"}"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="learningGoals">Learning Goals (Optional)</Label>
            <Textarea
              id="learningGoals"
              value={learningGoals}
              onChange={(e) => setLearningGoals(e.target.value)}
              rows={3}
              placeholder="What are your learning goals?"
            />
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

