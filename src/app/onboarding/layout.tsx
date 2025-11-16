import { getSessionWithProfiles } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import React from 'react'


const OnboardingLayout = async ({ children }: { children: React.ReactNode }) => {
    const session = await getSessionWithProfiles();
    if (!session?.user) {
        redirect("/login");
    }
    
    if (session.user.teacherProfile && session.user.studentProfile) {
        redirect("/");
    }
  return (
    <>
        {children}
    </>
  )
}

export default OnboardingLayout