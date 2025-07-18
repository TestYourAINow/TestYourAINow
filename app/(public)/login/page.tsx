"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState(""); // email OR username
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/agents");
    }
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!identifier || !password) {
      setError("Please enter both identifier and password.");
      return;
    }

    const res = await signIn("credentials", {
      redirect: false,
      identifier,
      password,
    });

    if (res?.error) {
      setError(res.error);
    } else {
      router.push("/agents");
    }
  };

  return (
    <div className="min-h-screen bg-grid bg-[#09090b] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">
            Welcome <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">back</span>
          </h1>
          <p className="text-gray-400">Sign in to your account</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Email or Username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full rounded-2xl bg-[#1a1a1a] border border-gray-700 px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl bg-[#1a1a1a] border border-gray-700 px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
          />

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-400 hover:to-cyan-300 text-white py-3 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
          >
            Sign In
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link href="/signup" className="text-blue-400 font-medium hover:text-blue-300 transition-colors">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}