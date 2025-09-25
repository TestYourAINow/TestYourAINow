'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Settings, Zap, MessageSquare, Globe, Bot,
  CheckCircle, Rocket, Layers, Sparkles, Users, Monitor,
  ArrowRight, Play, Wifi
} from 'lucide-react'
import FadeInSection from '@/components/FadeInSection'

// Composants d'icônes avec gradients premium
const InstagramIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="instagram-gradient-create" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f09433" />
        <stop offset="25%" stopColor="#e6683c" />
        <stop offset="50%" stopColor="#dc2743" />
        <stop offset="75%" stopColor="#cc2366" />
        <stop offset="100%" stopColor="#bc1888" />
      </linearGradient>
    </defs>
    <path fill="url(#instagram-gradient-create)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
)

const FacebookIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="facebook-gradient-create" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1877F2" />
        <stop offset="100%" stopColor="#42A5F5" />
      </linearGradient>
    </defs>
    <path fill="url(#facebook-gradient-create)" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

const SMSIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="sms-gradient-create" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#25D366" />
        <stop offset="100%" stopColor="#128C7E" />
      </linearGradient>
    </defs>
    <path fill="url(#sms-gradient-create)" d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
  </svg>
)

const WebsiteIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="website-gradient-create" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00D2FF" />
        <stop offset="100%" stopColor="#3A7BD5" />
      </linearGradient>
    </defs>
    <path fill="url(#website-gradient-create)" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
  </svg>
)

// Suppression de l'API Integration - seulement 4 intégrations maintenant
const integrations = [
  {
    label: 'Website Widget',
    value: 'website-widget',
    icon: WebsiteIcon,
    description: 'Embed AI chat on your website',
    color: 'from-cyan-500 to-blue-500',
    popular: true,
    suggestedName: 'Website Assistant',
    disabled: false // Ajout explicite
  },
  {
    label: 'Facebook Messenger',
    value: 'facebook-messenger',
    icon: FacebookIcon,
    description: 'Connect to Facebook messages',
    color: 'from-blue-500 to-indigo-500',
    popular: false,
    suggestedName: 'Facebook Support Bot',
    disabled: false
  },
  {
    label: 'Instagram DMs',
    value: 'instagram-dms',
    icon: InstagramIcon,
    description: 'Handle Instagram direct messages',
    color: 'from-pink-500 to-purple-500',
    popular: false,
    suggestedName: 'Instagram Chat Bot',
    disabled: false
  },
  {
    label: 'SMS Integration',
    value: 'sms',
    icon: SMSIcon,
    description: 'Text message conversations',
    color: 'from-green-500 to-emerald-500',
    popular: false,
    suggestedName: 'SMS Assistant',
    disabled: true, // 🎯 DÉSACTIVÉ
    comingSoon: true // 🎯 NOUVEAU : badge "Coming Soon"
  }
]

type Agent = {
  _id: string
  name: string
  integrations?: { name: string; type: string }[]
}

// Step indicator component
const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
  <div className="flex items-center justify-center gap-3 mb-8">
    {Array.from({ length: totalSteps }, (_, i) => (
      <div key={i} className="flex items-center">
        <div className={`
          w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
          ${i + 1 === currentStep
            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
            : i + 1 < currentStep
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-700 text-gray-400'
          }
        `}>
          {i + 1 < currentStep ? <CheckCircle size={16} /> : i + 1}
        </div>
        {i < totalSteps - 1 && (
          <div className={`w-8 h-0.5 mx-2 transition-all duration-300 ${i + 1 < currentStep ? 'bg-emerald-500' : 'bg-gray-700'
            }`} />
        )}
      </div>
    ))}
  </div>
);

// Platform card component
const PlatformCard = ({
  integration,
  isSelected,
  onSelect
}: {
  integration: typeof integrations[0];
  isSelected: boolean;
  onSelect: () => void;
}) => {
  const IconComponent = integration.icon;
  const isDisabled = integration.disabled || false;

  return (
    <button
      type="button"
      onClick={isDisabled ? undefined : onSelect} // 🎯 Désactive le clic si disabled
      disabled={isDisabled} // 🎯 Attribut disabled
      className={`
        relative p-6 rounded-2xl border-2 transition-all duration-300 text-left group
        ${isDisabled
          ? 'border-gray-700/30 bg-gray-900/30 cursor-not-allowed opacity-60' // 🎯 Style disabled
          : isSelected
            ? 'border-blue-500 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 shadow-xl shadow-blue-500/20 scale-105'
            : 'border-gray-700/50 bg-gradient-to-br from-gray-900/60 to-gray-800/40 hover:border-blue-500/50 hover:shadow-lg hover:scale-102'
        }
      `}
    >
      {/* Popular Badge */}
      {integration.popular && !isDisabled && (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-emerald-500 to-emerald-400 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg">
          Popular
        </div>
      )}

      {/* 🎯 NOUVEAU : Coming Soon Badge */}
      {integration.comingSoon && (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-gray-600 to-gray-500 text-gray-200 text-xs px-2 py-1 rounded-full font-semibold shadow-lg">
          Coming Soon
        </div>
      )}

      {/* Icon Container */}
      <div className={`
        w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300
        ${isDisabled
          ? 'bg-gray-800/30 border-2 border-gray-700/30' // 🎯 Style disabled
          : isSelected
            ? `bg-gradient-to-r ${integration.color}/20 border-2 border-blue-500/40 shadow-lg`
            : 'bg-gray-800/50 border-2 border-gray-700/50 group-hover:border-blue-500/30'
        }
      `}>
        <IconComponent size={32} className={isDisabled ? 'opacity-50' : ''} />
      </div>

      {/* Content */}
      <div>
        <h3 className={`font-bold text-lg mb-2 transition-colors ${isDisabled
            ? 'text-gray-500' // 🎯 Style disabled
            : isSelected
              ? 'text-white'
              : 'text-gray-200 group-hover:text-white'
          }`}>
          {integration.label}
        </h3>
        <p className={`text-sm transition-colors ${isDisabled
            ? 'text-gray-600' // 🎯 Style disabled
            : isSelected
              ? 'text-gray-300'
              : 'text-gray-400 group-hover:text-gray-300'
          }`}>
          {integration.description}
        </p>
      </div>

      {/* Selection Indicator - Ne s'affiche pas si disabled */}
      {isSelected && !isDisabled && (
        <div className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <CheckCircle size={16} className="text-white" />
        </div>
      )}
    </button>
  );
};

// Agent card component
const AgentCard = ({
  agent,
  isSelected,
  onSelect
}: {
  agent: Agent;
  isSelected: boolean;
  onSelect: () => void;
}) => (
  <button
    type="button"
    onClick={onSelect}
    className={`
      p-4 rounded-xl border transition-all duration-300 text-left w-full
      ${isSelected
        ? 'border-blue-500 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 shadow-lg shadow-blue-500/20'
        : 'border-gray-700/50 bg-gray-800/40 hover:border-blue-500/50 hover:bg-gray-800/60'
      }
    `}
  >
    <div className="flex items-center gap-3">
      <div className={`
        w-10 h-10 rounded-xl flex items-center justify-center transition-all
        ${isSelected
          ? 'bg-blue-600/20 border-2 border-blue-500/40'
          : 'bg-gray-700/50 border border-gray-600/50'
        }
      `}>
        <Bot size={20} className={isSelected ? 'text-blue-400' : 'text-gray-400'} />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className={`font-semibold truncate ${isSelected ? 'text-white' : 'text-gray-200'
          }`}>
          {agent.name}
        </h4>
        <p className={`text-xs ${isSelected ? 'text-blue-300' : 'text-gray-400'
          }`}>
          {agent.integrations?.length || 0} integration{agent.integrations?.length !== 1 ? 's' : ''}
        </p>
      </div>

      {isSelected && (
        <CheckCircle size={20} className="text-blue-500 flex-shrink-0" />
      )}
    </div>
  </button>
);

export default function CreateConnectionPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [name, setName] = useState('')
  const [integration, setIntegration] = useState('')
  const [aiBuildId, setAiBuildId] = useState('')
  const [agents, setAgents] = useState<Agent[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/agents')
      .then((res) => res.json())
      .then((data) => setAgents(data.agents || []))
      .catch((err) => console.error('Error loading agents:', err))
  }, [])



  // Dans app/(dashboard)/create-connection/page.tsx
  // Remplace la fonction handleSubmit existante par celle-ci :

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !integration || !aiBuildId) return;

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, integrationType: integration, aiBuildId }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Unknown error')

      // 🎯 NOUVELLE REDIRECTION : Va directement vers la page de la connection créée
      if (data.connection && data.connection._id) {
        const connectionId = data.connection._id;
        const integrationType = data.connection.integrationType;

        // Redirection selon le type de connection
        if (integrationType === 'website-widget') {
          // Pour le website widget, va vers la page de configuration
          router.push(`/launch-agent/${connectionId}/website-widget?tab=configuration`);
        } else if (integrationType === 'sms') {
          // Pour SMS, retourne sur launch-agent (page pas encore créée)
          router.push('/launch-agent');
        } else {
          // Pour Instagram et Facebook, va vers la page de détails
          router.push(`/launch-agent/${connectionId}/${integrationType}?tab=configuration`);
        }
      } else {
        // Fallback vers la page générale si pas d'ID
        router.push('/launch-agent');
      }

    } catch (err) {
      alert('Error creating connection.')
      console.error(err)
    } finally {
      setIsSubmitting(false);
    }
  }

  const canProceedToStep2 = integration !== '';
  const canProceedToStep3 = canProceedToStep2 && name.trim() !== '';
  const canSubmit = canProceedToStep3 && aiBuildId !== '';

  return (
    <div className="h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4 md:p-8">

      {/* Header */}
      <FadeInSection>
        <div className="max-w-4xl mx-auto mb-8">
          <Link href="/launch-agent" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Deployment Center</span>
          </Link>

          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-2xl px-6 py-3 mb-6">
              <Rocket className="text-blue-400" size={24} />
              <span className="text-blue-200 font-semibold">Connection Wizard</span>
            </div>

            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-3">
              Create New Connection
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Connect your AI agent to any platform in just a few steps. Choose your platform, name it, and launch!
            </p>
          </div>
        </div>
      </FadeInSection>

      {/* Step Indicator */}
      <FadeInSection>
        <div className="max-w-4xl mx-auto">
          <StepIndicator currentStep={currentStep} totalSteps={3} />
        </div>
      </FadeInSection>

      {/* Main Content */}
      <FadeInSection>
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit}>

            {/* Step 1: Select Platform */}
            {currentStep === 1 && (
              <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Layers className="text-purple-400" size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Choose Your Platform</h2>
                  <p className="text-gray-400">Select where you want to deploy your AI agent</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {integrations.map((item) => (
                    <PlatformCard
                      key={item.value}
                      integration={item}
                      isSelected={integration === item.value}
                      onSelect={() => setIntegration(item.value)}
                    />
                  ))}
                </div>

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => canProceedToStep2 && setCurrentStep(2)}
                    disabled={!canProceedToStep2}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-gray-600 disabled:to-gray-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 transform hover:scale-105"
                  >
                    <span>Continue</span>
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Connection Name */}
            {currentStep === 2 && (
              <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Settings className="text-blue-400" size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Name Your Connection</h2>
                  <p className="text-gray-400">Give your connection a memorable name to easily identify it later</p>
                </div>

                <div className="max-w-md mx-auto">
                  <label className="block text-sm font-semibold text-white mb-3">
                    Connection Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Instagram Support Bot, Website Assistant..."
                    className="w-full px-6 py-4 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400 font-medium backdrop-blur-sm text-lg"
                    required
                  />

                  <div className="mt-8 flex justify-center gap-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                    >
                      <ArrowLeft size={18} />
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => canProceedToStep3 && setCurrentStep(3)}
                      disabled={!canProceedToStep3}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-gray-600 disabled:to-gray-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 transform hover:scale-105"
                    >
                      <span>Continue</span>
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Select AI Agent */}
            {currentStep === 3 && (
              <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-600/20 to-blue-600/20 border border-emerald-500/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Bot className="text-emerald-400" size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Select Your AI Agent</h2>
                  <p className="text-gray-400">Choose which AI agent will handle the conversations</p>
                </div>

                <div className="max-w-2xl mx-auto">
                  {agents.length > 0 ? (
                    <div className="grid gap-3 mb-8">
                      {agents.map((agent) => (
                        <AgentCard
                          key={agent._id}
                          agent={agent}
                          isSelected={aiBuildId === agent._id}
                          onSelect={() => setAiBuildId(agent._id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Bot className="text-gray-400" size={32} />
                      </div>
                      <p className="text-gray-400 mb-4">No AI agents found</p>
                      <Link
                        href="/agents/new"
                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <Bot size={16} />
                        Create Agent First
                      </Link>
                    </div>
                  )}

                  <div className="flex justify-center gap-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                    >
                      <ArrowLeft size={18} />
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={!canSubmit || isSubmitting}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 transform hover:scale-105 relative overflow-hidden"
                    >
                      {isSubmitting && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer"></div>
                      )}
                      <Rocket size={18} />
                      <span>{isSubmitting ? 'Creating...' : 'Launch Connection'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </FadeInSection>

      {/* Custom CSS for shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  )
}