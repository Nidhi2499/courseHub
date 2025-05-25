
"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { getCourses } from '@/services/courseService';
import type { Course, VideoLecture } from '@/types/course';
import { Loader2, Maximize, Minimize, Play, Pause, Rewind, MonitorPlay, Volume2, VolumeX, CheckCircle, Circle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { saveVideoProgress, getVideoProgress } from '@/services/userProgressService';

const CourseDetailPage = () => {
  const params = useParams();
  const courseId = params.courseId as string;
  const { user } = useAuth();

  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerWrapperRef = useRef<HTMLDivElement>(null);
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
  const [isFullscreen, setIsFullscreen] = useState(false);

  // For saving progress
  const saveProgressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentVideoIdRef = useRef<string | null>(null); // To store ID of the video currently in player

  const fetchCourseData = useCallback(async () => {
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
          const firstVideo = foundCourse.videoLectures[0];
          setSelectedVideoUrl(firstVideo.videoUrl);
          currentVideoIdRef.current = firstVideo.id; // Set initial video ID
        } else {
          setSelectedVideoUrl(null);
          currentVideoIdRef.current = null;
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
  }, [courseId]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  const handleActualSaveProgress = useCallback(async () => {
    if (user && videoRef.current && currentVideoIdRef.current && videoRef.current.currentTime > 0) {
      try {
        await saveVideoProgress(user.uid, currentVideoIdRef.current, videoRef.current.currentTime);
      } catch (e) {
        console.error("Failed to save progress:", e);
      }
    }
  }, [user]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !user || !currentVideoIdRef.current) return;

    // Load progress when video element is ready and user/video ID is available
    const loadAndUpdateProgress = async () => {
      const progress = await getVideoProgress(user.uid, currentVideoIdRef.current!);
      if (progress !== null && videoElement.readyState >= 1) { // HAVE_METADATA or more
        videoElement.currentTime = progress;
      } else if (progress !== null) {
        const onMetadataLoaded = () => {
          videoElement.currentTime = progress;
          videoElement.removeEventListener('loadedmetadata', onMetadataLoaded);
        };
        videoElement.addEventListener('loadedmetadata', onMetadataLoaded);
      }
    };

    loadAndUpdateProgress();

  }, [selectedVideoUrl, user, course]); // Re-run if selected video or user changes

  // Effect for resetting player state & handling progress for PREVIOUS video
  useEffect(() => {
    const videoElement = videoRef.current;
    // Save progress of the *previous* video before changing source or unmounting
    const previousVideoId = currentVideoIdRef.current;

    // Set new video ID
    const newSelectedVideo = course?.videoLectures?.find(v => v.videoUrl === selectedVideoUrl);
    currentVideoIdRef.current = newSelectedVideo?.id || null;

    if (videoElement) {
      videoElement.pause();
      setIsPlaying(false);
      setVideoEnded(false);
      setCountdownActive(false);
      setCountdown(10);
      clearCountdown();
    }

    return () => { // Cleanup function
      if (user && videoElement && previousVideoId && videoElement.currentTime > 0 && !videoElement.ended) {
         // Check if the source is still the one for previousVideoId before saving
        const isStillPreviousVideo = course?.videoLectures?.find(v => v.id === previousVideoId)?.videoUrl === videoElement.src;
        if(isStillPreviousVideo) {
            saveVideoProgress(user.uid, previousVideoId, videoElement.currentTime);
        }
      }
      if (saveProgressTimeoutRef.current) {
        clearTimeout(saveProgressTimeoutRef.current);
      }
    };
  }, [selectedVideoUrl, user, course, handleActualSaveProgress]);


  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

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
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    setCountdownActive(false);
  };

  const handleVideoSelect = (video: VideoLecture) => {
    // Save progress of current video before switching
    if (videoRef.current && videoRef.current.currentTime > 0 && !videoRef.current.ended && currentVideoIdRef.current && user) {
       saveVideoProgress(user.uid, currentVideoIdRef.current, videoRef.current.currentTime);
    }
    setSelectedVideoUrl(video.videoUrl);
    // currentVideoIdRef will be updated by the useEffect for selectedVideoUrl
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
        if (videoEnded) setVideoEnded(false);
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
      if (videoEnded && seconds < 0) setVideoEnded(false);
    }
  };

  const changePlaybackRate = (rate: number) => {
    if (videoRef.current) {
      const limitedRate = Math.max(0.5, Math.min(2, rate)); // Allow up to 2x
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

  const toggleFullscreen = () => {
    if (!playerWrapperRef.current) return;
    if (!document.fullscreenElement) {
      if (playerWrapperRef.current.requestFullscreen) playerWrapperRef.current.requestFullscreen();
      else if ((playerWrapperRef.current as any).mozRequestFullScreen) (playerWrapperRef.current as any).mozRequestFullScreen();
      else if ((playerWrapperRef.current as any).webkitRequestFullscreen) (playerWrapperRef.current as any).webkitRequestFullscreen();
      else if ((playerWrapperRef.current as any).msRequestFullscreen) (playerWrapperRef.current as any).msRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if ((document as any).mozCancelFullScreen) (document as any).mozCancelFullScreen();
      else if ((document as any).webkitExitFullscreen) (document as any).webkitExitFullscreen();
      else if ((document as any).msExitFullscreen) (document as any).msExitFullscreen();
    }
  };

  const debouncedSaveProgress = useCallback(() => {
    if (saveProgressTimeoutRef.current) {
      clearTimeout(saveProgressTimeoutRef.current);
    }
    saveProgressTimeoutRef.current = setTimeout(() => {
      handleActualSaveProgress();
    }, 3000); // Save every 3 seconds of continuous play
  }, [handleActualSaveProgress]);

  // Component unmount cleanup
  useEffect(() => {
    return () => {
      handleActualSaveProgress(); // Save one last time on unmount
      if (saveProgressTimeoutRef.current) {
        clearTimeout(saveProgressTimeoutRef.current);
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, [handleActualSaveProgress]);


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
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No video lectures available for this course yet.</p>
          )}
        </aside>
        <main className="flex-1 bg-background p-0 md:p-4 rounded-lg">
          {selectedVideoUrl ? (
            <div ref={playerWrapperRef} className="bg-black rounded-lg overflow-hidden shadow-2xl relative group aspect-video">
              <video
                ref={videoRef}
                key={selectedVideoUrl} // Important: Re-mounts video when src changes
                src={selectedVideoUrl}
                className="w-full h-full object-contain"
                onLoadedMetadata={() => {
                  if (videoRef.current) setIsMuted(videoRef.current.muted);
                  // Attempt to load progress once metadata is loaded
                  if (user && currentVideoIdRef.current) {
                    getVideoProgress(user.uid, currentVideoIdRef.current).then(progress => {
                      if (progress !== null && videoRef.current) {
                        videoRef.current.currentTime = progress;
                      }
                    });
                  }
                }}
                onPlay={() => { setIsPlaying(true); clearCountdown(); }}
                onPause={() => {
                  setIsPlaying(false);
                  clearCountdown();
                  handleActualSaveProgress(); // Save progress on pause
                }}
                onEnded={() => {
                  setIsPlaying(false);
                  setVideoEnded(true);
                  handleActualSaveProgress(); // Save progress on end
                  startCountdown();
                  const currentVideo = course?.videoLectures?.find(v => v.videoUrl === selectedVideoUrl);
                  if (currentVideo && !completedVideos.includes(currentVideo.id)) {
                    setCompletedVideos(prev => [...prev, currentVideo.id]);
                  }
                }}
                onTimeUpdate={() => {
                  debouncedSaveProgress(); // Debounce progress saving during playback
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
              {countdownActive && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-md text-sm shadow-lg">
                  Next video in {countdown}s...
                  <Button variant="ghost" size="sm" className="ml-2 text-xs text-primary hover:text-primary/80" onClick={() => { clearCountdown(); playNextVideo(); }}>Play Next</Button>
                  <Button variant="ghost" size="sm" className="ml-1 text-xs text-muted-foreground hover:text-foreground" onClick={clearCountdown}>Cancel</Button>
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
                  {[0.5, 1, 1.5, 2].map(rate => ( // Added 2x speed
                    <Button key={rate} variant="ghost" size="sm" onClick={() => changePlaybackRate(rate)} className={`text-xs px-2 py-1 h-auto ${videoRef.current?.playbackRate === rate ? 'bg-muted' : ''}`}>{rate}x</Button>
                  ))}
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <Button variant="ghost" size="icon" onClick={toggleMute} title={isMuted ? "Unmute" : "Mute"}>
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={toggleFullscreen} title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
                    {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                  </Button>
                </div>
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
