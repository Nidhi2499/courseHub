
'use client';

import { useEffect, useState } from 'react';
import { useEnrolledCourses } from '@/contexts/EnrolledCoursesContext';
import CourseCard from '@/components/CourseCard';
import type { Course } from '@/types/course';
import { getCourses } from '@/services/courseService';
import { Loader2, AlertTriangle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const MyCoursesPage = () => {
  const { enrolledCourses, isLoadingEnrollments } = useEnrolledCourses();
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [isLoadingAllCourses, setIsLoadingAllCourses] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCoursesData() {
      try {
        setIsLoadingAllCourses(true);
        setError(null);
        const fetchedCourses = await getCourses();
        setAllCourses(fetchedCourses);
      } catch (err) {
        console.error("Failed to fetch courses for My Courses:", err);
        setError("Failed to load course catalog. Please try again later.");
      } finally {
        setIsLoadingAllCourses(false);
      }
    }
    fetchCoursesData();
  }, []);

  const enrolledCourseDetails = allCourses.filter(course =>
    enrolledCourses.includes(course.id)
  );

  if (isLoadingEnrollments || isLoadingAllCourses) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center px-4 py-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading your enrolled courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center px-4 py-8">
        <Alert variant="destructive" className="w-full max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Your Courses</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary">My Enrolled Courses</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Continue your learning journey with the courses you've enrolled in.
        </p>
      </div>
      
      {enrolledCourses.length === 0 ? (
         <div className="flex flex-col items-center justify-center py-10 text-center">
          <Info className="h-12 w-12 text-primary mb-4" />
          <p className="text-xl font-semibold text-foreground">You haven&apos;t enrolled in any courses yet.</p>
          <p className="mt-2 text-muted-foreground">
            Explore our course catalog and find something that sparks your interest!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {enrolledCourseDetails.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
};
export default MyCoursesPage;
