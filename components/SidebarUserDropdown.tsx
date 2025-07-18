"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { ChevronUp, LogOut, Settings, User, CreditCard, BarChart3 } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

export default function SidebarUserDropdown({ collapsed }: { collapsed: boolean }) {
  const { data: session, update } = useSession();
  const [localProfileImage, setLocalProfileImage] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Écouter les changements de session pour mettre à jour l'image
  useEffect(() => {
    setLocalProfileImage(session?.user?.profileImage || null);
  }, [session?.user?.profileImage]);

  // Fonction pour forcer la mise à jour de la session
  const refreshSession = async () => {
    await update(); // Force le refresh de la session depuis la DB
  };

  // Écouter les événements personnalisés de mise à jour d'avatar
  useEffect(() => {
    const handleAvatarUpdate = (event: CustomEvent) => {
      setLocalProfileImage(event.detail.profileImage);
      refreshSession(); // Optionnel : refresh aussi la session
    };

    window.addEventListener('profileImageUpdated', handleAvatarUpdate as EventListener);
    
    return () => {
      window.removeEventListener('profileImageUpdated', handleAvatarUpdate as EventListener);
    };
  }, []);

  const userInitial = session?.user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-700/50 border border-gray-600 hover:bg-gray-600/50 hover:border-gray-500 text-white transition-all duration-300 hover:shadow-lg"
      >
        {/* Photo de profil ou initiale */}
        <div className={`w-9 h-9 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0 shadow-lg overflow-hidden border-2 border-gray-500/50 ${localProfileImage ? '' : 'bg-blue-600'}`}>
          {localProfileImage ? (
            <img 
              src={localProfileImage} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          ) : (
            userInitial
          )}
        </div>
        {!collapsed && (
          <>
            <span className="flex-1 text-sm truncate text-gray-300">{session?.user?.name}</span>
            <ChevronUp
              className={clsx("w-4 h-4 transition-transform text-blue-400", isOpen ? "rotate-180" : "rotate-0")}
            />
          </>
        )}
      </button>

      {isOpen && (
        <div
          className={clsx(
            "absolute z-50 rounded-xl shadow-2xl text-sm border",
            collapsed
              ? "left-full top-1/2 -translate-y-[calc(100%+12px)] ml-3 w-56 bg-gradient-to-br from-gray-800 to-gray-900 border-gray-600 py-2"
              : "bottom-full mb-2 left-0 w-full bg-gradient-to-br from-gray-800 to-gray-900 border-gray-600 py-2"
          )}
        >
          {/* Header du dropdown avec photo de profil plus grande */}
          <div className="px-4 py-3 border-b border-gray-600 mb-2">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0 shadow-lg overflow-hidden border-2 border-gray-500/50 ${localProfileImage ? '' : 'bg-blue-600'}`}>
                {localProfileImage ? (
                  <img 
                    src={localProfileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  userInitial
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">
                  {session?.user?.name || 'User'}
                </p>
                <p className="text-gray-400 text-xs truncate">
                  {session?.user?.email}
                </p>
              </div>
            </div>
          </div>

          {session?.user?.isSubscribed && (
            <>
              <Link
                href="/account-settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-700/50 transition-all duration-200 text-gray-300 hover:text-white rounded-lg mx-2"
              >
                <Settings className="w-4 h-4 text-blue-400" />
                Account Settings
              </Link>
            </>
          )}

          {session?.user?.stripeCustomerId && (
            <Link
              href="/billing"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-700/50 transition-all duration-200 text-gray-300 hover:text-white rounded-lg mx-2"
            >
              <CreditCard className="w-4 h-4 text-blue-400" />
              Billing
            </Link>
          )}

          <div className="border-t border-gray-600 my-2 mx-2" />

          <button
            onClick={() => {
              setIsOpen(false);
              signOut();
            }}
            className="flex items-center gap-3 w-full text-left px-4 py-3 text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-all duration-200 rounded-lg mx-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}