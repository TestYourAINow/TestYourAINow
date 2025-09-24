'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  MessageCircle, Search, Clock, CheckCircle,
  Send, Paperclip,
  Calendar, Archive, PlusCircle, BarChart3, User, Image, X
} from 'lucide-react';
import { useSupport } from '@/hooks/useSupport';
import { toast } from 'sonner';

interface AttachmentType {
  type: string;
  url: string;
  filename: string;
  size: number;
  path: string;
}

export default function SupportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  // NEW: Get tab from URL params with fallback
  const urlTab = searchParams.get('tab') || 'contact';
  const [activeTab, setActiveTab] = useState(urlTab);

  const {
    tickets,
    unreadCounts, // NEW
    loading,
    error,
    createTicket,
    uploadScreenshot,
    refetchUnreadCounts // NEW
  } = useSupport();

  const [ticketSearchQuery, setTicketSearchQuery] = useState('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState('all');
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

  // NEW: Update URL when tab changes
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    const newUrl = `/support?tab=${newTab}`;
    router.push(newUrl, { scroll: false });

    // Refresh unread counts when switching to tickets tab
    if (newTab === 'tickets') {
      refetchUnreadCounts();
    }
  };

  // NEW: Sync tab with URL params
  useEffect(() => {
    setActiveTab(urlTab);
  }, [urlTab]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-orange-300 bg-orange-500/20 border border-orange-500/40 backdrop-blur-sm';
      case 'open': return 'text-blue-300 bg-blue-500/20 border border-blue-500/40 backdrop-blur-sm';
      case 'closed': return 'text-gray-300 bg-gray-500/20 border border-gray-500/40 backdrop-blur-sm';
      default: return 'text-gray-300 bg-gray-500/20 border border-gray-500/40 backdrop-blur-sm';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = ticketStatusFilter === 'all' || ticket.status === ticketStatusFilter;
    const matchesSearch = ticket.title.toLowerCase().includes(ticketSearchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(ticketSearchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleTicketClick = (ticketId: string) => {
    router.push(`/support/${ticketId}`);
  };

  // Upload with 3 file limit
  const handleFileUpload = async (file: File) => {
    if (uploadingAttachment) return;

    // Check: Max 3 files
    if (contactForm.attachments.length >= 3) {
      toast.error('Maximum 3 files allowed');
      return;
    }

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

      toast.success(`File added (${contactForm.attachments.length + 1}/3)`);
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploadingAttachment(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formDataWithUser = {
        name: session?.user?.name || 'User',
        email: session?.user?.email || '',
        subject: contactForm.subject,
        category: contactForm.category,
        priority: '',
        message: contactForm.message,
        attachments: contactForm.attachments
      };

      const result = await createTicket(formDataWithUser);
      toast.success(`Ticket ${result.ticketId} created successfully!`);

      setContactForm({
        subject: '',
        category: '',
        message: '',
        attachments: []
      });

      // NEW: Navigate to tickets tab after creating ticket
      handleTabChange('tickets');
    } catch (error) {
      toast.error('Failed to create ticket');
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
                <MessageCircle className="text-white" size={28} />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center">
                <Send className="text-white" size={12} />
              </div>
            </div>

            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-2 pb-1">
                Support Center
              </h1>
              <p className="text-gray-400 text-lg">
                Get help and connect with our support team
              </p>
            </div>
          </div>
        </div>

        {/* Navigation tabs with unread badges */}
        <div className="mb-8">
          <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-2">
            <div className="flex gap-2">
              {[
                { id: 'contact', label: 'Contact Support', icon: MessageCircle },
                { id: 'tickets', label: 'My Tickets', icon: Archive }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const showBadge = tab.id === 'tickets' && unreadCounts.totalUnread > 0;

                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 relative ${isActive
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                      }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                    {/* Badge seulement si > 0 */}
                    {showBadge && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                        {unreadCounts.totalUnread > 9 ? '9+' : unreadCounts.totalUnread}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

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
                  {/* Account information display */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-blue-300 mb-2">Account Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-300">
                        <User size={14} className="text-blue-400" />
                        <span>{session?.user?.name || 'User'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <MessageCircle size={14} className="text-blue-400" />
                        <span>{session?.user?.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
                    <select
                      value={contactForm.category}
                      onChange={(e) => setContactForm({ ...contactForm, category: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 transition-all backdrop-blur-sm"
                      required
                    >
                      <option value="">Select a category</option>
                      <option value="technical">Technical Issue</option>
                      <option value="billing">Billing Question</option>
                      <option value="general">General Question</option>
                      <option value="account">Account Issue</option>
                    </select>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Subject *</label>
                    <input
                      type="text"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all backdrop-blur-sm"
                      placeholder="Briefly describe your issue"
                      required
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Message *</label>
                    <textarea
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      rows={6}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all backdrop-blur-sm resize-none"
                      placeholder="Describe your issue in detail..."
                      required
                    />
                  </div>

                  {/* Attachments with 3 file limit */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Screenshots (optional) - Max 3 files
                    </label>
                    <div>
                      <input
                        type="file"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleFileUpload(e.target.files[0]);
                            e.target.value = '';
                          }
                        }}
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        id="file-upload"
                        disabled={contactForm.attachments.length >= 3 || uploadingAttachment}
                      />
                      <label
                        htmlFor="file-upload"
                        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer block ${contactForm.attachments.length >= 3
                          ? 'border-gray-600 opacity-50 cursor-not-allowed'
                          : 'border-gray-600 hover:border-blue-500/50'
                          }`}
                      >
                        {uploadingAttachment ? (
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                        ) : (
                          <Paperclip className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                        )}
                        <p className="text-gray-400 text-sm">
                          {uploadingAttachment
                            ? 'Uploading...'
                            : contactForm.attachments.length >= 3
                              ? '3 file limit reached'
                              : `Click to add an image (${contactForm.attachments.length}/3)`
                          }
                        </p>
                        <p className="text-gray-500 text-xs mt-1">JPEG, PNG, WebP - Max 5MB per file</p>
                      </label>
                    </div>

                    {/* Attachment preview */}
                    {contactForm.attachments.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm text-gray-300">Attached files ({contactForm.attachments.length}/3):</p>
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
                                toast.success('File removed');
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
                    Create ticket
                  </button>
                </form>
              </div>
            </div>

            {/* Contact Info Sidebar */}
            <div className="space-y-6">
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
                      Visit the "My Tickets" tab to track progress and view responses from our support team.
                    </div>
                  </div>

                  <div className="p-4 bg-gray-800/30 border border-gray-700/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="text-blue-400" size={14} />
                      <div className="text-white text-sm font-medium">Quick Response</div>
                    </div>
                    <div className="text-gray-300 text-xs leading-relaxed">
                      We do our best to respond as quickly as possible, typically within 24-48 hours.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Tickets Tab */}
        {activeTab === 'tickets' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Archive className="text-blue-400" size={24} />
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">Support Tickets</h2>
                  </div>
                  <button
                    onClick={() => handleTabChange('contact')}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-semibold transition-all"
                  >
                    <PlusCircle size={16} />
                    New Ticket
                  </button>
                </div>

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

                  <div className="flex gap-2">
                    {['all', 'pending', 'open', 'closed'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setTicketStatusFilter(status)}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${ticketStatusFilter === status
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
                          }`}
                      >
                        {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => handleTicketClick(ticket.id)}
                      className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-5 hover:bg-gray-700/50 transition-all duration-300 cursor-pointer group hover:border-blue-500/30 relative"
                    >

                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">{ticket.title}</h3>
                            <span className="text-xs text-gray-400 font-mono">#{ticket.id}</span>
                            {/* Badge unread avec colors plus douces */}
                            {ticket.unreadCount && ticket.unreadCount > 0 && (
                              <span className="bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold text-[10px]">
                                {ticket.unreadCount > 9 ? '9+' : ticket.unreadCount}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow-lg ${getStatusColor(ticket.status)}`}>
                              {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                            </span>
                            <span className="text-xs text-gray-400">{ticket.category}</span>
                          </div>
                        </div>
                        <MessageCircle className="text-gray-400 group-hover:text-blue-400 transition-colors" size={20} />
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

                {filteredTickets.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Archive className="w-10 h-10 text-gray-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">
                      {tickets.length === 0 ? 'No support tickets' : 'No tickets found'}
                    </h3>
                    <p className="text-gray-400 max-w-md mx-auto mb-6">
                      {tickets.length === 0
                        ? "You haven't created any support tickets yet. Need help? Create your first ticket."
                        : "Try adjusting your search or filter criteria to find what you're looking for."
                      }
                    </p>
                    <button
                      onClick={() => {
                        if (tickets.length === 0) {
                          handleTabChange('contact');
                        } else {
                          setTicketSearchQuery('');
                          setTicketStatusFilter('all');
                        }
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-semibold transition-all"
                    >
                      {tickets.length === 0 ? 'Create first ticket' : 'Clear filters'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <BarChart3 className="text-blue-400" size={20} />
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">Ticket Overview</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-xl">
                    <span className="text-gray-300 font-medium">Pending</span>
                    <span className="text-orange-400 font-bold">
                      {tickets.filter(t => t.status === 'pending').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-xl">
                    <span className="text-gray-300 font-medium">Open</span>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400 font-bold">
                        {tickets.filter(t => t.status === 'open').length}
                      </span>
                      {/* Badge seulement si > 0 */}
                      {unreadCounts.totalUnread > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                          {unreadCounts.totalUnread > 9 ? '9+' : unreadCounts.totalUnread}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-xl">
                    <span className="text-gray-300 font-medium">Closed</span>
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