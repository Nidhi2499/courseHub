import type { ReactNode } from "react";
import Image from "next/image";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6">
      <div className="mb-8 flex items-center space-x-3">
        <Image src="https://placehold.co/64x64.png" alt="CourseHub Logo" width={64} height={64} className="rounded-lg" data-ai-hint="logo education" />
        <h1 className="text-4xl font-bold text-primary">CourseHub</h1>
      </div>
      <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-xl sm:p-8">
        {children}
      </div>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Your journey to knowledge starts here.
      </p>
    </div>
  );
}
