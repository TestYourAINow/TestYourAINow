// app/(dashboard)/support/page.tsx (UPDATED)
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  MessageCircle, Search, Mail, Phone, Clock, CheckCircle, 
  AlertTriangle, Info, HelpCircle, Send, Paperclip, Star,
  Zap, Shield, Bot, Code, Globe, Book, ChevronDown, ChevronRight,
  ExternalLink, Copy, Users, Award, Crown, Sparkles,
  Calendar, Archive, PlusCircle, BarChart3, Camera, User, Image, X
} from 'lucide-react';
import { useSupport } from '@/hooks/useSupport';
import { toast } from 'sonner';

// Types
interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface Category {
  id: string;
  name: string;
  icon: any;
  color: string;
  description: string;
  articleCount: number;
}

interface AttachmentType {
  type: string;
  url: string;
  filename: string;
  size: number;
  path: string;
}

export default function SupportPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { tickets, loading, error, createTicket, uploadScreenshot } = useSupport();

  const [activeTab, setActiveTab] = useState('help-center');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [ticketSearchQuery, setTicketSearchQuery] = useState('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState('pending'); // 🔧 Défaut à pending
  const [contactForm, setContactForm] = useState<{
    subject: string;
    category: string;
    message: string;
    attachments: AttachmentType[];
  }>({
    subject: '',
    category: '',
    message: '',
    attachments: []
  });
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  // Catégories basées sur le vrai FAQ
  const categories: Category[] = [
    { 
      id: 'all', 
      name: 'All Topics', 
      icon: Book, 
      color: 'blue', 
      description: 'Browse all help articles',
      articleCount: 12 
    },
    { 
      id: 'getting-started', 
      name: 'Getting Started', 
      icon: Zap, 
      color: 'emerald', 
      description: 'Platform overview and basics',
      articleCount: 2 
    },
    { 
      id: 'building-agents', 
      name: 'Building Agents', 
      icon: Bot, 
      color: 'purple', 
      description: 'Creating prompts and agents',
      articleCount: 3 
    },
    { 
      id: 'account-billing', 
      name: 'Account & Billing', 
      icon: Crown, 
      color: 'yellow', 
      description: 'Subscription and account issues',
      articleCount: 4 
    },
    { 
      id: 'technical-issues', 
      name: 'Technical Issues', 
      icon: AlertTriangle, 
      color: 'red', 
      description: 'Troubleshooting and API problems',
      articleCount: 3 
    }
  ];

  // FAQ basé sur votre contenu réel
  const faqItems: FAQItem[] = [
    {
      id: '1',
      question: 'What is TestYourAI Now?',
      answer: 'TestYourAI Now is an AI-powered platform designed to help AI automation agencies build better prompts for their AI agents. It supports the entire workflow—from building to launching your agents.',
      category: 'getting-started'
    },
    {
      id: '2',
      question: 'What are the pricing options?',
      answer: 'You can subscribe for $39/month. Use the promo code 3MONTHS50 to get your first three months at $19.50/month.',
      category: 'account-billing'
    },
    {
      id: '3',
      question: 'I\'m experiencing loading issues while building agents or prompts. What should I do?',
      answer: 'Please check your OpenAI credit balance. If necessary, add more credits or generate a new API key.',
      category: 'technical-issues'
    },
    {
      id: '4',
      question: 'Is there a character limit when building agents?',
      answer: 'Yes, the character limit is 15,000 characters. If you exceed it, use the "Turn into FAQ" feature to split your content.',
      category: 'building-agents'
    },
    {
      id: '5',
      question: 'How can I change the email associated with my account?',
      answer: 'Send an email to support@testyourainow.com with both your current and new email addresses. We\'ll handle the update for you.',
      category: 'account-billing'
    },
    {
      id: '6',
      question: 'I didn\'t receive the verification or login email.',
      answer: 'Make sure you\'re using the same email associated with your Stripe payment. Also, check your spam or junk folders.',
      category: 'account-billing'
    },
    {
      id: '7',
      question: 'My account says I need to pay, but I already did. What should I do?',
      answer: 'Double-check that you\'re logged in with the email used during checkout on Stripe.',
      category: 'account-billing'
    },
    {
      id: '8',
      question: 'I forgot to apply my discount code. Can I get a refund?',
      answer: 'Please contact support@testyourainow.com with your request. We\'ll review your case and do our best to help.',
      category: 'account-billing'
    },
    {
      id: '9',
      question: 'Can I use languages other than English?',
      answer: 'Yes, you can configure prompts in any language of your choice.',
      category: 'building-agents'
    },
    {
      id: '10',
      question: 'I\'m getting an API key error. What does that mean?',
      answer: 'It usually means your OpenAI credits are low or empty. Check your balance and regenerate a new API key if needed.',
      category: 'technical-issues'
    },
    {
      id: '11',
      question: 'Can I import content from multiple URLs or manage long documents?',
      answer: 'Yes. Use the "Turn into FAQ" feature, or ask ChatGPT to help transform your website content into FAQs.',
      category: 'building-agents'
    },
    {
      id: '12',
      question: 'Will my clients know that the chatbot demo was built with TestYourAI Now?',
      answer: 'No. Demo versions do not display any branding or references to TestYourAI Now.',
      category: 'getting-started'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-orange-300 bg-orange-500/20 border border-orange-500/40 backdrop-blur-sm';
      case 'open': return 'text-blue-300 bg-blue-500/20 border border-blue-500/40 backdrop-blur-sm';
      case 'closed': return 'text-gray-300 bg-gray-500/20 border border-gray-500/40 backdrop-blur-sm';
      default: return 'text-gray-300 bg-gray-500/20 border border-gray-500/40 backdrop-blur-sm';
    }
  };

  // 🔧 NOUVEAUX FILTRES: Seulement 3 statuts
  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = ticketStatusFilter === 'all' || ticket.status === ticketStatusFilter;
    const matchesSearch = ticket.title.toLowerCase().includes(ticketSearchQuery.toLowerCase()) ||
                         ticket.id.toLowerCase().includes(ticketSearchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredFAQs = faqItems.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Fonction pour naviguer vers la conversation
  const handleTicketClick = (ticketId: string) => {
    console.log('🎯 Clicking on ticket ID:', ticketId);
    router.push(`/support/${ticketId}`);
  };

  // Upload d'attachments
  const handleFileUpload = async (file: File) => {
    if (uploadingAttachment) return;
    
    setUploadingAttachment(true);
    
    try {
      const tempTicketId = 'temp-' + Date.now();
      const attachment = await uploadScreenshot(file, tempTicketId);
      
      setContactForm(prev => ({
        ...prev,
        attachments: [...prev.attachments, {
          type: attachment.type,
          url: attachment.url,
          filename: attachment.filename,
          size: attachment.size,
          path: attachment.path
        }]
      }));
      
      toast.success('Fichier ajouté');
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
    } finally {
      setUploadingAttachment(false);
    }
  };

  // Submit du formulaire de contact
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const formDataWithUser = {
        name: session?.user?.name || 'User',
        email: session?.user?.email || '',
        subject: contactForm.subject,
        category: contactForm.category,
        message: contactForm.message,
        attachments: contactForm.attachments
      };
      
      const result = await createTicket(formDataWithUser);
      toast.success(`Ticket ${result.ticketId} créé avec succès !`);
      
      // Reset form
      setContactForm({
        subject: '',
        category: '',
        message: '',
        attachments: []
      });
      
      // Changer vers l'onglet tickets
      setActiveTab('tickets');
    } catch (error) {
      toast.error('Erreur lors de la création du ticket');
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4 md:p-8">
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
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
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-2 pb-1">
                Support Center
              </h1>
              <p className="text-gray-400 text-lg">
                Get help, find answers, and connect with our support team
              </p>
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

        {/* Help Center Tab - Inchangé */}
        {activeTab === 'help-center' && (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Categories Sidebar */}
            <div className="xl:col-span-1">
              <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6 sticky top-8">
                <div className="flex items-center gap-3 mb-6">
                  <Book className="text-blue-400" size={20} />
                  <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent ml-2">Categories</h2>
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
                            ? 'text-white bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30'
                            : 'hover:bg-gray-800/50 text-gray-300 hover:text-white border border-transparent hover:border-gray-700/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`${isActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-white'} transition-colors`} size={18} />
                          <div className="text-left">
                            <div className="font-medium">{category.name}</div>
                            <div className="text-xs opacity-70">{category.description}</div>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          isActive 
                            ? 'bg-blue-500/30 text-blue-300'
                            : 'bg-gray-700/50 text-gray-400 group-hover:bg-gray-600/50 group-hover:text-gray-300'
                        }`}>
                          {category.articleCount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* FAQ Content */}
            <div className="xl:col-span-3">
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" size={20} />
                  <input
                    type="text"
                    placeholder="Search help articles, FAQs, and guides..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-900/95 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400 font-medium"
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
                  <MessageCircle className="text-blue-400" size={24} />
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">Contact Our Support Team</h2>
                </div>

                <form onSubmit={handleContactSubmit} className="space-y-6">
                  {/* Affichage des infos user (lecture seule) */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-blue-300 mb-2">Informations du compte</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-300">
                        <User size={14} className="text-blue-400" />
                        <span>{session?.user?.name || 'Utilisateur'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <Mail size={14} className="text-blue-400" />
                        <span>{session?.user?.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* 🔧 NOUVELLES CATÉGORIES: Seulement 4 options */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Catégorie *</label>
                    <select
                      value={contactForm.category}
                      onChange={(e) => setContactForm({...contactForm, category: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 transition-all backdrop-blur-sm"
                      required
                    >
                      <option value="">Sélectionner une catégorie</option>
                      <option value="technical">Problème technique</option>
                      <option value="billing">Question de facturation</option>
                      <option value="general">Question générale</option>
                      <option value="account">Problème de compte</option>
                    </select>
                  </div>

                  {/* Sujet */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Sujet *</label>
                    <input
                      type="text"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all backdrop-blur-sm"
                      placeholder="Décrivez brièvement votre problème"
                      required
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Message *</label>
                    <textarea
                      value={contactForm.message}
                      onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                      rows={6}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all backdrop-blur-sm resize-none"
                      placeholder="Décrivez votre problème en détail..."
                      required
                    />
                  </div>

                  {/* Attachments */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Captures d'écran (optionnel)</label>
                    <div>
                      <input
                        type="file"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleFileUpload(e.target.files[0]);
                          }
                        }}
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="border-2 border-dashed border-gray-600 rounded-xl p-6 text-center hover:border-blue-500/50 transition-all cursor-pointer block"
                      >
                        {uploadingAttachment ? (
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                        ) : (
                          <Paperclip className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                        )}
                        <p className="text-gray-400 text-sm">
                          {uploadingAttachment ? 'Téléchargement...' : 'Cliquez pour ajouter une image'}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">JPEG, PNG, WebP - Max 5MB</p>
                      </label>
                    </div>

                    {/* Preview des attachments */}
                    {contactForm.attachments.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm text-gray-300">Fichiers attachés :</p>
                        {contactForm.attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Image size={16} className="text-blue-400" />
                              <span className="text-sm text-gray-300">{attachment.filename}</span>
                              <span className="text-xs text-gray-500">
                                ({Math.round(attachment.size / 1024)} KB)
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setContactForm(prev => ({
                                  ...prev,
                                  attachments: prev.attachments.filter((_, i) => i !== index)
                                }));
                              }}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={!contactForm.subject || !contactForm.category || !contactForm.message}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-gray-700 disabled:to-gray-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/20 transform hover:scale-105 flex items-center justify-center gap-3 disabled:transform-none disabled:shadow-none"
                  >
                    <Send size={20} />
                    Créer le ticket
                  </button>
                </form>
              </div>
            </div>

            {/* Contact Info Sidebar */}
            <div className="space-y-6">
              {/* Ticket Tracking Info */}
              <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Archive className="text-blue-400" size={20} />
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">Track Your Request</h3>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-800/30 border border-gray-700/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Send className="text-blue-400" size={14} />
                      <div className="text-white text-sm font-medium">After Sending Request</div>
                    </div>
                    <div className="text-gray-300 text-xs leading-relaxed">
                      Your message will be converted to a support ticket automatically and processed by our team.
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-800/30 border border-gray-700/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Archive className="text-blue-400" size={14} />
                      <div className="text-white text-sm font-medium">Find Your Tickets</div>
                    </div>
                    <div className="text-gray-300 text-xs leading-relaxed">
                      Visit the "My Tickets" tab to track progress, add comments, and view responses from our support team.
                    </div>
                  </div>

                  <div className="p-4 bg-gray-800/30 border border-gray-700/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="text-blue-400" size={14} />
                      <div className="text-white text-sm font-medium">Quick Response</div>
                    </div>
                    <div className="text-gray-300 text-xs leading-relaxed">
                      We do our best to respond as quickly as possible, typically within 24-48 hours. Our team is available around the clock to assist you.
                    </div>
                  </div>
                </div>
              </div>

              {/* Support Tips */}
              <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Award className="text-blue-400" size={20} />
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">Support Tips</h3>
                </div>

                <div className="space-y-4">
                  <div className="p-3 bg-gray-800/30 border border-gray-700/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Info className="text-blue-400" size={12} />
                      <div className="text-white text-sm font-medium">Be Specific</div>
                    </div>
                    <div className="text-gray-300 text-xs">Include error messages, steps to reproduce, and expected behavior.</div>
                  </div>
                  
                  <div className="p-3 bg-gray-800/30 border border-gray-700/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Camera className="text-blue-400" size={12} />
                      <div className="text-white text-sm font-medium">Add Screenshots</div>
                    </div>
                    <div className="text-gray-300 text-xs">Visual information helps us understand issues faster.</div>
                  </div>

                  <div className="p-3 bg-gray-800/30 border border-gray-700/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="text-blue-400" size={12} />
                      <div className="text-white text-sm font-medium">Check FAQ First</div>
                    </div>
                    <div className="text-gray-300 text-xs">Many common questions are answered in our help center.</div>
                  </div>
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
                    <Archive className="text-blue-400" size={24} />
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">Support Tickets</h2>
                  </div>
                  <button 
                    onClick={() => setActiveTab('contact')}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-semibold transition-all"
                  >
                    <PlusCircle size={16} />
                    New Ticket
                  </button>
                </div>

                {/* Search and Filter */}
                <div className="mb-6 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" size={20} />
                    <input
                      type="text"
                      placeholder="Search tickets by title or ID..."
                      value={ticketSearchQuery}
                      onChange={(e) => setTicketSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400 font-medium"
                    />
                  </div>
                  
                  {/* 🔧 NOUVEAUX FILTRES: Seulement 3 statuts */}
                  <div className="flex gap-2">
                    {['pending', 'open', 'closed'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setTicketStatusFilter(status)}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                          ticketStatusFilter === status
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => handleTicketClick(ticket.id)}
                      className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-5 hover:bg-gray-700/50 transition-all duration-300 cursor-pointer group hover:border-blue-500/30"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">{ticket.title}</h3>
                            <span className="text-xs text-gray-400 font-mono">#{ticket.id}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow-lg ${getStatusColor(ticket.status)}`}>
                              {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                            </span>
                            <span className="text-xs text-gray-400">{ticket.category}</span>
                          </div>
                        </div>
                        <ChevronRight className="text-gray-400 group-hover:text-blue-400 transition-colors" size={20} />
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Calendar size={12} />
                            <span>Créé le {ticket.created}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={12} />
                            <span>Mis à jour le {ticket.lastUpdate}</span>
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

                {filteredTickets.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Archive className="w-10 h-10 text-gray-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">
                      {tickets.length === 0 ? 'Aucun ticket de support' : 'Aucun ticket trouvé'}
                    </h3>
                    <p className="text-gray-400 max-w-md mx-auto mb-6">
                      {tickets.length === 0 
                        ? "Vous n'avez pas encore créé de tickets de support. Besoin d'aide ? Créez votre premier ticket."
                        : "Essayez d'ajuster vos critères de recherche ou de filtre pour trouver ce que vous cherchez."
                      }
                    </p>
                    <button 
                      onClick={() => {
                        if (tickets.length === 0) {
                          setActiveTab('contact');
                        } else {
                          setTicketSearchQuery('');
                          setTicketStatusFilter('pending');
                        }
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-semibold transition-all"
                    >
                      {tickets.length === 0 ? 'Créer le premier ticket' : 'Effacer les filtres'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 🔧 STATISTIQUES MISES À JOUR: 3 statuts seulement */}
            <div className="space-y-6">
              <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <BarChart3 className="text-blue-400" size={20} />
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">Ticket Overview</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-xl">
                    <span className="text-gray-300 font-medium">En attente</span>
                    <span className="text-orange-400 font-bold">
                      {tickets.filter(t => t.status === 'pending').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-xl">
                    <span className="text-gray-300 font-medium">Ouverts</span>
                    <span className="text-blue-400 font-bold">
                      {tickets.filter(t => t.status === 'open').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-xl">
                    <span className="text-gray-300 font-medium">Fermés</span>
                    <span className="text-gray-400 font-bold">
                      {tickets.filter(t => t.status === 'closed').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}