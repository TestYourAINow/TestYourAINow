"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Search, Book, Zap, Bot, Crown, AlertTriangle, 
  ChevronDown, HelpCircle, Sparkles
} from 'lucide-react';

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

export default function FAQPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

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

  const filteredFAQs = faqItems.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <main 
      className="min-h-screen text-white pt-20"
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
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 py-12">
        {/* Back Button */}
        <button 
          onClick={() => router.push('/')}
          className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-300 mb-8"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
          <span>Back to Home</span>
        </button>

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-full px-6 py-3 mb-6 backdrop-blur-xl">
            <HelpCircle className="w-5 h-5 text-blue-400" />
            <span className="text-blue-400 text-sm font-semibold">Help Center</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h1>
          
          <p className="text-gray-300 text-lg">
            Find answers to common questions about TestYourAI Now
          </p>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="xl:col-span-1">
            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6 sticky top-8">
              <div className="flex items-center gap-3 mb-6">
                <Book className="text-blue-400" size={20} />
                <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">Categories</h2>
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
                  className="w-full pl-12 pr-4 py-4 bg-gray-900/50 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400 font-medium backdrop-blur-xl"
                />
              </div>
            </div>

            {/* FAQ List */}
            <div className="space-y-4">
              {filteredFAQs.map((faq) => (
                <div
                  key={faq.id}
                  className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-xl overflow-hidden"
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
              <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">No articles found</h3>
                <p className="text-gray-400 max-w-md mx-auto mb-6">
                  Try different keywords or browse our categories to find what you're looking for.
                </p>
                <a 
                  href="mailto:support@testyourainow.com"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-semibold transition-all hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
                >
                  <HelpCircle className="w-5 h-5" />
                  Contact Support
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="text-center mt-16">
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600/20 to-green-600/20 border border-emerald-500/30 rounded-full px-4 py-2 mb-6 backdrop-blur-xl">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 text-sm font-semibold">Still Need Help?</span>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-4">
              Can't find what you're looking for?
            </h3>
            
            <p className="text-gray-400 mb-6">
              Our support team is here to help you get the most out of TestYourAI Now.
            </p>
            
            <a 
              href="mailto:support@testyourainow.com"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
            >
              <HelpCircle className="w-5 h-5" />
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}