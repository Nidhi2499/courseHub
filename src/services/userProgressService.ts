
'use server';

import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';

const USER_VIDEO_PROGRESS_COLLECTION = 'userVideoProgress';

export interface UserVideoState {
  currentTime: number;
  duration: number;
  completed: boolean;
  lastUpdated?: any; // Firestore ServerTimestamp
}

interface UserProgressDocument {
  videoStates?: {
    [videoId: string]: UserVideoState; // A map of videoId to its state
  };
  lastUpdatedOverall?: any; // Timestamp for the last update to this document
}

/**
 * Saves or updates the progress state for a specific video for a user.
 * @param userId The ID of the user.
 * @param videoId The ID of the video.
 * @param dataToUpdate An object containing fields to update (currentTime, duration, completed).
 */
export async function saveVideoProgress(
  userId: string,
  videoId: string,
  dataToUpdate: Partial<UserVideoState>
): Promise<void> {
  if (!userId || !videoId) {
    console.error('User ID or Video ID is missing for saving progress.');
    // Potentially throw an error or return a status indicating failure
    throw new Error('User ID or Video ID is missing.');
  }
  const userProgressRef = doc(db, USER_VIDEO_PROGRESS_COLLECTION, userId);

  // Construct the object to merge for this specific video's state.
  // Ensure lastUpdated is always set with the current server timestamp.
  const specificVideoUpdate = {
    ...dataToUpdate,
    lastUpdated: serverTimestamp(),
  };

  try {
    // Using setDoc with { merge: true } will:
    // - Create the document if it doesn't exist.
    // - Create the videoStates map if it doesn't exist.
    // - Create or update the specific videoId entry within the videoStates map.
    // - Fields in specificVideoUpdate will overwrite existing fields in videoStates[videoId] or be added if new.
    // - Other videoId entries in videoStates map will remain untouched.
    await setDoc(userProgressRef, {
      videoStates: {
        [videoId]: specificVideoUpdate
      },
      lastUpdatedOverall: serverTimestamp() // Also update the overall document timestamp
    }, { merge: true });

  } catch (e) {
    console.error("Failed to save video progress:", e);
    // Re-throw the error so the caller can potentially handle it (e.g., show a toast)
    throw e;
  }
}

/**
 * Retrieves all video states (progress, completion) for a given user.
 * @param userId The ID of the user.
 * @returns A Promise that resolves to a Map where keys are videoIds and values are UserVideoState objects.
 */
export async function getUserVideoStates(userId: string): Promise<Map<string, UserVideoState>> {
  const videoStatesMap = new Map<string, UserVideoState>();
  if (!userId) {
    console.warn('User ID is missing for getting video states. Returning empty map.');
    return videoStatesMap; // Return empty map if no userId
  }

  const userProgressRef = doc(db, USER_VIDEO_PROGRESS_COLLECTION, userId);
  try {
    const docSnap = await getDoc(userProgressRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as UserProgressDocument;
      if (data.videoStates) {
        for (const videoId in data.videoStates) {
          // Ensure we are iterating over own properties and not from prototype chain
          if (Object.prototype.hasOwnProperty.call(data.videoStates, videoId)) {
            videoStatesMap.set(videoId, data.videoStates[videoId]);
          }
        }
      }
    }
    // If docSnap doesn't exist or data.videoStates is undefined, an empty map is correctly returned.
    return videoStatesMap;
  } catch (error) {
    console.error('Error getting video states for user', userId, ':', error);
    // Depending on how critical this is, you might re-throw or return empty map
    // For robustness in UI, returning an empty map is often preferred
    throw error; // Re-throw to allow calling component to handle it
  }
}
