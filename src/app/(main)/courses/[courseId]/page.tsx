"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
// Combined imports from react
// Placeholder video data - replace with actual data fetched from your source
const placeholderVideos = [
  { id: '1', title: 'Introduction to the Course', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
  { id: '2', title: 'Module 1: Getting Started', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
  { id: '3', title: 'Module 2: Advanced Concepts', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
];

import { getCourses } from '@/services/courseService';
import { Course } from '@/types/course';

const CourseDetailPage = () => {
  const params = useParams();
  const courseId = params.courseId;
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [course, setCourse] = useState<Course | null>(null); // State to store the fetched course details
  
  useEffect(() => {
    const fetchCourse = async () => {
      const allCourses = await getCourses();
      const foundCourse = allCourses.find(c => c.id === courseId);
      setCourse(foundCourse || null);
    };
    fetchCourse();
  }, [courseId]);
  

  const handleVideoSelect = (videoUrl: string) => {
    setSelectedVideoUrl(videoUrl);
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handleSeekBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime -= 10; // Seek backward by 10 seconds
    }
  };

  const handleSetSpeed15x = () => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.5;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-screen-xl"> {/* Container for padding and max width */}
      <div className="flex flex-col md:flex-row gap-8"> {/* Use flexbox for two columns, adjust for mobile */}
        {/* Left Column (25% on medium screens and up) */}
        <div className="w-full md:w-1/4 bg-background p-4 rounded-lg overflow-y-auto"> {/* Use w-full for small screens */}
          <h2 className="text-2xl font-bold mb-6">{course?.title || 'Loading...'}</h2> {/* Display course title, show loading if not fetched */}
          <h3 className="text-lg font-semibold mb-4">Video Lectures</h3> {/* Heading for video titles */}
          <ul>
            {placeholderVideos.map((video) => (
              <li key={video.id} className="cursor-pointer py-3 border-b last:border-b-0 border-gray-300 text-base text-gray-700 hover:bg-gray-200 px-2 rounded-md" onClick={() => handleVideoSelect(video.videoUrl)}>
                {video.title}
              </li>
            ))}
          </ul>
        </div>

        {/* Right Column (Rest of the width) */}
        <div className="flex-1 bg-gray-200 p-4 rounded-lg"> {/* Use flex-1 to take the remaining width */}
        <video ref={videoRef} key={selectedVideoUrl} src={selectedVideoUrl || ''} controls controlsList="nodownload nofullscreen" className="w-full h-auto">
          Your browser does not support the video tag.
        </video>
        {/* You can add custom controls here if you prefer over the default ones */}
      </div>
    </div>
    </div>
  )
};

export default CourseDetailPage;