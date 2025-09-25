"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CheckCircle, XCircle, Eye, EyeOff, UserPlus, Loader2, Mail, User, Lock } from "lucide-react";
import clsx from "clsx";
import { signIn } from "next-auth/react";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const rules = [
    { label: "Contains at least 1 lowercase letter", valid: /[a-z]/.test(password) },
    { label: "Contains at least 1 uppercase letter", valid: /[A-Z]/.test(password) },
    { label: "Contains at least 1 number", valid: /\d/.test(password) },
    { label: "Contains at least 1 special character", valid: /[^A-Za-z0-9]/.test(password) },
    { label: "Is at least 8 characters long", valid: password.length >= 8 },
  ];

  const checkUsername = async () => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    try {
      const res = await fetch(`/api/users/check-username?username=${encodeURIComponent(username)}`);
      const data = await res.json();
      setUsernameAvailable(data.available);
    } catch {
      setUsernameAvailable(null);
    }
  };

  const checkEmail = async () => {
    if (!email || !isValidEmail(email)) {
      setEmailAvailable(null);
      return;
    }

    try {
      const res = await fetch(`/api/users/check-email?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      setEmailAvailable(data.available);
    } catch {
      setEmailAvailable(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!username || !email || !confirmEmail || !password || !confirm) {
      setError("Please fill in all fields.");
      setIsLoading(false);
      return;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters.");
      setIsLoading(false);
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email.");
      setIsLoading(false);
      return;
    }

    if (email !== confirmEmail) {
      setError("Email addresses do not match.");
      setIsLoading(false);
      return;
    }

    if (usernameAvailable === false) {
      setError("Username is already taken.");
      setIsLoading(false);
      return;
    }

    if (emailAvailable === false) {
      setError("Email is already registered.");
      setIsLoading(false);
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    const validations = rules.map((rule) => rule.valid);
    if (!validations.every(Boolean)) {
      setError("Password doesn't meet the required rules.");
      setIsLoading(false);
      return;
    }

    try {
      console.log("🔍 Création du compte pour:", email);
      
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("❌ Erreur création compte:", data);
        if (data.field === "email") setEmailAvailable(false);
        if (data.field === "username") setUsernameAvailable(false);
        setError(data.error || "Something went wrong.");
        setIsLoading(false);
        return;
      }

      console.log("✅ Compte créé, tentative de connexion...");

      const loginRes = await signIn("credentials", {
        identifier: email,
        password,
        redirect: false,
      });

      if (loginRes?.error) {
        console.error("❌ Erreur connexion:", loginRes.error);
        setError("Account created but login failed.");
        setIsLoading(false);
        return;
      }

      console.log("✅ Connexion réussie, tentative de checkout pour:", email);

      const checkoutRes = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }), // S'assurer que l'email est bien envoyé
      });

      if (!checkoutRes.ok) {
        const errorData = await checkoutRes.json();
        console.error("❌ Erreur checkout:", errorData);
        setError(`Checkout error: ${errorData.error || 'Unknown error'}`);
        setIsLoading(false);
        return;
      }

      const checkoutData = await checkoutRes.json();
      console.log("✅ Réponse checkout:", checkoutData);
      
      const { url } = checkoutData;

      if (url) {
        console.log("🔄 Redirection vers Stripe:", url);
        router.push(url);
      } else {
        console.error("❌ Pas d'URL dans la réponse checkout");
        setError("Unable to start checkout - no URL received.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("❌ Erreur générale:", error);
      setError("Server error. Please try again later.");
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen text-white flex items-center justify-center px-4 py-8 pt-32 relative overflow-hidden"
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
      <div className="relative z-10 w-full max-w-lg">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl mb-6 shadow-2xl shadow-blue-500/25">
            <UserPlus size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
            Create your account
          </h1>
          <p className="text-gray-400 text-lg">Start building AI agents today</p>
        </div>

        {/* Signup Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
            <div className="space-y-5">
              {/* Username Input */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <User size={16} />
                  Username
                </label>
                <input
                  type="text"
                  placeholder="Choose a unique username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onBlur={checkUsername}
                  disabled={isLoading}
                  className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400 font-medium backdrop-blur-sm"
                />
                {username && username.length < 3 && (
                  <p className="text-red-400 text-sm flex items-center gap-2 mt-2 font-medium">
                    <XCircle size={16} /> Username must be at least 3 characters
                  </p>
                )}
                {username && username.length >= 3 && usernameAvailable === true && (
                  <p className="text-emerald-400 text-sm flex items-center gap-2 mt-2 font-medium">
                    <CheckCircle size={16} /> Username available
                  </p>
                )}
                {username && username.length >= 3 && usernameAvailable === false && (
                  <p className="text-red-400 text-sm flex items-center gap-2 mt-2 font-medium">
                    <XCircle size={16} /> Username already taken
                  </p>
                )}
              </div>

              {/* Email Input */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <Mail size={16} />
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={checkEmail}
                  disabled={isLoading}
                  className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400 font-medium backdrop-blur-sm"
                />
                {email && !isValidEmail(email) && (
                  <p className="text-red-400 text-sm flex items-center gap-2 mt-2 font-medium">
                    <XCircle size={16} /> Invalid email format
                  </p>
                )}
                {email && isValidEmail(email) && emailAvailable === true && (
                  <p className="text-emerald-400 text-sm flex items-center gap-2 mt-2 font-medium">
                    <CheckCircle size={16} /> Email available
                  </p>
                )}
                {email && isValidEmail(email) && emailAvailable === false && (
                  <p className="text-red-400 text-sm flex items-center gap-2 mt-2 font-medium">
                    <XCircle size={16} /> Email already registered
                  </p>
                )}
              </div>

              {/* Confirm Email Input */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <Mail size={16} />
                  Confirm Email
                </label>
                <input
                  type="email"
                  placeholder="Confirm your email address"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400 font-medium backdrop-blur-sm"
                />
                {confirmEmail && email !== confirmEmail && (
                  <p className="text-red-400 text-sm flex items-center gap-2 mt-2 font-medium">
                    <XCircle size={16} /> Email addresses do not match
                  </p>
                )}
                {confirmEmail && email === confirmEmail && email && (
                  <p className="text-emerald-400 text-sm flex items-center gap-2 mt-2 font-medium">
                    <CheckCircle size={16} /> Emails match
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <Lock size={16} />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-4 py-3.5 pr-12 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400 font-medium backdrop-blur-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <Lock size={16} />
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-4 py-3.5 pr-12 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400 font-medium backdrop-blur-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
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
                {rules.map((rule, idx) => (
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
                      <Check size={12} className={rule.valid ? "text-black" : "text-transparent"} />
                    </div>
                    <span className="font-medium">{rule.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-red-400 text-sm font-medium flex items-center gap-2">
                <XCircle size={16} />
                {error}
              </p>
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  <span>Create Account</span>
                </>
              )}
            </div>
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-400">
            Already have an account?{" "}
            <Link 
              href="/login" 
              className="text-blue-400 font-semibold hover:text-blue-300 transition-colors relative group"
            >
              Sign in
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}