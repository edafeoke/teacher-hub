"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { Menu, X, LayoutDashboard, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { authClient } from "@/lib/auth-client";
import { Spinner } from "./ui/spinner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const menuItems = [
  { name: "Teachers", href: "/teachers" },
  { name: "How It Works", href: "/#how-it-works" },
  { name: "About", href: "/#about" },
];

export function Navbar() {
  const [menuState, setMenuState] = React.useState(false);
  const [userProfiles, setUserProfiles] = React.useState<{
    teacherProfile: any;
    studentProfile: any;
  } | null>(null);
  const session = authClient.useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
      // Still redirect even if there's an error
      router.push("/login");
      router.refresh();
    }
  };

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
  
  // Teacher routes: if profile exists, go to dashboard; otherwise, go to onboarding
  const teacherRoute = isTeacher ? "/teacher" : "/onboarding?role=teacher";
  const teacherLabel = isTeacher ? "Teacher Dashboard" : "Create Teacher Account";
  
  // Student routes: if profile exists, go to dashboard; otherwise, go to onboarding
  const studentRoute = isStudent ? "/student" : "/onboarding?role=student";
  const studentLabel = isStudent ? "Student Dashboard" : "Create Student Account";
  
  const profileRoute = isTeacher
    ? "/teacher/profile"
    : isStudent
    ? "/student/profile"
    : "/onboarding";

  return (
    <header>
      <nav
        data-state={menuState && "active"}
        className="fixed top-0 z-50 w-full border-b border-dashed bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:bg-zinc-950/95 dark:supports-[backdrop-filter]:bg-zinc-950/80"
      >
        <div className="m-auto max-w-5xl px-6">
          <div className="flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full justify-between lg:w-auto">
              <Link
                href="/"
                aria-label="home"
                className="flex items-center space-x-2"
              >
                <Logo />
              </Link>

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState == true ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
              </button>
            </div>

            <div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
              <div className="lg:pr-4">
                <ul className="space-y-6 text-base lg:flex lg:gap-8 lg:space-y-0 lg:text-sm">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.href}
                        className="text-muted-foreground hover:text-accent-foreground block duration-150"
                      >
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {!session.data?.user && !session.isPending ? (
                <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit lg:border-l lg:pl-6 lg:items-center">
                  <AnimatedThemeToggler className="rounded-md border border-border bg-background p-2 hover:bg-accent hover:text-accent-foreground transition-colors" />
                  <Button asChild variant="outline" size="sm">
                    <Link href="/login">
                      <span>Login</span>
                    </Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/register">
                      <span>Sign Up</span>
                    </Link>
                  </Button>
                </div>
              ) : (
                <>
                  {/* Mobile/Tablet Auth Links - shown below lg breakpoint */}
                  <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 lg:hidden">
                    <AnimatedThemeToggler className="rounded-md border border-border bg-background p-2 hover:bg-accent hover:text-accent-foreground transition-colors" />
                    {session.isPending ? (
                      <Spinner />
                    ) : (
                      <>
                        <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                          <Link href={teacherRoute}>
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>{teacherLabel}</span>
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                          <Link href={studentRoute}>
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>{studentLabel}</span>
                          </Link>
                        </Button>
                        {(isTeacher || isStudent) && (
                          <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                            <Link href={profileRoute}>
                              <User className="mr-2 h-4 w-4" />
                              <span>Profile</span>
                            </Link>
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleSignOut}
                          className="w-full sm:w-auto"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Logout</span>
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Desktop Avatar Dropdown - shown on lg breakpoint and above */}
                  <div className="hidden lg:flex lg:border-l lg:pl-6 lg:items-center">
                    <AnimatedThemeToggler className="rounded-md border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors" />
                    {session.isPending ? (
                      <Spinner />
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full">
                            <Avatar className="h-9 w-9 cursor-pointer border-2 border-border hover:border-primary transition-colors">
                              {session.data?.user?.image && (
                                <AvatarImage
                                  src={session.data.user.image}
                                  alt={session.data?.user?.name || "User"}
                                />
                              )}
                              <AvatarFallback>
                                {session.data?.user?.name
                                  ? session.data.user.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .toUpperCase()
                                      .slice(0, 2)
                                  : "U"}
                              </AvatarFallback>
                            </Avatar>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>
                            <div className="flex flex-col space-y-1">
                              <p className="text-sm font-medium leading-none">
                                {session.data?.user?.name || "User"}
                              </p>
                              {session.data?.user?.email && (
                                <p className="text-xs leading-none text-muted-foreground">
                                  {session.data.user.email}
                                </p>
                              )}
                            </div>
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={teacherRoute} className="cursor-pointer">
                              <LayoutDashboard className="mr-2 h-4 w-4" />
                              <span>{teacherLabel}</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={studentRoute} className="cursor-pointer">
                              <LayoutDashboard className="mr-2 h-4 w-4" />
                              <span>{studentLabel}</span>
                            </Link>
                          </DropdownMenuItem>
                          {(isTeacher || isStudent) && (
                            <DropdownMenuItem asChild>
                              <Link href={profileRoute} className="cursor-pointer">
                                <User className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                              </Link>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={handleSignOut}
                            variant="destructive"
                            className="cursor-pointer"
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Sign out</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

