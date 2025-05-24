
import CourseCard, { type Course } from "@/components/CourseCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

// Dummy course data
const courses: Course[] = [
  {
    id: "1",
    title: "Introduction to Web Development",
    description: "Learn the fundamentals of HTML, CSS, and JavaScript to build modern websites.",
    category: "Web Development",
    imageUrl: "https://placehold.co/600x400.png",
    dataAiHint: "web code",
    duration: "8 Weeks",
    level: "Beginner",
  },
  {
    id: "2",
    title: "Advanced Python Programming",
    description: "Dive deep into Python concepts, data structures, and algorithms.",
    category: "Programming",
    imageUrl: "https://placehold.co/600x400.png",
    dataAiHint: "python algorithm",
    duration: "12 Weeks",
    level: "Advanced",
  },
  {
    id: "3",
    title: "Data Science with R",
    description: "Explore data analysis, visualization, and machine learning techniques using R.",
    category: "Data Science",
    imageUrl: "https://placehold.co/600x400.png",
    dataAiHint: "data analysis",
    duration: "10 Weeks",
    level: "Intermediate",
  },
  {
    id: "4",
    title: "Digital Marketing Fundamentals",
    description: "Understand SEO, SEM, social media marketing, and content strategy.",
    category: "Marketing",
    imageUrl: "https://placehold.co/600x400.png",
    dataAiHint: "marketing analytics",
    duration: "6 Weeks",
    level: "Beginner",
  },
   {
    id: "5",
    title: "UI/UX Design Principles",
    description: "Master the core principles of user interface and user experience design.",
    category: "Design",
    imageUrl: "https://placehold.co/600x400.png",
    dataAiHint: "ux wireframe",
    duration: "8 Weeks",
    level: "Intermediate",
  },
  {
    id: "6",
    title: "Cloud Computing with AWS",
    description: "Learn to deploy and manage applications on Amazon Web Services.",
    category: "Cloud Computing",
    imageUrl: "https://placehold.co/600x400.png",
    dataAiHint: "aws architecture",
    duration: "10 Weeks",
    level: "Intermediate",
  },
  {
    id: "7",
    title: "Java Programming",
    description: "Learn the fundamentals of Java programming language.",
    category: "Programming",
    imageUrl: "https://placehold.co/600x400.png",
    dataAiHint: "java code",
    duration: "10 Weeks",
    level: "Beginner",
  },
  {
    id: "8",
    title: "n8n Automation",
    description: "Learn to automate workflows with n8n.",
    category: "Automation",
    imageUrl: "https://placehold.co/600x400.png",
    dataAiHint: "n8n workflow automation",
    level: "Intermediate",
  },
];


// Server component for now, can be client if search/filter is client-side
export default function CoursesPage() {
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
      
      {/* Search bar - functionality to be implemented if needed */}
      {/* <div className="mb-8 relative">
        <Input
          type="search"
          placeholder="Search for courses..."
          className="pl-10 h-12 text-base bg-card"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      </div> */}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
