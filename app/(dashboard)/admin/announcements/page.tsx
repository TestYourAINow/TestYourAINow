'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Plus, Trash2, Megaphone, ArrowLeft, ChevronDown } from 'lucide-react';

type AnnouncementType = 'update' | 'feature' | 'maintenance' | 'info';

interface Announcement {
  _id: string;
  title: string;
  message: string;
  type: AnnouncementType;
  isActive: boolean;
  createdAt: string;
}

const TYPE_OPTIONS: { value: AnnouncementType; label: string }[] = [
  { value: 'update',      label: 'Update' },
  { value: 'feature',     label: 'New Feature' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'info',        label: 'Info' },
];

const ADMIN_EMAIL = 'sango_ks@hotmail.com';

export default function AdminAnnouncementsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', type: 'update' as AnnouncementType });
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (status === 'loading') return;
    if (session?.user?.email !== ADMIN_EMAIL) {
      router.push('/dashboard');
      return;
    }
    fetchAnnouncements();
  }, [status, session]);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/admin/announcements');
      const data = await res.json();
      setAnnouncements(data.announcements || []);
    } catch {
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      toast.error('Title and message are required');
      return;
    }
    setCreating(true);
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setAnnouncements(prev => [data.announcement, ...prev]);
        setForm({ title: '', message: '', type: 'update' });
        setShowForm(false);
        toast.success('Announcement created');
      }
    } catch {
      toast.error('Failed to create announcement');
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (ann: Announcement) => {
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ann._id, isActive: !ann.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        setAnnouncements(prev => prev.map(a => a._id === ann._id ? data.announcement : a));
        toast.success(data.announcement.isActive ? 'Announcement activated' : 'Announcement deactivated');
      }
    } catch {
      toast.error('Failed to update announcement');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      const res = await fetch(`/api/admin/announcements?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setAnnouncements(prev => prev.filter(a => a._id !== id));
        toast.success('Announcement deleted');
      }
    } catch {
      toast.error('Failed to delete announcement');
    }
  };

  function toggleExpand(id: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-8">
      <div className="max-w-3xl mx-auto">

        {/* Back button */}
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Admin</span>
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/20 shrink-0">
              <Megaphone className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">Announcements</h1>
              <p className="text-gray-400 text-lg">{announcements.filter(a => a.isActive).length} active</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-sm font-semibold transition-all"
          >
            <Plus className="w-4 h-4" />
            New Announcement
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-6 mb-6">
            <h2 className="text-white font-semibold mb-4">New Announcement</h2>

            <div className="space-y-4">
              {/* Type */}
              <div className="flex gap-2 flex-wrap">
                {TYPE_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setForm(f => ({ ...f, type: value }))}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                      form.type === value
                        ? 'bg-blue-500/20 border-blue-500/50 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Title */}
              <input
                type="text"
                placeholder="Title (max 100 chars)"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                maxLength={100}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500/50"
              />

              {/* Message */}
              <textarea
                placeholder="Message (max 1000 chars)"
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                maxLength={1000}
                rows={4}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500/50 resize-none"
              />

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Announcements list */}
        <div className="space-y-3">
          {announcements.length === 0 && (
            <div className="text-center py-16 text-gray-500">No announcements yet.</div>
          )}
          {announcements.map(ann => {
            const typeOpt = TYPE_OPTIONS.find(t => t.value === ann.type) || TYPE_OPTIONS[0];
            const isOpen = expanded.has(ann._id);
            return (
              <div key={ann._id} className={`bg-gray-900/80 border rounded-2xl overflow-hidden transition-all ${ann.isActive ? 'border-gray-700/50' : 'border-gray-800/30 opacity-60'}`}>
                <div className="p-5 flex items-start gap-4">
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{typeOpt.label}</span>
                      <span className="text-white font-semibold text-sm">{ann.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ann.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-700 text-gray-400'}`}>
                        {ann.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className={`text-gray-400 text-sm whitespace-pre-line ${isOpen ? '' : 'line-clamp-2'}`}>{ann.message}</p>
                    <p className="text-gray-600 text-xs mt-1">{new Date(ann.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    {/* Expand toggle */}
                    <button onClick={() => toggleExpand(ann._id)} className="text-gray-500 hover:text-gray-300 transition-colors">
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Active toggle — premium pill */}
                    <button
                      onClick={() => handleToggle(ann)}
                      className={`relative w-11 h-6 rounded-full transition-all duration-200 focus:outline-none shrink-0 ${ann.isActive ? 'bg-gradient-to-r from-blue-600 to-cyan-600' : 'bg-gray-700'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${ann.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>

                    {/* Delete */}
                    <button onClick={() => handleDelete(ann._id)} className="text-gray-500 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
