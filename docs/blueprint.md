
# CourseHub - Application Blueprint

## 1. Overview

CourseHub is a personalized online learning platform designed to offer users a curated selection of courses. It features user authentication, course browsing, video lectures, and personalized course recommendations based on user interests and learning history.

## 2. Tech Stack

*   **Frontend:** Next.js (with App Router), React, TypeScript
*   **UI:** ShadCN UI Components, Tailwind CSS
*   **State Management:** React Context API (for auth, potentially video progress)
*   **Backend/Authentication:** Firebase (Authentication, Firestore for course data and user progress)
*   **Generative AI:** Genkit (for course recommendations)

## 3. Core Features

### 3.1. User Authentication
*   User Sign-up (Email/Password)
*   User Login (Email/Password, Google OAuth)
*   Forgot Password functionality
*   Change Password functionality for logged-in users
*   Secure session management.

### 3.2. Course Management & Display
*   **Course Dashboard:** Displays all available courses using `CourseCard` components.
    *   Courses fetched from Firestore.
    *   Seeding mechanism to populate Firestore with initial course data if the collection is empty.
*   **Course Detail Page:**
    *   Displays selected course information.
    *   Lists video lectures for the selected course.
*   **Course Card Component:**
    *   Displays course title, description, category, level, duration, and image.
    *   Entire card is clickable, navigating to the course detail page.
    *   Uses `next/image` for optimized image loading, with fallbacks for broken image URLs.

### 3.3. Video Player Functionality
*   Custom video player controls for lectures on the course detail page.
*   **Controls Include:**
    *   Play/Pause toggle.
    *   Rewind 10 seconds.
    *   Mute/Unmute toggle.
    *   Playback speed adjustment (0.5x, 1x, 1.5x, 2x).
    *   Fullscreen toggle.
*   **Autoplay Next Video:**
    *   When a video ends, a 10-second countdown initiates to automatically play the next video in the playlist.
    *   Users can cancel the countdown or play the next video immediately.
*   **Video Progress & Completion Tracking (Login Required):**
    *   **Progress Saving:** For logged-in users, video playback progress (current time, duration) is automatically saved to Firestore.
        *   Progress is saved periodically during playback.
        *   Progress is saved when the video is paused, ends, or when the user navigates away/closes the tab.
    *   **Resume Playback:** When a logged-in user returns to a video, playback resumes from the last saved interval.
    *   **Progress Bar:** A thin progress bar is displayed below each video title in the playlist, indicating the percentage watched by the logged-in user.
    *   **Completion Marking:** For logged-in users, when a video is watched to completion, it's marked as complete.
        *   A green checkmark icon appears next to the video title in the playlist.
        *   This completion status is persisted in Firestore.
*   **Video Seeking (Intentional Limitation):**
    *   The custom video player **does not** currently feature a traditional progress bar/scrubber for users to arbitrarily click and drag to different points in the video.
    *   This is an **intentional design choice** to encourage a more linear and complete viewing experience for course content. Users navigate via "Rewind 10s," sequential play, or re-selecting videos from the playlist.
*   **Playlist Interaction:**
    *   The currently playing video title is highlighted in the playlist sidebar.

### 3.4. Personalized Recommendations (AI-Powered)
*   Dedicated "Recommendations" page.
*   Users input their interests and optionally, their learning history.
*   A Genkit flow (`personalizedCourseRecommendationsFlow`) processes this input to generate a list of tailored course suggestions.
*   Recommendations are displayed to the user.

## 4. Routing (App Router)

*   `/` (Home): Redirects to `/login` (if not authenticated) or `/courses` (if authenticated).
*   `/login`: Login page.
*   `/signup`: Signup page.
*   `/forgot-password`: Forgot password page.
*   `/courses`: Main course dashboard.
    *   Displays all available courses.
    *   Supports search functionality via query parameter (e.g., `/courses?search=python`).
*   `/courses/[courseId]`: Course detail page.
*   `/recommendations`: Personalized course recommendations page.
*   `/profile/change-password`: Page for logged-in users to change their password.

## 5. Styling & UI
*   **Theme:** Light theme with a beige background. Primary color is indigo, accent is purple. Dark mode variables are present but light mode is the focus.
*   **Layout:**
    *   Main application layout includes a Navbar and Footer.
    *   Authentication pages use a distinct `AuthLayout` with a background image.
*   **Responsiveness:** The application aims to be responsive using Tailwind CSS utility classes and component-specific adjustments.

## 6. Data Management
*   **Course Data:** Stored in Firestore collection named `courses`. Includes details like title, description, category, image URL, duration, level, and an array of `videoLectures` (each with id, title, videoUrl).
*   **User Authentication Data:** Managed by Firebase Authentication.
*   **User Video Progress & Completion:** Stored in Firestore collection `userVideoProgress`. Each document (keyed by `userId`) contains a `videoStates` map where each `videoId` maps to `{ currentTime, duration, completed }`.
*   **Static Assets:** Images like logos are stored in the `public/assets` directory.

## 7. Error Handling
*   Client-side forms include validation messages.
*   Toasts are used for success and error notifications for operations like login, signup, password change, and recommendation generation.
*   Alert components are used for more prominent error displays on pages (e.g., course loading errors).

## 8. Future Considerations / Potential Enhancements
*   Admin panel for course management.
*   More detailed user profiles.
*   Quizzes or assessments within courses.
*   User reviews and ratings for courses.
*   Directly upload and host video content via Cloud Storage for Firebase.
*   Advanced search and filtering for courses.
