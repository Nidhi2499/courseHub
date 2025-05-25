
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Course } from "@/types/course";

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const [currentImageSrc, setCurrentImageSrc] = useState(course.imageUrl);

  useEffect(() => {
    setCurrentImageSrc(course.imageUrl);
  }, [course.imageUrl]);

  const handleImageError = () => {
    console.warn(`Failed to load image: ${course.imageUrl}. Falling back to default placeholder for course "${course.title}".`);
    setCurrentImageSrc(`https://placehold.co/600x400.png?text=Image+Not+Available`);
  };

  return (
    <Card className="flex h-full w-full flex-col overflow-hidden transition-all hover:shadow-xl">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full group">
          <Link href={`/courses/${course.id}`} passHref>
            <Image
              src={currentImageSrc}
              alt={course.title}
              fill={true}
              className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
              data-ai-hint={course.dataAiHint}
              onError={handleImageError}
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
      {/* CardFooter with Enroll button removed */}
    </Card>
  );
}
