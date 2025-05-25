
'use server';

import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';

const USER_VIDEO_PROGRESS_COLLECTION = 'userVideoProgress';

interface VideoProgressData {
  progress?: {
    [videoId: string]: {
      currentTime: number;
      lastUpdated: any; // Firestore ServerTimestamp
    };
  };
  lastUpdated?: any; // Firestore ServerTimestamp for the whole document
}

/**
 * Saves the video progress for a specific user and video.
 * @param userId The ID of the user.
 * @param videoId The ID of the video.
 * @param currentTime The current playback time in seconds.
 */
export async function saveVideoProgress(
  userId: string,
  videoId: string,
  currentTime: number
): Promise<void> {
  if (!userId || !videoId) {
    console.error('User ID or Video ID is missing for saving progress.');
    return;
  }
  const userProgressRef = doc(db, USER_VIDEO_PROGRESS_COLLECTION, userId);
  const progressEntry = {
    currentTime,
    lastUpdated: serverTimestamp(),
  };

  try {
    // Use setDoc with merge to create the document if it doesn't exist,
    // or update the specific video's progress if it does.
    await setDoc(
      userProgressRef,
      {
        progress: {
          [videoId]: progressEntry,
        },
        lastUpdatedOverall: serverTimestamp(), // To track overall activity if needed
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error saving video progress for user', userId, 'video', videoId, ':', error);
    // Optionally, re-throw or handle as per application needs
  }
}

/**
 * Retrieves the last saved video progress for a specific user and video.
 * @param userId The ID of the user.
 * @param videoId The ID of the video.
 * @returns The last saved currentTime in seconds, or null if no progress is found.
 */
export async function getVideoProgress(
  userId: string,
  videoId: string
): Promise<number | null> {
  if (!userId || !videoId) {
    console.error('User ID or Video ID is missing for getting progress.');
    return null;
  }
  const userProgressRef = doc(db, USER_VIDEO_PROGRESS_COLLECTION, userId);
  try {
    const docSnap = await getDoc(userProgressRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as VideoProgressData;
      if (data.progress && data.progress[videoId]) {
        return data.progress[videoId].currentTime;
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting video progress for user', userId, 'video', videoId, ':', error);
    return null;
  }
}
