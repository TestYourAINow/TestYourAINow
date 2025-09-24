import React from 'react';
import { RefreshCw, LucideIcon } from 'lucide-react';

interface LoadingScreenProps {
  icon?: LucideIcon;
  title?: string;
  subtitle?: string;
}

export default function LoadingScreen({ 
  icon: Icon = RefreshCw, 
  title = "Loading...", 
  subtitle = "Please wait" 
}: LoadingScreenProps) {
  return (
    <div className="h-[calc(100vh-64px)] bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-6">
          <div className="w-20 h-20 mx-auto relative">
            <div className="absolute inset-0 rounded-full border-2 border-gray-800" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
            <div className="absolute inset-3 rounded-full bg-gray-900 flex items-center justify-center">
              <Icon className="w-8 h-8 text-blue-400 animate-pulse" />
            </div>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">{title}</h2>
        <p className="text-gray-400">{subtitle}</p>
      </div>
    </div>
  );
}