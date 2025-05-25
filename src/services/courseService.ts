
'use server';

import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { Course } from '@/types/course';
import { coursesData as initialCourses } from '@/data/courses';

const COURSES_COLLECTION = 'courses';

export async function seedCoursesIfEmpty(): Promise<void> {
  console.log('Attempting to seed courses if collection is empty...');
  const coursesCollectionRef = collection(db, COURSES_COLLECTION);
  
  try {
    const querySnapshot = await getDocs(coursesCollectionRef); // This read needs permission

    if (querySnapshot.empty) {
      console.log('Courses collection is empty. Seeding data...');
      const batch = writeBatch(db);
      initialCourses.forEach((course) => {
        const courseRef = doc(db, COURSES_COLLECTION, course.id);
        // Ensure the data being set matches the Course type, especially imageUrl
        const courseToSeed: Course = {
            ...course,
            imageUrl: course.imageUrl || `https://placehold.co/600x400.png?text=Image+Not+Found`, // Fallback
        };
        batch.set(courseRef, courseToSeed);
      });
      await batch.commit(); // This write needs permission
      console.log('Courses seeded successfully.');
    } else {
      console.log('Courses collection already contains data. No seeding needed.');
    }
  } catch (error) {
    console.error('Error during seeding process (checking or committing):', error);
    throw new Error(`Failed to seed/check course data: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function getCourses(): Promise<Course[]> {
  try {
    // Attempt to seed data if the collection is empty.
    // This call itself can throw an error if seeding fails or if reading the collection to check if it's empty fails.
    await seedCoursesIfEmpty();

    const coursesCollectionRef = collection(db, COURSES_COLLECTION);
    const querySnapshot = await getDocs(coursesCollectionRef);
    const coursesList: Course[] = [];
    querySnapshot.forEach((docSnap) => { // Renamed doc to docSnap to avoid conflict if 'doc' function is imported
      const courseData = docSnap.data();
      // Ensure the fetched data conforms to the Course type, especially imageUrl
      coursesList.push({ 
        id: docSnap.id, 
        ...courseData,
        // Provide a fallback for imageUrl if it's missing or not a string from Firestore
        imageUrl: typeof courseData.imageUrl === 'string' && courseData.imageUrl ? courseData.imageUrl : `https://placehold.co/600x400.png?text=Image+Missing`,
      } as Course);
    });

    if (coursesList.length === 0 && querySnapshot.empty) {
        console.warn("No courses found in Firestore after attempting to seed. This might indicate a seeding issue or an empty (but existing) collection.");
    }
    return coursesList.sort((a, b) => a.title.localeCompare(b.title));
  } catch (error) {
    console.error('Error in getCourses function:', error);
    // Re-throw the error so the client-side calling fetchCourse can catch it.
    throw new Error(`Failed to get courses from service: ${error instanceof Error ? error.message : String(error)}`);
  }
}
