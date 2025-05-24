import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { EnrolledCoursesProvider } from "@/contexts/EnrolledCoursesContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "CourseHub",
  description: "Your personalized learning platform.",
  icons: {
    icon: '/assets/course icon.webp',

  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <EnrolledCoursesProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} font-sans antialiased`}>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </body>
      </html>
    </EnrolledCoursesProvider>
  );
}
