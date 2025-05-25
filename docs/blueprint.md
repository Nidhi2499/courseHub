# CourseHub Blueprint

This document outlines the tech stack, features, and design choices for the CourseHub application.

## Technology Stack

*   **Frontend Framework:** Next.js (with App Router)
*   **UI Components:** React, ShadCN UI
*   **Styling:** Tailwind CSS
*   **Generative AI:** Genkit (for AI-powered features like course recommendations)
*   **Authentication:** Firebase Authentication
*   **Database:** Cloud Firestore (for storing course data)
*   **Deployment:** Firebase Hosting (implied, common for Firebase projects)

## Key Features

### User Authentication
*   Sign Up with Email/Password
*   Login with Email/Password
*   Login with Google
*   Forgot Password (Email Reset)
*   Change Password (for authenticated users)

### Course Management & Display
*   **Course Dashboard:** Displays all available courses fetched from Firestore.
    *   Each course is presented as a clickable card leading to its detail page.
    *   Course cards show title, category, level, description, duration, and an image.
*   **Course Detail Page:**
    *   Displays detailed information about a specific course.
    *   Includes a video player for viewing course lectures.
    *   Lists video lectures in a sidebar, allowing users to select different videos.

### Video Player Functionality
*   **Custom Controls:** The video player features a custom control bar that appears on hover.
*   **Play/Pause:** Toggle video playback.
*   **Rewind:** A "Rewind 10s" button.
*   **Mute/Unmute:** Toggle audio.
*   **Playback Speed Control:** Options for 0.5x, 1x, and 1.5x speeds.
*   **Fullscreen Toggle:** Allows users to view the video in fullscreen mode.
*   **Autoplay Next Video:** When a video finishes, the next video in the playlist starts automatically after a 10-second countdown.
*   **Mark Video as Completed:** Videos are marked as completed in the playlist sidebar after they finish playing.

*   **Video Progress Bar/Seeking (Not Implemented):**
    *   Currently, the custom video player **does not include a visual progress bar or scrubber**.
    *   **Consequence:** Users cannot directly click or drag on a timeline to jump to specific points within the video. Video navigation is primarily through sequential playback, using the "Rewind 10s" button, or re-selecting a video from the playlist (which typically starts it from the beginning).
    *   **Rationale/Current State:** The absence of a progress bar means users are encouraged to watch videos more linearly. The underlying HTML5 video element supports seeking (`videoRef.current.currentTime`), which is used by the rewind button, but a user-facing draggable progress bar is not part of the current custom controls. This could be a design choice or a feature planned for future implementation.

### Personalized Recommendations (AI-Powered)
*   A dedicated page where users can input their interests and learning history.
*   Genkit AI flow processes this input to provide personalized course recommendations.

### User Profile Management
*   Authenticated users can navigate to a page to change their password.

## Responsiveness
*   The application is designed to be responsive, adapting to various screen sizes using Tailwind CSS and responsive component design.

## Navigation
*   Navbar with a link to "Courses", a search bar.
*   User avatar dropdown with options for "Change Password" and "Log out."
*   Mobile-responsive navigation with a sheet menu.

## Styling
*   Customizable theme using CSS variables in `src/app/globals.css`.
*   Utilizes ShadCN UI components for a consistent and modern look and feel.
