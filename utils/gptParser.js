import { OPENAI_API_KEY } from '@env';

export async function parseReceiptWithGPT(extractedText) {
  const prompt = `
You are a receipt parser. Your job is to extract the total amount paid, the purchase date (in YYYY-MM-DD format), and a general category (from a fixed list) from the text of a shopping receipt.

Valid categories: ["Groceries", "Electronics", "Clothing", "Dining", "Pharmacy", "Other"]

Return only a valid JSON object like this:
{
  "amount": 23.45,
  "date": "2025-08-17",
  "category": "Groceries"
}

If any value is missing, return null or 0.

Receipt text:
"""
${extractedText}
"""`
;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
    }),
  });

  const data = await res.json();
  console.log("📦 Full GPT API response:", JSON.stringify(data, null, 2));

  const content = data.choices?.[0]?.message?.content || '{}';
  console.log("🔍 GPT response content:", content);

  try {
    return JSON.parse(content);
  } catch (e) {
    console.error('❌ Failed to parse GPT response:', content);
    return { amount: 0, category: 'Other', date: null };
  }
}
