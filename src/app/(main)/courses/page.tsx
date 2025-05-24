"use client";

import { useEffect, useState } from "react";
import CourseCard from "@/components/CourseCard";
import type { Course } from "@/types/course"; // Use shared type
import { getCourses } from "@/services/courseService";
import { useSearchParams } from "next/navigation";
import { Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function CoursesPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search");

  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCourses() {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedCourses = await getCourses();
        setCourses(fetchedCourses);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
        setError("Failed to load courses. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchCourses();
  }, []);

  const filteredCourses = searchQuery
    ? courses.filter((course) =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : courses;

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center px-4 py-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center px-4 py-8">
        <Alert variant="destructive" className="w-full max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Courses</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  if (!isLoading && !error && courses.length === 0) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center px-4 py-8">
        <Alert className="w-full max-w-md">
          <AlertTitle>No Courses Available</AlertTitle>
          <AlertDescription>
            There are currently no courses available. Please check back later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary">
          Explore Our Courses
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Find the perfect course to enhance your skills and knowledge.
        </p>
      </div>
      
      {filteredCourses.length === 0 && searchQuery ? (
        <div className="text-center py-10">
          <p className="text-xl text-muted-foreground">No courses found matching &quot;{searchQuery}&quot;.</p>
          <p className="mt-2 text-sm text-muted-foreground">Try a different search term or browse all courses.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
