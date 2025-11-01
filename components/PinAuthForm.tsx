// components/PinAuthForm.tsx

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Lock, AlertCircle } from 'lucide-react';

interface PinAuthFormProps {
  onSubmit: (pin: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export const PinAuthForm: React.FC<PinAuthFormProps> = ({
  onSubmit,
  isLoading = false,
  error = null
}) => {
  const [pin, setPin] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus premier input au montage
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Gérer la saisie d'un chiffre
  const handleChange = (index: number, value: string) => {
    // Accepter seulement les chiffres
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value.slice(-1); // Prendre seulement le dernier caractère
    setPin(newPin);

    // Auto-focus sur le prochain input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit si tous les champs sont remplis
    if (index === 5 && value && newPin.every(digit => digit !== '')) {
      const fullPin = newPin.join('');
      onSubmit(fullPin);
    }
  };

  // Gérer le backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Gérer le paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    if (pastedData.length === 6) {
      const newPin = pastedData.split('');
      setPin(newPin);
      inputRefs.current[5]?.focus();
      
      // Auto-submit
      setTimeout(() => {
        onSubmit(pastedData);
      }, 100);
    }
  };

  // Reset le formulaire en cas d'erreur
  useEffect(() => {
    if (error) {
      setPin(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-8">
          
          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-2 border-cyan-500/40 flex items-center justify-center">
            <Lock className="text-cyan-400" size={32} />
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              Secure Access
            </h2>
            <p className="text-gray-400">
              Enter the 6-digit PIN code to continue
            </p>
          </div>

          {/* PIN Input */}
          <div className="flex gap-3 justify-center mb-6" onPaste={handlePaste}>
            {pin.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isLoading}
                className={`w-12 h-14 text-center text-2xl font-bold bg-gray-800/50 border-2 rounded-xl outline-none transition-all ${
                  error
                    ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                    : 'border-gray-700/50 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20'
                } ${
                  digit ? 'text-white' : 'text-gray-500'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
              <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={18} />
              <div className="text-sm text-red-200">
                <strong className="font-semibold">Error:</strong>
                <p className="mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={() => {
              const fullPin = pin.join('');
              if (fullPin.length === 6) {
                onSubmit(fullPin);
              }
            }}
            disabled={pin.some(d => !d) || isLoading}
            className="w-full py-4 px-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-gray-700 disabled:to-gray-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-cyan-500/20 transform hover:scale-105 disabled:scale-100 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                Verifying...
              </div>
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <span className="relative z-10">Continue</span>
              </>
            )}
          </button>

          {/* Loading indicator */}
          {isLoading && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 text-sm text-gray-400">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                Authenticating...
              </div>
            </div>
          )}
        </div>

        {/* Security notice */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>🔒 This connection is protected by a PIN code</p>
        </div>
      </div>
    </div>
  );
};