import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateHeadlines(barName: string, barType: string, objective: string): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a creative marketing copywriter for bars and nightlife venues. Generate catchy, professional headlines for promotions. Return exactly 5 headlines, one per line, no numbering, no quotes." },
        { role: "user", content: `Generate 5 promotional headlines for ${barName}, a ${barType?.replace(/_/g, " ")} in Helsinki. The campaign objective is: ${objective}. Make them catchy and professional.` },
      ],
      temperature: 0.8,
      max_tokens: 200,
    });
    return (response.choices[0]?.message?.content || "").split("\n").filter(h => h.trim());
  } catch (err) {
    console.error("OpenAI headline generation failed:", err);
    return ["Happy Hour Special", "Weekend Party", "Live Music Night", "Drinks & Friends", "VIP Experience"];
  }
}

export async function generateCampaignBody(headline: string, barName: string, promotionType: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a professional marketing copywriter. Write engaging promotional copy for bars. Include a call to action. Keep it under 200 characters." },
        { role: "user", content: `Write promotional copy for "${headline}" at ${barName}. Type: ${promotionType}. Include emoji. Under 200 chars.` },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });
    return response.choices[0]?.message?.content || "";
  } catch (err) {
    console.error("OpenAI body generation failed:", err);
    return `Join us at ${barName} for an amazing ${promotionType?.replace(/_/g, " ")}! Don't miss out.`;
  }
}
