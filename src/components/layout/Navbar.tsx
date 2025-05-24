"use client";

import { signOut } from "firebase/auth";
import { BookOpen, LogOut, Menu, Sparkles, UserCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { auth } from "@/config/firebase";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ElementType;
  currentPath: string;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ href, label, icon: Icon, currentPath, onClick }) => (
  <Link href={href} legacyBehavior passHref>
    <a
      onClick={onClick}
      className={cn(
        "flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary",
        currentPath === href ? "bg-primary/10 text-primary" : "text-foreground/70"
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </a>
  </Link>
);

export default function Navbar() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast({ title: "Logout Failed", description: "Could not log you out. Please try again.", variant: "destructive" });
    }
  };

  const navItems = [
    { href: "/courses", label: "Courses", icon: BookOpen },
    { href: "/recommendations", label: "Recommendations", icon: Sparkles },
  ];

  const UserAvatar = () => (
    <Avatar className="h-8 w-8">
      {user?.photoURL ? (
        <AvatarImage src={user.photoURL} alt={user.displayName || user.email || "User"} />
      ) : null}
      <AvatarFallback>
        {user?.displayName ? user.displayName.charAt(0).toUpperCase() : <UserCircle size={20} />}
      </AvatarFallback>
    </Avatar>
  );

  return (
 <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-[15px]">
        <Link href="/courses" className="flex items-center space-x-2 rtl:space-x-reverse">
          <Image src="/src/assets/course-icon.png" alt="CourseHub Logo" width={40} height={40} className="rounded-md" />
          <span className="text-xl font-bold text-primary">CourseHub</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center space-x-4 md:flex">
          {navItems.map((item) => (
            <NavItem key={item.href} {...item} currentPath={pathname} />
          ))}
        </nav>

        <div className="flex items-center space-x-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <UserAvatar />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.displayName || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link href="/login">Sign In</Link>
            </Button>
          )}

          {/* Mobile Menu Trigger */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6"/>
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[240px] bg-card p-4">
                <div className="mb-4 flex items-center space-x-2 rtl:space-x-reverse">
 <Image src="/src/assets/course-icon.png" alt="CourseHub Logo" width={32} height={32} className="rounded-md" />
                   <span className="text-lg font-bold text-primary">CourseHub</span>
 </div>
                <nav className="flex flex-col space-y-2">
                  {navItems.map((item) => (
                    <NavItem key={item.href} {...item} currentPath={pathname} onClick={() => setMobileMenuOpen(false)} />
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
