
"use client";

import { signOut } from "firebase/auth";
import { LogOut, Menu, UserCircle, Search, KeyRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { auth } from "@/config/firebase";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
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
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const courseTitles = [
    "Introduction to Web Development",
    "Advanced Python Programming",
    "Data Science with R",
    "Digital Marketing Fundamentals",
    "UI/UX Design Principles",
    "Cloud Computing with AWS",
    "Java Programming",
    "n8n Automation",
  ];
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

  const handleChangePassword = () => {
    router.push('/profile/change-password');
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 0) {
      const filteredSuggestions = courseTitles.filter((title) =>
        title.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions(courseTitles); // Show all titles if query is empty but input is focused
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    router.push(`/courses?search=${encodeURIComponent(suggestion)}`);
  };

  const UserAvatar = () => (
    <Avatar className="h-8 w-8">
      {user?.photoURL ? (
        <AvatarImage src={user.photoURL} alt={user.displayName || user.email || "User"} />
      ) : null}
      <AvatarFallback>
        {user?.displayName
          ? user.displayName.charAt(0).toUpperCase()
          : user?.email
            ? user.email.charAt(0).toUpperCase()
            : <UserCircle size={20} />}
      </AvatarFallback>
    </Avatar>
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center px-4 md:px-6 gap-2">
          <Link href="/courses" className="flex items-center gap-2 rtl:space-x-reverse mr-4">
            <Image src="/assets/course-icon.png" alt="CourseHub Logo" width={100} height={50} className="rounded-md" />
            <span className="hidden text-xl font-bold text-primary sm:inline">CourseHub</span>
          </Link>

          <div className="hidden md:flex flex-1 justify-center">
            <div className="relative w-full max-w-md" ref={searchInputRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search courses..."
                className="w-full rounded-lg bg-card py-2 pl-10 pr-4 text-sm shadow-sm outline-none focus:ring-2 focus:ring-primary"
                value={searchQuery}
                onChange={handleSearchInputChange}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={(e) => e.key === 'Enter' && handleSelectSuggestion(searchQuery)}
              />
              {showSuggestions && (
                <div className="absolute z-20 mt-1 w-full rounded-md border bg-popover shadow-lg max-h-60 overflow-y-auto">
                  {suggestions.length > 0 ? (
                    suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 text-sm cursor-pointer hover:bg-muted"
                        onClick={() => handleSelectSuggestion(suggestion)}
                      >
                        {suggestion}
                      </div>
                    ))
                  ) : (
                    searchQuery.length > 0 && (
                      <p className="px-4 py-2 text-sm text-muted-foreground">
                        Course not available
                      </p>
                    )
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <nav className="flex items-center gap-2">
            </nav>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
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
                  <DropdownMenuItem onClick={handleChangePassword} className="cursor-pointer">
                    <KeyRound className="mr-2 h-4 w-4" />
                    <span>Change Password</span>
                  </DropdownMenuItem>
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
          </div>

          <div className="md:hidden flex-1 flex justify-end">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6"/>
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[260px] bg-card p-4 flex flex-col">
                <div className="mb-4 flex items-center space-x-2 rtl:space-x-reverse border-b pb-4">
                  <Image src="/assets/course-icon.png" alt="CourseHub Logo" width={80} height={50} className="rounded-md" />
                  <span className="text-lg font-bold text-primary">CourseHub</span>
                </div>

                <div className="relative mb-4" ref={!searchInputRef.current ? searchInputRef : undefined}>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="search"
                    placeholder="Search courses..."
                    className="w-full rounded-lg bg-background py-2 pl-10 pr-4 text-sm shadow-sm outline-none focus:ring-2 focus:ring-primary"
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSelectSuggestion(searchQuery);
                        setMobileMenuOpen(false);
                      }
                    }}
                  />
                   {showSuggestions && (
                    <div className="absolute z-20 mt-1 w-full rounded-md border bg-popover shadow-lg max-h-48 overflow-y-auto">
                      {suggestions.length > 0 ? (
                        suggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className="px-4 py-2 text-sm cursor-pointer hover:bg-muted"
                            onClick={() => { handleSelectSuggestion(suggestion); setMobileMenuOpen(false); }}
                          >
                            {suggestion}
                          </div>
                        ))
                      ) : (
                        searchQuery.length > 0 && (
                          <p className="px-4 py-2 text-sm text-muted-foreground">
                            Course not available
                          </p>
                        )
                      )}
                    </div>
                  )}
                </div>
                
                <nav className="flex flex-col space-y-1 flex-grow">
                </nav>

                {user && (
                  <div className="mt-auto border-t pt-4">
                     <div className="flex items-center gap-2 mb-3">
                        <UserAvatar />
                        <div className="flex flex-col">
                           <p className="text-sm font-medium leading-none">
                            {user.displayName || "User"}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                     </div>
                    <div
                      onClick={() => { handleChangePassword(); setMobileMenuOpen(false); }}
                      className="flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <KeyRound className="mr-2 h-4 w-4" />
                      <span>Change Password</span>
                    </div>
                    <div
                      onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                      className="flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors text-destructive hover:bg-destructive/10 hover:text-destructive mt-1"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </div>
                  </div>
                )}
                {!user && (
                   <div className="mt-auto border-t pt-4">
                    <Button asChild className="w-full" onClick={() => setMobileMenuOpen(false)}>
                      <Link href="/login">Sign In</Link>
                    </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}
