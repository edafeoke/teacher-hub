import * as z from "zod";

export const updateTeacherProfileSchema = z.object({
  bio: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  dateOfBirth: z.date().optional().nullable(),
  gender: z.string().optional().nullable(),
  hourlyRate: z.number().min(0).optional().nullable(),
  introVideoUrl: z.union([z.string().url(), z.literal("")]).optional().nullable(),
  languagesSpoken: z.array(z.string()).optional(),
  levels: z.array(z.string()).optional(),
  phoneNumber: z.string().optional().nullable(),
  qualifications: z.string().optional().nullable(),
  subjectsTaught: z.array(z.string()).optional(),
  teachingStyle: z.string().optional().nullable(),
  yearsOfExperience: z.number().int().min(0).max(100).optional().nullable(),
  demoClassAvailable: z.boolean().optional(),
});

export type UpdateTeacherProfileData = z.infer<typeof updateTeacherProfileSchema>;

