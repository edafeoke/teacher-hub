"use client";

import * as React from "react";
import { TeacherCard } from "./teacher-card";
import { TeacherFilters, type FilterState } from "./teacher-filters";
import type { TeacherWithUser } from "@/server-actions/teachers/get-teachers";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Users, ChevronLeft, ChevronRight } from "lucide-react";

interface TeachersClientProps {
  initialTeachers: TeacherWithUser[];
  currentUserId: string | null;
}

type SortOption = "name" | "price-low" | "price-high" | "experience" | "rating";

export function TeachersClient({ initialTeachers, currentUserId }: TeachersClientProps) {
  const [teachers] = React.useState<TeacherWithUser[]>(initialTeachers);
  const [filters, setFilters] = React.useState<FilterState>({
    search: "",
    subjects: [],
    city: "",
    country: "",
    minPrice: "",
    maxPrice: "",
    minExperience: "",
    levels: [],
    languages: [],
    teachingStyle: "",
    verifiedOnly: false,
  });
  const [sortBy, setSortBy] = React.useState<SortOption>("name");
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 12;

  // Filter teachers
  const filteredTeachers = React.useMemo(() => {
    let filtered = [...teachers];

    // Search filter
    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter((teacher) => {
        const nameMatch = teacher.user.name.toLowerCase().includes(query);
        const bioMatch = teacher.bio?.toLowerCase().includes(query) || false;
        const subjectsMatch = teacher.subjectsTaught.some((subject) =>
          subject.toLowerCase().includes(query)
        );
        const qualificationsMatch = teacher.qualifications?.toLowerCase().includes(query) || false;
        return nameMatch || bioMatch || subjectsMatch || qualificationsMatch;
      });
    }

    // Subject filter
    if (filters.subjects.length > 0) {
      filtered = filtered.filter((teacher) =>
        filters.subjects.some((subject) =>
          teacher.subjectsTaught.includes(subject)
        )
      );
    }

    // Location filters
    if (filters.city) {
      filtered = filtered.filter((teacher) => teacher.city === filters.city);
    }
    if (filters.country) {
      filtered = filtered.filter((teacher) => teacher.country === filters.country);
    }

    // Price filters
    if (filters.minPrice) {
      const min = parseFloat(filters.minPrice);
      filtered = filtered.filter(
        (teacher) => teacher.hourlyRate && teacher.hourlyRate >= min
      );
    }
    if (filters.maxPrice) {
      const max = parseFloat(filters.maxPrice);
      filtered = filtered.filter(
        (teacher) => teacher.hourlyRate && teacher.hourlyRate <= max
      );
    }

    // Experience filter
    if (filters.minExperience) {
      const minExp = parseInt(filters.minExperience);
      filtered = filtered.filter(
        (teacher) =>
          teacher.yearsOfExperience && teacher.yearsOfExperience >= minExp
      );
    }

    // Levels filter
    if (filters.levels.length > 0) {
      filtered = filtered.filter((teacher) =>
        filters.levels.some((level) => teacher.levels.includes(level))
      );
    }

    // Languages filter
    if (filters.languages.length > 0) {
      filtered = filtered.filter((teacher) =>
        filters.languages.some((lang) =>
          teacher.languagesSpoken.includes(lang)
        )
      );
    }

    // Teaching style filter
    if (filters.teachingStyle) {
      filtered = filtered.filter(
        (teacher) => teacher.teachingStyle === filters.teachingStyle
      );
    }

    // Verified only filter
    if (filters.verifiedOnly) {
      filtered = filtered.filter(
        (teacher) => teacher.verificationStatus === "verified"
      );
    }

    return filtered;
  }, [teachers, filters]);

  // Sort teachers
  const sortedTeachers = React.useMemo(() => {
    const sorted = [...filteredTeachers];

    switch (sortBy) {
      case "name":
        sorted.sort((a, b) => a.user.name.localeCompare(b.user.name));
        break;
      case "price-low":
        sorted.sort((a, b) => {
          const rateA = a.hourlyRate || 0;
          const rateB = b.hourlyRate || 0;
          return rateA - rateB;
        });
        break;
      case "price-high":
        sorted.sort((a, b) => {
          const rateA = a.hourlyRate || 0;
          const rateB = b.hourlyRate || 0;
          return rateB - rateA;
        });
        break;
      case "experience":
        sorted.sort((a, b) => {
          const expA = a.yearsOfExperience || 0;
          const expB = b.yearsOfExperience || 0;
          return expB - expA;
        });
        break;
      case "rating":
        // Mock rating sort (since we don't have real ratings yet)
        sorted.sort((a, b) => {
          const ratingA = 4.0 + (a.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 10) / 10;
          const ratingB = 4.0 + (b.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 10) / 10;
          return ratingB - ratingA;
        });
        break;
    }

    return sorted;
  }, [filteredTeachers, sortBy]);

  // Pagination
  const totalPages = Math.ceil(sortedTeachers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTeachers = sortedTeachers.slice(startIndex, endIndex);

  React.useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [filters, sortBy]);

  return (
    <div className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Find Teachers</h1>
          <p className="text-muted-foreground">
            Discover qualified teachers and find the perfect match for your learning needs
          </p>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <TeacherFilters
            teachers={teachers}
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>

        {/* Teachers List */}
        <div className="lg:col-span-3 space-y-4">
          {/* Sort and Results Count */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="text-sm text-muted-foreground">
              Showing {paginatedTeachers.length} of {sortedTeachers.length} teacher
              {sortedTeachers.length !== 1 ? "s" : ""}
              {filteredTeachers.length !== teachers.length && (
                <span> (filtered from {teachers.length} total)</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="price-low">Price (Low to High)</SelectItem>
                  <SelectItem value="price-high">Price (High to Low)</SelectItem>
                  <SelectItem value="experience">Experience</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Teachers Grid */}
          {paginatedTeachers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {filteredTeachers.length === 0
                    ? "No teachers found matching your filters."
                    : "No teachers on this page."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {paginatedTeachers.map((teacher) => (
                  <TeacherCard key={teacher.id} teacher={teacher} currentUserId={currentUserId} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

