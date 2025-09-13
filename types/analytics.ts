// types/analytics.ts - Types pour le système Analytics

export interface ConversationAnalytics {
  _id: string;
  conversationId: string;
  connectionId: string;
  platform: string;
  connectionName: string;
  userFullName?: string;
  messageCount: number;
  lastMessageAt: string;
  firstMessageAt: string;
  agentName?: string;
  dailyMessages?: { date: string; count: number }[];
  hourlyDistribution?: { hour: number; count: number }[];
}

export interface PlatformFilter {
  value: string;
  label: string;
  count: number;
  connections: ConnectionFilter[];
}

export interface ConnectionFilter {
  value: string;
  label: string;
  count: number;
}

export interface AnalyticsSummary {
  totalConversations: number;
  totalMessages: number;
  avgMessagesPerConversation: number;
  uniquePlatforms: number;
  uniqueConnections: number;
}

export interface DailyActivity {
  date: string;
  conversations: number;
  messages: number;
  platforms?: string[];
}

export interface PlatformBreakdown {
  platform: string;
  conversations: number;
  messages: number;
  color: string;
}

export interface HourlyHeatmap {
  hour: number;
  day: string;
  messages: number;
}

export interface AnalyticsChartData {
  dailyActivity: DailyActivity[];
  platformBreakdown: PlatformBreakdown[];
  hourlyHeatmap: HourlyHeatmap[];
}

export interface AnalyticsPeriod {
  start: string;
  end: string;
  label: string;
}

export interface AnalyticsFilters {
  platforms: PlatformFilter[];
}

export interface AnalyticsData {
  success: boolean;
  period: AnalyticsPeriod;
  summary: AnalyticsSummary;
  conversations: ConversationAnalytics[];
  availableFilters: AnalyticsFilters;
  chartData: AnalyticsChartData;
}

// Types pour les réponses API
export interface AnalyticsApiResponse extends AnalyticsData {}

export interface AnalyticsError {
  error: string;
  details?: string;
}

// Types pour MongoDB (avec les types corrects)
export interface MongoConnection {
  _id: {
    toString(): string;
  };
  name: string;
  integrationType: string;
  userId: string;
  isActive: boolean;
  [key: string]: any;
}

export interface MongoConversation {
  _id: {
    toString(): string;
  };
  conversationId: string;
  connectionId: string;
  userId: string;
  platform: string;
  messages?: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
    isFiltered?: boolean;
  }>;
  messageCount?: number;
  lastMessageAt: Date;
  firstMessageAt: Date;
  agentName?: string;
  userFullName?: string;
  userFirstName?: string;
  userLastName?: string;
  userProfilePic?: string;
  userUsername?: string;
  isDeleted: boolean;
  [key: string]: any;
}

// Utilitaires pour les filtres avec effet domino
export interface FilterState {
  selectedPeriod: string;
  selectedPlatform: string;
  selectedConnection: string;
}

export interface FilterActions {
  setSelectedPeriod: (period: string) => void;
  setSelectedPlatform: (platform: string) => void;
  setSelectedConnection: (connection: string) => void;
  resetFilters: () => void;
}

// Types pour les hooks
export interface UseAnalyticsReturn {
  // Data
  data: AnalyticsData | null;
  loading: boolean;
  error: string | null;
  
  // Filters
  selectedPeriod: string;
  selectedPlatform: string;
  selectedConnection: string;
  
  // Filter Options (calculées dynamiquement)
  availableConnections: ConnectionFilter[];
  
  // Filtered Results
  filteredData: {
    conversations: ConversationAnalytics[];
    summary: AnalyticsSummary;
  } | null;
  filteredChartData: AnalyticsChartData | undefined;
  
  // Actions
  setSelectedPeriod: (period: string) => void;
  setSelectedPlatform: (platform: string) => void;
  setSelectedConnection: (connection: string) => void;
  resetFilters: () => void;
  refresh: () => void;
  
  // Utilities
  isFiltered: boolean;
  periods: Array<{ value: string; label: string }>;
}

export interface UseAnalyticsSummaryReturn {
  summary: AnalyticsSummary | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  period: AnalyticsPeriod | null;
}

// Constantes
export const ANALYTICS_PERIODS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'this-week', label: 'This Week' },
  { value: 'last-week', label: 'Last Week' },
  { value: 'last-7-days', label: 'Last 7 Days' },
  { value: 'last-30-days', label: 'Last 30 Days' },
  { value: 'last-90-days', label: 'Last 90 Days' }
] as const;

export const PLATFORM_COLORS: Record<string, string> = {
  'website-widget': '#3b82f6',
  'instagram-dms': '#e91e63',
  'facebook-messenger': '#1877f2',
  'sms': '#10b981'
} as const;

export type AnalyticsPeriodValue = typeof ANALYTICS_PERIODS[number]['value'];