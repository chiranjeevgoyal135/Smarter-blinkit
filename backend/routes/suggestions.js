// backend/routes/suggestions.js
// "Intent" Search — understands what the user MEANS, not just what they type.
// "I have a cold" → Honey, Ginger Tea, Tulsi drops (not biscuits!)
// "movie night"   → Popcorn, Chips, Cola
// "make pizza"    → Flour, Cheese, Tomato Sauce

const express = require("express");
const router  = express.Router();

const queryCache = {};

function robustParse(text) {
  if (!text?.trim()) return null;
  let s = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  s = s.replace(/\}\s*\{/g, "},{").replace(/\}\s*\(\s*\{/g, "},{");
  try { const r = JSON.parse(s); if (r) return r; } catch (_) {}
  const o1 = s.indexOf("{"), o2 = s.lastIndexOf("}");
  if (o1 !== -1 && o2 > o1) {
    try { const r = JSON.parse(s.slice(o1, o2 + 1)); if (r) return r; } catch (_) {}
  }
  const a1 = s.indexOf("["), a2 = s.lastIndexOf("]");
  if (a1 !== -1 && a2 > a1) {
    try {
      const r = JSON.parse(s.slice(a1, a2 + 1));
      if (Array.isArray(r)) return { matched: true, suggestions: r };
    } catch (_) {}
  }
  return null;
}

router.post("/", async (req, res) => {
  const { query } = req.body;
  if (!query?.trim()) return res.json({ matched: false, suggestions: [] });

  const cacheKey = query.toLowerCase().trim();
  if (queryCache[cacheKey]) {
    console.log(`Cache hit: "${query}"`);
    return res.json(queryCache[cacheKey]);
  }

  const systemPrompt = `You are a JSON API for an Indian grocery app. You ONLY output valid JSON. No explanations. No markdown. Just JSON.

CRITICAL RULE — INTENT UNDERSTANDING:
You must understand the USER'S INTENT, not just match keywords.
- "I have a cold" → suggest remedies: Honey, Ginger Tea, Tulsi drops, Kadha, Vicks, Strepsils — NOT biscuits or snacks
- "movie night" → Popcorn, Chips, Cola, Nachos — NOT dal or rice
- "make pizza" → Pizza base, Mozzarella, Tomato sauce, Oregano — NOT random items
- "breakfast" → Bread, Eggs, Butter, Milk, Cornflakes
- "party" → Chips, Soft drinks, Juice, Snacks
- "baby food" → Cerelac, Nestum, Baby formula
- "gym" → Protein powder, Oats, Peanut butter, Banana chips
- "hangover" → Electral, Coconut water, Lemon, Ginger ale
- "period cramps" → Dark chocolate, Heating pad, Chamomile tea, Ibuprofen
- "study night" → Coffee, Energy drink, Biscuits, Nuts
Always think: "What does this person actually need right now?"`;

  const userPrompt = `Return 6 Indian grocery products for the search intent: "${query}"

Output this exact JSON structure:
{"matched":true,"keyword":"${query}","suggestions":[{"name":"Dabur Honey 250g","price":175,"emoji":"🍯","reason":"Natural remedy for cold and sore throat","brand":"Dabur"},{"name":"Tata Tea Ginger 250g","price":145,"emoji":"🍵","reason":"Ginger tea soothes cold symptoms","brand":"Tata"}]}

Rules:
- UNDERSTAND THE INTENT — suggest what the person actually needs
- Real Indian brands (Dabur, Himalaya, Patanjali, Amul, Tata, Nestle, etc.)
- Real INR prices
- The "reason" field must explain WHY this product fits the intent
- If query has no grocery meaning at all, output: {"matched":false,"suggestions":[]}`;

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 700,
        temperature: 0.2,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user",   content: userPrompt   },
        ],
      }),
    });

    const groqData = await groqRes.json();

    if (groqData.error) {
      console.error("Groq API error:", groqData.error);
      return res.json({ matched: false, suggestions: [] });
    }

    const rawText = groqData.choices?.[0]?.message?.content || "";
    console.log(`AI intent search: "${query}" | raw (${rawText.length} chars):`, rawText.slice(0, 120));

    const parsed = robustParse(rawText);
    if (!parsed) {
      console.error("Parse failed. Full response:", rawText);
      return res.json({ matched: false, suggestions: [] });
    }

    if (parsed.suggestions) {
      parsed.suggestions = parsed.suggestions.map(s => ({
        ...s,
        price: Number(s.price) || 50,
        stock: Math.floor(Math.random() * 50) + 5,
        unit:  "pack",
      }));
    }

    queryCache[cacheKey] = parsed;
    return res.json(parsed);
  } catch (e) {
    console.error("Suggestions fetch error:", e.message);
    return res.status(500).json({ matched: false, suggestions: [] });
  }
});

module.exports = router;
