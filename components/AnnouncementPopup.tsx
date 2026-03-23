'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';

type Announcement = {
  _id: string;
  title: string;
  message: string;
  type: 'update' | 'feature' | 'maintenance' | 'info';
  createdAt: string;
};

const TYPE_LABEL: Record<string, string> = {
  update:      'Update',
  feature:     'New Feature',
  maintenance: 'Maintenance',
  info:        'Info',
};

export default function AnnouncementPopup() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sessionKey = 'announcements_shown';
    if (sessionStorage.getItem(sessionKey)) return;

    fetch('/api/announcements')
      .then(r => r.json())
      .then(data => {
        if (data.announcements?.length > 0) {
          setAnnouncements(data.announcements);
          setVisible(true);
          sessionStorage.setItem(sessionKey, '1');
        }
      })
      .catch(() => {});
  }, []);

  const markSeen = async (id: string) => {
    await fetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ announcementId: id }),
    }).catch(() => {});
  };

  const handleNext = () => {
    markSeen(announcements[current]._id);
    if (current < announcements.length - 1) {
      setCurrent(c => c + 1);
    } else {
      setVisible(false);
    }
  };

  const handleBack = () => {
    if (current > 0) setCurrent(c => c - 1);
  };

  const handleClose = () => {
    announcements.slice(current).forEach(a => markSeen(a._id));
    setVisible(false);
  };

  const handleViewAll = () => {
    announcements.slice(current).forEach(a => markSeen(a._id));
    setVisible(false);
    router.push('/updates');
  };

  if (!visible || announcements.length === 0) return null;

  const ann = announcements[current];
  const total = announcements.length;
  const isLast = current === total - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      {/* Fixed size modal — content scrolls inside */}
      <div className="relative w-full max-w-md h-[500px] max-h-[90vh] bg-gray-900 border border-gray-700/50 rounded-2xl shadow-2xl flex flex-col">

        {/* Header — fixed, never scrolls */}
        <div className="px-6 pt-5 pb-4 shrink-0">
          {/* Type + date + controls */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-white uppercase tracking-widest">
                {TYPE_LABEL[ann.type] ?? ann.type}
              </span>
              <span className="text-gray-500 text-xs">
                {new Date(ann.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {total > 1 && (
                <span className="text-gray-500 text-xs">{current + 1} / {total}</span>
              )}
              <button onClick={handleClose} className="text-gray-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          {/* Title */}
          <h2 className="text-white font-bold text-2xl">{ann.title}</h2>
        </div>

        {/* Blue gradient separator */}
        <div className="h-px bg-gradient-to-r from-blue-600 to-cyan-500 shrink-0" />

        {/* Content — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar">
          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{ann.message}</p>
        </div>

        {/* Progress dots */}
        {total > 1 && (
          <div className="flex justify-center gap-1.5 py-3 shrink-0">
            {announcements.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${i === current ? 'w-4 bg-white' : 'w-1.5 bg-gray-600'}`}
              />
            ))}
          </div>
        )}

        {/* Footer — fixed */}
        <div className="px-6 py-4 flex items-center justify-between shrink-0 border-t border-gray-800">
          <div className="flex items-center gap-4">
            {current > 0 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}
            <button
              onClick={handleViewAll}
              className="text-gray-500 hover:text-gray-300 text-xs hover:underline underline-offset-2 transition-colors"
            >
              View all updates
            </button>
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 transition-all"
          >
            {isLast ? 'Got it!' : (
              <>Next <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
