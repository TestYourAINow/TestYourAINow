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
export async function handleWebhookIntegration(
  userMessage: string,
  integrations: any[],
  openai: any,
  agentModel: string,
  userTimezone: string = 'UTC'
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
      
      // Construire un contexte riche pour la détection
      let detectionContext = `Webhook: ${integration.name}\n`;
      detectionContext += `Description: ${integration.description || 'No description'}\n\n`;
      
      // Ajouter des exemples basés sur le nom du webhook
      if (integration.name.toLowerCase().includes('list') || 
          integration.name.toLowerCase().includes('check') ||
          integration.name.toLowerCase().includes('show')) {
        detectionContext += `TRIGGER when user asks to:\n`;
        detectionContext += `- Check their calendar/schedule\n`;
        detectionContext += `- See what's planned\n`;
        detectionContext += `- Verify availability\n`;
        detectionContext += `- List events\n\n`;
        detectionContext += `Examples: "What's on my calendar?", "Am I free today?", "Qu'est-ce que j'ai aujourd'hui?"\n`;
      }
      
      if (integration.name.toLowerCase().includes('add') || 
          integration.name.toLowerCase().includes('create') ||
          integration.name.toLowerCase().includes('schedule')) {
        detectionContext += `TRIGGER when user wants to:\n`;
        detectionContext += `- Add/create an event\n`;
        detectionContext += `- Schedule something\n`;
        detectionContext += `- Book an appointment\n\n`;
        detectionContext += `Examples: "Add event", "Schedule meeting", "Ajoute un événement"\n`;
      }
      
      const shouldTriggerRes = await openai.chat.completions.create({
        model: agentModel,
        temperature: 0,
        messages: [
          {
            role: "system",
            content: `You are analyzing if a webhook should be triggered.

${detectionContext}

Analyze the user's message and reply ONLY with 'true' if it matches this webhook's purpose, 'false' otherwise.

Be generous in matching - if the intent is related, say 'true'.`
          },
          {
            role: "user",
            content: userMessage
          }
        ]
      });

      const shouldTrigger = shouldTriggerRes.choices[0]?.message?.content?.toLowerCase().trim() === 'true';
      
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
      
      const extractRes = await openai.chat.completions.create({
        model: agentModel,
        temperature: 0,
        messages: [
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

Response format (copy exactly):
{"hasAllData": true, "data": {"field1": "value1", "field2": "value2"}}

If missing data:
{"hasAllData": false, "missing": ["field1", "field2"]}`
          },
          {
            role: "user",
            content: userMessage
          }
        ]
      });

      const rawResponse = extractRes.choices[0]?.message?.content?.trim() || '';
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
        
        const missingFieldsRes = await openai.chat.completions.create({
          model: agentModel,
          temperature: 0.3,
          messages: [
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
          ]
        });

        return missingFieldsRes.choices[0]?.message?.content || "I need more information to proceed with this request.";
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
      
      const confirmationRes = await openai.chat.completions.create({
        model: agentModel,
        temperature: 0.3,
        messages: [
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
        ]
      });

      const response = confirmationRes.choices[0]?.message?.content;
      
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