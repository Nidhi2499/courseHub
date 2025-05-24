"use client";

import { useParams } from 'next/navigation';
import React from 'react';

const CourseDetailPage = () => {
  const params = useParams();
  const courseId = params.courseId;

  return (
    <div>
      <h1>Course Detail Page</h1>
      <p>Course ID: {courseId}</p>
    </div>
  );
};

export default CourseDetailPage;