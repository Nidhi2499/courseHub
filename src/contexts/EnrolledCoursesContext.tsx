'use client';

import { useEffect } from 'react';

import React, { createContext, useState, useContext, ReactNode } from 'react';

interface EnrolledCoursesContextType {
  enrolledCourses: string[];
  enrollCourse: (courseId: string) => void;
  unenrollCourse: (courseId: string) => void;
}

const EnrolledCoursesContext = createContext<EnrolledCoursesContextType | undefined>(undefined);

export const EnrolledCoursesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const savedEnrolledCourses = localStorage.getItem('enrolledCourses');
      return savedEnrolledCourses ? JSON.parse(savedEnrolledCourses) : [];
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('enrolledCourses', JSON.stringify(enrolledCourses));
    }
  }, [enrolledCourses]);



  const enrollCourse = (courseId: string) => {
    setEnrolledCourses((prevCourses) => {
      if (!prevCourses.includes(courseId)) {
        return [...prevCourses, courseId];
      }
      return prevCourses;
    });
  };

  const unenrollCourse = (courseId: string) => {
    setEnrolledCourses((prevCourses) => prevCourses.filter((id) => id !== courseId));
  };

  return (
    <EnrolledCoursesContext.Provider value={{ enrolledCourses, enrollCourse, unenrollCourse }}>
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