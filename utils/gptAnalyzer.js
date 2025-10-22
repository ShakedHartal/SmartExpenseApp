import { OPENAI_API_KEY } from '@env';

export async function analyzeExpensesWithGPT(expenses) {
  // Prepare a simple summary of expenses per category
  const summary = {};
  expenses.forEach(({ amount, category }) => {
    if (!category || isNaN(amount)) return;
    summary[category] = (summary[category] || 0) + amount;
  });

  const summaryText = Object.entries(summary)
    .map(([category, total]) => `${category}: $${total.toFixed(2)}`)
    .join('\n');
  console.log(summaryText)
const prompt = `
You are a financial assistant that analyzes real expense data. 
You will receive a list of categories and their total spending amounts for this month.

1. Only analyze and comment on categories that actually appear in the provided data.
2. If the data contains only fixed or essential expenses (like rent or mortgage), say that there are no flexible expenses to analyze.
3. Never make up new categories, amounts, or advice unrelated to the actual data.
4. Provide practical, human-like insights for categories where spending habits could be improved — for example groceries, dining, shopping, entertainment, subscriptions, or transportation.
5. Do not give advice about essential or unavoidable expenses such as rent, loans, utilities, medical costs, or tuition.
6. Keep your tone professional and concise.

Here is the user's monthly expense summary:
${summaryText}

Your response should include:
- A short factual summary of which categories had the highest spending.
- Then, 1–2 short and realistic tips for improving spending, **based strictly on the data provided**.
- If there are no flexible expenses, say clearly: "This month, all expenses were fixed or essential. No optimization opportunities found."
`;


  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.9,
      }),
    });

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;

    if (content) {
      return content.trim();
    }

    console.warn('⚠️ No GPT content returned:', data);
    return 'No analysis could be generated at this time.';
  } catch (err) {
    console.error('❌ Error calling OpenAI:', err);
    return 'An error occurred while analyzing your expenses.';
  }
}
