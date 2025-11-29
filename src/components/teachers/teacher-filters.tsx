"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { TeacherWithUser } from "@/server-actions/teachers/get-teachers";

export interface FilterState {
  search: string;
  subjects: string[];
  city: string;
  country: string;
  minPrice: string;
  maxPrice: string;
  minExperience: string;
  levels: string[];
  languages: string[];
  teachingStyle: string;
  verifiedOnly: boolean;
}

interface TeacherFiltersProps {
  teachers: TeacherWithUser[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export function TeacherFilters({
  teachers,
  filters,
  onFiltersChange,
}: TeacherFiltersProps) {
  // Extract unique values for filter options
  const allSubjects = React.useMemo(() => {
    const subjectsSet = new Set<string>();
    teachers.forEach((teacher) => {
      teacher.subjectsTaught.forEach((subject) => subjectsSet.add(subject));
    });
    return Array.from(subjectsSet).sort();
  }, [teachers]);

  const allCities = React.useMemo(() => {
    const citiesSet = new Set<string>();
    teachers.forEach((teacher) => {
      if (teacher.city) citiesSet.add(teacher.city);
    });
    return Array.from(citiesSet).sort();
  }, [teachers]);

  const allCountries = React.useMemo(() => {
    const countriesSet = new Set<string>();
    teachers.forEach((teacher) => {
      if (teacher.country) countriesSet.add(teacher.country);
    });
    return Array.from(countriesSet).sort();
  }, [teachers]);

  const allLevels = React.useMemo(() => {
    const levelsSet = new Set<string>();
    teachers.forEach((teacher) => {
      teacher.levels.forEach((level) => levelsSet.add(level));
    });
    return Array.from(levelsSet).sort();
  }, [teachers]);

  const allLanguages = React.useMemo(() => {
    const languagesSet = new Set<string>();
    teachers.forEach((teacher) => {
      teacher.languagesSpoken.forEach((lang) => languagesSet.add(lang));
    });
    return Array.from(languagesSet).sort();
  }, [teachers]);

  const allTeachingStyles = React.useMemo(() => {
    const stylesSet = new Set<string>();
    teachers.forEach((teacher) => {
      if (teacher.teachingStyle) stylesSet.add(teacher.teachingStyle);
    });
    return Array.from(stylesSet).sort();
  }, [teachers]);

  const maxPrice = React.useMemo(() => {
    return Math.max(
      ...teachers.map((t) => t.hourlyRate || 0).filter((p) => p > 0),
      100
    );
  }, [teachers]);

  const maxExperience = React.useMemo(() => {
    return Math.max(
      ...teachers.map((t) => t.yearsOfExperience || 0).filter((e) => e > 0),
      20
    );
  }, [teachers]);

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleSubject = (subject: string) => {
    const newSubjects = filters.subjects.includes(subject)
      ? filters.subjects.filter((s) => s !== subject)
      : [...filters.subjects, subject];
    updateFilter("subjects", newSubjects);
  };

  const toggleLevel = (level: string) => {
    const newLevels = filters.levels.includes(level)
      ? filters.levels.filter((l) => l !== level)
      : [...filters.levels, level];
    updateFilter("levels", newLevels);
  };

  const toggleLanguage = (language: string) => {
    const newLanguages = filters.languages.includes(language)
      ? filters.languages.filter((l) => l !== language)
      : [...filters.languages, language];
    updateFilter("languages", newLanguages);
  };

  const clearFilters = () => {
    onFiltersChange({
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
  };

  const hasActiveFilters = React.useMemo(() => {
    return (
      filters.search ||
      filters.subjects.length > 0 ||
      filters.city ||
      filters.country ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.minExperience ||
      filters.levels.length > 0 ||
      filters.languages.length > 0 ||
      filters.teachingStyle ||
      filters.verifiedOnly
    );
  }, [filters]);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by name, bio, subjects, or qualifications..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Filters</CardTitle>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Verified Only */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="verified-only"
              checked={filters.verifiedOnly}
              onCheckedChange={(checked) =>
                updateFilter("verifiedOnly", checked)
              }
            />
            <Label htmlFor="verified-only" className="text-sm font-normal">
              Verified teachers only
            </Label>
          </div>

          {/* Subjects */}
          {allSubjects.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Subjects</Label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {allSubjects.map((subject) => (
                  <Badge
                    key={subject}
                    variant={
                      filters.subjects.includes(subject) ? "default" : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => toggleSubject(subject)}
                  >
                    {subject}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Location */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Location</Label>
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={filters.city || "all"}
                onValueChange={(value) =>
                  updateFilter("city", value === "all" ? "" : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {allCities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.country || "all"}
                onValueChange={(value) =>
                  updateFilter("country", value === "all" ? "" : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {allCountries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Hourly Rate</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => updateFilter("minPrice", e.target.value)}
                min="0"
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => updateFilter("maxPrice", e.target.value)}
                min="0"
              />
            </div>
          </div>

          {/* Experience */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Min Experience</Label>
            <Select
              value={filters.minExperience || "all"}
              onValueChange={(value) =>
                updateFilter("minExperience", value === "all" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any</SelectItem>
                <SelectItem value="1">1+ years</SelectItem>
                <SelectItem value="3">3+ years</SelectItem>
                <SelectItem value="5">5+ years</SelectItem>
                <SelectItem value="10">10+ years</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Levels */}
          {allLevels.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Teaching Levels</Label>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {allLevels.map((level) => (
                  <Badge
                    key={level}
                    variant={filters.levels.includes(level) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleLevel(level)}
                  >
                    {level}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {allLanguages.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Languages</Label>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {allLanguages.map((language) => (
                  <Badge
                    key={language}
                    variant={
                      filters.languages.includes(language) ? "default" : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => toggleLanguage(language)}
                  >
                    {language}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Teaching Style */}
          {allTeachingStyles.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Teaching Style</Label>
              <Select
                value={filters.teachingStyle || "all"}
                onValueChange={(value) =>
                  updateFilter("teachingStyle", value === "all" ? "" : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any style</SelectItem>
                  {allTeachingStyles.map((style) => (
                    <SelectItem key={style} value={style}>
                      {style}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

