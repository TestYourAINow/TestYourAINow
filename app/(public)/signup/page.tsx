"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CheckCircle, XCircle } from "lucide-react";
import clsx from "clsx";
import { signIn } from "next-auth/react";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState(""); // ⬅️ NOUVEAU
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

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

    if (!username || !email || !confirmEmail || !password || !confirm) {
      setError("Please fill in all fields.");
      return;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email.");
      return;
    }

    // ⬇️ NOUVEAU : Vérification des emails
    if (email !== confirmEmail) {
      setError("Email addresses do not match.");
      return;
    }

    if (usernameAvailable === false) {
      setError("Username is already taken.");
      return;
    }

    if (emailAvailable === false) {
      setError("Email is already registered.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    const validations = rules.map((rule) => rule.valid);
    if (!validations.every(Boolean)) {
      setError("Password doesn't meet the required rules.");
      return;
    }

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.field === "email") setEmailAvailable(false);
        if (data.field === "username") setUsernameAvailable(false);
        setError(data.error || "Something went wrong.");
        return;
      }

      const loginRes = await signIn("credentials", {
        identifier: email,
        password,
        redirect: false,
      });

      if (loginRes?.error) {
        setError("Account created but login failed.");
        return;
      }

      // ⬇️ Appelle l'API checkout (comme avant)
      const checkoutRes = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const { url } = await checkoutRes.json();

      if (url) {
        router.push(url); // ⬅️ Redirection vers Stripe
      } else {
        setError("Unable to start checkout.");
      }
    } catch {
      setError("Server error. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-grid bg-[#09090b] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">
            Create your <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">account</span>
          </h1>
          <p className="text-gray-400">Start building AI agents today</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onBlur={checkUsername}
              className="w-full rounded-2xl bg-[#1a1a1a] border border-gray-700 px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
            />
            {username && username.length < 3 && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <XCircle className="w-4 h-4" /> Username must be at least 3 characters
              </p>
            )}
            {username && username.length >= 3 && usernameAvailable === true && (
              <p className="text-green-500 text-sm flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Username available
              </p>
            )}
            {username && username.length >= 3 && usernameAvailable === false && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <XCircle className="w-4 h-4" /> Username already taken
              </p>
            )}
          </div>

          <div className="space-y-2">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={checkEmail}
              className="w-full rounded-2xl bg-[#1a1a1a] border border-gray-700 px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
            />
            {email && !isValidEmail(email) && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <XCircle className="w-4 h-4" /> Invalid email format
              </p>
            )}
            {email && isValidEmail(email) && emailAvailable === true && (
              <p className="text-green-500 text-sm flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Email available
              </p>
            )}
            {email && isValidEmail(email) && emailAvailable === false && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <XCircle className="w-4 h-4" /> Email already registered
              </p>
            )}
          </div>

          {/* ⬇️ NOUVEAU CHAMP */}
          <div className="space-y-2">
            <input
              type="email"
              placeholder="Confirm Email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              className="w-full rounded-2xl bg-[#1a1a1a] border border-gray-700 px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
            />
            {confirmEmail && email !== confirmEmail && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <XCircle className="w-4 h-4" /> Email addresses do not match
              </p>
            )}
            {confirmEmail && email === confirmEmail && email && (
              <p className="text-green-500 text-sm flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Emails match
              </p>
            )}
          </div>

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl bg-[#1a1a1a] border border-gray-700 px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-2xl bg-[#1a1a1a] border border-gray-700 px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
          />

          {password && (
            <div className="bg-gray-900/50 rounded-2xl p-4 space-y-2">
              <p className="text-sm text-gray-400 font-medium">Password requirements:</p>
              <ul className="space-y-2">
                {rules.map((rule, idx) => (
                  <li
                    key={idx}
                    className={clsx(
                      "flex items-center gap-3 text-sm",
                      rule.valid ? "text-green-400" : "text-gray-500"
                    )}
                  >
                    <div
                      className={clsx(
                        "w-5 h-5 flex items-center justify-center rounded-full border",
                        rule.valid 
                          ? "border-green-400 bg-green-400 text-black" 
                          : "border-gray-600"
                      )}
                    >
                      <Check className="w-3 h-3" />
                    </div>
                    {rule.label}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-400 hover:to-cyan-300 text-white py-3 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
          >
            Create Account
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-400 font-medium hover:text-blue-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}