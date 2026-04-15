'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Plus, Trash2, Megaphone, ArrowLeft, Eye, ImageIcon, X } from 'lucide-react';
import AnnouncementPopup from '@/components/AnnouncementPopup';
import RichTextEditor from '@/components/RichTextEditor';

type AnnouncementType = 'update' | 'feature' | 'maintenance' | 'info';

interface Announcement {
  _id: string;
  title: string;
  message: string;
  type: AnnouncementType;
  imageUrl?: string;
  imageLayout?: 'banner' | 'thumbnail';
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
  const [form, setForm] = useState({ title: '', message: '', type: 'update' as AnnouncementType, imageLayout: 'thumbnail' as 'banner' | 'thumbnail' });
  const [showForm, setShowForm] = useState(false);

  // Image upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  // Preview popup
  const [previewAnnouncement, setPreviewAnnouncement] = useState<Announcement | null>(null);

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large. Max 5MB.');
      return;
    }

    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreviewUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) return '';
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      const res = await fetch('/api/admin/announcements/upload-image', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Upload failed');
      return data.url;
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      toast.error('Title and message are required');
      return;
    }
    setCreating(true);
    try {
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, imageUrl, imageLayout: form.imageLayout }),
      });
      const data = await res.json();
      if (data.success) {
        setAnnouncements(prev => [data.announcement, ...prev]);
        setForm({ title: '', message: '', type: 'update', imageLayout: 'thumbnail' });
        removeImage();
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

  // Build a fake announcement from the form for preview
  const formAsAnnouncement: Announcement = {
    _id: 'preview',
    title: form.title || 'Title',
    message: form.message || 'Message',
    type: form.type,
    imageUrl: imagePreviewUrl || '',
    imageLayout: form.imageLayout,
    isActive: true,
    createdAt: new Date().toISOString(),
  };

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
              <RichTextEditor
                value={form.message}
                onChange={val => setForm(f => ({ ...f, message: val }))}
                placeholder="Message..."
              />

              {/* Image upload */}
              <div className="flex items-center gap-3">
                {imagePreviewUrl ? (
                  <div className="relative shrink-0">
                    <img
                      src={imagePreviewUrl}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded-xl"
                    />
                    <button
                      onClick={removeImage}
                      className="absolute -top-1.5 -right-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="shrink-0 w-16 h-16 flex flex-col items-center justify-center gap-1 border border-dashed border-gray-700 hover:border-gray-500 rounded-xl text-gray-500 hover:text-gray-300 text-xs transition-colors"
                  >
                    <ImageIcon className="w-4 h-4" />
                    Image
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                {/* Layout selector — only shown when an image is selected */}
                {imagePreviewUrl && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-gray-500">Layout</span>
                    <div className="flex gap-2">
                      {([
                        { value: 'thumbnail', label: 'Thumbnail' },
                        { value: 'banner',    label: 'Banner' },
                      ] as const).map(({ value, label }) => (
                        <button
                          key={value}
                          onClick={() => setForm(f => ({ ...f, imageLayout: value }))}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            form.imageLayout === value
                              ? 'bg-blue-500/20 border-blue-500/50 text-white'
                              : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <span className="text-xs text-gray-600">
                      {form.imageLayout === 'thumbnail' ? 'Small image beside the text' : 'Full-width image above the text'}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setPreviewAnnouncement(formAsAnnouncement)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white rounded-xl text-sm transition-all"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating || uploading}
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all"
                >
                  {creating || uploading ? 'Creating...' : 'Create'}
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
            return (
              <div key={ann._id} className={`bg-gray-900/80 border rounded-2xl overflow-hidden transition-all ${ann.isActive ? 'border-gray-700/50' : 'border-gray-800/30 opacity-60'}`}>
                <div className="p-5 flex items-start gap-4">
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{typeOpt.label}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ann.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-700 text-gray-400'}`}>
                        {ann.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {ann.imageUrl && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-700 text-gray-400">
                          Image
                        </span>
                      )}
                    </div>
                    <span className="text-white font-semibold text-sm">{ann.title}</span>
                    <p className="text-gray-600 text-xs mt-1">{new Date(ann.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    {/* Preview */}
                    <button onClick={() => setPreviewAnnouncement(ann)} className="text-gray-500 hover:text-gray-300 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Active toggle */}
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

      {/* Preview popup */}
      {previewAnnouncement && (
        <AnnouncementPopup
          preview
          announcements={[previewAnnouncement]}
          onClose={() => setPreviewAnnouncement(null)}
        />
      )}
    </div>
  );
}
