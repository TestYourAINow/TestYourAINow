"use client";

import Link from "next/link";
import Image from "next/image"; // 👈 Import pour le logo
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import {
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
    <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-[#08080a]/80 text-white border-b border-white/50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* 👇 Logo + Brand text */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Logo"
            width={32}
            height={32}
            className="w-8 h-8 object-contain"
          />
          <span className="text-lg font-bold tracking-tight">
            TestYour
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              AI
            </span>{" "}
            Now
          </span>
        </Link>

        {status === "authenticated" ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              <div
                className={`w-7 h-7 text-white rounded-full flex items-center justify-center text-sm font-bold overflow-hidden border-2 border-white/30 ${
                  localProfileImage ? "" : "bg-gradient-to-r from-blue-400 to-cyan-400"
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
              <span>{displayName}</span>
              <ChevronDown
                className={`w-4 h-4 transform transition-transform duration-200 ${
                  isMenuOpen ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-[#1a1a1d] text-white rounded-2xl z-50 py-2 ring-1 ring-white/10 shadow-xl">
                <div className="px-4 py-3 border-b border-white/10 text-sm text-gray-400">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-9 h-9 text-white rounded-full flex items-center justify-center text-sm font-bold overflow-hidden border-2 border-white/30 ${
                        localProfileImage ? "" : "bg-gradient-to-r from-blue-400 to-cyan-400"
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
                    <div>
                      <div className="font-semibold text-white">{session?.user?.name}</div>
                      <div className="text-xs text-gray-400">{session?.user?.email}</div>
                    </div>
                  </div>
                </div>
                <Link
                  href="/agents"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-[#2a2a2e] transition-all duration-300 text-sm"
                >
                  <Grid2X2 className="w-4 h-4 text-gray-400" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/billing"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-[#2a2a2e] transition-all duration-300 text-sm"
                >
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <span>Billing</span>
                </Link>
                <Link
                  href="/account-settings"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-[#2a2a2e] transition-all duration-300 text-sm"
                >
                  <Settings className="w-4 h-4 text-gray-400" />
                  <span>Account Settings</span>
                </Link>
                <div className="border-t border-white/10 my-1" />
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    signOut();
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-800/30 hover:text-white transition-all duration-300 text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium bg-white/10 text-white rounded-2xl px-6 py-2 border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-400 hover:to-cyan-300 text-white rounded-2xl px-6 py-2 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
            >
              Start Now
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
