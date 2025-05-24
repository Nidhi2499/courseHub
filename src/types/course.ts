export interface Course {
  id: string; // Firestore document ID will be this id
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  dataAiHint: string;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
}
