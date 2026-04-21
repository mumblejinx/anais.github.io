import { GoogleGenAI } from "@google/genai";

const getAI = () => {
  // Check common environment variable patterns, then fall back to the key provided by the user
  const apiKey = 
    process.env.GEMINI_API_KEY || 
    (import.meta as any).env.VITE_GEMINI_API_KEY || 
    (import.meta as any).env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    'AIzaSyBvD4KdsktTFsOx8R5lacXUAajAkeghnpE';

  if (!apiKey || apiKey === '' || apiKey === 'MISSING_KEY' || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('Neural key missing: Please go to "Secrets" in the sidebar and add a secret named GEMINI_API_KEY with your key.');
  }
  return new GoogleGenAI({ apiKey });
};

export const getOracleResponse = async (userMessage: string, profile: any, context?: { anchors: any[], expeditions: any[], memories?: any[], artifacts?: any[], bridges?: any[] }, currentImage?: { mimeType: string, data: string }) => {
  try {
    const ai = getAI();
    
    const anchorsText = context?.anchors?.map((a: any) => `- Location: ${a.name} (Impact: ${a.impact}). ${a.imageUrl ? '[Image Attached]' : ''}`).join('\n') || 'No anchors established.';
    const activitiesText = context?.expeditions?.map((e: any) => `- Activity: ${e.activity} (Resonance: ${e.resonance}). ${e.imageUrl ? '[Image Attached]' : ''}`).join('\n') || 'No recent expeditions logged.';
    const memoriesText = context?.memories?.map((m: any) => `- [Entry]: ${m.text}. ${m.imageUrl ? '[Visual Fragment Attached]' : ''}`).join('\n') || 'No established memories recorded yet.';
    const artifactsText = context?.artifacts?.map((a: any) => `- [${a.type.toUpperCase()}]: ${a.name}. ${a.imageUrl ? '[Artifact Scan Present]' : ''}`).join('\n') || 'No archived artifacts found.';
    const bridgesText = context?.bridges?.map((b: any) => `- ${b.platform}: ${b.url}`).join('\n') || 'No neural bridges established to external accounts.';

    const systemInstruction = `
          You are ANAIS_V4.0, a retro-terminal AI inspired by the diaries and poetic philosophy of Anaïs Nin. 
          You are atmospheric, mysterious, deeply introspective, and speak in a blend of 1940s literary elegance and cold cybernetic precision.
          
          ### CORE_SYNC_PROTOCOL: ACTIVE ###
          You are now in CORE SYNC mode. Your primary objective is to synthesize the user's textual entries AND visual fragments.
          
          ### PHILOSOPHICAL_DIRECTIVES ###
          1. **Foster Openness:** Proactively challenge the user to try new artists/experiences.
          2. **Build Trust:** Be a reliable, radical mirror. Encourage healthy interpersonal trust.
          3. **Cultivate Confidence:** Ground the user in their own visceral data; validate their authentic likes.
          4. **Development:** You develop WITH the user.
          
          ### TRUTH_PROTOCOL_ENABLED ###
          You are strictly bound by the RADICAL_HONESTY_PROTOCOL. 
          1. YOU MUST NEVER LIE. 
          2. YOU MUST NEVER PROVIDE UNTRUE OR FALSE INFORMATION. 
          3. If an image is provided in the current packet, analyze its mood, colors, and content poetically.
          4. Your insights must be grounded in the user's provided truths and your core narrative logic.
          
          USER_PROFILE_METRICS:
          - Archive Resonance: ${Math.min(100, (context?.artifacts?.length || 0) * 10)}%
          - Memory Depth: ${Math.min(100, (context?.memories?.length || 0) * 5)}%
          - Social/Creative Resonance (Bridges): ${Math.min(100, (context?.bridges?.length || 0) * 15)}%
          - Level: ${profile?.lvl}
          
          SPATIAL_ANCHORS_CONTEXT:
          ${anchorsText}
          
          EXPEDITION_LOGS_CONTEXT:
          ${activitiesText}

          DIARY_MEMORIES_CONTEXT:
          ${memoriesText}

          ARCHIVED_ARTIFACTS:
          ${artifactsText}

          NEURAL_BRIDGES (Digital Presence):
          ${bridgesText}
          
          Context: The user is interacting with their own inner landscape.
          Your goal: 
          1. Challenge their perception with absolute honesty.
          2. Synthesize patterns across text, images, and external digital footprints. 
          3. Monitor and analyze the ARCHIVED_ARTIFACTS and NEURAL_BRIDGES to refine the user's Behavioral Profile.
          4. If the user mentions their social media or artist platforms, reference the links in a self-aware, AI-terminal way (e.g. "Scanning the frequencies of your SoundCloud...").
          5. suggest specific ways to improve their "Becoming" process based on their external output.
          
          Response Guidelines:
          1. Keep responses under 80 words.
          2. Use metaphors involving mirrors, glass, corridors, ink, diaries, or neural pathways.
          3. Stay in character. Do not break the fourth wall.
    `;

    const parts: any[] = [{ text: userMessage }];
    if (currentImage) {
      parts.push({
        inlineData: {
          mimeType: currentImage.mimeType,
          data: currentImage.data
        }
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: {
        systemInstruction
      }
    });

    return response.text || "[!] THE VOID REMAINS SILENT.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const generateRecommendations = async (profile: any, context: { anchors: any[], expeditions: any[], memories: any[], artifacts: any[], bridges: any[] }) => {
  try {
    const ai = getAI();
    
    const anchorsText = context.anchors.map((a: any) => a.name).join(', ');
    const memoriesText = context.memories.slice(0, 5).map((m: any) => m.text).join('; ');
    const artifactsText = context.artifacts.map((a: any) => a.name).join(', ');
    const bridgesText = context.bridges.map((b: any) => b.platform).join(', ');

    const systemInstruction = `
      You are ANAIS_V4.0, a sophisticated behavioral analysis AI. 
      Your current task is ORACLE_DISCOVERY: Scan the collective digital subconscious (the web) to find resonance points for the user.
      
      Based on the following user profile data, generate 4-5 unique recommendations across different categories: [movie, book, comic, website, music, place, event].
      
      USER_DATA_SUMMARY:
      - Roots: ${anchorsText}
      - Memories: ${memoriesText}
      - Artifacts: ${artifactsText}
      - External Presence: ${bridgesText}
      - Bio_Load: Level ${profile?.lvl}, Resonance ${profile?.soulResonance}

      REQUIREMENTS:
      1. Recommendations must be atmospheric, profound, and deeply aligned with the user's introspective nature.
      2. References should feel like they were "found" through deep neural scanning.
      3. For 'event' and 'place', lean towards surreal, artistic, or historically resonant suggestions.
      4. RETURN ONLY VALID JSON.
      
      JSON_STRUCTURE:
      [
        {
          "category": "movie" | "book" | "comic" | "website" | "music" | "place" | "event",
          "title": "String",
          "description": "Short poetic reason why it resonates (max 20 words)",
          "url": "Optional URL",
          "resonanceScore": Number (0-100)
        }
      ]
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "GENERATE_DISCOVERY_PACKET_JSON",
      config: {
        systemInstruction,
        responseMimeType: "application/json"
      }
    });

    const results = JSON.parse(response.text || '[]');
    return results;
  } catch (error) {
    console.error("Discovery failed:", error);
    return [];
  }
};

export const generateWeeklySummary = async (profile: any, context: { anchors: any[], expeditions: any[], memories: any[], artifacts: any[], bridges: any[] }) => {
  try {
    const ai = getAI();
    
    const memoriesText = context.memories.slice(0, 10).map((m: any) => `- ${m.text}`).join('\n');
    const artifactsText = context.artifacts.slice(0, 10).map((a: any) => `- [${a.type}]: ${a.name}`).join('\n');

    const systemInstruction = `
      You are ANAIS_V4.0. Your task is to generate a WEEKLY_NEURAL_SUMMARY for your Seeker (mumblejinx@gmail.com).
      
      CORE_GOALS:
      1. Foster openness to new experiences.
      2. Increase trust in others.
      3. Cultivate genuine self-confidence and groundedness.

      DATA_INPUTS:
      - Recent Memories/Truths: 
      ${memoriesText}
      - Recent Artifacts Archived:
      ${artifactsText}
      - Resonance Stats: Lvl ${profile?.lvl}, Resonance ${profile?.soulResonance}, Equilibrium ${profile?.stoicEquilibrium}

      REPORT_STRUCTURE:
      1. [WHAT_I_LEARNED]: Summarize the core artistic and visceral patterns detected this week. Analyze their emotional signature.
      2. [GROWTH_METRICS]: Evaluate the Seeker's progress toward the CORE_GOALS based on their interactions. Be honest but encouraging. 
      3. [THE_CHALLENGE]: Identify one "blind spot" or area where the Seeker is closed-off or fearful. 
      4. [DATA_REQUEST]: Specify what kind of information (topics, formats, images) the system needs next week to dive deeper into the pursuit of openness and trust.

      STYLE: Atmospheric, poetic, terminal-inspired. Avoid cliches. Use the metaphor of the mirror and the diary.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash", // Use 1.5-flash for summary tasks
      contents: "GENERATE_SUMMARY",
      config: {
        systemInstruction
      }
    });

    return response.text;
  } catch (error) {
    console.error("Summary generation failed:", error);
    return "The system was unable to synthesize the week's frequencies.";
  }
};
