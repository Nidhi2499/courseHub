
"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { getCourses } from '@/services/courseService';
import type { Course, VideoLecture } from '@/types/course';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Play, Pause, Rewind, MonitorPlay, Volume2, VolumeX, CheckCircle, Circle } from 'lucide-react';

const CourseDetailPage = () => {
  const params = useParams();
  const courseId = params.courseId as string;
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [completedVideos, setCompletedVideos] = useState<string[]>([]);
  const [videoEnded, setVideoEnded] = useState(false);
  const [countdownActive, setCountdownActive] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

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
            setSelectedVideoUrl(null);
          }
        } else {
          setError("Course not found.");
        }
      } catch (err) {
        console.error("Failed to fetch course:", err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(`Failed to load course details. Please try again. (Details: ${errorMessage})`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement && selectedVideoUrl) {
      videoElement.pause();
      setIsPlaying(false);
      setVideoEnded(false);
      setCountdownActive(false);
      setCountdown(10);
      clearCountdown();
    }
  }, [selectedVideoUrl]);

  const startCountdown = () => {
    setCountdownActive(true);
    setCountdown(10);
    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current!);
          playNextVideo();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const clearCountdown = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setCountdownActive(false);
    setCountdown(10);
    if (videoEnded) {
      setVideoEnded(false);
    }
  };

  const handleVideoSelect = (video: VideoLecture) => {
    setSelectedVideoUrl(video.videoUrl);
  };

  const playNextVideo = () => {
    if (!course || !course.videoLectures || !selectedVideoUrl) return;
    const currentIndex = course.videoLectures.findIndex(video => video.videoUrl === selectedVideoUrl);
    const nextIndex = currentIndex + 1;
    if (nextIndex < course.videoLectures.length) {
      handleVideoSelect(course.videoLectures[nextIndex]);
    } else {
      clearCountdown();
      console.log("End of playlist");
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused || videoRef.current.ended) {
        videoRef.current.play().catch(e => console.warn("Play action failed:", e));
         if(videoEnded) setVideoEnded(false); 
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handleSeek = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
      if (isPlaying && videoRef.current.paused) { 
        videoRef.current.play().catch(e => console.warn("Play after seek failed:", e));
      }
      clearCountdown();
      if(videoEnded && seconds < 0) setVideoEnded(false); 
    }
  };

  const changePlaybackRate = (rate: number) => {
    if (videoRef.current) {
      const limitedRate = Math.max(0.5, Math.min(1.5, rate));
      videoRef.current.playbackRate = limitedRate;
      if (countdownActive) clearCountdown();
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted); 
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
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${selectedVideoUrl === video.videoUrl ? 'bg-primary/10 text-primary font-semibold hover:bg-primary/20' : 'hover:bg-muted text-foreground/80'}`}
                    onClick={() => handleVideoSelect(video)}
                  >
                    <MonitorPlay size={16} className={`${selectedVideoUrl === video.videoUrl ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="flex-grow text-left">{video.title}</span>
                    <span className="flex-shrink-0">
                      {completedVideos.includes(video.id) ? (
                        <CheckCircle size={16} className="text-green-500" />
                      ) : (
                        <Circle size={16} className="text-gray-400" />
                      )}
                    </span>
                  </button>
                  {selectedVideoUrl === video.videoUrl && countdownActive && (
                    <p className="text-xs text-muted-foreground mt-1 px-3">Next lecture in {countdown}...</p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No video lectures available for this course yet.</p>
          )}
        </aside>
        <main className="flex-1 bg-background p-0 md:p-4 rounded-lg">
          {selectedVideoUrl ? (
            <div className="bg-black rounded-lg overflow-hidden shadow-2xl relative group aspect-video">
              <video
                ref={videoRef}
                key={selectedVideoUrl}
                src={selectedVideoUrl}
                className="w-full aspect-video"
                onLoadedMetadata={() => {
                  if (videoRef.current) setIsMuted(videoRef.current.muted);
                }}
                onPlay={() => { setIsPlaying(true); clearCountdown(); }}
                onPause={() => { setIsPlaying(false); clearCountdown(); }} 
                onEnded={() => {
                  setIsPlaying(false);
                  setVideoEnded(true);
                  startCountdown();
                  const currentVideo = course?.videoLectures?.find(v => v.videoUrl === selectedVideoUrl);
                  if (currentVideo && !completedVideos.includes(currentVideo.id)) {
                    setCompletedVideos(prev => [...prev, currentVideo.id]);
                  }
                }}
              >
                Your browser does not support the video tag.
              </video>
              {!isPlaying && !videoEnded && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 cursor-pointer" onClick={togglePlayPause}>
                  <Button variant="ghost" size="icon" className="h-20 w-20 text-white hover:bg-white/20 pointer-events-none">
                    <Play size={60} />
                  </Button>
                </div>
              )}
              
              <div className="absolute bottom-0 left-0 right-0 bg-card/90 backdrop-blur-sm p-2 sm:p-3 flex items-center justify-between gap-1 sm:gap-2 text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Button variant="ghost" size="icon" onClick={togglePlayPause} title={isPlaying ? "Pause" : "Play"}>
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleSeek(-10)} title="Rewind 10s">
                    <Rewind size={20} />
                  </Button>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className="text-xs hidden sm:inline">Speed:</span>
                  {[0.5, 1, 1.5].map(rate => (
                    <Button key={rate} variant="ghost" size="sm" onClick={() => changePlaybackRate(rate)} className={`text-xs px-2 py-1 h-auto ${videoRef.current?.playbackRate === rate ? 'bg-muted' : ''}`}>{rate}x</Button>
                  ))}
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
    

    