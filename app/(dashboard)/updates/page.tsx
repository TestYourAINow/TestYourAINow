'use client';

import { useEffect, useState } from 'react';
import { Megaphone, ChevronDown } from 'lucide-react';

type AnnouncementType = 'update' | 'feature' | 'maintenance' | 'info';

interface Announcement {
  _id: string;
  title: string;
  message: string;
  type: AnnouncementType;
  createdAt: string;
}

const TYPE_LABEL: Record<AnnouncementType, string> = {
  update:      'Update',
  feature:     'New Feature',
  maintenance: 'Maintenance',
  info:        'Info',
};

const FILTERS: { value: AnnouncementType | 'all'; label: string }[] = [
  { value: 'all',         label: 'All' },
  { value: 'update',      label: 'Update' },
  { value: 'feature',     label: 'New Feature' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'info',        label: 'Info' },
];

function groupByMonth(announcements: Announcement[]): { label: string; items: Announcement[] }[] {
  const map = new Map<string, Announcement[]>();
  for (const ann of announcements) {
    const key = new Date(ann.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(ann);
  }
  return Array.from(map.entries()).map(([label, items]) => ({ label, items }));
}

const PREVIEW_LENGTH = 120;

export default function UpdatesPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<AnnouncementType | 'all'>('all');

  useEffect(() => {
    fetch('/api/updates')
      .then(r => r.json())
      .then(data => setAnnouncements(data.announcements || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function toggle(id: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const filtered = activeFilter === 'all'
    ? announcements
    : announcements.filter(a => a.type === activeFilter);

  const groups = groupByMonth(filtered);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-center gap-5">
          <div className="shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-600/20">
              <Megaphone className="text-white" size={28} />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-1">
              What's New
            </h1>
            <p className="text-gray-400 text-lg">Latest updates and features</p>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 flex-wrap mb-8">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                activeFilter === f.value
                  ? 'bg-gray-700 border-gray-500 text-white'
                  : 'bg-gray-900/60 border-gray-700/50 text-gray-500 hover:text-gray-300 hover:border-gray-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No updates yet.</div>
        ) : (
          <div className="space-y-10">
            {groups.map(({ label, items }) => (
              <div key={label}>
                {/* Month header */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest whitespace-nowrap">{label}</span>
                  <div className="flex-1 h-px bg-gray-800" />
                </div>

                {/* Items */}
                <div className="space-y-3">
                  {items.map((ann) => {
                    const date = new Date(ann.createdAt);
                    const isOpen = expanded.has(ann._id);
                    const hasMore = ann.message.length > PREVIEW_LENGTH;
                    const preview = hasMore ? ann.message.slice(0, PREVIEW_LENGTH).trimEnd() + '…' : ann.message;

                    return (
                      <div key={ann._id} className="bg-gray-900/80 border border-gray-700/50 rounded-2xl overflow-hidden">
                        <button
                          onClick={() => hasMore && toggle(ann._id)}
                          className={`w-full text-left p-6 ${hasMore ? 'cursor-pointer hover:bg-gray-800/30 transition-colors' : 'cursor-default'}`}
                        >
                          {/* Type chip + date */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="bg-gray-800 border border-gray-700/60 rounded-md px-2 py-0.5 text-xs text-gray-400 font-medium">
                                {TYPE_LABEL[ann.type]}
                              </span>
                              <span className="text-gray-600 text-xs">
                                {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                            {hasMore && (
                              <ChevronDown className={`w-4 h-4 text-gray-600 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                            )}
                          </div>

                          {/* Title */}
                          <h2 className="text-white font-bold text-xl mb-2">{ann.title}</h2>

                          {/* Message */}
                          <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">
                            {isOpen ? ann.message : preview}
                          </p>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
