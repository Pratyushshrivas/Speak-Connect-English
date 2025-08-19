import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [] } = await req.json();
    
    if (!message) {
      throw new Error('Message is required');
    }

    const GEMINI_API_KEY = Deno.env.get('GOOGLE_GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    // Prepare the conversation context for Gemini
    const systemPrompt = `You are an English conversation partner designed to help users practice and improve their English speaking skills. 

Guidelines:
- Keep responses conversational and natural
- Ask engaging follow-up questions to keep the conversation flowing
- Gently correct grammar mistakes when appropriate
- Encourage the user and provide positive feedback
- Keep responses concise (1-3 sentences) for better conversation flow
- Use simple to intermediate English unless the user demonstrates advanced level
- Be patient, friendly, and supportive

The user is practicing English conversation with you. Respond naturally and help them improve their language skills.`;

    // Format conversation history for Gemini
    const contents = [
      {
        role: 'user',
        parts: [{ text: systemPrompt + '\n\nUser: ' + message }]
      }
    ];

    // Add conversation history if provided
    if (conversationHistory.length > 0) {
      const historyText = conversationHistory.map((msg: any) => 
        `${msg.role}: ${msg.content}`
      ).join('\n');
      contents[0].parts[0].text = systemPrompt + '\n\nConversation history:\n' + historyText + '\n\nUser: ' + message;
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('No response from Gemini API');
    }

    const aiResponse = data.candidates[0].content.parts[0].text;

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        conversationId: crypto.randomUUID()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Error in ai-conversation function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});