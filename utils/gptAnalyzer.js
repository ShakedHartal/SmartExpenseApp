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

  const prompt = `
You are a helpful financial assistant. Given the following summary of a user's monthly expenses by category, provide 2-3 smart insights or tips on how the user could better manage their spending. Be polite, practical, and insightful.

Monthly Expenses:
${summaryText}

Respond with a short summary of your analysis.
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
        temperature: 0.7,
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
