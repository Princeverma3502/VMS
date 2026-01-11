import asyncHandler from 'express-async-handler';
import KnowledgeBase from '../models/KnowledgeBase.js';

// POST /api/ai/query
// Body: { prompt: string }
export const queryAI = asyncHandler(async (req, res) => {
  const { prompt } = req.body || {};
  const user = req.user; // User context from middleware

  if (!prompt || !prompt.trim()) {
    res.status(400);
    throw new Error('Prompt is required');
  }

  // 1. CONTEXT RETRIEVAL (RAG-Lite)
  // Search Knowledge Base for relevant context within the user's college
  let contextText = "";
  try {
    const relevantDocs = await KnowledgeBase.find(
      { 
        $text: { $search: prompt }, 
        isPublished: true,
        collegeId: user.collegeId 
      },
      { score: { $meta: "textScore" } }
    )
    .sort({ score: { $meta: "textScore" } })
    .limit(2)
    .select('title content description');

    if (relevantDocs.length > 0) {
      contextText = "Reference Material from NSS Knowledge Base:\n" + 
        relevantDocs.map(doc => `- ${doc.title}: ${doc.description} (${doc.content.substring(0, 200)}...)`).join('\n');
    }
  } catch (err) {
    console.warn("AI Context Retrieval failed:", err.message);
    // Continue without context if DB search fails
  }

  const openaiKey = process.env.OPENAI_API_KEY;

  // 2. AI EXECUTION
  if (openaiKey) {
    try {
      // System Prompt defines persona and injects context
      const systemMessage = `
        You are the 'NSS Assistant', a helpful AI for the National Service Scheme unit.
        
        User Info:
        - Name: ${user.name}
        - Role: ${user.role}
        
        ${contextText ? "Use the following context to answer if relevant:\n" + contextText : ""}
        
        Guidelines:
        - Be professional, encouraging, and concise.
        - If the user asks about specific college events/tasks, look at the provided context.
        - If you don't know, say "I don't have that information right now, please contact your Secretary."
      `;

      const payload = {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        max_tokens: 300,
        temperature: 0.7,
      };

      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!r.ok) {
        const text = await r.text();
        console.error('OpenAI Error:', text);
        res.status(502).json({ error: 'AI Service unavailable at the moment.' });
        return;
      }

      const data = await r.json();
      const reply = data?.choices?.[0]?.message?.content || 'No response from AI.';
      
      res.json({ 
        reply,
        contextUsed: !!contextText // Flag to frontend that KB data was used
      });

    } catch (err) {
      console.error('AI Request Error:', err);
      res.status(500);
      throw new Error('AI processing failed');
    }
  } else {
    // 3. FALLBACK MODE (No API Key)
    // Enhanced rule-based responses
    const q = prompt.toLowerCase();
    let reply = `[Offline Mode] Hello ${user.name.split(' ')[0]}! I can help you navigate:\n\n`;

    if (q.includes('certificate') || q.includes('resume')) {
      reply += "👉 Go to 'My Resume' in the sidebar to generate your volunteer certificate and resume.";
    } else if (q.includes('scan') || q.includes('qr')) {
      reply += "👉 Use the 'Scan QR' button in your profile to verify ID cards.";
    } else if (q.includes('task') || q.includes('work')) {
      reply += "👉 Check the 'Dashboard' for available tasks assigned to your domain.";
    } else if (q.includes('contact') || q.includes('secretary')) {
      reply += "👉 You can find contact details in the 'About Unit' section.";
    } else {
      reply += "I can help you find features like Tasks, Profile, Resume, and ID Card. What are you looking for?";
    }

    res.json({ reply, isFallback: true });
  }
});

export default queryAI;