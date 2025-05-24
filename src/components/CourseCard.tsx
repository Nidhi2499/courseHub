import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  dataAiHint: string;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
}

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const handleEnroll = () => {
    // Placeholder for enroll functionality
    alert(`Enrolling in ${course.title}`);
  };

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-all hover:shadow-xl">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <Image
            src={course.imageUrl}
            alt={course.title}
            layout="fill"
            objectFit="cover"
            data-ai-hint={course.dataAiHint}
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
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button onClick={handleEnroll} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          Enroll Now <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
