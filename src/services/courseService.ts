'use server';

import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { Course } from '@/types/course';
import { coursesData as initialCourses } from '@/data/courses'; 

const COURSES_COLLECTION = 'courses';

export async function seedCoursesIfEmpty(): Promise<void> {
  try {
    console.log('Attempting to seed courses if collection is empty...');
    const coursesCollectionRef = collection(db, COURSES_COLLECTION);
    const querySnapshot = await getDocs(coursesCollectionRef);
    if (querySnapshot.empty) {
      console.log('Courses collection is empty. Seeding data...');
      const batch = writeBatch(db);
      initialCourses.forEach((course) => {
        const courseRef = doc(db, COURSES_COLLECTION, course.id);
        batch.set(courseRef, course);
      });
      await batch.commit();
      console.log('Courses seeded successfully.');
    } else {
      console.log('Courses collection already contains data. No seeding needed.');
    }
  } catch (error) {
    console.error('Error seeding courses:', error);
    // Optionally re-throw or handle as needed
  }
}

export async function getCourses(): Promise<Course[]> {
  // Attempt to seed data if the collection is empty.
  await seedCoursesIfEmpty();

  const coursesCollectionRef = collection(db, COURSES_COLLECTION);
  const querySnapshot = await getDocs(coursesCollectionRef);
  const coursesList: Course[] = [];
  querySnapshot.forEach((doc) => {
    const courseData = doc.data();
    // The imageUrl from Firestore (seeded from data/courses.ts) should already be in the correct format (e.g., "/assets/image.jpeg")
    // No further manipulation of imageUrl is needed here.
    coursesList.push({ id: doc.id, ...courseData } as Course);
  });
  return coursesList.sort((a, b) => a.title.localeCompare(b.title));
}
