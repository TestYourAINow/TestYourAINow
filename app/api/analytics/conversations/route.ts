// app/api/analytics/conversations/route.ts - VERSION PROPRE
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Connection } from '@/models/Connection';
import { Conversation } from '@/models/Conversation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// 🆕 Import des types depuis notre fichier types/analytics.ts
import type { 
  AnalyticsData,
  ConversationAnalytics,
  DailyActivity,
  PlatformBreakdown,
  HourlyHeatmap
} from '@/types/analytics';

// 🎨 Couleurs pour les plateformes
const PLATFORM_COLORS: Record<string, string> = {
  'website-widget': '#3b82f6',
  'instagram-dms': '#e91e63',
  'facebook-messenger': '#1877f2',
  'sms': '#10b981'
};

// 📅 Fonction pour calculer les périodes
function getDateRange(period: string): { start: Date; end: Date; label: string } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (period) {
    case 'today':
      return {
        start: today,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        label: 'Today'
      };

    case 'yesterday':
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      return {
        start: yesterday,
        end: today,
        label: 'Yesterday'
      };

    case 'this-week':
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      return {
        start: startOfWeek,
        end: new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000),
        label: 'This Week'
      };

    case 'last-week':
      const startOfLastWeek = new Date(today);
      startOfLastWeek.setDate(today.getDate() - today.getDay() - 7);
      const endOfLastWeek = new Date(startOfLastWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
      return {
        start: startOfLastWeek,
        end: endOfLastWeek,
        label: 'Last Week'
      };

    case 'last-30-days':
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      return {
        start: thirtyDaysAgo,
        end: today,
        label: 'Last 30 Days'
      };

    case 'last-90-days':
      const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
      return {
        start: ninetyDaysAgo,
        end: today,
        label: 'Last 90 Days'
      };

    default:
      // Par défaut : derniers 7 jours
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return {
        start: sevenDaysAgo,
        end: today,
        label: 'Last 7 Days'
      };
  }
}

// 📊 Fonction pour générer les données de graphique journalier
function generateDailyChartData(conversations: any[], dateRange: { start: Date; end: Date }): DailyActivity[] {
  const dailyData = new Map<string, {
    conversations: Set<string>;
    messages: number;
    platforms: Set<string>;
  }>();

  // Initialiser tous les jours de la période
  const current = new Date(dateRange.start);
  while (current < dateRange.end) {
    const dateStr = current.toISOString().split('T')[0];
    dailyData.set(dateStr, {
      conversations: new Set(),
      messages: 0,
      platforms: new Set()
    });
    current.setDate(current.getDate() + 1);
  }

  // Remplir avec les données réelles
  conversations.forEach((conv: any) => {
    conv.messages?.forEach((message: any) => {
      const messageDate = new Date(message.timestamp);
      const dateStr = messageDate.toISOString().split('T')[0];
      
      const dayData = dailyData.get(dateStr);
      if (dayData) {
        dayData.conversations.add(conv.conversationId);
        dayData.messages++;
        dayData.platforms.add(conv.platform);
      }
    });
  });

  // Convertir en format pour le graphique
  return Array.from(dailyData.entries()).map(([date, data]) => ({
    date,
    conversations: data.conversations.size,
    messages: data.messages,
    platforms: Array.from(data.platforms)
  }));
}

// 🎯 ROUTE PRINCIPALE - GET ANALYTICS
export async function GET(req: NextRequest) {
  try {
    // 🔐 Vérification de la session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 📅 Récupération des paramètres
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'last-7-days';
    const dateRange = getDateRange(period);

    console.log(`📊 [ANALYTICS] Fetching data for period: ${dateRange.label}`);

    await connectToDatabase();

    // 🔍 1. Récupérer toutes les connections de l'utilisateur
    const userConnections = await Connection.find({
      userId: session.user.id
    }).lean();

    if (userConnections.length === 0) {
      return NextResponse.json({
        success: true,
        period: {
          start: dateRange.start.toISOString(),
          end: dateRange.end.toISOString(),
          label: dateRange.label
        },
        summary: {
          totalConversations: 0,
          totalMessages: 0,
          avgMessagesPerConversation: 0,
          uniquePlatforms: 0,
          uniqueConnections: 0
        },
        conversations: [],
        availableFilters: { platforms: [] },
        chartData: {
          dailyActivity: [],
          platformBreakdown: [],
          hourlyHeatmap: []
        }
      });
    }

    const connectionIds = userConnections.map((conn: any) => conn._id.toString());

    // 🔍 2. Récupérer toutes les conversations de la période
    const conversations = await Conversation.find({
      connectionId: { $in: connectionIds },
      isDeleted: false,
      lastMessageAt: {
        $gte: dateRange.start,
        $lt: dateRange.end
      }
    }).lean();

    console.log(`📊 [ANALYTICS] Found ${conversations.length} conversations in period`);

    // 🏗️ 3. Construire les données d'analyse
    const analyticsData: ConversationAnalytics[] = conversations.map((conv: any) => {
      const connection = userConnections.find((c: any) => c._id.toString() === conv.connectionId);
      
      return {
        _id: conv._id.toString(),
        conversationId: conv.conversationId,
        connectionId: conv.connectionId,
        platform: conv.platform,
        connectionName: connection?.name || 'Unknown Connection',
        userFullName: conv.userFullName,
        messageCount: conv.messageCount || 0,
        lastMessageAt: conv.lastMessageAt.toISOString(),
        firstMessageAt: conv.firstMessageAt.toISOString(),
        agentName: conv.agentName
      };
    });

    // 📊 4. Construire les filtres disponibles (effet domino)
    const platformsMap = new Map<string, {
      count: number;
      connections: Map<string, number>;
    }>();

    analyticsData.forEach(conv => {
      if (!platformsMap.has(conv.platform)) {
        platformsMap.set(conv.platform, {
          count: 0,
          connections: new Map()
        });
      }

      const platformData = platformsMap.get(conv.platform)!;
      platformData.count++;

      const connectionKey = `${conv.connectionId}:${conv.connectionName}`;
      platformData.connections.set(
        connectionKey,
        (platformData.connections.get(connectionKey) || 0) + 1
      );
    });

    const availableFilters = {
      platforms: Array.from(platformsMap.entries()).map(([platform, data]) => ({
        value: platform,
        label: platform.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        count: data.count,
        connections: Array.from(data.connections.entries()).map(([connectionKey, count]) => {
          const [connectionId, connectionName] = connectionKey.split(':');
          return {
            value: connectionId,
            label: connectionName,
            count
          };
        })
      }))
    };

    // 📊 5. Générer les données de graphique
    const dailyActivity: DailyActivity[] = generateDailyChartData(conversations, dateRange);

    const platformBreakdown: PlatformBreakdown[] = Array.from(platformsMap.entries()).map(([platform, data]) => ({
      platform: platform.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      conversations: data.count,
      messages: analyticsData
        .filter(conv => conv.platform === platform)
        .reduce((sum, conv) => sum + conv.messageCount, 0),
      color: PLATFORM_COLORS[platform] || '#6b7280'
    }));

    // 📊 6. Heatmap horaire
    const hourlyHeatmap: HourlyHeatmap[] = Array.from({ length: 24 }, (_, hour) => {
      const messagesInHour = conversations.reduce((count: number, conv: any) => {
        const hourMessages = conv.messages?.filter((msg: any) => {
          const msgDate = new Date(msg.timestamp);
          return msgDate.getHours() === hour;
        }).length || 0;
        return count + hourMessages;
      }, 0);

      return {
        hour,
        day: 'All Days',
        messages: messagesInHour
      };
    });

    // 📊 7. Calculer les statistiques résumées
    const totalMessages = analyticsData.reduce((sum, conv) => sum + conv.messageCount, 0);
    const summary = {
      totalConversations: analyticsData.length,
      totalMessages,
      avgMessagesPerConversation: analyticsData.length > 0 
        ? Math.round(totalMessages / analyticsData.length) 
        : 0,
      uniquePlatforms: platformsMap.size,
      uniqueConnections: new Set(analyticsData.map(c => c.connectionId)).size
    };

    console.log(`✅ [ANALYTICS] Processed data:`, summary);

    const response: AnalyticsData = {
      success: true,
      period: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
        label: dateRange.label
      },
      summary,
      conversations: analyticsData,
      availableFilters,
      chartData: {
        dailyActivity,
        platformBreakdown,
        hourlyHeatmap
      }
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('❌ [ANALYTICS] Error:', error);
    return NextResponse.json({
      error: 'Failed to fetch analytics data',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}