
"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { getCourses } from '@/services/courseService';
import type { Course, VideoLecture } from '@/types/course';
import { Loader2, Maximize, Minimize, Play, Pause, Rewind, MonitorPlay, Volume2, VolumeX, CheckCircle, Circle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { saveVideoProgress, getUserVideoStates } from '@/services/userProgressService';
import type { UserVideoState } from '@/services/userProgressService';
import { Progress } from '@/components/ui/progress';


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
  
  const [videoStates, setVideoStates] = useState<Map<string, UserVideoState>>(new Map());

  const [videoEnded, setVideoEnded] = useState(false);
  const [countdownActive, setCountdownActive] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const saveProgressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentVideoIdRef = useRef<string | null>(null);

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
          currentVideoIdRef.current = firstVideo.id;
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

  useEffect(() => {
    if (user && course?.videoLectures) {
      getUserVideoStates(user.uid).then(states => {
        setVideoStates(states);
      }).catch(err => {
        console.error("Failed to fetch video states:", err);
      });
    }
  }, [user, course?.videoLectures]);


  const handleActualSaveProgress = useCallback(async (videoIdToSave?: string, dataToUpdate?: Partial<UserVideoState>) => {
    const videoId = videoIdToSave || currentVideoIdRef.current;
    if (user && videoId && videoRef.current) {
      const progressData: Partial<UserVideoState> = dataToUpdate || {
        currentTime: videoRef.current.currentTime,
        duration: videoRef.current.duration || videoStates.get(videoId)?.duration || 0,
        completed: videoRef.current.ended || videoStates.get(videoId)?.completed || false,
      };
      
      if (isNaN(progressData.duration ?? NaN)) {
          delete progressData.duration;
      }
      
      try {
        // Only save if there's a src and the video is not in an error state or no source.
        // And if there's actual data to update.
        if (videoRef.current.src && videoRef.current.networkState !== videoRef.current.NETWORK_NO_SOURCE && Object.keys(progressData).length > 0) {
           await saveVideoProgress(user.uid, videoId, progressData);
           setVideoStates(prev => {
            const newStates = new Map(prev);
            const existingState = newStates.get(videoId) || { completed: false, currentTime: 0, duration: 0 }; // Provide default for existingState
            newStates.set(videoId, { ...existingState, ...progressData } as UserVideoState);
            return newStates;
           });
        }
      } catch (e) {
        console.error("Failed to save progress:", e);
      }
    }
  }, [user, videoStates]);


  useEffect(() => {
    const videoElement = videoRef.current;
    
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

    return () => {
      if (saveProgressTimeoutRef.current) {
        clearTimeout(saveProgressTimeoutRef.current);
      }
    };
  }, [selectedVideoUrl, course]);


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
    if (currentVideoIdRef.current && videoRef.current && !videoRef.current.ended && videoRef.current.currentTime > 0) {
       handleActualSaveProgress(currentVideoIdRef.current, { currentTime: videoRef.current.currentTime });
    }
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
      const limitedRate = Math.max(0.5, Math.min(2, rate));
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
      if(videoRef.current && currentVideoIdRef.current && !isNaN(videoRef.current.currentTime) && !isNaN(videoRef.current.duration)) {
        handleActualSaveProgress(currentVideoIdRef.current, {
          currentTime: videoRef.current.currentTime,
          duration: videoRef.current.duration,
          completed: videoRef.current.ended,
        });
      }
    }, 3000); 
  }, [handleActualSaveProgress]);


  useEffect(() => {
    return () => {
      if (user && currentVideoIdRef.current && videoRef.current && !isNaN(videoRef.current.currentTime) && !isNaN(videoRef.current.duration)) {
          handleActualSaveProgress(currentVideoIdRef.current, { 
            currentTime: videoRef.current.currentTime, 
            duration: videoRef.current.duration,
            completed: videoRef.current.ended
          });
      }
      if (saveProgressTimeoutRef.current) {
        clearTimeout(saveProgressTimeoutRef.current);
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, [handleActualSaveProgress, user]);

  const overallCourseProgressPercent = useMemo(() => {
    if (!course || !course.videoLectures || course.videoLectures.length === 0 || videoStates.size === 0) {
      return 0;
    }

    let totalKnownDuration = 0;
    let totalWatchedTime = 0;

    course.videoLectures.forEach(video => {
      const state = videoStates.get(video.id);
      if (state && state.duration && state.duration > 0) {
        totalKnownDuration += state.duration;
        if (state.completed) {
          totalWatchedTime += state.duration;
        } else if (state.currentTime) {
          totalWatchedTime += Math.min(state.currentTime, state.duration);
        }
      }
    });

    return totalKnownDuration > 0 ? (totalWatchedTime / totalKnownDuration) * 100 : 0;
  }, [course, videoStates]);


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
            <>
              {course.videoLectures.slice(0, 1).map((video) => {
                const videoState = videoStates.get(video.id);
                const progressPercent = (videoState && videoState.duration && videoState.currentTime) ? (videoState.currentTime / videoState.duration) * 100 : 0;
                const isCompleted = videoState?.completed || progressPercent >= 99.9;

                return (
                  <div key={video.id}>
                    <button
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${selectedVideoUrl === video.videoUrl ? 'bg-primary/10 text-primary font-semibold hover:bg-primary/20' : 'hover:bg-muted text-foreground/80'}`}
                      onClick={() => handleVideoSelect(video)}
                    >
                      <MonitorPlay size={16} className={`${selectedVideoUrl === video.videoUrl ? 'text-primary' : 'text-muted-foreground'}`} />
                      <div className="flex-grow">
                        <span className="block text-left">{video.title}</span>
                        <Progress value={progressPercent} className="h-1 w-full mt-1 [&>div]:bg-primary" />
                      </div>
                      <span className="flex-shrink-0 ml-2">
                        {isCompleted ? (
                          <CheckCircle size={16} className="text-green-500" />
                        ) : (
                          <Circle size={16} className="text-gray-400" />
                        )}
                      </span>
                    </button>
                  </div>
                );
              })}
              <div className="mt-6 mb-2">
                <p className="text-xs text-muted-foreground mb-1 text-center">Overall Course Progress: {overallCourseProgressPercent.toFixed(0)}%</p>
                <div className="h-[4px] w-full bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary rounded-full transition-all duration-300 ease-in-out"
                        style={{ width: `${overallCourseProgressPercent}%` }}
                    />
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No video lectures available for this course yet.</p>
          )}
        </aside>
        <main className="flex-1 bg-background p-0 md:p-4 rounded-lg">
          {selectedVideoUrl ? (
            <div ref={playerWrapperRef} className="bg-black rounded-lg overflow-hidden shadow-2xl relative group aspect-video">
              <video
                ref={videoRef}
                key={selectedVideoUrl} 
                src={selectedVideoUrl}
                className="w-full h-full object-contain"
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    setIsMuted(videoRef.current.muted);
                    const currentVideoId = currentVideoIdRef.current;
                    if (user && currentVideoId) {
                      const savedState = videoStates.get(currentVideoId);
                      if (savedState?.currentTime) {
                        videoRef.current.currentTime = savedState.currentTime;
                      }
                      if (videoRef.current.duration && (isNaN(savedState?.duration ?? NaN) || savedState?.duration !== videoRef.current.duration)) {
                         handleActualSaveProgress(currentVideoId, { duration: videoRef.current.duration });
                      }
                    }
                  }
                }}
                onPlay={() => { setIsPlaying(true); clearCountdown(); }}
                onPause={() => {
                  setIsPlaying(false);
                  clearCountdown();
                   if (user && currentVideoIdRef.current && videoRef.current && !isNaN(videoRef.current.currentTime) && !isNaN(videoRef.current.duration)) {
                      handleActualSaveProgress(currentVideoIdRef.current, { currentTime: videoRef.current.currentTime, duration: videoRef.current.duration });
                  }
                }}
                onEnded={() => {
                  setIsPlaying(false);
                  setVideoEnded(true);
                  const currentVideo = course?.videoLectures?.find(v => v.videoUrl === selectedVideoUrl);
                  if (user && currentVideo && videoRef.current) {
                     handleActualSaveProgress(currentVideo.id, { 
                       currentTime: videoRef.current.duration, 
                       duration: videoRef.current.duration,
                       completed: true 
                     });
                  }
                  startCountdown();
                }}
                onTimeUpdate={() => {
                  debouncedSaveProgress(); 
                  if (videoRef.current && currentVideoIdRef.current) {
                    const videoId = currentVideoIdRef.current;
                    const currentTime = videoRef.current.currentTime;
                    const duration = videoRef.current.duration;
                    if (!isNaN(currentTime) && !isNaN(duration)) {
                        setVideoStates(prev => {
                            const newStates = new Map(prev);
                            const existingState = newStates.get(videoId) || {completed: false, currentTime: 0, duration: 0};
                            newStates.set(videoId, { ...existingState, currentTime, duration: duration || existingState.duration } as UserVideoState);
                            return newStates;
                        });
                    }
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
                  {[0.5, 1, 1.5, 2].map(rate => ( 
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
    

    
