"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import clsx from "clsx";

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Password validation rules
  const passwordRules = [
    { label: "Contains at least 1 lowercase letter", valid: /[a-z]/.test(password) },
    { label: "Contains at least 1 uppercase letter", valid: /[A-Z]/.test(password) },
    { label: "Contains at least 1 number", valid: /\d/.test(password) },
    { label: "Contains at least 1 special character", valid: /[^A-Za-z0-9]/.test(password) },
    { label: "Is at least 8 characters long", valid: password.length >= 8 },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validation
    if (!password || !confirmPassword) {
      setError("Please fill in all fields.");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      setIsLoading(false);
      return;
    }

    const validations = passwordRules.map((rule) => rule.valid);
    if (!validations.every(Boolean)) {
      setError("Password doesn't meet the required security criteria.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-600/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
        <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-emerald-600/4 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '6s' }} />
        <div className="absolute bottom-1/3 left-1/6 w-72 h-72 bg-pink-600/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '8s' }} />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {!success ? (
          <>
            {/* Header Section */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-400 rounded-2xl mb-6 shadow-2xl shadow-purple-500/25">
                <Lock size={32} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent">
                Reset your password
              </h1>
              <p className="text-gray-400 text-lg">Choose a new secure password for your account.</p>
            </div>

            {/* Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
                <div className="space-y-5">
                  {/* New Password Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3.5 pr-12 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all placeholder-gray-400 font-medium backdrop-blur-sm"
                        disabled={isLoading}
                        autoComplete="new-password"
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

                  {/* Confirm Password Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3.5 pr-12 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all placeholder-gray-400 font-medium backdrop-blur-sm"
                        disabled={isLoading}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* Password Match Indicator */}
                  {confirmPassword && (
                    <div className={clsx(
                      "flex items-center gap-2 text-sm font-medium transition-all",
                      password === confirmPassword ? "text-emerald-400" : "text-red-400"
                    )}>
                      {password === confirmPassword ? (
                        <>
                          <CheckCircle size={16} />
                          <span>Passwords match</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={16} />
                          <span>Passwords don't match</span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 backdrop-blur-sm">
                      <p className="text-red-400 text-sm font-medium flex items-center gap-2">
                        <AlertCircle size={16} />
                        {error}
                      </p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full group relative px-4 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-700 disabled:to-gray-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/25 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed overflow-hidden"
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    
                    <div className="relative flex items-center justify-center gap-2">
                      {isLoading ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          <span>Resetting Password...</span>
                        </>
                      ) : (
                        <>
                          <Lock size={20} />
                          <span>Reset Password</span>
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              {password && (
                <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                    <Lock size={16} />
                    Password Requirements
                  </h3>
                  <div className="grid gap-3">
                    {passwordRules.map((rule, idx) => (
                      <div
                        key={idx}
                        className={clsx(
                          "flex items-center gap-3 text-sm transition-all duration-200",
                          rule.valid ? "text-emerald-400" : "text-gray-500"
                        )}
                      >
                        <div
                          className={clsx(
                            "w-5 h-5 flex items-center justify-center rounded-full border transition-all duration-200",
                            rule.valid 
                              ? "border-emerald-400 bg-emerald-400 text-black shadow-lg shadow-emerald-400/20" 
                              : "border-gray-600 bg-transparent"
                          )}
                        >
                          <CheckCircle size={12} className={rule.valid ? "text-black" : "text-transparent"} />
                        </div>
                        <span className="font-medium">{rule.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </form>

            {/* Back to Login */}
            <div className="text-center mt-8">
              <Link 
                href="/login" 
                className="text-gray-400 hover:text-white transition-colors font-medium"
              >
                Remember your password?{" "}
                <span className="text-purple-400 hover:text-purple-300">Sign in</span>
              </Link>
            </div>
          </>
        ) : (
          /* Success Message */
          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-green-400/20 rounded-full border border-emerald-500/30">
                <CheckCircle size={40} className="text-emerald-400" />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">Password Reset Successful!</h2>
                <p className="text-gray-300 mb-4">
                  Your password has been successfully reset.
                </p>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-blue-300 text-sm">
                  🎉 You can now login with your new password
                </p>
              </div>

              <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/30">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Loader2 size={20} className="animate-spin text-blue-400" />
                  <span className="text-gray-300 font-medium">Redirecting to login...</span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-pink-400 rounded-full animate-pulse"></div>
                </div>
              </div>

              <Link
                href="/login"
                className="block w-full px-4 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/25"
              >
                Go to Login Now
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}