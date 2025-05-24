import type { ReactNode } from "react";
import Image from "next/image";

const BACKGROUND_IMAGE_URL = "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzOTM5Njd8MHwxfHNlYXJjaHwyMnx8b25saW5lJTIwbGVhcm5pbmd8ZW58MHx8fHwxNzE3MTk0NzE4fDA&ixlib=rb-4.0.3&q=80&w=1080";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4 sm:p-6">
      <Image
        src={BACKGROUND_IMAGE_URL}
        alt="Person learning online at a desk with a laptop and notebook"
        layout="fill"
        objectFit="cover"
        className="-z-10"
        priority
      />
      <div className="mb-8 flex items-center space-x-3">
        <Image src="https://placehold.co/64x64.png" alt="CourseHub Logo" width={64} height={64} className="rounded-lg" data-ai-hint="books pens" />
        <h1 className="text-4xl font-bold text-primary">CourseHub</h1>
      </div>
      <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-xl sm:p-8">
        {children}
      </div>
      <p className="mt-8 text-center text-sm text-white drop-shadow-sm">
        Your journey to knowledge starts here.
      </p>
    </div>
  );
}
