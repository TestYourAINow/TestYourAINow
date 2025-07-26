'use client';

import { useState, useEffect } from 'react';
import { 
  MessageCircle, Search, Mail, Phone, Clock, CheckCircle, 
  AlertTriangle, Info, HelpCircle, Send, Paperclip, Star,
  Zap, Shield, Bot, Code, Globe, Book, ChevronDown, ChevronRight,
  ExternalLink, Copy, Users, TrendingUp, Award, Crown, Sparkles,
  Calendar, Eye, ThumbsUp, Filter, Tag, Archive, PlusCircle
} from 'lucide-react';

// Types
interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
  views: number;
  isPopular?: boolean;
}

interface SupportTicket {
  id: string;
  title: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  created: string;
  lastUpdate: string;
  messages: number;
}

interface Category {
  id: string;
  name: string;
  icon: any;
  color: string;
  description: string;
  articleCount: number;
}

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState('help-center');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    priority: 'medium',
    message: '',
    attachments: []
  });

  // Mock data pour les catégories
  const categories: Category[] = [
    { 
      id: 'all', 
      name: 'All Topics', 
      icon: Book, 
      color: 'blue', 
      description: 'Browse all help articles',
      articleCount: 42 
    },
    { 
      id: 'getting-started', 
      name: 'Getting Started', 
      icon: Zap, 
      color: 'emerald', 
      description: 'First steps and setup guides',
      articleCount: 12 
    },
    { 
      id: 'ai-agents', 
      name: 'AI Agents', 
      icon: Bot, 
      color: 'purple', 
      description: 'Creating and managing AI agents',
      articleCount: 15 
    },
    { 
      id: 'integrations', 
      name: 'Integrations', 
      icon: Globe, 
      color: 'cyan', 
      description: 'API and third-party integrations',
      articleCount: 8 
    },
    { 
      id: 'billing', 
      name: 'Billing & Plans', 
      icon: Crown, 
      color: 'yellow', 
      description: 'Subscription and payment help',
      articleCount: 7 
    }
  ];

  // Mock data pour les FAQ
  const faqItems: FAQItem[] = [
    {
      id: '1',
      question: 'How do I create my first AI agent?',
      answer: 'Creating your first AI agent is simple! Navigate to the Agent Lab, click "Create New Agent", choose a template or start from scratch, configure your agent\'s personality and knowledge base, then test and deploy. Our step-by-step wizard will guide you through the entire process.',
      category: 'getting-started',
      helpful: 156,
      views: 2847,
      isPopular: true
    },
    {
      id: '2',
      question: 'What AI models are supported?',
      answer: 'TestYourAI supports multiple AI models including GPT-4, GPT-3.5 Turbo, Claude, and other leading language models. You can switch between models based on your needs for cost optimization or performance requirements.',
      category: 'ai-agents',
      helpful: 98,
      views: 1923
    },
    {
      id: '3',
      question: 'How do I integrate with my existing website?',
      answer: 'Integration is easy with our JavaScript widget, REST API, or WordPress plugin. Simply copy the embed code, customize the appearance, and paste it into your website. Full documentation and examples are available in our developer section.',
      category: 'integrations',
      helpful: 134,
      views: 1456
    },
    {
      id: '4',
      question: 'What are the pricing plans?',
      answer: 'We offer flexible pricing plans: Starter (free), Professional ($29/month), and Enterprise (custom pricing). Each plan includes different usage limits, features, and support levels. You can upgrade or downgrade anytime.',
      category: 'billing',
      helpful: 203,
      views: 3456,
      isPopular: true
    },
    {
      id: '5',
      question: 'Is my data secure and private?',
      answer: 'Absolutely! We use enterprise-grade encryption, comply with GDPR and SOC 2 standards, and never use your data to train AI models. Your conversations and data remain completely private and secure.',
      category: 'getting-started',
      helpful: 187,
      views: 2234
    }
  ];

  // Mock data pour les tickets
  const supportTickets: SupportTicket[] = [
    {
      id: 'TICK-001',
      title: 'API Integration Issue with Webhooks',
      status: 'open',
      priority: 'high',
      category: 'integrations',
      created: '2024-01-15',
      lastUpdate: '2024-01-16',
      messages: 3
    },
    {
      id: 'TICK-002',
      title: 'Billing Question about Enterprise Plan',
      status: 'pending',
      priority: 'medium',
      category: 'billing',
      created: '2024-01-14',
      lastUpdate: '2024-01-15',
      messages: 2
    },
    {
      id: 'TICK-003',
      title: 'Agent Not Responding Correctly',
      status: 'resolved',
      priority: 'medium',
      category: 'ai-agents',
      created: '2024-01-12',
      lastUpdate: '2024-01-13',
      messages: 5
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'pending': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'resolved': return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
      case 'closed': return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const filteredFAQs = faqItems.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logique d'envoi du formulaire ici
    console.log('Contact form submitted:', contactForm);
  };

  return (
    <div className="min-h-screen bg-premium-gradient relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-600/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/20">
                  <HelpCircle className="text-white" size={28} />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center">
                  <Sparkles className="text-white" size={12} />
                </div>
              </div>
              
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-2">
                  Support Center
                </h1>
                <p className="text-gray-400 text-lg">
                  Get help, find answers, and connect with our support team
                </p>
              </div>
            </div>
            
            {/* Quick Contact */}
            <div className="flex items-center gap-4">
              <a 
                href="mailto:support@testyourainow.com"
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl backdrop-blur-sm text-emerald-400 hover:bg-emerald-500/30 transition-all"
              >
                <Mail size={16} />
                <span className="font-medium">Quick Email</span>
              </a>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-2">
            <div className="flex gap-2">
              {[
                { id: 'help-center', label: 'Help Center', icon: Book },
                { id: 'contact', label: 'Contact Support', icon: MessageCircle },
                { id: 'tickets', label: 'My Tickets', icon: Archive }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Help Center Tab */}
        {activeTab === 'help-center' && (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Categories Sidebar */}
            <div className="xl:col-span-1">
              <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6 sticky top-8">
                <div className="flex items-center gap-3 mb-6">
                  <Book className="text-cyan-400" size={20} />
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
                          <div className="text-left">
                            <div className="font-medium">{category.name}</div>
                            <div className="text-xs opacity-70">{category.description}</div>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          isActive 
                            ? `bg-${category.color}-500/30 text-${category.color}-300` 
                            : 'bg-gray-700/50 text-gray-400 group-hover:bg-gray-600/50 group-hover:text-gray-300'
                        }`}>
                          {category.articleCount}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Quick Links */}
                <div className="mt-8 p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="text-blue-400" size={16} />
                    <span className="text-blue-200 text-sm font-semibold">Quick Actions</span>
                  </div>
                  <div className="space-y-2">
                    <button className="w-full text-left px-3 py-2 text-blue-300 hover:text-blue-200 text-xs rounded-lg hover:bg-blue-500/10 transition-all">
                      📖 Getting Started Guide
                    </button>
                    <button className="w-full text-left px-3 py-2 text-blue-300 hover:text-blue-200 text-xs rounded-lg hover:bg-blue-500/10 transition-all">
                      🎥 Video Tutorials
                    </button>
                    <button className="w-full text-left px-3 py-2 text-blue-300 hover:text-blue-200 text-xs rounded-lg hover:bg-blue-500/10 transition-all">
                      🔧 API Documentation
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Content */}
            <div className="xl:col-span-3">
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search help articles, FAQs, and guides..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400 font-medium"
                  />
                </div>
              </div>

              {/* FAQ List */}
              <div className="space-y-4">
                {filteredFAQs.map((faq) => (
                  <div
                    key={faq.id}
                    className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-xl overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                      className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-800/30 transition-all"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
                          {faq.isPopular && (
                            <span className="px-2 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-yellow-400 text-xs rounded-full font-semibold flex items-center gap-1">
                              <TrendingUp size={10} />
                              Popular
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <div className="flex items-center gap-1">
                            <Eye size={12} />
                            <span>{faq.views.toLocaleString()} views</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsUp size={12} />
                            <span>{faq.helpful} helpful</span>
                          </div>
                        </div>
                      </div>
                      <ChevronDown 
                        className={`text-gray-400 transition-transform duration-300 ${
                          expandedFAQ === faq.id ? 'rotate-180' : ''
                        }`} 
                        size={20} 
                      />
                    </button>
                    
                    {expandedFAQ === faq.id && (
                      <div className="px-6 pb-6 border-t border-gray-700/50">
                        <div className="pt-4 text-gray-300 leading-relaxed">
                          {faq.answer}
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700/30">
                          <span className="text-xs text-gray-500">Was this helpful?</span>
                          <div className="flex gap-2">
                            <button className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs rounded-lg transition-all">
                              👍 Yes
                            </button>
                            <button className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs rounded-lg transition-all">
                              👎 No
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredFAQs.length === 0 && (
                <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-12 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Search className="w-10 h-10 text-gray-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">No articles found</h3>
                  <p className="text-gray-400 max-w-md mx-auto mb-6">
                    Try different keywords or browse our categories to find what you're looking for.
                  </p>
                  <button 
                    onClick={() => setActiveTab('contact')}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-semibold transition-all"
                  >
                    Contact Support
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contact Support Tab */}
        {activeTab === 'contact' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <MessageCircle className="text-emerald-400" size={24} />
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-200 to-green-200 bg-clip-text text-transparent">Contact Our Support Team</h2>
                </div>

                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                      <input
                        type="text"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 text-white rounded-xl outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all backdrop-blur-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                      <input
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 text-white rounded-xl outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all backdrop-blur-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                      <select
                        value={contactForm.category}
                        onChange={(e) => setContactForm({...contactForm, category: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 text-white rounded-xl outline-none focus:border-emerald-500/60 transition-all backdrop-blur-sm"
                        required
                      >
                        <option value="">Select a category</option>
                        <option value="technical">Technical Issue</option>
                        <option value="billing">Billing Question</option>
                        <option value="feature">Feature Request</option>
                        <option value="general">General Inquiry</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                      <select
                        value={contactForm.priority}
                        onChange={(e) => setContactForm({...contactForm, priority: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 text-white rounded-xl outline-none focus:border-emerald-500/60 transition-all backdrop-blur-sm"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                    <input
                      type="text"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 text-white rounded-xl outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all backdrop-blur-sm"
                      placeholder="Brief description of your issue"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                    <textarea
                      value={contactForm.message}
                      onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                      rows={6}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 text-white rounded-xl outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all backdrop-blur-sm resize-none"
                      placeholder="Please provide detailed information about your issue..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Attachments</label>
                    <div className="border-2 border-dashed border-gray-600 rounded-xl p-6 text-center hover:border-emerald-500/50 transition-all cursor-pointer">
                      <Paperclip className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">Drop files here or click to upload</p>
                      <p className="text-gray-500 text-xs mt-1">Max 10MB per file</p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-emerald-500/20 transform hover:scale-105 flex items-center justify-center gap-3"
                  >
                    <Send size={20} />
                    Send Message
                  </button>
                </form>
              </div>
            </div>

            {/* Contact Info Sidebar */}
            <div className="space-y-6">
              {/* Contact Methods */}
              <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Mail className="text-blue-400" size={20} />
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">Get in Touch</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <Mail className="text-blue-400" size={16} />
                    <div>
                      <div className="text-white font-medium">Email Support</div>
                      <div className="text-blue-300 text-sm">support@testyourainow.com</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <Clock className="text-emerald-400" size={16} />
                    <div>
                      <div className="text-white font-medium">Response Time</div>
                      <div className="text-emerald-300 text-sm">Usually within 2-4 hours</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                    <Users className="text-purple-400" size={16} />
                    <div>
                      <div className="text-white font-medium">Available Hours</div>
                      <div className="text-purple-300 text-sm">Mon-Fri, 9AM-6PM EST</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Support Status */}
              <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="text-emerald-400" size={20} />
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-emerald-200 to-green-200 bg-clip-text text-transparent">System Status</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="text-emerald-200 text-sm font-medium">All Systems Operational</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                      <span className="text-blue-200 text-sm font-medium">API Response: 99.9%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                      <span className="text-cyan-200 text-sm font-medium">Average Response: 1.2s</span>
                    </div>
                  </div>
                </div>

                <button className="w-full mt-4 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 text-gray-300 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
                  <ExternalLink size={14} />
                  View Status Page
                </button>
              </div>

              {/* Help Resources */}
              <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Book className="text-cyan-400" size={20} />
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-cyan-200 to-blue-200 bg-clip-text text-transparent">Quick Resources</h3>
                </div>

                <div className="space-y-3">
                  <button className="w-full text-left p-3 bg-gray-800/30 hover:bg-gray-700/50 border border-gray-700/30 hover:border-gray-600/50 rounded-xl transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                        <Book size={14} className="text-white" />
                      </div>
                      <div>
                        <div className="text-white font-medium group-hover:text-blue-300 transition-colors">Documentation</div>
                        <div className="text-gray-400 text-xs">Complete API docs</div>
                      </div>
                    </div>
                  </button>

                  <button className="w-full text-left p-3 bg-gray-800/30 hover:bg-gray-700/50 border border-gray-700/30 hover:border-gray-600/50 rounded-xl transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                        <Globe size={14} className="text-white" />
                      </div>
                      <div>
                        <div className="text-white font-medium group-hover:text-purple-300 transition-colors">Community Forum</div>
                        <div className="text-gray-400 text-xs">Ask the community</div>
                      </div>
                    </div>
                  </button>

                  <button className="w-full text-left p-3 bg-gray-800/30 hover:bg-gray-700/50 border border-gray-700/30 hover:border-gray-600/50 rounded-xl transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-green-600 rounded-lg flex items-center justify-center">
                        <Code size={14} className="text-white" />
                      </div>
                      <div>
                        <div className="text-white font-medium group-hover:text-emerald-300 transition-colors">Code Examples</div>
                        <div className="text-gray-400 text-xs">Ready-to-use snippets</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Tickets Tab */}
        {activeTab === 'tickets' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Tickets List */}
            <div className="lg:col-span-2">
              <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Archive className="text-purple-400" size={24} />
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">Support Tickets</h2>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-semibold transition-all">
                    <PlusCircle size={16} />
                    New Ticket
                  </button>
                </div>

                <div className="space-y-4">
                  {supportTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-5 hover:bg-gray-700/50 transition-all duration-300 cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">{ticket.title}</h3>
                            <span className="text-xs text-gray-400 font-mono">#{ticket.id}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded-lg border ${getStatusColor(ticket.status)}`}>
                              {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-lg border ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                            </span>
                            <span className="text-xs text-gray-400">{ticket.category}</span>
                          </div>
                        </div>
                        <ChevronRight className="text-gray-400 group-hover:text-white transition-colors" size={20} />
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Calendar size={12} />
                            <span>Created {ticket.created}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={12} />
                            <span>Updated {ticket.lastUpdate}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle size={12} />
                          <span>{ticket.messages} messages</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {supportTickets.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Archive className="w-10 h-10 text-gray-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">No support tickets</h3>
                    <p className="text-gray-400 max-w-md mx-auto mb-6">
                      You haven't created any support tickets yet. Need help? Create your first ticket.
                    </p>
                    <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-semibold transition-all">
                      Create First Ticket
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Tickets Sidebar */}
            <div className="space-y-6">
              {/* Ticket Stats */}
              <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="text-blue-400" size={20} />
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">Ticket Overview</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 rounded-xl">
                    <span className="text-gray-400 font-medium">Open Tickets</span>
                    <span className="text-blue-400 font-bold">1</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 rounded-xl">
                    <span className="text-gray-400 font-medium">Pending Response</span>
                    <span className="text-yellow-400 font-bold">1</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 rounded-xl">
                    <span className="text-gray-400 font-medium">Resolved</span>
                    <span className="text-emerald-400 font-bold">1</span>
                  </div>
                </div>
              </div>

              {/* Support Tips */}
              <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Award className="text-yellow-400" size={20} />
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-yellow-200 to-orange-200 bg-clip-text text-transparent">Support Tips</h3>
                </div>

                <div className="space-y-4">
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                    <div className="text-yellow-200 text-sm font-medium mb-1">💡 Be Specific</div>
                    <div className="text-yellow-100/80 text-xs">Include error messages, steps to reproduce, and expected behavior.</div>
                  </div>
                  
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <div className="text-blue-200 text-sm font-medium mb-1">📷 Add Screenshots</div>
                    <div className="text-blue-100/80 text-xs">Visual information helps us understand issues faster.</div>
                  </div>

                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <div className="text-emerald-200 text-sm font-medium mb-1">⚡ Check FAQ First</div>
                    <div className="text-emerald-100/80 text-xs">Many common questions are answered in our help center.</div>
                  </div>
                </div>
              </div>

              {/* Response Time */}
              <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Clock className="text-emerald-400" size={20} />
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-emerald-200 to-green-200 bg-clip-text text-transparent">Response Times</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <span className="text-red-200 text-sm">Urgent</span>
                    <span className="text-red-300 font-semibold text-sm"> 1 hour</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                    <span className="text-orange-200 text-sm">High</span>
                    <span className="text-orange-300 font-semibold text-sm"> 4 hours</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                    <span className="text-yellow-200 text-sm">Medium</span>
                    <span className="text-yellow-300 font-semibold text-sm"> 24 hours</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <span className="text-emerald-200 text-sm">Low</span>
                    <span className="text-emerald-300 font-semibold text-sm"> 48 hours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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