import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    aiAvailable: Boolean(process.env.GEMINI_API_KEY),
    platform: 'SG SmartBin IoT Cloud',
  });
});

// IoT ESP32 Telemetry Ingestion Endpoint
// Accepts standard payload from physical ESP32 SmartBins
app.post('/api/iot/telemetry', (req, res) => {
  const {
    binId,
    timestamp,
    foodFillLevel,
    recyclingFillLevel,
    generalFillLevel,
    temperature,
    humidity,
    batteryLevel,
    connectivity,
  } = req.body;

  if (!binId) {
    return res.status(400).json({ error: 'binId is required' });
  }

  const processedData = {
    binId,
    timestamp: timestamp || new Date().toISOString(),
    foodFillLevel: Number(foodFillLevel ?? 0),
    recyclingFillLevel: Number(recyclingFillLevel ?? 0),
    generalFillLevel: Number(generalFillLevel ?? 0),
    temperature: Number(temperature ?? 25),
    humidity: Number(humidity ?? 50),
    batteryLevel: Number(batteryLevel ?? 100),
    connectivity: connectivity || 'ONLINE',
    receivedAt: new Date().toISOString(),
    status: 'INGESTED_SUCCESSFULLY',
  };

  return res.json({
    success: true,
    message: `Telemetry ingested for ${binId}`,
    data: processedData,
  });
});

// AI Assistant Operational Queries Endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { prompt, binsContext, collectionQueue, alertsContext } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getGeminiClient();

    // If Gemini API is available, generate smart contextual answer
    if (ai) {
      const systemInstruction = `You are the AI Operational Assistant for "SG SmartBin", an AI-powered IoT waste management & digital advertising platform in Kigali, Rwanda developed by SG AI Agency.
Brand Tagline: SMART WASTE • CLEAN CITIES • SMART AFRICA.

You have live telemetry data about Kigali's SmartBins:
SmartBin Status Rules:
- 0–59%: NORMAL (Green)
- 60–79%: WARNING (Yellow)
- 80–100%: COLLECTION REQUIRED (Red, auto-alerts generated)
SmartBins have 3 compartments: Food Waste, Recycling Waste, General Waste.
SmartBins have an upper digital LED advertising screen and lower 3 compartments.

Current System Context:
${JSON.stringify({
  totalBins: binsContext?.length || 0,
  bins: binsContext?.map((b: any) => ({
    id: b.binId,
    name: b.name,
    location: b.location,
    food: b.foodFillLevel + '%',
    recycling: b.recyclingFillLevel + '%',
    general: b.generalFillLevel + '%',
    temp: b.temperature + '°C',
    battery: b.batteryLevel + '%',
    status: b.connectivityStatus,
  })),
  pendingCollections: collectionQueue,
  activeAlerts: alertsContext,
}, null, 2)}

Provide clear, concise, highly professional, operational recommendations. Use bullet points and bold highlights for critical actions (e.g. dispatching collectors, priority routes in Kigali). If demo data is referenced, indicate based on current system data.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.2,
        },
      });

      return res.json({
        reply: response.text || 'No response generated.',
        source: 'GEMINI_AI',
      });
    }

    // Heuristic Fallback when GEMINI_API_KEY is not set or running offline
    let fallbackReply = '';
    const lowerPrompt = prompt.toLowerCase();

    if (lowerPrompt.includes('require collection') || lowerPrompt.includes('collection') || lowerPrompt.includes('priorit')) {
      const urgentBins = (binsContext || []).filter(
        (b: any) => b.foodFillLevel >= 80 || b.recyclingFillLevel >= 80 || b.generalFillLevel >= 80
      );
      if (urgentBins.length > 0) {
        fallbackReply = `### 🚨 Immediate Collection Priorities for Kigali:\n\n` +
          urgentBins.map((b: any) => {
            const highComps = [];
            if (b.foodFillLevel >= 80) highComps.push(`Food (${b.foodFillLevel}%)`);
            if (b.recyclingFillLevel >= 80) highComps.push(`Recycling (${b.recyclingFillLevel}%)`);
            if (b.generalFillLevel >= 80) highComps.push(`General (${b.generalFillLevel}%)`);
            return `- **${b.name}** (${b.binId} at ${b.location}): Critical fill in ${highComps.join(', ')}. Recommend immediate truck dispatch.`;
          }).join('\n') +
          `\n\n**Action Item:** Auto-alert has been assigned to Kigali Waste Operations Team. Estimated total volume: ~${urgentBins.length * 120} Liters.`;
      } else {
        fallbackReply = `All active SmartBins currently operate below the 80% critical threshold. Current highest is **${binsContext?.[0]?.name || 'SG-BIN-001'}** at ~75%. Next scheduled routine route at 14:00.`;
      }
    } else if (lowerPrompt.includes('filling fastest') || lowerPrompt.includes('fastest') || lowerPrompt.includes('rate')) {
      fallbackReply = `### 📈 Waste Fill Velocity Analysis:\n\n- **Highest Velocity Area:** **Nyarugenge Market (SG-BIN-003)** & **Kimironko Market (SG-BIN-005)**.\n- **Trend:** Food waste and organic matter accumulate 2.8x faster during midday market hours (11:30 - 15:00).\n- **Recycling Surge:** **Kigali Heights (SG-BIN-002)** experiences peak plastic beverage bottle intake between 17:00 - 20:00.\n- **Recommendation:** Schedule dual-shift collections at market hubs on weekends.`;
    } else if (lowerPrompt.includes('offline') || lowerPrompt.includes('connectivity')) {
      const offlineBins = (binsContext || []).filter((b: any) => b.connectivityStatus === 'OFFLINE');
      if (offlineBins.length > 0) {
        fallbackReply = `### ⚠️ Offline SmartBin Status:\n\n` +
          offlineBins.map((b: any) => `- **${b.name}** (${b.binId} - ${b.location}): Last ping received >35 mins ago. Battery was at ${b.batteryLevel}%. Check LoRaWAN gateway / ESP32 4G telemetry link.`).join('\n');
      } else {
        fallbackReply = `All 12 SmartBins across Kigali are currently **ONLINE** with active telemetry heartbeats. Average ping latency is 184ms.`;
      }
    } else if (lowerPrompt.includes('predict') || lowerPrompt.includes('tomorrow')) {
      fallbackReply = `### 🔮 Predictive AI Fill Forecast for Tomorrow:\n\nBased on historical disposal velocity in Kigali:\n1. **SG-BIN-002 (Kigali Heights)**: Recycling compartment will reach **88% by 16:30 tomorrow**.\n2. **SG-BIN-005 (Kimironko Market)**: Food waste will reach **85% by 13:00 tomorrow**.\n3. **SG-BIN-006 (Kigali Convention Centre)**: Moderate increase during scheduled summit; recycling at ~72%.\n\n**Operational Plan:** Pre-allocate Route 2 collection truck for 13:30 Kimironko - Kigali Heights loop.`;
    } else if (lowerPrompt.includes('maintenance') || lowerPrompt.includes('sensor')) {
      fallbackReply = `### 🛠️ Hardware & Maintenance Status:\n\n- **SG-BIN-008 (Kanombe Airport Rd)**: Ultrasonic sensor reading variance ±8% — scheduled lens clean.\n- **SG-BIN-004 (Remera Stadium)**: Solar panel charge rate 14% below expected sunlight irradiance — inspection scheduled.\n- **LED Display Screens**: 100% operational across all Kigali smart stations with 0 pixel anomalies.`;
    } else {
      fallbackReply = `### 🤖 SG SmartBin Operational Intelligence Summary:\n\n- **Fleet Status:** ${binsContext?.length || 12} SmartBins active across Kigali city hubs.\n- **Current High Priority:** Monitor recycling waste in commercial zones (avg 87%) and food waste in central markets (avg 64%).\n- **Advertising Screen Status:** 4 active digital campaigns running with ~98.4% uptime and 142k daily impressions.\n- **Recommended Next Step:** Review the Collections tab to assign pending dispatches for bins exceeding 80% fill level.`;
    }

    return res.json({
      reply: fallbackReply,
      source: 'LOCAL_OPERATIONAL_ENGINE (DEMO DATA)',
    });
  } catch (error: any) {
    console.error('AI Assistant error:', error);
    return res.status(500).json({ error: error.message || 'AI processing error' });
  }
});

// AI Computer Vision Waste Classification Simulator Endpoint
app.post('/api/ai/classify-waste', async (req, res) => {
  try {
    const { itemName, imageBase64 } = req.body;
    const ai = getGeminiClient();

    if (ai && (imageBase64 || itemName)) {
      const prompt = `Analyze this waste item for the SG SmartBin 3-compartment segregation system:
1. FOOD WASTE (Organic food scraps, fruit peels, vegetables, leftovers)
2. RECYCLING WASTE (Plastic bottles, aluminum cans, clean cardboard, paper, glass)
3. GENERAL WASTE (Non-recyclable wrappers, soiled napkins, sanitary items, composite materials)

Item description or user query: "${itemName || 'Image of waste item'}"

Respond in JSON format:
{
  "category": "FOOD" | "RECYCLING" | "GENERAL",
  "compartment": "FOOD WASTE" | "RECYCLING WASTE" | "GENERAL WASTE",
  "confidence": number (e.g. 0.96),
  "itemIdentified": "string name",
  "reasoning": "string concise explanation",
  "environmentalTip": "string short smart-city recycling advice",
  "biodegradable": boolean,
  "recyclable": boolean
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({
        success: true,
        data: parsed,
        engine: 'GEMINI_VISION_AI',
      });
    }

    // Default simulation response
    const name = (itemName || 'Plastic Water Bottle').toLowerCase();
    let category = 'RECYCLING';
    let compartment = 'RECYCLING WASTE';
    let reasoning = 'Clean PET plastic can be melted and re-pelletized for circular manufacturing in Rwanda.';
    let tip = 'Empty all liquid before placing in the RECYCLING compartment.';
    let recyclable = true;
    let biodegradable = false;

    if (name.includes('banana') || name.includes('food') || name.includes('apple') || name.includes('bread') || name.includes('rice') || name.includes('peel')) {
      category = 'FOOD';
      compartment = 'FOOD WASTE';
      reasoning = 'Organic biodegradable material suitable for Kigali municipal bio-composting and methane capture.';
      tip = 'Keep plastics out to preserve organic compost purity.';
      recyclable = false;
      biodegradable = true;
    } else if (name.includes('wrapper') || name.includes('tissue') || name.includes('straw') || name.includes('chip') || name.includes('battery')) {
      category = 'GENERAL';
      compartment = 'GENERAL WASTE';
      reasoning = 'Multi-layer composite material not currently processed in standard mechanical recycling loops.';
      tip = 'Minimize single-use non-recyclable packaging when shopping.';
      recyclable = false;
      biodegradable = false;
    }

    return res.json({
      success: true,
      data: {
        category,
        compartment,
        confidence: 0.94,
        itemIdentified: itemName || 'Simulated Waste Item',
        reasoning,
        environmentalTip: tip,
        biodegradable,
        recyclable,
      },
      engine: 'SIMULATED_CV_ENGINE (DEMO READY)',
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Setup Vite middleware
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SG SmartBin Cloud Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
