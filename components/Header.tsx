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

  if (!isClient) return null;

  const displayName = session?.user?.name || session?.user?.email || "User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl bg-[#0A0A0B]/90 text-white border-b border-gray-700/30">
      {/* Gradient Orbs Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Premium Logo - Same as Sidebar */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            {/* Main Logo Container */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-blue-500/25">
              <Bot className="w-6 h-6 text-white transition-transform duration-300 group-hover:scale-110" />
            </div>
            {/* Active Dot */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0A0A0B] shadow-emerald-400/50 shadow-md animate-pulse"></div>
          </div>
          
          {/* Brand Text - Same as Sidebar */}
          <span className="text-xl font-bold whitespace-nowrap bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent transition-all duration-300 group-hover:from-blue-400 group-hover:to-cyan-400">
            TestYour<span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">AI</span> Now
          </span>
        </Link>

        {status === "authenticated" ? (
          <div className="relative" ref={dropdownRef}>
            {/* Premium User Button */}
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="flex items-center gap-3 bg-gray-900/60 backdrop-blur-xl text-white px-4 py-3 rounded-2xl border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 hover:bg-gray-800/60 group shadow-lg hover:shadow-blue-500/20"
            >
              {/* Enhanced Glow Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 transition-all duration-300 pointer-events-none"></div>
              
              {/* Premium Profile Photo - Same as Sidebar */}
              <div 
                className={`relative w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0 overflow-hidden border-2 border-gray-600/50 group-hover:border-blue-400/70 transition-all duration-300 shadow-lg ${localProfileImage ? '' : 'bg-gradient-to-r from-blue-600 to-cyan-600'}`}
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
              
              {/* Name */}
              <span className="font-semibold transition-colors duration-300 group-hover:text-blue-400 relative z-10">{displayName}</span>
              
              {/* Premium Chevron */}
              <ChevronDown
                className={`w-4 h-4 transition-all duration-300 text-blue-400 group-hover:text-cyan-400 relative z-10 ${
                  isMenuOpen ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>

            {/* Premium Dropdown */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-3 w-72 bg-gray-900/95 backdrop-blur-xl text-white rounded-2xl z-50 py-3 border border-gray-700/50 shadow-2xl shadow-black/50 overflow-hidden">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 pointer-events-none"></div>
                
                {/* Header */}
                <div className="relative px-6 py-4 border-b border-gray-700/50">
                  <div className="flex items-center gap-4">
                    {/* Large Profile Photo */}
                    <div
                      className={`w-12 h-12 text-white rounded-full flex items-center justify-center text-lg font-bold overflow-hidden border-2 border-gray-600/50 shadow-lg ${
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
                    
                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white text-base bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                        {session?.user?.name}
                      </div>
                      <div className="text-sm text-gray-400 truncate">
                        {session?.user?.email}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="relative py-2">
                  <Link
                    href="/agents"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-4 px-6 py-3 hover:bg-gray-800/50 transition-all duration-300 text-gray-300 hover:text-white group"
                  >
                    <div className="p-2 bg-gray-800/50 rounded-lg text-blue-400 group-hover:text-cyan-400 transition-colors">
                      <Grid2X2 className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Dashboard</span>
                  </Link>
                  
                  <Link
                    href="/billing"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-4 px-6 py-3 hover:bg-gray-800/50 transition-all duration-300 text-gray-300 hover:text-white group"
                  >
                    <div className="p-2 bg-gray-800/50 rounded-lg text-blue-400 group-hover:text-cyan-400 transition-colors">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Billing</span>
                  </Link>
                  
                  <Link
                    href="/account-settings"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-4 px-6 py-3 hover:bg-gray-800/50 transition-all duration-300 text-gray-300 hover:text-white group"
                  >
                    <div className="p-2 bg-gray-800/50 rounded-lg text-blue-400 group-hover:text-cyan-400 transition-colors">
                      <Settings className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Account Settings</span>
                  </Link>
                  
                  {/* Separator */}
                  <div className="border-t border-gray-700/50 my-2 mx-6" />
                  
                  {/* Logout */}
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      signOut();
                    }}
                    className="flex w-full items-center gap-4 px-6 py-3 text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-all duration-300 group"
                  >
                    <div className="p-2 bg-red-900/20 rounded-lg text-red-400 group-hover:text-red-300 transition-colors">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-4">
            {/* Sign In Button */}
            <Link
              href="/login"
              className="relative px-6 py-3 bg-gray-900/60 backdrop-blur-xl text-white rounded-2xl border border-gray-700/50 hover:border-blue-500/50 font-medium transition-all duration-300 hover:bg-gray-800/60 group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 transition-all duration-300 pointer-events-none"></div>
              <span className="relative z-10">Sign in</span>
            </Link>
            
            {/* Start Now Button */}
            <Link
              href="/signup"
              className="relative px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-2xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 group overflow-hidden"
            >
              {/* Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <span className="relative z-10">Start Now</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}