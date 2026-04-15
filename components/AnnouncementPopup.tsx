'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';

type Announcement = {
  _id: string;
  title: string;
  message: string;
  type: 'update' | 'feature' | 'maintenance' | 'info';
  imageUrl?: string;
  imageLayout?: 'banner' | 'thumbnail';
  createdAt: string;
};

const TYPE_LABEL: Record<string, string> = {
  update:      'Update',
  feature:     'New Feature',
  maintenance: 'Maintenance',
  info:        'Info',
};

// Preview mode: pass announcements directly, no API fetch, no seen tracking
interface PreviewProps {
  preview: true;
  announcements: Announcement[];
  onClose: () => void;
}

// Normal mode: fetches from API, tracks seen
interface NormalProps {
  preview?: false;
}

type Props = PreviewProps | NormalProps;

export default function AnnouncementPopup(props: Props) {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(false);

  const isPreview = props.preview === true;

  useEffect(() => {
    if (isPreview) {
      const p = props as PreviewProps;
      setAnnouncements(p.announcements);
      setVisible(p.announcements.length > 0);
      setCurrent(0);
      return;
    }

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
  }, [isPreview]);

  // Sync preview announcements when they change
  useEffect(() => {
    if (!isPreview) return;
    const p = props as PreviewProps;
    setAnnouncements(p.announcements);
    setVisible(p.announcements.length > 0);
    setCurrent(0);
  }, [isPreview && (props as PreviewProps).announcements]);

  const markSeen = async (id: string) => {
    if (isPreview) return;
    await fetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ announcementId: id }),
    }).catch(() => {});
  };

  const handleNext = () => {
    if (!isPreview) markSeen(announcements[current]._id);
    if (current < announcements.length - 1) {
      setCurrent(c => c + 1);
    } else {
      if (isPreview) {
        (props as PreviewProps).onClose();
      } else {
        setVisible(false);
      }
    }
  };

  const handleBack = () => {
    if (current > 0) setCurrent(c => c - 1);
  };

  const handleClose = () => {
    if (isPreview) {
      (props as PreviewProps).onClose();
      return;
    }
    announcements.slice(current).forEach(a => markSeen(a._id));
    setVisible(false);
  };

  const handleViewAll = () => {
    if (isPreview) {
      (props as PreviewProps).onClose();
      return;
    }
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
      <div className="relative w-full max-w-md h-[500px] max-h-[90vh] bg-gray-900 border border-gray-700/50 rounded-2xl shadow-2xl flex flex-col">

        {/* Header */}
        <div className="px-6 pt-5 pb-4 shrink-0">
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
          <h2 className="text-white font-bold text-2xl">{ann.title}</h2>
        </div>

        {/* Blue gradient separator */}
        <div className="h-px bg-gradient-to-r from-blue-600 to-cyan-500 shrink-0" />

        {/* Content — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar">
          {ann.imageUrl && ann.imageLayout === 'banner' && (
            <img
              src={ann.imageUrl}
              alt=""
              className="w-full rounded-xl object-cover max-h-40 mb-4"
            />
          )}
          {ann.imageUrl && ann.imageLayout !== 'banner' && (
            <div className="flex items-start gap-4 mb-3">
              <img
                src={ann.imageUrl}
                alt=""
                className="w-20 h-20 rounded-xl object-cover shrink-0"
              />
              <div
                className="announcement-content"
                dangerouslySetInnerHTML={{ __html: ann.message }}
              />
            </div>
          )}
          {(!ann.imageUrl || ann.imageLayout === 'banner') && (
            <div
              className="announcement-content"
              dangerouslySetInnerHTML={{ __html: ann.message }}
            />
          )}
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

        {/* Footer */}
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
            {!isPreview && (
              <button
                onClick={handleViewAll}
                className="text-gray-500 hover:text-gray-300 text-xs hover:underline underline-offset-2 transition-colors"
              >
                View all updates
              </button>
            )}
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
