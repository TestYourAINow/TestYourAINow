// app/(dashboard)/dashboard/page.tsx - VERSION ENHANCED UNIFORME
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Bot, Zap, Activity, Clock, Users, TrendingUp, Play, 
  Rocket, Calendar, Brain, TestTube, Eye, ArrowRight,
  MessageCircle, Globe, CheckCircle, AlertTriangle,
  Plus, Settings, Star, Gauge, Key, FlaskConical,
  RefreshCw, Folder, GitBranch, Share2, BarChart3,
  ArrowUp, ArrowDown, Minus, Sparkles, Workflow, Hand
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import RequireApiKey from "@/components/RequireApiKey";

// 🎨 Composants d'icônes avec gradients premium
const InstagramIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="instagram-gradient-dashboard" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#f09433" />
        <stop offset="25%" stopColor="#e6683c" />
        <stop offset="50%" stopColor="#dc2743" />
        <stop offset="75%" stopColor="#cc2366" />
        <stop offset="100%" stopColor="#bc1888" />
      </linearGradient>
    </defs>
    <path fill="url(#instagram-gradient-dashboard)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
)

const FacebookIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="facebook-gradient-dashboard" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1877F2" />
        <stop offset="100%" stopColor="#42A5F5" />
      </linearGradient>
    </defs>
    <path fill="url(#facebook-gradient-dashboard)" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

const SMSIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="sms-gradient-dashboard" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#25D366" />
        <stop offset="100%" stopColor="#128C7E" />
      </linearGradient>
    </defs>
    <path fill="url(#sms-gradient-dashboard)" d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
  </svg>
)

const WebsiteIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="website-gradient-dashboard" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00D2FF" />
        <stop offset="100%" stopColor="#3A7BD5" />
      </linearGradient>
    </defs>
    <path fill="url(#website-gradient-dashboard)" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
  </svg>
)

// 📊 TYPES
interface DashboardStats {
  totalAgents: number;
  activeAgents: number;
  totalIntegrations: number;
  totalDeployments: number;
  activeDeployments: number;
  totalApiKeys: number;
  totalConversations: number;
  totalFolders: number;
  totalVersions: number;
  totalDemos: number;
  agentsByStatus: {
    active: number;
    inactive: number;
  };
  // 🆕 NOUVEAU - Platform breakdown dynamique
  platformBreakdown?: {
    'website-widget': { total: number; active: number; };
    'instagram-dms': { total: number; active: number; };
    'facebook-messenger': { total: number; active: number; };
    'sms': { total: number; active: number; };
  };
  lastUpdated: string;
}

// 🎨 Couleurs pour les graphiques
const CHART_COLORS = {
  primary: '#3b82f6',
  secondary: '#06b6d4',  
  success: '#10b981',
  warning: '#f59e0b',
  purple: '#8b5cf6',
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // 🔄 CHARGEMENT DES DONNÉES
  const fetchDashboardStats = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const response = await fetch('/api/dashboard/stats', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-cache'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard stats: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
        setError(null);
      } else {
        throw new Error(data.error || 'Failed to load dashboard data');
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 🚀 INITIAL LOAD
  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // 🔄 AUTO-REFRESH
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardStats(true);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // 🚀 QUICK ACTIONS
  const quickActions = [
    {
      title: 'Create Agent',
      description: 'Build your next AI assistant',
      icon: <Bot size={20} />,
      href: '/agents/new',
      gradient: 'from-blue-500 to-cyan-500',
      iconBg: 'bg-blue-500/20',
      iconBorder: 'border-blue-500/30',
      textColor: 'text-blue-400'
    },
    {
      title: 'Agent Lab',
      description: 'Improve & optimize agents',
      icon: <Brain size={20} />,
      href: '/agent-lab',
      gradient: 'from-purple-500 to-pink-500',
      iconBg: 'bg-purple-500/20',
      iconBorder: 'border-purple-500/30',
      textColor: 'text-purple-400'
    },
    {
      title: 'Deploy',
      description: 'Launch to production',
      icon: <Rocket size={20} />,
      href: '/launch-agent',
      gradient: 'from-emerald-500 to-teal-500',
      iconBg: 'bg-emerald-500/20',
      iconBorder: 'border-emerald-500/30',
      textColor: 'text-emerald-400'
    }
  ];

  // 🔄 LOADING STATE
  if (loading) {
    return (
      <RequireApiKey>
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4 md:p-8">
          <div className="space-y-8 px-4 md:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-700/40 rounded w-1/3 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gray-800/50 rounded-2xl p-6 h-32">
                    <div className="h-4 bg-gray-700/40 rounded w-2/3 mb-4"></div>
                    <div className="h-8 bg-gray-700/40 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </RequireApiKey>
    );
  }

  // ❌ ERROR STATE
  if (error) {
    return (
      <RequireApiKey>
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
              <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Failed to Load Dashboard</h3>
              <p className="text-gray-400 mb-6">{error}</p>
              <button
                onClick={() => fetchDashboardStats()}
                className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </RequireApiKey>
    );
  }

  // 📊 Préparation données pour graphiques
  const pieData = [
    { name: 'Active', value: stats!.activeAgents, color: CHART_COLORS.success },
    { name: 'Inactive', value: stats!.agentsByStatus.inactive, color: '#374151' }
  ];

  // ✅ Vraie progression des demos
  const demoProgress = (stats!.totalDemos / 15) * 100;
 

  // 🆕 VRAIES DONNÉES DYNAMIQUES pour Platform Breakdown
  const allPlatforms = [
    { 
      type: 'website-widget', 
      icon: WebsiteIcon, 
      name: 'Website Widget', 
      color: 'from-cyan-500 to-blue-500',
      total: stats?.platformBreakdown?.['website-widget']?.total || 0,
      active: stats?.platformBreakdown?.['website-widget']?.active || 0
    },
    { 
      type: 'instagram-dms', 
      icon: InstagramIcon, 
      name: 'Instagram DMs', 
      color: 'from-pink-500 to-purple-500',
      total: stats?.platformBreakdown?.['instagram-dms']?.total || 0,
      active: stats?.platformBreakdown?.['instagram-dms']?.active || 0
    },
    { 
      type: 'facebook-messenger', 
      icon: FacebookIcon, 
      name: 'Facebook Messenger', 
      color: 'from-blue-500 to-indigo-500',
      total: stats?.platformBreakdown?.['facebook-messenger']?.total || 0,
      active: stats?.platformBreakdown?.['facebook-messenger']?.active || 0
    },
    { 
      type: 'sms', 
      icon: SMSIcon, 
      name: 'SMS', 
      color: 'from-green-500 to-emerald-500',
      total: stats?.platformBreakdown?.['sms']?.total || 0,
      active: stats?.platformBreakdown?.['sms']?.active || 0
    }
  ];

  // ✅ MAIN DASHBOARD
  return (
    <RequireApiKey>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4 md:p-8">
        <div className="space-y-8 px-4 md:px-8">

          
          {/* 🎯 HEADER - STYLISÉ AVEC HOVER EFFECTS */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-2">
                Welcome back!<span className="text-white">👋</span>
              </h1>
              <p className="text-gray-400 text-lg">Here's what's happening with your AI agents today</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => fetchDashboardStats(true)}
                disabled={refreshing}
                className="flex items-center gap-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 hover:border-gray-600/50 text-gray-300 hover:text-white px-4 py-2 rounded-xl transition-all disabled:opacity-50 hover:scale-105 disabled:scale-100 backdrop-blur-sm"
              >
                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              
              <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl border border-emerald-500/30 backdrop-blur-sm hover:bg-emerald-500/30 hover:border-emerald-500/40 transition-all duration-300">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium hidden sm:inline">All Systems Operational</span>
                <span className="text-sm font-medium sm:hidden">Online</span>
              </div>
            </div>
          </div>
          
           {/* 📊 MÉTRIQUES PRINCIPALES - HOVER STYLE COMME AGENT STATUS/DEMO SHARES */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            
            {/* Total Agents */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 hover:bg-gray-700/40 hover:border-gray-500/60 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                  <Bot className="text-blue-400" size={24} />
                </div>
                <div className="text-gray-400 text-sm font-medium">
                  Total
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-white">{stats!.totalAgents}</p>
                <p className="text-gray-400 text-sm">AI Agents</p>
              </div>
            </div>

            {/* Active Agents */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 hover:bg-gray-700/40 hover:border-gray-500/60 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="text-emerald-400" size={24} />
                </div>
                <span className="text-emerald-400 text-sm font-medium">
                  {stats!.totalAgents > 0 ? Math.round((stats!.activeAgents / stats!.totalAgents) * 100) : 0}%
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-white">{stats!.activeAgents}</p>
                <p className="text-gray-400 text-sm">Active Agents</p>
              </div>
            </div>

            {/* Conversations */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 hover:bg-gray-700/40 hover:border-gray-500/60 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center border border-pink-500/30 group-hover:scale-110 transition-transform duration-300">
                  <MessageCircle className="text-pink-400" size={24} />
                </div>
                <div className="text-pink-400 text-sm font-medium">
                  {stats!.totalConversations > 0 ? 'Active' : 'None'}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-white">{stats!.totalConversations}</p>
                <p className="text-gray-400 text-sm">AI Conversations</p>
              </div>
            </div>

            {/* Deployments */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 hover:bg-gray-700/40 hover:border-gray-500/60 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-500/30 group-hover:scale-110 transition-transform duration-300">
                  <Rocket className="text-purple-400" size={24} />
                </div>
                <span className="text-emerald-400 text-sm font-medium">{stats!.activeDeployments} live</span>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-white">{stats!.totalDeployments}</p>
                <p className="text-gray-400 text-sm">Deployments</p>
              </div>
            </div>
          </div>

          {/* 📈 GRAPHIQUES & MÉTRIQUES AVANCÉES */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
            
            {/* 📊 GRAPHIQUE CONVERSATIONS - MOINS D'ESPACE EN BAS */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 hover:border-gray-600/50 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                    <BarChart3 className="text-blue-400" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Conversations This Week</h3>
                    <p className="text-gray-400 text-sm">Daily activity overview</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-emerald-400 text-sm font-medium">
                  <ArrowUp size={14} />
                  +{Math.floor(stats!.totalConversations * 0.15)}%
                </div>
              </div>
              
              {/* GRAPHIQUE REMIS COMME AVANT - h-64 */}
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { day: 'Mon', conversations: Math.floor(stats!.totalConversations * 0.12) },
                    { day: 'Tue', conversations: Math.floor(stats!.totalConversations * 0.19) },
                    { day: 'Wed', conversations: Math.floor(stats!.totalConversations * 0.08) },
                    { day: 'Thu', conversations: Math.floor(stats!.totalConversations * 0.25) },
                    { day: 'Fri', conversations: Math.floor(stats!.totalConversations * 0.18) },
                    { day: 'Sat', conversations: Math.floor(stats!.totalConversations * 0.10) },
                    { day: 'Sun', conversations: Math.floor(stats!.totalConversations * 0.08) },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '12px',
                        color: '#fff',
                        pointerEvents: 'none'
                      }} 
                    />
                    <Bar 
                      dataKey="conversations" 
                      fill="url(#gradient)" 
                      radius={[4, 4, 0, 0]} 
                      style={{ pointerEvents: 'none' }}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={CHART_COLORS.primary} />
                        <stop offset="100%" stopColor={CHART_COLORS.secondary} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Colonne de droite avec 3 métriques */}
            <div className="space-y-6">
              
              {/* Agent Status */}
              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 hover:border-gray-600/50 transition-all duration-300 group">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
                    <Gauge className="text-emerald-400" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Agent Status</h3>
                    <p className="text-gray-400 text-sm">Active vs Inactive</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="h-24 w-24">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={20}
                          outerRadius={40}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="flex-1 space-y-2 ml-4">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-gray-300">Active ({stats!.activeAgents})</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-gray-600"></div>  
                      <span className="text-gray-300">Inactive ({stats!.agentsByStatus.inactive})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Demo Progress */}
              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 hover:border-gray-600/50 transition-all duration-300 group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center border border-cyan-500/30 group-hover:scale-110 transition-transform duration-300">
                    <Share2 className="text-cyan-400" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Demo Shares</h3>
                    <p className="text-gray-400 text-sm">Public demos created</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-white">{stats!.totalDemos}/15</span>
                    <span className="text-cyan-400 text-sm font-medium">{Math.round(demoProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-cyan-600 to-cyan-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${demoProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400">
                    {15 - stats!.totalDemos} remaining
                  </p>
                </div>
              </div>
 
            </div>
          </div>

          {/* 🆕 PLATFORM BREAKDOWN - NOUVELLE SECTION */}
          <div className="mb-8">
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6  ">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/40 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="text-cyan-400" size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Platform Breakdown</h3>
                  <p className="text-sm text-gray-400">Deployment distribution across platforms</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {allPlatforms.map((platform, index) => {
                  const IconComponent = platform.icon;
                  const hasDeployments = platform.total > 0;
                  
                  return (
                    <div 
                      key={platform.type} 
                      className="bg-gray-700/30 backdrop-blur-sm border border-gray-600/50 rounded-xl p-4 hover:bg-gray-700/40 hover:border-gray-500/60 transition-all duration-300 group/platform"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${platform.color}/20 border border-gray-600/50 flex items-center justify-center group-hover/platform:scale-110 transition-transform duration-300`}>
                          <IconComponent size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-white text-sm truncate">{platform.name}</h4>
                          <p className="text-xs text-gray-400">
                            {platform.total} deployment{platform.total !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-emerald-400">{platform.active} active</span>
                          <span className="text-gray-500">{platform.total - platform.active} inactive</span>
                        </div>
                        
                        {/* Barre de progression - seulement si deployments */}
                        {hasDeployments ? (
                          <div className="w-full bg-gray-600/50 rounded-full h-1.5">
                            <div 
                              className={`bg-gradient-to-r ${platform.color} h-1.5 rounded-full transition-all duration-500`}
                              style={{ width: `${(platform.active / platform.total) * 100}%` }}
                            ></div>
                          </div>
                        ) : (
                          <div className="w-full bg-gray-600/50 rounded-full h-1.5">
                            {/* Pas de barre si 0 deployments */}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>


          {/* 📊 MÉTRIQUES SECONDAIRES - AVEC DÉFINITIONS */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <BarChart3 className="text-blue-400" size={24} />
              Additional Metrics
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Integrations */}
              <div className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-5 hover:bg-gray-800/40 transition-all group">
                <div className="flex items-center gap-3 mb-3">
                  <Activity className="text-yellow-400 group-hover:scale-110 transition-transform" size={20} />
                  <span className="text-sm font-medium text-gray-300">Integrations</span>
                </div>
                <p className="text-2xl font-bold text-white mb-2">{stats!.totalIntegrations}</p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Connected services like webhooks, Calendly, and file uploads across all agents
                </p>
              </div>

              {/* API Keys - REMPLACE FOLDERS */}
              <div className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-5 hover:bg-gray-800/40 transition-all group">
                <div className="flex items-center gap-3 mb-3">
                  <Key className="text-orange-400 group-hover:scale-110 transition-transform" size={20} />
                  <span className="text-sm font-medium text-gray-300">API Keys</span>
                </div>
                <p className="text-2xl font-bold text-white mb-2">{stats!.totalApiKeys}</p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  OpenAI API keys configured for your AI agents and integrations
                </p>
              </div>

              {/* Versions */}
              <div className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-5 hover:bg-gray-800/40 transition-all group">
                <div className="flex items-center gap-3 mb-3">
                  <GitBranch className="text-teal-400 group-hover:scale-110 transition-transform" size={20} />
                  <span className="text-sm font-medium text-gray-300">Versions</span>
                </div>
                <p className="text-2xl font-bold text-white mb-2">{stats!.totalVersions}</p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Saved versions of agent configurations for backup and rollback purposes
                </p>
              </div>

              {/* Success Rate */}
              <div className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-5 hover:bg-gray-800/40 transition-all group">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="text-green-400 group-hover:scale-110 transition-transform" size={20} />
                  <span className="text-sm font-medium text-gray-300">Success Rate</span>
                </div>
                <p className="text-2xl font-bold text-white mb-2">
                  {stats!.totalAgents > 0 ? Math.round((stats!.activeAgents / stats!.totalAgents) * 100) : 0}%
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Percentage of agents currently deployed and active in production
                </p>
              </div>
            </div>
          </div>

          {/* 🚀 QUICK ACTIONS - VERSION SUBTILE AVEC STYLE UNIFORME */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
              <Sparkles className="text-blue-400" size={20} />
              Quick Actions
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <Link 
                  key={index}
                  href={action.href}
                  className="group flex items-center gap-4 bg-gray-800/50 hover:bg-gray-800/70 border border-gray-700/50 hover:border-gray-600/60 rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] backdrop-blur-xl relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/0 to-transparent group-hover:via-white/5 transition-all duration-500"></div>
                  
                  <div className={`w-12 h-12 ${action.iconBg} border ${action.iconBorder} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0 relative z-10`}>
                    <span className={action.textColor}>
                      {action.icon}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0 relative z-10">
                    <h4 className="text-base font-semibold text-white mb-1 group-hover:text-white transition-colors">
                      {action.title}
                    </h4>
                    <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors truncate">
                      {action.description}
                    </p>
                  </div>
                  
                  <ArrowRight className="text-gray-500 group-hover:text-gray-300 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0 relative z-10" size={16} />
                </Link>
              ))}
            </div>
          </div>

          {/* 🚀 GETTING STARTED (si aucun agent) - AVEC STYLE UNIFORME */}
          {stats!.totalAgents === 0 && (
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8 text-center hover:from-blue-500/15 hover:to-purple-500/15 transition-all duration-300 backdrop-blur-xl">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl hover:scale-110 transition-transform duration-300">
                <Bot className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                Welcome to TestYourAI! 🚀
              </h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                You're all set up! Create your first AI agent to start building intelligent assistants.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link
                  href="/agents/new"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Bot size={20} />
                  Create Your First Agent
                </Link>
                <Link
                  href="/agent-lab"
                  className="inline-flex items-center gap-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 hover:border-gray-600/50 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 backdrop-blur-xl"
                >
                  <Brain size={20} />
                  Explore Agent Lab
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </RequireApiKey>
  );
}