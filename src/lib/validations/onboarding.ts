import * as z from "zod";

// Step 1: Role Selection
export const roleSelectionSchema = z.object({
  role: z.enum(["teacher", "student"]),
});

export type RoleSelectionData = z.infer<typeof roleSelectionSchema>;

// Step 2: Basic Information (shared for both roles)
export const basicInfoSchema = z.object({
  gender: z.string().optional(),
  dateOfBirth: z.date().optional(),
  bio: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

export type BasicInfoData = z.infer<typeof basicInfoSchema>;

// Step 3: Professional Details (Teacher)
export const teacherProfessionalDetailsSchema = z.object({
  subjectsTaught: z.array(z.string()).min(1, "Please add at least one subject."),
  levels: z.array(z.string()).min(1, "Please select at least one level."),
  yearsOfExperience: z.number().int().min(0).max(100).optional(),
  qualifications: z.string().optional(),
  teachingStyle: z.string().optional(),
  hourlyRate: z.number().min(0).optional(),
  demoClassAvailable: z.boolean().optional(),
});

export type TeacherProfessionalDetailsData = z.infer<typeof teacherProfessionalDetailsSchema>;

// Step 3: Learning Details (Student)
export const studentLearningDetailsSchema = z.object({
  subjectsOfInterest: z.array(z.string()).min(1, "Please add at least one subject of interest."),
  learningLevel: z.string().optional(),
  learningGoals: z.string().optional(),
  preferredMode: z.enum(["online", "in-person", "hybrid"]).optional(),
  budgetRange: z.string().optional(),
});

export type StudentLearningDetailsData = z.infer<typeof studentLearningDetailsSchema>;

// Step 4: Availability & Preferences
export const availabilitySlotSchema = z.object({
  day: z.string(),
  timeSlots: z.array(
    z.object({
      start: z.string(),
      end: z.string(),
    })
  ),
});

export type AvailabilitySlot = z.infer<typeof availabilitySlotSchema>;

export const availabilitySchema = z.object({
  availability: z.array(availabilitySlotSchema).optional(),
  languagesSpoken: z.array(z.string()),
  phoneNumber: z.string().optional(),
});

export type AvailabilityData = z.infer<typeof availabilitySchema>;

// Combined schemas for each step
export const teacherOnboardingSchema = z.object({
  role: z.literal("teacher"),
  basicInfo: basicInfoSchema,
  professionalDetails: teacherProfessionalDetailsSchema,
  availability: availabilitySchema,
});

export const studentOnboardingSchema = z.object({
  role: z.literal("student"),
  basicInfo: basicInfoSchema,
  learningDetails: studentLearningDetailsSchema,
  availability: availabilitySchema,
});

export type TeacherOnboardingData = z.infer<typeof teacherOnboardingSchema>;
export type StudentOnboardingData = z.infer<typeof studentOnboardingSchema>;

