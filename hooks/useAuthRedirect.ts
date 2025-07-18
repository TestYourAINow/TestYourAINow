"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAuthRedirect(onReady?: () => void) {
  const router = useRouter();

  useEffect(() => {
    let isActive = true;

    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          cache: "no-store",
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok || !data.user) {
          router.replace("/login");
        } else if (isActive) {
          onReady?.(); // ✅ Ne l'appelle que si le composant est toujours monté
        }
      } catch {
        router.replace("/login");
      }
    };

    checkAuth();

    return () => {
      isActive = false;
    };
  }, [router, onReady]);
}
