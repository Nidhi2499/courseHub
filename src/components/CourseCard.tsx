
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Course } from "@/types/course"; // Use shared type

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const [currentImageSrc, setCurrentImageSrc] = useState(course.imageUrl || `https://placehold.co/600x400.png?text=Image+Unavailable`);

  useEffect(() => {
    // Ensure fallback if course.imageUrl is falsy
    setCurrentImageSrc(course.imageUrl || `https://placehold.co/600x400.png?text=Image+Unavailable`);
  }, [course.imageUrl]);

  const handleImageError = () => {
    console.warn(`Failed to load image: ${course.imageUrl}. Falling back to default placeholder for course "${course.title}".`);
    setCurrentImageSrc(`https://placehold.co/600x400.png?text=Image+Not+Available`);
  };

  return (
    <Link href={`/courses/${course.id}`} passHref legacyBehavior>
      <a className="group block h-full w-full transition-all hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg group-hover:scale-105">
        <Card className="flex h-full w-full flex-col overflow-hidden">
          <CardHeader className="p-0">
            <div className="relative h-48 w-full">
              <Image
                src={currentImageSrc}
                alt={course.title || "Course Image"}
                fill={true}
                className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                data-ai-hint={course.dataAiHint || "course"}
                onError={handleImageError}
                unoptimized={currentImageSrc.startsWith('https://placehold.co') && currentImageSrc.includes('?text=')}
              />
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
            {course.videoLectures && course.videoLectures.length > 0 && (
              <div className="mt-2 text-xs text-muted-foreground">
                <span className="font-medium">First Lecture:</span> {course.videoLectures[0].title}
              </div>
            )}
          </CardContent>
        </Card>
      </a>
    </Link>
  );
}
