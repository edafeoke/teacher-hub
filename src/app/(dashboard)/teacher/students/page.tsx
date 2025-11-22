"use client";

import * as React from "react";
import { Search, Loader2, User, MapPin, BookOpen, GraduationCap } from "lucide-react";
import { getAllStudents } from "@/server-actions/teacher/students";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "sonner";

interface Student {
  id: string;
  userId: string;
  learningLevel: string | null;
  subjectsOfInterest: string[];
  city: string | null;
  country: string | null;
  learningGoals: string | null;
  preferredMode: string | null;
  languagesSpoken: string[];
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    createdAt: Date;
  };
}

export default function TeacherStudentsPage() {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = React.useState<Student[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    async function loadStudents() {
      try {
        const result = await getAllStudents();
        if (result.success && result.students) {
          setStudents(result.students as Student[]);
          setFilteredStudents(result.students as Student[]);
        } else {
          toast.error(result.error || "Failed to load students");
        }
      } catch (error) {
        console.error("Error loading students:", error);
        toast.error("Failed to load students");
      } finally {
        setIsLoading(false);
      }
    }
    loadStudents();
  }, []);

  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredStudents(students);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = students.filter((student) => {
      const nameMatch = student.user.name.toLowerCase().includes(query);
      const emailMatch = student.user.email.toLowerCase().includes(query);
      const subjectsMatch = student.subjectsOfInterest.some((subject) =>
        subject.toLowerCase().includes(query)
      );
      const cityMatch = student.city?.toLowerCase().includes(query);
      const countryMatch = student.country?.toLowerCase().includes(query);
      const levelMatch = student.learningLevel?.toLowerCase().includes(query);

      return (
        nameMatch ||
        emailMatch ||
        subjectsMatch ||
        cityMatch ||
        countryMatch ||
        levelMatch
      );
    });
    setFilteredStudents(filtered);
  }, [searchQuery, students]);

  if (isLoading) {
    return (
      <div className="px-4 lg:px-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Students</h1>
        <p className="text-muted-foreground mt-2">
          View and manage all students in the platform
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by name, email, subjects, location, or level..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Students List */}
      {filteredStudents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchQuery
                ? "No students found matching your search."
                : "No students found."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => {
            const initials = student.user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <Card key={student.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={student.user.image || undefined}
                        alt={student.user.name}
                      />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <h3 className="font-semibold truncate">
                          {student.user.name}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {student.user.email}
                        </p>
                      </div>

                      {student.city || student.country ? (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">
                            {[student.city, student.country]
                              .filter(Boolean)
                              .join(", ")}
                          </span>
                        </div>
                      ) : null}

                      {student.learningLevel && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <GraduationCap className="h-3 w-3" />
                          <span>{student.learningLevel}</span>
                        </div>
                      )}

                      {student.subjectsOfInterest.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {student.subjectsOfInterest.slice(0, 3).map((subject) => (
                            <Badge
                              key={subject}
                              variant="secondary"
                              className="text-xs"
                            >
                              {subject}
                            </Badge>
                          ))}
                          {student.subjectsOfInterest.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{student.subjectsOfInterest.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}

                      {student.preferredMode && (
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs">
                            {student.preferredMode}
                          </Badge>
                        </div>
                      )}

                      {student.languagesSpoken.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground">
                            Languages: {student.languagesSpoken.join(", ")}
                          </p>
                        </div>
                      )}

                      {student.learningGoals && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {student.learningGoals}
                          </p>
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground mt-2">
                        Joined {format(new Date(student.user.createdAt), "MMM yyyy")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Results Count */}
      {filteredStudents.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          Showing {filteredStudents.length} of {students.length} student
          {students.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
