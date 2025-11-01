// components/ShareAccessButton.tsx

'use client';

import React from 'react';
import { Link2 } from 'lucide-react';

interface ShareAccessButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const ShareAccessButton: React.FC<ShareAccessButtonProps> = ({ 
  onClick, 
  disabled = false 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full lg:py-4 py-3.5 lg:px-6 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center lg:gap-3 gap-2 shadow-lg border relative overflow-hidden group lg:text-base text-sm ${
        disabled
          ? 'bg-gray-700 text-gray-400 border-gray-600/50 cursor-not-allowed opacity-75'
          : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white hover:shadow-cyan-500/25 hover:scale-[1.02] border-cyan-500/30'
      }`}
    >
      {!disabled && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
      )}
      <Link2 className="lg:w-5 lg:h-5 w-4 h-4 relative z-10" />
      <span className="relative z-10">Share Access</span>
    </button>
  );
};