# **App Name**: CourseHub

## Core Features:

- Email Login: Email/password login.
- Forgot Password: Provide link to the user by sending the reset link to the user email
- Google Login: Authenticate via Google account popup.
- Create Account: Account creation page for new users with password verification. Password requirements: 8+ characters, begins with _ or alphabet, at least one number, one special character, one lowercase letter, and one uppercase letter.
- Course Listing: Display a list of available courses after successful login and a enroll button below every course to the left of it.
- Personalized Recommendations: Use a generative AI tool to provide personalized course recommendations.

- My Courses Page: A dedicated page to display courses the user has enrolled in.
- Course Enrollment: Users can enroll in a course by clicking the "Enroll Now" button on the Course Card.
- Enroll Button State: The "Enroll Now" button text changes to "Enrolled!" after successful enrollment.
- Image Click Navigation: Clicking the course image on the Course Card navigates to the /courses page with the course ID as a query parameter.
- Card Content Click Navigation: Clicking the Course Card content (excluding the image and enroll button) navigates to a dynamic page displaying detailed information for that course (/courses/[courseId]).
## Style Guidelines:

- Primary color: Deep indigo (#3F51B5) for a sense of professionalism and trust.
- Background color: Very light indigo (#F0F2F9). It provides a subtle, clean backdrop that won't distract from the courses.
- Accent color: A vibrant purple (#9C27B0) to highlight key interactive elements. It's distinct from the primary, drawing user attention without overwhelming the design.
- Clean, sans-serif font for headers to ensure readability and a modern feel.
- Slightly smaller font size for body text to encourage engagement.
- Use minimalist, consistent icons for course categories to provide visual cues.
- Ensure a responsive design that adapts to different screen sizes and devices.
- Subtle transitions for loading new courses and displaying course details to enhance user experience.