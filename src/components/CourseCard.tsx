
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from "next/link";
import { useEnrolledCourses } from '@/contexts/EnrolledCoursesContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import type { Course } from "@/types/course"; // Use shared type

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const { enrolledCourses, enrollCourse } = useEnrolledCourses();
  const [currentImageSrc, setCurrentImageSrc] = useState(course.imageUrl);

  useEffect(() => {
    // Update currentImageSrc if the course prop changes,
    // effectively resetting any fallback that might have been triggered.
    setCurrentImageSrc(course.imageUrl);
  }, [course.imageUrl]);

  const handleEnroll = () => {
    enrollCourse(course.id);
  };

  const handleImageError = () => {
    console.warn(`Failed to load image: ${course.imageUrl}. Falling back to default placeholder for course "${course.title}".`);
    setCurrentImageSrc(`https://placehold.co/600x400.png?text=Image+Not+Available`);
  };

  return (
    <Card className="flex h-full w-full flex-col overflow-hidden transition-all hover:shadow-xl">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full group"> {/* Added group for potential hover effects on image if needed */}
          <Link href={`/courses/${course.id}`} passHref>
            <Image
              src={currentImageSrc}
              alt={course.title}
              fill={true}
              className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
              data-ai-hint={course.dataAiHint}
              onError={handleImageError}
              // Add unoptimized prop if the fallback image URL itself could cause issues with optimizer
              unoptimized={currentImageSrc.startsWith('https://placehold.co') && currentImageSrc.includes('?text=')}
            />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4 pt-4">
        <div className="mb-2 flex items-center justify-between">
          <Badge variant="secondary">{course.category}</Badge>
          <Badge variant="outline">{course.level}</Badge>
        </div>
        <CardTitle className="mb-1 text-xl">{course.title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground line-clamp-3">
          {course.description}
        </CardDescription>
        <div className="mt-3 text-xs text-muted-foreground">
          Duration: {course.duration}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <Button 
          onClick={handleEnroll} 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" 
          disabled={enrolledCourses.includes(course.id)} 
          suppressHydrationWarning
        >
          {enrolledCourses.includes(course.id) ? 'Enrolled!' : 'Enroll Now'}
          {!enrolledCourses.includes(course.id) && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </CardFooter>
    </Card>
  );
}
