'use client';

import { Play } from 'lucide-react';

interface VideoGuide {
  id: string;
  title: string;
  description: string;
  loomEmbedId: string;
}

export default function VideoGuidesPage() {
  // Tes vidéos avec les vraies données Loom
  const videoGuides: VideoGuide[] = [
    {
      id: '1',
      title: 'Build Tutorial',
      description: 'Learn how to build and optimize your AI prompts',
      loomEmbedId: 'd1689bbcb31b4dd08f27a59f0956e29c'
    },
    {
      id: '2',
      title: 'Demo Tutorial',
      description: 'Create interactive demos for your AI solutions',
      loomEmbedId: '2ee9d7c9ed354965aacabe6139d10894'
    },
    {
      id: '3',
      title: 'Improve Tutorial',
      description: 'Enhance and refine your AI agents for better performance',
      loomEmbedId: '22d1d7c134554cb1b4c0e982b8e151c9'
    },
    {
      id: '4',
      title: 'Launch Tutorial',
      description: 'Deploy and manage your AI agents effectively',
      loomEmbedId: '62c7532862b0449c9c2916bc4c3825ed'
    },
    {
      id: '5',
      title: 'Insta & Fb DMs Setup Guide',
      description: 'Connect your AI to Instagram & Facebook Direct Messages',
      loomEmbedId: '62c7532862b0449c9c2916bc4c3825ed'
    }
  ];

  return (
    <div className="h-[calc(100vh-64px)] overflow-y-auto bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Header centré */}
        <div className="mb-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <Play className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-2">
                Master AI Agent Creation
              </h1>
              <p className="text-gray-400 text-lg">Our comprehensive video library guides you through every step of building intelligent AI agents</p>
            </div>
          </div>
        </div>

        {/* Video Grid - Cartes plus compactes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {videoGuides.map((video, index) => (
            <div
              key={video.id}
              className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl overflow-hidden hover:transform hover:scale-[1.02] transition-all duration-300 group"
            >
              {/* Video Player plus compact */}
              <div className="relative aspect-video bg-gray-800">
                <iframe
                  src={`https://www.loom.com/embed/${video.loomEmbedId}`}
                  frameBorder="0"
                  allowFullScreen
                  className="w-full h-full rounded-t-xl"
                  title={video.title}
                  loading="lazy"
                />
              </div>

              {/* Info Card plus compacte */}
              <div className="p-4">
                <div className="flex items-start gap-3">
                  {/* Numéro avec dégradé bleu-cyan */}
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">{index + 1}</span>
                  </div>
                  
                  <div className="flex-1">
                    {/* Titre plus petit */}
                    <h3 className="text-lg font-bold text-white mb-2 transition-colors leading-tight">
                      {video.title}
                    </h3>
                    
                    {/* Description plus courte */}
                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">
                      {video.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}