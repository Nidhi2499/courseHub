
'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/config/firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface EnrolledCoursesContextType {
  enrolledCourses: string[];
  enrollCourse: (courseId: string) => Promise<void>;
  unenrollCourse: (courseId: string) => Promise<void>;
  isLoadingEnrollments: boolean;
}

const EnrolledCoursesContext = createContext<EnrolledCoursesContextType | undefined>(undefined);

export const EnrolledCoursesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const [isLoadingEnrollments, setIsLoadingEnrollments] = useState(true);

  useEffect(() => {
    const fetchUserEnrollments = async () => {
      if (user) {
        setIsLoadingEnrollments(true);
        const userEnrollmentRef = doc(db, 'userEnrollments', user.uid);
        try {
          const docSnap = await getDoc(userEnrollmentRef);
          if (docSnap.exists() && docSnap.data().enrolledCourseIds) {
            setEnrolledCourses(docSnap.data().enrolledCourseIds);
          } else {
            setEnrolledCourses([]);
          }
        } catch (error) {
          console.error("Error fetching user enrollments:", error);
          toast({
            title: "Error",
            description: "Could not load your enrolled courses.",
            variant: "destructive",
          });
          setEnrolledCourses([]); // Reset on error
        } finally {
          setIsLoadingEnrollments(false);
        }
      } else {
        // No user, clear enrollments and set loading to false
        setEnrolledCourses([]);
        setIsLoadingEnrollments(false);
      }
    };

    fetchUserEnrollments();
  }, [user, toast]);

  const enrollCourse = async (courseId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You need to be logged in to enroll in a course.",
        variant: "destructive",
      });
      return;
    }
    if (enrolledCourses.includes(courseId)) return; // Already enrolled

    const userEnrollmentRef = doc(db, 'userEnrollments', user.uid);
    try {
      // Try to update first, if it fails (doc doesn't exist), then set
      await updateDoc(userEnrollmentRef, {
        enrolledCourseIds: arrayUnion(courseId),
      });
      setEnrolledCourses((prevCourses) => [...prevCourses, courseId]);
      toast({
        title: "Successfully Enrolled!",
        description: "You have been enrolled in the course.",
      });
    } catch (error: any) {
      if (error.code === 'not-found' || error.message.includes('No document to update')) {
        // Document doesn't exist, so create it
        try {
          await setDoc(userEnrollmentRef, {
            enrolledCourseIds: [courseId],
          });
          setEnrolledCourses((prevCourses) => [...prevCourses, courseId]);
          toast({
            title: "Successfully Enrolled!",
            description: "You have been enrolled in the course.",
          });
        } catch (setDocError) {
          console.error("Error setting user enrollment document:", setDocError);
          toast({
            title: "Enrollment Failed",
            description: "Could not enroll you in the course. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        console.error("Error enrolling course:", error);
        toast({
          title: "Enrollment Failed",
          description: "Could not enroll you in the course. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const unenrollCourse = async (courseId: string) => {
    if (!user) {
       toast({
        title: "Authentication Required",
        description: "You need to be logged in to unenroll from a course.",
        variant: "destructive",
      });
      return;
    }
    if (!enrolledCourses.includes(courseId)) return; // Not enrolled

    const userEnrollmentRef = doc(db, 'userEnrollments', user.uid);
    try {
      await updateDoc(userEnrollmentRef, {
        enrolledCourseIds: arrayRemove(courseId),
      });
      setEnrolledCourses((prevCourses) => prevCourses.filter((id) => id !== courseId));
      toast({
        title: "Successfully Unenrolled",
        description: "You have been unenrolled from the course.",
      });
    } catch (error) {
      console.error("Error unenrolling course:", error);
      toast({
        title: "Unenrollment Failed",
        description: "Could not unenroll you from the course. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <EnrolledCoursesContext.Provider value={{ enrolledCourses, enrollCourse, unenrollCourse, isLoadingEnrollments }}>
      {children}
    </EnrolledCoursesContext.Provider>
  );
};

export const useEnrolledCourses = () => {
  const context = useContext(EnrolledCoursesContext);
  if (context === undefined) {
    throw new Error('useEnrolledCourses must be used within an EnrolledCoursesProvider');
  }
  return context;
};
