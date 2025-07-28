"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState(""); // email OR username
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);

    if (!identifier || !password) {
      setError("Please enter both identifier and password.");
      setIsLoading(false);
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
    
    setIsLoading(false);
  };

  return (
    <div 
      className="min-h-screen text-white flex items-center justify-center px-4 pt-20 relative overflow-hidden"
      style={{
        background: `
          linear-gradient(to right, rgba(59, 130, 246, 0.03) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(59, 130, 246, 0.03) 1px, transparent 1px),
          radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(6, 182, 212, 0.08) 0%, transparent 50%),
          radial-gradient(circle at 40% 70%, rgba(168, 85, 247, 0.05) 0%, transparent 50%),
          linear-gradient(135deg, #0a0a0b 0%, #111827 25%, #1f2937 50%, #111827 75%, #0a0a0b 100%)
        `,
        backgroundSize: '40px 40px, 40px 40px, 800px 800px, 600px 600px, 400px 400px, 100% 100%',
        animation: 'premiumFloat 25s ease-in-out infinite'
      }}
    >
      {/* Orbes animés comme le hero */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-600/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
        <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-emerald-600/4 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '6s' }} />
        <div className="absolute bottom-1/3 left-1/6 w-72 h-72 bg-pink-600/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '8s' }} />
      </div>
      <div className="relative z-10 w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl mb-6 shadow-2xl shadow-blue-500/25">
            <LogIn size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
            Welcome back
          </h1>
          <p className="text-gray-400 text-lg">Sign in to your TestYourAI account</p>
        </div>

        {/* Login Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
            <div className="space-y-5">
              {/* Email/Username Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email or Username
                </label>
                <input
                  type="text"
                  placeholder="Enter your email or username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400 font-medium backdrop-blur-sm"
                  disabled={isLoading}
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3.5 pr-12 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400 font-medium backdrop-blur-sm"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 backdrop-blur-sm">
                  <p className="text-red-400 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full group relative px-4 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-gray-700 disabled:to-gray-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed overflow-hidden"
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                
                <div className="relative flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <LogIn size={20} />
                      <span>Sign In</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-400">
            Don't have an account?{" "}
            <Link 
              href="/signup" 
              className="text-blue-400 font-semibold hover:text-blue-300 transition-colors relative group"
            >
              Create Account
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}