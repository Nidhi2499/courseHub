
"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { getCourses } from '@/services/courseService';
import type { Course, VideoLecture } from '@/types/course'; // Updated import
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Play, Pause, Rewind, FastForward, Volume2, VolumeX, MonitorPlay } from 'lucide-react';

const CourseDetailPage = () => {
  const params = useParams();
  const courseId = params.courseId as string; // Ensure courseId is treated as string
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) {
        setError("Course ID is missing.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const allCourses = await getCourses();
        const foundCourse = allCourses.find(c => c.id === courseId);
        if (foundCourse) {
          setCourse(foundCourse);
          if (foundCourse.videoLectures && foundCourse.videoLectures.length > 0) {
            setSelectedVideoUrl(foundCourse.videoLectures[0].videoUrl);
          } else {
            // Handle case where course has no videos
             setSelectedVideoUrl(null); // Or a default "no video" message/state
          }
        } else {
          setError("Course not found.");
        }
      } catch (err) {
        console.error("Failed to fetch course:", err);
        setError("Failed to load course details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleVolumeChange = () => setIsMuted(videoElement.muted);

      videoElement.addEventListener('play', handlePlay);
      videoElement.addEventListener('pause', handlePause);
      videoElement.addEventListener('volumechange', handleVolumeChange);

      // Set initial state
      setIsPlaying(!videoElement.paused);
      setIsMuted(videoElement.muted);

      return () => {
        videoElement.removeEventListener('play', handlePlay);
        videoElement.removeEventListener('pause', handlePause);
        videoElement.removeEventListener('volumechange', handleVolumeChange);
      };
    }
  }, [selectedVideoUrl]); // Re-run when video URL changes

  const handleVideoSelect = (video: VideoLecture) => {
    setSelectedVideoUrl(video.videoUrl);
    if (videoRef.current) {
        videoRef.current.load(); // Ensure the new video loads
        videoRef.current.play().catch(e => console.warn("Autoplay prevented:", e));
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused || videoRef.current.ended) {
        videoRef.current.play().catch(e => console.warn("Play action failed:", e));
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handleSeek = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };
  
  const changePlaybackRate = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
    }
  };


  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading course...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertTitle>Course Not Found</AlertTitle>
          <AlertDescription>The course you are looking for does not exist or could not be loaded.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-screen-xl px-4 py-8">
      <div className="flex flex-col gap-8 md:flex-row">
        <aside className="w-full md:w-1/3 lg:w-1/4 bg-card p-4 rounded-lg shadow-lg h-fit md:max-h-[calc(100vh-8rem)] md:overflow-y-auto">
          <h2 className="text-2xl font-bold mb-1 text-primary">{course.title}</h2>
          <p className="text-sm text-muted-foreground mb-4">Category: {course.category} | Level: {course.level}</p>
          <h3 className="text-lg font-semibold mb-4 text-foreground border-t pt-4">Video Lectures</h3>
          {course.videoLectures && course.videoLectures.length > 0 ? (
            <ul className="space-y-2">
              {course.videoLectures.map((video) => (
                <li key={video.id}>
                  <button
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${
                      selectedVideoUrl === video.videoUrl
                        ? 'bg-primary/20 text-primary font-medium'
                        : 'hover:bg-muted text-foreground/80'
                    }`}
                    onClick={() => handleVideoSelect(video)}
                  >
                    <MonitorPlay size={16} className={`${selectedVideoUrl === video.videoUrl ? 'text-primary' : 'text-muted-foreground'}`} />
                    {video.title}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No video lectures available for this course yet.</p>
          )}
        </aside>

        <main className="flex-1 bg-background p-0 md:p-4 rounded-lg">
          {selectedVideoUrl ? (
            <div className="bg-black rounded-lg overflow-hidden shadow-2xl">
              <video 
                ref={videoRef} 
                key={selectedVideoUrl}  // Important for re-rendering when src changes
                src={selectedVideoUrl} 
                className="w-full aspect-video"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onLoadedMetadata={() => {
                  if(videoRef.current) setIsMuted(videoRef.current.muted);
                }}
              >
                Your browser does not support the video tag.
              </video>
              <div className="bg-card/90 backdrop-blur-sm p-3 flex items-center justify-between gap-2 text-foreground">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={togglePlayPause} title={isPlaying ? "Pause" : "Play"}>
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleSeek(-10)} title="Rewind 10s">
                    <Rewind size={20} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleSeek(10)} title="Forward 10s">
                    <FastForward size={20} />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                   <span className="text-xs">Speed:</span>
                  <Button variant="ghost" size="sm" onClick={() => changePlaybackRate(1)} className="text-xs px-2 py-1 h-auto">1x</Button>
                  <Button variant="ghost" size="sm" onClick={() => changePlaybackRate(1.5)} className="text-xs px-2 py-1 h-auto">1.5x</Button>
                  <Button variant="ghost" size="sm" onClick={() => changePlaybackRate(2)} className="text-xs px-2 py-1 h-auto">2x</Button>
                </div>
                <Button variant="ghost" size="icon" onClick={toggleMute} title={isMuted ? "Unmute" : "Mute"}>
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-96 bg-muted rounded-lg shadow-inner">
              <p className="text-muted-foreground">Select a video to play or no videos available.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CourseDetailPage;
