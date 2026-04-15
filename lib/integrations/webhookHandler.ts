// lib/integrations/webhookHandler.ts

// 🔥 HELPERS UNIVERSELS POUR LES DATES
function getDateInTimezone(timezone: string): string {
  const now = new Date();
  const userDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
  
  const year = userDate.getFullYear();
  const month = String(userDate.getMonth() + 1).padStart(2, '0');
  const day = String(userDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

function getTomorrowInTimezone(timezone: string): string {
  const now = new Date();
  const userDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
  userDate.setDate(userDate.getDate() + 1);
  
  const year = userDate.getFullYear();
  const month = String(userDate.getMonth() + 1).padStart(2, '0');
  const day = String(userDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

function getYesterdayInTimezone(timezone: string): string {
  const now = new Date();
  const userDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
  userDate.setDate(userDate.getDate() - 1);
  
  const year = userDate.getFullYear();
  const month = String(userDate.getMonth() + 1).padStart(2, '0');
  const day = String(userDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

// 🔥 FONCTION PRINCIPALE - GESTION DES WEBHOOKS
// Simple AI call type — messages in, text out
type AICallFn = (messages: { role: "user" | "assistant" | "system"; content: string }[], temperature?: number) => Promise<string>;

export async function handleWebhookIntegration(
  userMessage: string,
  integrations: any[],
  aiCall: AICallFn,
  userTimezone: string = 'UTC',
  conversationHistory: any[] = []
): Promise<string | null> {
  const webhookIntegrations = integrations.filter(i => i.type === "webhook" && i.enabled !== false);
  
  if (webhookIntegrations.length === 0) return null;

  console.log('🔍 [WEBHOOK] Checking webhook integrations...');

  for (const integration of webhookIntegrations) {
    if (!integration.url || !integration.fields) {
      console.log(`⚠️ [WEBHOOK] ${integration.name} missing URL or fields`);
      continue;
    }

    try {
      // 🔥 AMÉLIORATION - Détection intelligente basée sur le nom et la description
      console.log(`🤔 [WEBHOOK] Checking if ${integration.name} should be triggered...`);

const historyContext = conversationHistory.length > 0
  ? `Conversation so far:\n${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}\n\n`
  : '';

const systemPrompt = `You are analyzing if a webhook should be triggered.

Webhook name: ${integration.name}
Webhook description: ${integration.description || 'No description'}
Required fields: ${integration.fields.map((f: any) => `${f.key} (${f.value})`).join(', ')}

${historyContext}Look at the full conversation. If the user has been progressively providing information matching the required fields, reply 'true'. Reply ONLY with 'true' or 'false'.`;

console.log(`📋 [WEBHOOK] System prompt:`, systemPrompt);
console.log(`📋 [WEBHOOK] User message:`, userMessage);

const shouldTriggerText = await aiCall([
  { role: "system", content: systemPrompt },
  { role: "user", content: userMessage }
], 0);

      const shouldTrigger = shouldTriggerText.toLowerCase().trim() === 'true';

console.log(`🎯 [WEBHOOK] shouldTrigger result: "${shouldTriggerText}"`);

      if (!shouldTrigger) {
        console.log(`⏭️ [WEBHOOK] ${integration.name} not triggered - no matching intent`);
        continue;
      }

      console.log(`✅ [WEBHOOK] ${integration.name} MATCHED! Proceeding...`);

      // 2️⃣ Extraire les données nécessaires
      console.log(`📊 [WEBHOOK] Extracting data for ${integration.name}...`);

      // 🔥 CALCUL DES DATES DANS LE TIMEZONE UTILISATEUR
      const todayStr = getDateInTimezone(userTimezone);
      const tomorrowStr = getTomorrowInTimezone(userTimezone);
      const yesterdayStr = getYesterdayInTimezone(userTimezone);

      console.log(`📅 [DATES] Timezone: ${userTimezone}, Today: ${todayStr}, Tomorrow: ${tomorrowStr}`);

      const rawResponse = await aiCall([
          {
            role: "system",
            content: `You MUST respond with ONLY valid JSON. No explanations, no markdown, no extra text.

Extract data for webhook: ${integration.name}

Required fields:
${integration.fields.map((f: any) => `- ${f.key}: ${f.value}`).join('\n')}

CRITICAL DATE INFORMATION (User timezone: ${userTimezone}):
- Today: ${todayStr}
- Tomorrow: ${tomorrowStr}
- Yesterday: ${yesterdayStr}

IMPORTANT DATE CONVERSION RULES:
- "aujourd'hui" / "today" → ${todayStr}
- "demain" / "tomorrow" → ${tomorrowStr}
- "hier" / "yesterday" → ${yesterdayStr}
- For "lundi dernier"/"last Monday": Calculate the most recent occurrence from ${todayStr}
- Convert ALL natural language dates to YYYY-MM-DD format

CRITICAL LANGUAGE RULE:
NEVER translate the user's responses. Keep all extracted values in the exact language the user used.
If the user said "perdre du poids", extract "perdre du poids", NOT "lose weight".
If the user said "débutant", extract "débutant", NOT "beginner".
If the user said "maison", extract "maison", NOT "home".

Response format (copy exactly):
{"hasAllData": true, "data": {"field1": "value1", "field2": "value2"}}

If missing data:
{"hasAllData": false, "missing": ["field1", "field2"]}`
          },
         ...conversationHistory.map((m: any) => ({
    role: m.role as "user" | "assistant",
    content: m.content
  })),
          {
            role: "user",
            content: userMessage
          }
        ], 0);
      console.log(`📝 [WEBHOOK] Raw AI response:`, rawResponse.substring(0, 200));

      let extractedData;
      try {
        const cleanResponse = rawResponse
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .replace(/^[^{]*({.*})[^}]*$/s, '$1');
        
        extractedData = JSON.parse(cleanResponse);
      } catch (parseError) {
        console.log(`⚠️ [WEBHOOK] Parse error, trying regex fallback...`);
        const jsonMatch = rawResponse.match(/\{.*\}/s);
        if (jsonMatch) {
          try {
            extractedData = JSON.parse(jsonMatch[0]);
          } catch {
            extractedData = { hasAllData: false, error: 'Failed to parse response' };
          }
        } else {
          extractedData = { hasAllData: false, error: 'No JSON found in response' };
        }
      }
      
      if (!extractedData.hasAllData) {
        console.log(`❌ [WEBHOOK] Missing data for ${integration.name}:`, extractedData);
        
        const missingFieldsText = await aiCall([
            {
              role: "system",
              content: `The user wants to use the "${integration.name}" feature but some required information is missing.

Required information:
${integration.fields.map((f: any) => `- ${f.key}: ${f.value}`).join('\n')}

Ask the user politely to provide the missing information. Be specific about what you need and friendly.`
            },
            {
              role: "user",
              content: userMessage
            }
          ], 0.3);

        return missingFieldsText || "I need more information to proceed with this request.";
      }

      // 3️⃣ Envoyer le webhook
      console.log(`🚀 [WEBHOOK] Sending webhook to ${integration.url}`);
      console.log(`📤 [WEBHOOK] Payload:`, JSON.stringify(extractedData.data, null, 2));
      
      const webhookRes = await fetch(integration.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'AI-Agent-Webhook/1.0'
        },
        body: JSON.stringify(extractedData.data)
      });

      const webhookSuccess = webhookRes.ok;
      let webhookResponseData = null;
      
      try {
        const responseText = await webhookRes.text();
        console.log(`📥 [WEBHOOK] Make response (${webhookRes.status}):`, responseText.substring(0, 500));
        
        try {
          webhookResponseData = JSON.parse(responseText);
          console.log(`✅ [WEBHOOK] Successfully parsed JSON response`);
        } catch {
          console.log(`⚠️ [WEBHOOK] Response is not JSON, using as text`);
          webhookResponseData = { message: responseText };
        }
      } catch (error) {
        console.log(`❌ [WEBHOOK] Error reading response:`, error);
        webhookResponseData = null;
      }

      // 4️⃣ Générer la réponse
      console.log(`🤖 [WEBHOOK] Generating AI response with webhook data...`);
      
      const response = await aiCall([
          {
            role: "system",
            content: `The webhook "${integration.name}" was ${webhookSuccess ? 'successfully' : 'unsuccessfully'} triggered.

Status: ${webhookRes.status}
Data sent: ${JSON.stringify(extractedData.data, null, 2)}

${webhookResponseData && Object.keys(webhookResponseData).length > 0 ? `
🔥 IMPORTANT - Data received from webhook:
${JSON.stringify(webhookResponseData, null, 2)}

Use this data in your response. If there are events, list them. If it's a confirmation, mention it.
Be natural and conversational.
` : 'No additional data returned.'}

Generate a natural, friendly response to inform the user.`
          },
          {
            role: "user",
            content: userMessage
          }
        ], 0.3);
      
      if (response) {
        console.log(`✅ [WEBHOOK] ${integration.name} processed successfully`);
        return response;
      }

    } catch (error) {
      console.error(`❌ [WEBHOOK] Error for ${integration.name}:`, error);
      return `I encountered an error while processing your request with ${integration.name}. Please try again.`;
    }
  }

  return null;
}