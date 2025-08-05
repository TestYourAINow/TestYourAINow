'use client';

import { useState, useEffect } from 'react';
import { 
  Play, Clock, Users, Star, Search, Filter, BookOpen, 
  Zap, Settings, Bot, Code, Globe, Shield, Crown, 
  ChevronRight, Eye, ThumbsUp, Share2, Bookmark,
  PlayCircle, Sparkles, TrendingUp, Award
} from 'lucide-react';

// Types
interface VideoGuide {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  views: number;
  likes: number;
  thumbnail: string;
  isNew?: boolean;
  isPremium?: boolean;
  tags: string[];
}

interface Category {
  id: string;
  name: string;
  icon: any;
  color: string;
  count: number;
}

export default function VideoGuidesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock data pour les catégories
  const categories: Category[] = [
    { id: 'all', name: 'All Guides', icon: BookOpen, color: 'blue', count: 24 },
    { id: 'getting-started', name: 'Getting Started', icon: Zap, color: 'emerald', count: 8 },
    { id: 'ai-agents', name: 'AI Agents', icon: Bot, color: 'purple', count: 6 },
    { id: 'integrations', name: 'Integrations', icon: Globe, color: 'cyan', count: 4 },
    { id: 'advanced', name: 'Advanced', icon: Code, color: 'orange', count: 3 },
    { id: 'security', name: 'Security', icon: Shield, color: 'red', count: 3 },
  ];

  // Mock data pour les vidéos
  const videoGuides: VideoGuide[] = [
    {
      id: '1',
      title: 'Getting Started with TestYourAI',
      description: 'Learn the basics of TestYourAI platform and create your first AI agent in under 10 minutes.',
      duration: '8:42',
      difficulty: 'beginner',
      category: 'getting-started',
      views: 2847,
      likes: 156,
      thumbnail: '/api/placeholder/400/225',
      isNew: true,
      tags: ['basics', 'setup', 'first-steps']
    },
    {
      id: '2',
      title: 'Creating Your First AI Agent',
      description: 'Step-by-step guide to building and configuring your first intelligent AI agent.',
      duration: '12:15',
      difficulty: 'beginner',
      category: 'ai-agents',
      views: 1923,
      likes: 98,
      thumbnail: '/api/placeholder/400/225',
      tags: ['agent', 'creation', 'tutorial']
    },
    {
      id: '3',
      title: 'Advanced Agent Customization',
      description: 'Dive deep into advanced customization options and unlock the full potential of your AI agents.',
      duration: '18:33',
      difficulty: 'advanced',
      category: 'ai-agents',
      views: 1456,
      likes: 89,
      thumbnail: '/api/placeholder/400/225',
      isPremium: true,
      tags: ['advanced', 'customization', 'pro']
    },
    {
      id: '4',
      title: 'API Integration Guide',
      description: 'Learn how to integrate TestYourAI with your existing applications using our powerful API.',
      duration: '15:27',
      difficulty: 'intermediate',
      category: 'integrations',
      views: 987,
      likes: 67,
      thumbnail: '/api/placeholder/400/225',
      tags: ['api', 'integration', 'development']
    },
    {
      id: '5',
      title: 'Demo Builder Masterclass',
      description: 'Create stunning interactive demos that convert visitors into customers.',
      duration: '22:18',
      difficulty: 'intermediate',
      category: 'advanced',
      views: 1678,
      likes: 134,
      thumbnail: '/api/placeholder/400/225',
      isNew: true,
      tags: ['demo', 'conversion', 'marketing']
    },
    {
      id: '6',
      title: 'Security Best Practices',
      description: 'Essential security practices to keep your AI agents and data safe.',
      duration: '11:45',
      difficulty: 'intermediate',
      category: 'security',
      views: 1234,
      likes: 76,
      thumbnail: '/api/placeholder/400/225',
      tags: ['security', 'privacy', 'best-practices']
    }
  ];

  // Filtrage des vidéos
  const filteredVideos = videoGuides.filter(video => {
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Tri des vidéos
  const sortedVideos = [...filteredVideos].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      case 'popular':
        return b.views - a.views;
      case 'liked':
        return b.likes - a.likes;
      case 'duration-short':
        return parseInt(a.duration.split(':')[0]) - parseInt(b.duration.split(':')[0]);
      case 'duration-long':
        return parseInt(b.duration.split(':')[0]) - parseInt(a.duration.split(':')[0]);
      default:
        return 0;
    }
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
      case 'intermediate': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'advanced': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.icon : BookOpen;
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.color : 'blue';
  };

  return (
    <div className="h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4 md:p-8">


      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-600/20">
                  <Play className="text-white" size={28} />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-400 rounded-full flex items-center justify-center">
                  <Sparkles className="text-white" size={12} />
                </div>
              </div>
              
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-2">
                  Video Guides
                </h1>
                <p className="text-gray-400 text-lg">
                  Master TestYourAI with our comprehensive video tutorials
                </p>
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{videoGuides.length}</div>
                <div className="text-sm text-gray-400">Total Guides</div>
              </div>
              <div className="w-px h-12 bg-gray-700" />
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{categories.length - 1}</div>
                <div className="text-sm text-gray-400">Categories</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search guides, topics, or keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-800/50 border border-gray-700/50 text-white rounded-xl outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all backdrop-blur-sm placeholder-gray-400 font-medium"
                  />
                </div>
              </div>

              {/* Sort */}
              <div className="flex gap-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3.5 bg-gray-800/50 border border-gray-700/50 text-white rounded-xl outline-none focus:border-purple-500/60 transition-all backdrop-blur-sm font-medium"
                >
                  <option value="newest">Newest First</option>
                  <option value="popular">Most Popular</option>
                  <option value="liked">Most Liked</option>
                  <option value="duration-short">Shortest First</option>
                  <option value="duration-long">Longest First</option>
                </select>

                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="px-4 py-3.5 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 hover:border-gray-600/50 text-white rounded-xl transition-all backdrop-blur-sm"
                >
                  <Filter size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="xl:col-span-1">
            <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6 sticky top-8">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="text-cyan-400" size={20} />
                <h2 className="text-lg font-semibold bg-gradient-to-r from-cyan-200 to-blue-200 bg-clip-text text-transparent">Categories</h2>
              </div>

              <div className="space-y-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const isActive = selectedCategory === category.id;
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 group ${
                        isActive 
                          ? `bg-${category.color}-500/20 border border-${category.color}-500/30 text-${category.color}-300` 
                          : 'hover:bg-gray-800/50 text-gray-300 hover:text-white border border-transparent hover:border-gray-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`${isActive ? `text-${category.color}-400` : 'text-gray-400 group-hover:text-white'} transition-colors`} size={18} />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isActive 
                          ? `bg-${category.color}-500/30 text-${category.color}-300` 
                          : 'bg-gray-700/50 text-gray-400 group-hover:bg-gray-600/50 group-hover:text-gray-300'
                      }`}>
                        {category.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Learning Path */}
              <div className="mt-8 p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="text-purple-400" size={16} />
                  <span className="text-purple-200 text-sm font-semibold">Learning Path</span>
                </div>
                <p className="text-purple-100/80 text-xs leading-relaxed mb-3">
                  Follow our recommended sequence for the best learning experience.
                </p>
                <button className="w-full px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 rounded-lg text-xs font-medium transition-all">
                  Start Learning Path
                </button>
              </div>
            </div>
          </div>

          {/* Video Grid */}
          <div className="xl:col-span-3">
            {sortedVideos.length === 0 ? (
              <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">No guides found</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  Try adjusting your search criteria or browse different categories to find the perfect guide.
                </p>
              </div>
            ) : (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                {sortedVideos.map((video) => {
                  const CategoryIcon = getCategoryIcon(video.category);
                  const categoryColor = getCategoryColor(video.category);
                  
                  return (
                    <div
                      key={video.id}
                      className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 group"
                    >
                      {/* Video Thumbnail */}
                      <div className="relative">
                        <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative overflow-hidden">
                          {/* Placeholder Thumbnail */}
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center">
                            <div className="text-center">
                              <PlayCircle className="w-16 h-16 text-white/60 mx-auto mb-2" />
                              <div className="text-white/40 text-sm font-medium">Video Preview</div>
                            </div>
                          </div>
                          
                          {/* Play Button Overlay */}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all cursor-pointer">
                              <Play className="text-white ml-1" size={24} />
                            </div>
                          </div>

                          {/* Duration Badge */}
                          <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 backdrop-blur-sm text-white text-xs rounded-lg font-mono">
                            {video.duration}
                          </div>

                          {/* New/Premium Badges */}
                          <div className="absolute top-3 left-3 flex gap-2">
                            {video.isNew && (
                              <span className="px-2 py-1 bg-emerald-500/90 text-white text-xs rounded-lg font-semibold">
                                NEW
                              </span>
                            )}
                            {video.isPremium && (
                              <span className="px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs rounded-lg font-semibold flex items-center gap-1">
                                <Crown size={10} />
                                PRO
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Video Info */}
                      <div className="p-6">
                        {/* Category & Difficulty */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <CategoryIcon className={`text-${categoryColor}-400`} size={14} />
                            <span className={`text-${categoryColor}-400 text-xs font-medium uppercase tracking-wide`}>
                              {categories.find(c => c.id === video.category)?.name}
                            </span>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-lg border ${getDifficultyColor(video.difficulty)}`}>
                            {video.difficulty}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                          {video.title}
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed mb-4">
                          {video.description}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {video.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="px-2 py-1 bg-gray-800/50 border border-gray-700/50 text-gray-300 text-xs rounded-lg">
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Stats & Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <div className="flex items-center gap-1">
                              <Eye size={12} />
                              <span>{video.views.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ThumbsUp size={12} />
                              <span>{video.likes}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all">
                              <Bookmark size={14} />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all">
                              <Share2 size={14} />
                            </button>
                            <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-semibold transition-all text-xs flex items-center gap-2">
                              <Play size={12} />
                              Watch
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Load More */}
            {sortedVideos.length > 0 && (
              <div className="mt-8 text-center">
                <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/20 transform hover:scale-105">
                  Load More Guides
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Custom Styles */}
      <style jsx>{`
        .bg-grid {
          background-image: 
            linear-gradient(to right, rgba(59, 130, 246, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59, 130, 246, 0.05) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>
    </div>
  );
}