"use client"

import * as React from "react"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Rocket, LayoutDashboard } from 'lucide-react'
import { authClient } from "@/lib/auth-client"

export default function CallToAction() {
    const [userProfiles, setUserProfiles] = React.useState<{
        teacherProfile: any;
        studentProfile: any;
    } | null>(null);
    const session = authClient.useSession();

    // Fetch user profiles when session is available
    React.useEffect(() => {
        if (session.data?.user && !session.isPending) {
            fetch("/api/user/profile")
                .then((res) => res.json())
                .then((data) => {
                    if (data.user) {
                        setUserProfiles({
                            teacherProfile: data.user.teacherProfile,
                            studentProfile: data.user.studentProfile,
                        });
                    }
                })
                .catch((error) => {
                    console.error("Error fetching user profiles:", error);
                });
        }
    }, [session.data?.user, session.isPending]);

    // Determine user role and routes
    const isTeacher = userProfiles?.teacherProfile !== null;
    const isStudent = userProfiles?.studentProfile !== null;
    const isLoggedIn = !!session.data?.user;
    const hasBothProfiles = isTeacher && isStudent;

    // Determine primary dashboard route
    const dashboardRoute = isTeacher
        ? "/teacher"
        : isStudent
        ? "/student"
        : "/onboarding";

    return (
        <section className="bg-zinc-50 py-16 md:py-32 dark:bg-transparent">
            <div className="mx-auto max-w-5xl px-6">
                <div className="text-center">
                    <Badge variant="outline" className="mb-4">
                        Ready to Start?
                    </Badge>
                    <h2 className="text-balance text-3xl font-semibold md:text-4xl lg:text-5xl">
                        Join the TeacherHub Community Today
                    </h2>
                    <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
                        Connect with passionate educators and eager learners. Start your educational journey and make a difference.
                    </p>

                    <div className="mt-12 flex flex-wrap justify-center gap-4">
                        {!isLoggedIn ? (
                            <>
                                <Button
                                    asChild
                                    size="lg">
                                    <Link href="/register">
                                        <Rocket className="size-4" />
                                        <span>Get Started Free</span>
                                    </Link>
                                </Button>

                                <Button
                                    asChild
                                    size="lg"
                                    variant="outline">
                                    <Link href="/login">
                                        <span>Sign In</span>
                                    </Link>
                                </Button>
                            </>
                        ) : hasBothProfiles ? (
                            <>
                                <Button
                                    asChild
                                    size="lg">
                                    <Link href="/teacher">
                                        <LayoutDashboard className="size-4" />
                                        <span>Go to Teacher Dashboard</span>
                                    </Link>
                                </Button>

                                <Button
                                    asChild
                                    size="lg"
                                    variant="outline">
                                    <Link href="/student">
                                        <LayoutDashboard className="size-4" />
                                        <span>Go to Student Dashboard</span>
                                    </Link>
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    asChild
                                    size="lg">
                                    <Link href={dashboardRoute}>
                                        <LayoutDashboard className="size-4" />
                                        <span>
                                            {isTeacher ? "Go to Teacher Dashboard" : isStudent ? "Go to Student Dashboard" : "Create Account"}
                                        </span>
                                    </Link>
                                </Button>
                                {!isTeacher && !isStudent && (
                                    <Button
                                        asChild
                                        size="lg"
                                        variant="outline">
                                        <Link href="/onboarding">
                                            <span>Create Account</span>
                                        </Link>
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}
