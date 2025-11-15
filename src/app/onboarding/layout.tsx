import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react'


const OnboardingLayout = async ({ children }: { children: React.ReactNode }) => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) {
        redirect("/login");
    }
    
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            teacherProfile: true,
            studentProfile: true,
        },
    });
    
    if (user?.teacherProfile) {
        redirect("/teacher/dashboard");
    }
    if (user?.studentProfile) {
        redirect("/student/dashboard");
    }
  return (
    <div>
        {children}
    </div>
  )
}

export default OnboardingLayout