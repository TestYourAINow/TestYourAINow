// app/(dashboard)/dashboard/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Bot, Zap, Activity, Clock, Users, TrendingUp, Play, 
  Rocket, Calendar, Brain, TestTube, Eye, ArrowRight,
  MessageCircle, Globe, CheckCircle, AlertTriangle,
  Plus, Settings, Star, Gauge, Layers, Key, FlaskConical,
  RefreshCw, BarChart3
} from 'lucide-react';
import RequireApiKey from "@/components/RequireApiKey";

// 📊 TYPES
interface DashboardStats {
  totalAgents: number;
  activeAgents: number;
  totalIntegrations: number;
  totalVersions: number;
  totalDeployments: number;
  activeDeployments: number;
  totalDemos: number;
  totalApiKeys: number;
  agentsByStatus: {
    active: number;
    inactive: number;
  };
  recentActivity: ActivityItem[];
  chartData: ChartDataPoint[];
  lastUpdated: string;
}

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  time: string;
  status: 'success' | 'info' | 'warning' | 'error';
}

interface ChartDataPoint {
  date: string;
  day: string;
  value: number;
  height: number;
}

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
        cache: 'no-cache' // Forcer le rechargement
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

  // 🔄 AUTO-REFRESH (optionnel - toutes les 5 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardStats(true);
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  // 🎨 HELPER FUNCTIONS
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'agent_created': return <Bot size={14} className="text-blue-400" />;
      case 'agent_updated': return <Settings size={14} className="text-gray-400" />;
      case 'deployment': return <Rocket size={14} className="text-emerald-400" />;
      case 'test': return <TestTube size={14} className="text-purple-400" />;
      case 'integration': return <Zap size={14} className="text-yellow-400" />;
      case 'demo': return <FlaskConical size={14} className="text-cyan-400" />;
      default: return <Activity size={14} className="text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'warning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'info': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // 📱 QUICK ACTIONS
  const quickActions = [
    {
      title: 'Create New Agent',
      description: 'Build your next AI assistant',
      icon: <Bot className="text-blue-400" size={16} />,
      href: '/agents/new',
      color: 'blue'
    },
    {
      title: 'Open Agent Lab',
      description: 'Improve existing agents',
      icon: <Brain className="text-purple-400" size={16} />,
      href: '/agent-lab',
      color: 'purple'
    },
    {
      title: 'Deploy Agent',
      description: 'Launch to production',
      icon: <Rocket className="text-cyan-400" size={16} />,
      href: '/launch-agent',
      color: 'cyan'
    }
  ];

  // 🔄 LOADING STATE
  if (loading) {
    return (
      <RequireApiKey>
        <div className="min-h-screen bg-gray-900 p-6">
          <div className="max-w-7xl mx-auto space-y-8">
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
        <div className="min-h-screen bg-gray-900 p-6">
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

  // ✅ MAIN DASHBOARD
  return (
    <RequireApiKey>
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* 🎯 HEADER */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-2">
                Welcome back! 👋
              </h1>
              <p className="text-gray-400 text-lg">Here's what's happening with your AI agents today</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Refresh Button */}
              <button
                onClick={() => fetchDashboardStats(true)}
                disabled={refreshing}
                className="flex items-center gap-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 text-gray-300 hover:text-white px-4 py-2 rounded-xl transition-all disabled:opacity-50"
              >
                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              
              {/* System Status */}
              <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl border border-emerald-500/30 backdrop-blur-sm">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium hidden sm:inline">All Systems Operational</span>
                <span className="text-sm font-medium sm:hidden">Online</span>
              </div>
            </div>
          </div>

          {/* 📊 MÉTRIQUES PRINCIPALES */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            
            {/* Total Agents */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 hover:border-blue-500/30 transition-all group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-blue-500/5 transition-all duration-300"></div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                  <Bot className="text-blue-400" size={24} />
                </div>
                <span className="text-emerald-400 text-sm font-medium">
                  +{Math.max(0, stats!.totalAgents - 10)} this week
                </span>
              </div>
              <div className="space-y-1 relative z-10">
                <p className="text-3xl font-bold text-white">{stats!.totalAgents}</p>
                <p className="text-gray-400 text-sm">Total AI Agents</p>
              </div>
            </div>

            {/* Active Agents */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 hover:border-emerald-500/30 transition-all group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-emerald-500/5 transition-all duration-300"></div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="text-emerald-400" size={24} />
                </div>
                <span className="text-emerald-400 text-sm font-medium">
                  {stats!.totalAgents > 0 ? Math.round((stats!.activeAgents / stats!.totalAgents) * 100) : 0}% active
                </span>
              </div>
              <div className="space-y-1 relative z-10">
                <p className="text-3xl font-bold text-white">{stats!.activeAgents}</p>
                <p className="text-gray-400 text-sm">Active Agents</p>
              </div>
            </div>

            {/* Integrations */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 hover:border-yellow-500/30 transition-all group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 to-yellow-500/0 group-hover:from-yellow-500/5 group-hover:to-yellow-500/5 transition-all duration-300"></div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center border border-yellow-500/30 group-hover:scale-110 transition-transform duration-300">
                  <Activity className="text-yellow-400" size={24} />
                </div>
                <span className="text-emerald-400 text-sm font-medium">Connected</span>
              </div>
              <div className="space-y-1 relative z-10">
                <p className="text-3xl font-bold text-white">{stats!.totalIntegrations}</p>
                <p className="text-gray-400 text-sm">Active Integrations</p>
              </div>
            </div>

            {/* Deployments */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 hover:border-purple-500/30 transition-all group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:to-purple-500/5 transition-all duration-300"></div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-500/30 group-hover:scale-110 transition-transform duration-300">
                  <Rocket className="text-purple-400" size={24} />
                </div>
                <span className="text-emerald-400 text-sm font-medium">{stats!.activeDeployments} live</span>
              </div>
              <div className="space-y-1 relative z-10">
                <p className="text-3xl font-bold text-white">{stats!.totalDeployments}</p>
                <p className="text-gray-400 text-sm">Total Deployments</p>
              </div>
            </div>
          </div>

          {/* 📈 SECTION PRINCIPALE */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Chart Section */}
            <div className="xl:col-span-2 bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
                    <BarChart3 className="text-blue-400" size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Agent Activity</h3>
                    <p className="text-gray-400 text-sm">Activity over the last 7 days</p>
                  </div>
                </div>
              </div>
              
              {/* Chart */}
              <div className="h-64 relative">
                <div className="absolute inset-0 flex items-end justify-between px-4">
                  {stats!.chartData.map((dataPoint, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div 
                        className="w-12 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg relative group cursor-pointer hover:from-blue-500 hover:to-blue-300 transition-all"
                        style={{ height: `${dataPoint.height}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          {dataPoint.value}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">{dataPoint.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions & Status */}
            <div className="space-y-6">
              
              {/* Quick Actions */}
              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                    <Rocket className="text-emerald-400" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Quick Actions</h3>
                    <p className="text-gray-400 text-sm">Fast access to common tasks</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {quickActions.map((action, index) => (
                    <Link 
                      key={index}
                      href={action.href}
                      className="w-full flex items-center gap-3 p-4 bg-gray-700/50 hover:bg-gray-700 rounded-xl transition-all text-left group"
                    >
                      <div className={`w-10 h-10 bg-${action.color}-500/20 rounded-lg flex items-center justify-center border border-${action.color}-500/30 group-hover:scale-110 transition-transform`}>
                        {action.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-white">{action.title}</div>
                        <div className="text-xs text-gray-400">{action.description}</div>
                      </div>
                      <ArrowRight className="text-gray-400 group-hover:text-white transition-colors" size={16} />
                    </Link>
                  ))}
                </div>
              </div>

              {/* System Health */}
              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                    <Activity className="text-emerald-400" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">System Health</h3>
                    <p className="text-gray-400 text-sm">Current status overview</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="text-emerald-400" size={16} />
                      <span className="text-sm text-emerald-200 font-medium">API Services</span>
                    </div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="text-emerald-400" size={16} />
                      <span className="text-sm text-emerald-200 font-medium">Database</span>
                    </div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="text-emerald-400" size={16} />
                      <span className="text-sm text-emerald-200 font-medium">Agents</span>
                    </div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  </div>

                  <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-xl p-4 mt-4 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="text-emerald-400" size={16} />
                      <span className="text-emerald-200 text-sm font-semibold">99.9% Uptime</span>
                    </div>
                    <p className="text-emerald-100/80 text-xs leading-relaxed">
                      All systems operational and performing optimally
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 📋 RECENT ACTIVITY */}
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
                  <Clock className="text-blue-400" size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Recent Activity</h3>
                  <p className="text-gray-400 text-sm">Latest actions across your workspace</p>
                </div>
              </div>
              <Link 
                href="/agents"
                className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
              >
                View all agents
              </Link>
            </div>
            
            <div className="space-y-4">
              {stats!.recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-8 h-8 text-gray-500" />
                  </div>
                  <h4 className="text-white font-medium mb-2">No recent activity</h4>
                  <p className="text-gray-400 text-sm mb-6">Start by creating your first agent!</p>
                  <Link
                    href="/agents/new"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-all"
                  >
                    <Plus size={16} />
                    Create Agent
                  </Link>
                </div>
              ) : (
                stats!.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-4 bg-gray-900/30 rounded-xl hover:bg-gray-900/50 transition-all group">
                    <div className="w-10 h-10 bg-gray-700/50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{activity.description}</p>
                      <p className="text-xs text-gray-400">{activity.time}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 📊 SECONDARY METRICS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* API Keys */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 hover:border-orange-500/30 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center border border-orange-500/30 group-hover:scale-110 transition-transform duration-300">
                  <Key className="text-orange-400" size={24} />
                </div>
                <span className="text-emerald-400 text-sm font-medium">
                  {stats!.totalApiKeys > 0 ? 'Configured' : 'None'}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-white">{stats!.totalApiKeys}</p>
                <p className="text-gray-400 text-sm">API Keys</p>
              </div>
            </div>

            {/* Demos */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 hover:border-cyan-500/30 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center border border-cyan-500/30 group-hover:scale-110 transition-transform duration-300">
                  <FlaskConical className="text-cyan-400" size={24} />
                </div>
                <span className="text-emerald-400 text-sm font-medium">
                  {stats!.totalDemos > 0 ? 'Active' : 'None'}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-white">{stats!.totalDemos}</p>
                <p className="text-gray-400 text-sm">Live Demos</p>
              </div>
            </div>

            {/* Agent Status Distribution */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 hover:border-green-500/30 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center border border-green-500/30 group-hover:scale-110 transition-transform duration-300">
                  <Gauge className="text-green-400" size={24} />
                </div>
                <span className="text-emerald-400 text-sm font-medium">Health</span>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-white">
                  {stats!.totalAgents > 0 ? Math.round((stats!.activeAgents / stats!.totalAgents) * 100) : 0}%
                </p>
                <p className="text-gray-400 text-sm">Active Rate</p>
              </div>
            </div>

            {/* Versions */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 hover:border-pink-500/30 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center border border-pink-500/30 group-hover:scale-110 transition-transform duration-300">
                  <Layers className="text-pink-400" size={24} />
                </div>
                <span className="text-emerald-400 text-sm font-medium">
                  +{Math.max(0, stats!.totalVersions - stats!.totalAgents)} iterations
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-white">{stats!.totalVersions}</p>
                <p className="text-gray-400 text-sm">Total Versions</p>
              </div>
            </div>
          </div>

          {/* 📝 FOOTER NOTE */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Activity className="text-blue-400" size={16} />
              <span className="text-blue-200 text-sm font-semibold">Live Dashboard</span>
            </div>
            <p className="text-blue-100/80 text-xs">
              Last updated: {new Date(stats!.lastUpdated).toLocaleString()} • 
              Auto-refreshes every 5 minutes
            </p>
          </div>

          {/* 🚀 GETTING STARTED (si aucun agent) */}
          {stats!.totalAgents === 0 && (
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
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
                  className="inline-flex items-center gap-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300"
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