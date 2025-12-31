const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// Get API key from Expo constants
const getApiKey = () => {
  const key = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  console.log('Gemini API Key exists:', !!key);
  return key;
};

// Localized prompts for dream analysis
const prompts = {
  analysis: {
    tr: (content) => `Jungiyen psikolojiye dayanan, empatik ve anlayışlı bir rüya analisti olarak hareket et.
Kullanıcı tarafından sağlanan aşağıdaki rüyayı analiz et.

Girdi:
- Rüya İçeriği: ${content}

Talimatlar:
1. Girdi anlamsızsa veya saçmaysa, sadece 'Analiz Yapılamadı' dön.
2. Soru SORMA.
3. Yanıtını 3 ayrı paragrafa ayır (aralarında çift satır sonu kullan):
   - Paragraf 1: Temel Tema. Duygusal atmosferi ve merkezi anlamı kısaca açıkla.
   - Paragraf 2: Sembol Çözümleme. Rüyadaki belirli sembolleri analiz et. Anahtar sembolleri **kalın** yap ve psikolojik olarak neyi temsil ettiklerini açıkla.
   - Paragraf 3: Uygulanabilir İçgörü. Bu rüyayı gerçek hayat durumlarıyla ilişkilendir ve nazik bir öneri veya yansıma sun.

Üslup: Profesyonel, sıcak, anlayışlı ve net.`,
    en: (content) => `Act as an empathetic and insightful dream analyst based on Jungian psychology.
Analyze the following dream provided by the user.

Input:
- Dream Content: ${content}

Instructions:
1. If the input is meaningless or gibberish, return only 'Analysis Failed'.
2. Do NOT ask questions.
3. Structure your response in 3 distinct paragraphs (use double line breaks between them):
   - Paragraph 1: The Core Theme. Briefly explain the emotional atmosphere and the central meaning, using the Title as a context clue.
   - Paragraph 2: Symbol Decoding. Analyze specific symbols in the dream. **Bold** the key symbols and explain what they represent psychologically.
   - Paragraph 3: Actionable Insight. Connect this dream to potential waking life situations and offer a gentle suggestion or reflection.

Tone: Professional yet warm, insightful, and clear.`,
  },
  fallback: {
    tr: 'Analiz yapılamadı',
    en: 'Analysis could not be performed',
  },
};

// Analyze dream using Gemini API
export const analyzeDream = async (dreamContent, language = 'tr') => {
  const apiKey = getApiKey();
  
  console.log('Starting dream analysis...');
  
  if (!apiKey) {
    console.error('Gemini API key not found!');
    return { analysis: null, error: 'Gemini API key not configured' };
  }

  const lang = language === 'tr' ? 'tr' : 'en';
  const prompt = prompts.analysis[lang](dreamContent);

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      }),
    });

    console.log('Gemini API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    // console.log('Gemini API response:', JSON.stringify(data).substring(0, 200));
    let analysis = data.candidates?.[0]?.content?.parts?.[0]?.text || prompts.fallback[lang];
    
    // Clean up the response - keep letters from both languages
    analysis = analysis.replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ\s.,!?-]/g, '');

    const failedAnalysis = lang === 'tr' ? 'Analiz Yapılamadı' : 'Analysis Failed';
    if (analysis.trim() === failedAnalysis) {
      return { analysis: null, error: 'Invalid dream content' };
    }

    return { analysis, error: null };
  } catch (error) {
    return { analysis: null, error: error.message };
  }
};

import { InferenceClient } from "@huggingface/inference";

const getHfToken = () => {
    return process.env.EXPO_PUBLIC_HF_TOKEN;
}

// Direct fetch implementation to bypass SDK issues in React Native
export const generateDreamImage = async (dreamContent) => {
    const token = getHfToken();
    if (!token) {
        console.error("HF Token not found");
        return { image: null, error: "Hugging Face Token is missing" };
    }

    try {
        console.log("Generating dream image via direct fetch...");
        const prompt = `Dreamy, surreal, artistic interpretation of: ${dreamContent.substring(0, 300)}`;
        
        // Switching to Pollinations.ai - Guaranteed free, no-key-required generation
        // This bypasses HF API issues completely
        const encodedPrompt = encodeURIComponent(prompt);
        const response = await fetch(
            `https://image.pollinations.ai/prompt/${encodedPrompt}`,
            {
                method: "GET",
            }
        );

        if (!response.ok) {
             const errorText = await response.text();
             console.error("HF API Error:", response.status, errorText);
             throw new Error(`API Error: ${response.status}`);
        }

        const blob = await response.blob();
        
        // Convert Blob to Base64
        const reader = new FileReader();
        return new Promise((resolve) => {
            reader.onloadend = () => {
                const base64data = reader.result;
                resolve({ image: base64data, error: null });
            };
            reader.onerror = () => {
                resolve({ image: null, error: "Failed to process image data" });
            };
            reader.readAsDataURL(blob);
        });

    } catch (error) {
        console.error("Image Gen Error:", error);
        return { image: null, error: error.message || "Failed to generate image" };
    }
};
