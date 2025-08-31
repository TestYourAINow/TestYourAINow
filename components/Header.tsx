"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Grid2X2,
  CreditCard,
  Settings,
  LogOut,
  ChevronDown,
  Loader2,
  Menu,
  X,
} from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const { data: session, status, update } = useSession();
  const [isClient, setIsClient] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [localProfileImage, setLocalProfileImage] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setLocalProfileImage(session?.user?.profileImage || null);
  }, [session?.user?.profileImage]);

  const refreshSession = async () => {
    await update();
  };

  useEffect(() => {
    const handleAvatarUpdate = (event: CustomEvent) => {
      setLocalProfileImage(event.detail.profileImage);
      refreshSession();
    };

    window.addEventListener("profileImageUpdated", handleAvatarUpdate as EventListener);

    return () => {
      window.removeEventListener("profileImageUpdated", handleAvatarUpdate as EventListener);
    };
  }, []);

  // Loading state pendant que NextAuth vérifie la session
  if (!isClient || status === "loading") {
    return (
      <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl bg-[#0A0A0B]/90 text-white border-b border-gray-700/30">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-20 h-20 sm:w-40 sm:h-40 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -top-20 -right-20 w-20 h-20 sm:w-40 sm:h-40 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          {/* Logo - Plus petit sur mobile */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="relative">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-blue-500/25">
                <Bot className="w-4 h-4 sm:w-6 sm:h-6 text-white transition-transform duration-300 group-hover:scale-110" />
              </div>
              <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-emerald-400 rounded-full border border-[#0A0A0B] shadow-emerald-400/50 shadow-md animate-pulse"></div>
            </div>
            
            <span className="text-lg sm:text-xl font-bold whitespace-nowrap bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent transition-all duration-300 group-hover:from-blue-400 group-hover:to-cyan-400">
              TestYour<span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">AI</span> Now
            </span>
          </Link>

          {/* Loading State Compact pour Mobile */}
          <div className="flex items-center gap-2 sm:gap-3 bg-gray-900/60 backdrop-blur-xl px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl border border-gray-700/50 animate-fade-in">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-600/50 to-cyan-600/50 rounded-full flex items-center justify-center">
              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 text-white animate-spin" />
            </div>
            <div className="h-3 w-12 sm:h-4 sm:w-20 bg-gray-700/50 rounded animate-pulse"></div>
            <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 opacity-50" />
          </div>
        </div>
      </header>
    );
  }

  const displayName = session?.user?.name || session?.user?.email || "User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl bg-[#0A0A0B]/90 text-white border-b border-gray-700/30">
      {/* Gradient Orbs Background - Responsive */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-20 h-20 sm:w-40 sm:h-40 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -top-20 -right-20 w-20 h-20 sm:w-40 sm:h-40 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        {/* Logo - Responsive */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
          <div className="relative">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-blue-500/25">
              <Bot className="w-4 h-4 sm:w-6 sm:h-6 text-white transition-transform duration-300 group-hover:scale-110" />
            </div>
            <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-emerald-400 rounded-full border border-[#0A0A0B] shadow-emerald-400/50 shadow-md animate-pulse"></div>
          </div>
          
          <span className="text-lg sm:text-xl font-bold whitespace-nowrap bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent transition-all duration-300 group-hover:from-blue-400 group-hover:to-cyan-400">
            TestYour<span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">AI</span> Now
          </span>
        </Link>

        {status === "authenticated" ? (
          <div className="relative animate-fade-in" ref={dropdownRef}>
            {/* User Button - Mobile Optimized */}
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 sm:gap-3 bg-gray-900/60 backdrop-blur-xl text-white px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 hover:bg-gray-800/60 group shadow-lg hover:shadow-blue-500/20"
            >
              <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 transition-all duration-300 pointer-events-none"></div>
              
              {/* Profile Photo - Responsive */}
              <div 
                className={`relative w-6 h-6 sm:w-8 sm:h-8 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shrink-0 overflow-hidden border-2 border-gray-600/50 group-hover:border-blue-400/70 transition-all duration-300 shadow-lg ${localProfileImage ? '' : 'bg-gradient-to-r from-blue-600 to-cyan-600'}`}
              >
                {localProfileImage ? (
                  <img
                    src={localProfileImage}
                    alt="Profile"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <span className="transition-transform duration-300 group-hover:scale-110">{initial}</span>
                )}
              </div>
              
{/* Name - Show on small screens and up, truncate only on small */}
<span className="hidden sm:block font-semibold transition-colors duration-300 group-hover:text-blue-400 relative z-10 text-sm sm:text-base max-w-24 sm:max-w-none truncate sm:whitespace-nowrap sm:overflow-visible">
  {displayName}
</span>
              
              {/* Chevron */}
              <ChevronDown
                className={`w-3 h-3 sm:w-4 sm:h-4 transition-all duration-300 text-blue-400 group-hover:text-cyan-400 relative z-10 ${
                  isMenuOpen ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>

            {/* Dropdown - Mobile Optimized */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 sm:mt-3 w-64 sm:w-72 bg-gray-900/95 backdrop-blur-xl text-white rounded-xl sm:rounded-2xl z-50 py-2 sm:py-3 border border-gray-700/50 shadow-2xl shadow-black/50 overflow-hidden animate-fade-in">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 pointer-events-none"></div>
                
                {/* Header - Compact sur mobile */}
                <div className="relative px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-700/50">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 text-white rounded-full flex items-center justify-center text-base sm:text-lg font-bold overflow-hidden border-2 border-gray-600/50 shadow-lg ${
                        localProfileImage ? "" : "bg-gradient-to-r from-blue-600 to-cyan-600"
                      }`}
                    >
                      {localProfileImage ? (
                        <img
                          src={localProfileImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        initial
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white text-sm sm:text-base bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent truncate">
                        {session?.user?.name}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-400 truncate">
                        {session?.user?.email}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menu Items - Compact sur mobile */}
                <div className="relative py-1 sm:py-2">
                  <Link
                    href="/agents"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-2.5 sm:py-3 hover:bg-gray-800/50 transition-all duration-300 text-gray-300 hover:text-white group"
                  >
                    <div className="p-1.5 sm:p-2 bg-gray-800/50 rounded-lg text-blue-400 group-hover:text-cyan-400 transition-colors">
                      <Grid2X2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <span className="font-medium text-sm sm:text-base">Dashboard</span>
                  </Link>
                  
                  <Link
                    href="/billing"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-2.5 sm:py-3 hover:bg-gray-800/50 transition-all duration-300 text-gray-300 hover:text-white group"
                  >
                    <div className="p-1.5 sm:p-2 bg-gray-800/50 rounded-lg text-blue-400 group-hover:text-cyan-400 transition-colors">
                      <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <span className="font-medium text-sm sm:text-base">Billing</span>
                  </Link>
                  
                  <Link
                    href="/account-settings"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-2.5 sm:py-3 hover:bg-gray-800/50 transition-all duration-300 text-gray-300 hover:text-white group"
                  >
                    <div className="p-1.5 sm:p-2 bg-gray-800/50 rounded-lg text-blue-400 group-hover:text-cyan-400 transition-colors">
                      <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <span className="font-medium text-sm sm:text-base">Account Settings</span>
                  </Link>
                  
                  <div className="border-t border-gray-700/50 my-1.5 sm:my-2 mx-4 sm:mx-6" />
                  
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      signOut();
                    }}
                    className="flex w-full items-center gap-3 sm:gap-4 px-4 sm:px-6 py-2.5 sm:py-3 text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-all duration-300 group"
                  >
                    <div className="p-1.5 sm:p-2 bg-red-900/20 rounded-lg text-red-400 group-hover:text-red-300 transition-colors">
                      <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <span className="font-medium text-sm sm:text-base">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-4 animate-fade-in">
            {/* Sign In - Mobile Compact */}
            <Link
              href="/login"
              className="relative px-3 sm:px-6 py-2 sm:py-3 bg-gray-900/60 backdrop-blur-xl text-white rounded-xl sm:rounded-2xl border border-gray-700/50 hover:border-blue-500/50 font-medium transition-all duration-300 hover:bg-gray-800/60 group overflow-hidden text-sm sm:text-base"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 transition-all duration-300 pointer-events-none"></div>
              <span className="relative z-10">Sign in</span>
            </Link>
            
            {/* Start Now */}
            <Link
              href="/signup"
              className="relative px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl sm:rounded-2xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 group overflow-hidden text-sm sm:text-base"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <span className="relative z-10">Start Now</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}