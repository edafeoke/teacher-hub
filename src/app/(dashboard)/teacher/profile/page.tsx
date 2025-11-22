"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Save } from "lucide-react";
import { updateTeacherProfileSchema, type UpdateTeacherProfileData } from "@/lib/validations/teacher-profile";
import { updateTeacherProfile, getTeacherProfile } from "@/server-actions/teacher/profile";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VideoUpload } from "@/components/ui/video-upload";
import { TagInput } from "@/components/ui/tag-input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const LEVELS = [
  "Primary",
  "Secondary",
  "University",
  "Professional",
  "All Levels",
];

export default function TeacherProfilePage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [profile, setProfile] = React.useState<any>(null);

  const form = useForm<UpdateTeacherProfileData>({
    resolver: zodResolver(updateTeacherProfileSchema),
    defaultValues: {
      bio: "",
      city: "",
      country: "",
      dateOfBirth: null,
      gender: null,
      hourlyRate: null,
      introVideoUrl: null,
      languagesSpoken: [],
      levels: [],
      phoneNumber: null,
      qualifications: "",
      subjectsTaught: [],
      teachingStyle: "",
      yearsOfExperience: null,
      demoClassAvailable: false,
    },
  });

  React.useEffect(() => {
    async function loadProfile() {
      try {
        const result = await getTeacherProfile();
        if (result.success && result.profile) {
          setProfile(result.profile);
          // Convert date string to Date object if it exists
          const dateOfBirth = result.profile.dateOfBirth
            ? new Date(result.profile.dateOfBirth)
            : null;

          form.reset({
            bio: result.profile.bio || "",
            city: result.profile.city || "",
            country: result.profile.country || "",
            dateOfBirth: dateOfBirth,
            gender: result.profile.gender || null,
            hourlyRate: result.profile.hourlyRate || null,
            introVideoUrl: result.profile.introVideoUrl || null,
            languagesSpoken: result.profile.languagesSpoken || [],
            levels: result.profile.levels || [],
            phoneNumber: result.profile.phoneNumber || null,
            qualifications: result.profile.qualifications || "",
            subjectsTaught: result.profile.subjectsTaught || [],
            teachingStyle: result.profile.teachingStyle || "",
            yearsOfExperience: result.profile.yearsOfExperience || null,
            demoClassAvailable: result.profile.demoClassAvailable || false,
          });
        } else {
          toast.error(result.error || "Failed to load profile");
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        toast.error("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, [form]);

  const onSubmit = async (data: UpdateTeacherProfileData) => {
    setIsSaving(true);
    try {
      const result = await updateTeacherProfile(data);
      if (result.success) {
        toast.success("Profile updated successfully!");
        setProfile(result.profile);
      } else {
        toast.error(result.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleLevel = (level: string) => {
    const currentLevels = form.getValues("levels") || [];
    const newLevels = currentLevels.includes(level)
      ? currentLevels.filter((l) => l !== level)
      : [...currentLevels, level];
    form.setValue("levels", newLevels);
  };

  if (isLoading) {
    return (
      <div className="px-4 lg:px-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Teacher Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your profile information and intro video
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information Section */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Your basic personal details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input
                  id="name"
                  value={profile?.user?.name || ""}
                  disabled
                  className="bg-muted"
                  readOnly
                />
                <p className="text-muted-foreground text-xs mt-1">
                  This is your account name and cannot be changed here
                </p>
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  value={profile?.user?.email || ""}
                  disabled
                  className="bg-muted"
                  readOnly
                />
                <p className="text-muted-foreground text-xs mt-1">
                  This is your account email and cannot be changed here
                </p>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="gender"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="gender">Gender</FieldLabel>
                      <Select
                        value={field.value || ""}
                        onValueChange={(value) => field.onChange(value || null)}
                      >
                        <SelectTrigger id="gender">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="dateOfBirth"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="dateOfBirth">Date of Birth</FieldLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="dateOfBirth"
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            captionLayout="dropdown"
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <Controller
                name="bio"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="bio">Bio / About Me</FieldLabel>
                    <Textarea
                      {...field}
                      id="bio"
                      placeholder="Tell us about yourself..."
                      rows={4}
                      value={field.value || ""}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="city"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="city">City</FieldLabel>
                      <Input
                        {...field}
                        id="city"
                        placeholder="New York"
                        value={field.value || ""}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="country"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="country">Country</FieldLabel>
                      <Input
                        {...field}
                        id="country"
                        placeholder="United States"
                        value={field.value || ""}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

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
                      value={field.value || ""}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Professional Details Section */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Details</CardTitle>
            <CardDescription>
              Your teaching experience and expertise
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Controller
                name="subjectsTaught"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="subjectsTaught">
                      Subjects / Skills Taught
                    </FieldLabel>
                    <TagInput
                      tags={field.value || []}
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
                <FieldLabel>Levels</FieldLabel>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {LEVELS.map((level) => (
                    <div key={level} className="flex items-center space-x-2">
                      <Checkbox
                        id={`level-${level}`}
                        checked={(form.watch("levels") || []).includes(level)}
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
                          e.target.value ? parseInt(e.target.value, 10) : null
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
                      value={field.value || ""}
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
                      value={field.value || ""}
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
                            e.target.value ? parseFloat(e.target.value) : null
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
                      checked={field.value || false}
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

              <Controller
                name="languagesSpoken"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="languagesSpoken">
                      Languages Spoken
                    </FieldLabel>
                    <TagInput
                      tags={field.value || []}
                      onTagsChange={field.onChange}
                      placeholder="e.g., English, Spanish, French..."
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Intro Video Section */}
        <Card>
          <CardHeader>
            <CardTitle>Intro Video</CardTitle>
            <CardDescription>
              Record or upload a short introduction video
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Controller
              name="introVideoUrl"
              control={form.control}
              render={({ field }) => (
                <VideoUpload
                  value={field.value || undefined}
                  onChange={(url) => field.onChange(url === "" ? null : url || null)}
                />
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="submit"
            disabled={isSaving}
            className="min-w-[120px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
