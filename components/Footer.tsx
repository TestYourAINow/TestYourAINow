"use client";

import { 
  ArrowRight,
  Zap,
  Heart
} from 'lucide-react';
import { useState } from 'react';

export default function Footer() {
  return (
    <footer 
      className="relative text-white py-12 px-6 sm:px-12 lg:px-20 border-t border-gray-700/50"
      style={{
        background: `
          linear-gradient(to right, rgba(59, 130, 246, 0.03) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(59, 130, 246, 0.03) 1px, transparent 1px),
          radial-gradient(circle at 30% 50%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
          radial-gradient(circle at 70% 50%, rgba(6, 182, 212, 0.06) 0%, transparent 50%),
          linear-gradient(135deg, #0a0a0b 0%, #111827 50%, #0a0a0b 100%)
        `,
        backgroundSize: '40px 40px, 40px 40px, 600px 600px, 600px 600px, 100% 100%'
      }}
    >
      {/* Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
          
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                TestYourAI
              </span>
            </div>
            
            <p className="text-gray-300 leading-relaxed">
              Build and share AI agents with a single link. No coding, no setup — just results.
            </p>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="/faq"
                  className="group text-gray-300 hover:text-white transition-colors duration-300 flex items-center gap-2"
                >
                  <span>FAQ</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </a>
              </li>
              <li>
                <span className="text-gray-300">
                  support@testyourainow.com
                </span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="/privacy"
                  className="group text-gray-300 hover:text-white transition-colors duration-300 flex items-center gap-2"
                >
                  <span>Privacy Policy</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  className="group text-gray-300 hover:text-white transition-colors duration-300 flex items-center gap-2"
                >
                  <span>Terms of Service</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700/50 pt-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
              <span>© 2025 TestYourAI. All rights reserved. Made with</span>
              <Heart className="w-4 h-4 text-red-500 animate-pulse" />
              <span>for AI builders</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}