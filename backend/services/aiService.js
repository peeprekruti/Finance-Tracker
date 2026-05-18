const { OpenAI } = require('openai');

// Initialize OpenAI conditionally. Ensures the app doesn't crash if the key is not defined.
let openai = null;
if (process.env.GROQ_API_KEY || (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here')) {
  try {
    openai = new OpenAI({
      apiKey: process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY,
      baseURL: process.env.GROQ_API_KEY ? 'https://api.groq.com/openai/v1' : undefined
    });
  } catch(e) {
    console.warn("Invalid API Key configuration.");
  }
}

const getModelName = () => process.env.GROQ_API_KEY ? 'llama-3.3-70b-versatile' : 'gpt-3.5-turbo';

/**
 * Categorize an expense using OpenAI/Groq.
 * @param {string} transactionText - Description of the transaction.
 */
async function categorizeExpense(transactionText) {
  if (!openai) {
    const text = transactionText.toLowerCase();
    if (text.includes("food") || text.includes("burger") || text.includes("grocery") || text.includes("swiggy") || text.includes("zomato")) return { category: 'Food', confidence: '90%' };
    if (text.includes("cab") || text.includes("uber") || text.includes("flight") || text.includes("train")) return { category: 'Travel', confidence: '85%' };
    if (text.includes("amazon") || text.includes("myntra") || text.includes("shirt") || text.includes("buy")) return { category: 'Shopping', confidence: '90%' };
    if (text.includes("electricity") || text.includes("recharge") || text.includes("wifi")) return { category: 'Bills', confidence: '95%' };
    return { category: 'Uncategorized', confidence: 'System Default' };
  }

  try {
    const response = await openai.chat.completions.create({
      model: getModelName(),
      messages: [
        {
          role: 'system',
          content: `You are a financial AI. Categorize the given transaction text into one of these strict categories: Food, Travel, Shopping, Bills, or Uncategorized. Return a JSON object with 'category' (string) and 'confidence' (string like "92%").`
        },
        { role: 'user', content: `Transaction: "${transactionText}"` }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("AI Categorization Error:", error);
    return { category: 'Uncategorized', confidence: '0%' };
  }
}

/**
 * Generate insights based on transaction logs.
 */
async function generateInsights(transactions) {
  if (!openai || transactions.length === 0) {
    if (transactions.length > 0) {
      const topCat = transactions[0].category || 'General';
      return { insights: [
        `You've recently been spending on ${topCat}.`,
        'Try to limit weekend discretionary spending.',
        'Consider setting up an automated 30% savings rule to hit your goals.'
      ] };
    }
    return { insights: ['Add more transactions to see AI insights!'] };
  }

  const recentTx = transactions.slice(0, 30).map(t => `$${t.amount} on ${t.category} (${t.note || 'No note'})`);

  try {
    const response = await openai.chat.completions.create({
      model: getModelName(),
      messages: [
        {
          role: 'system',
          content: 'You are a financial advisor AI. Given the recent transactions, generate exactly 3 short, punchy financial insights. Return a JSON object with a strings array under "insights".'
        },
        { role: 'user', content: JSON.stringify(recentTx) }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("AI Insights Error:", error);
    return { insights: ['Failed to generate insights.'] };
  }
}

/**
 * Handle chatbot query with transaction context.
 */
async function generateChatResponse(userQuery, transactions) {
  if (!openai) {
    // Simulated Offline AI Response Matrix
    const q = userQuery.toLowerCase();
    const totalSpent = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    
    if (q.includes("hi") || q.includes("hello")) {
      return { reply: "Hello! I am your AI Finance Advisor. Since you haven't linked my API key yet, I am running in Simulator Offline mode! Try asking me 'how much did I spend?'" };
    }
    if (q.includes("spent") || q.includes("total") || q.includes("how much")) {
      return { reply: `Based on your local transaction history, you've spent a total of ₹${totalSpent} so far. Let's try cutting that down by 10% next week!` };
    }
    if (q.includes("save") || q.includes("saving") || q.includes("advice")) {
      return { reply: "A good rule of thumb is the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings. Looking at your chart pie, you should focus on limiting your biggest slice!" };
    }
    if (q.includes("joke")) {
      return { reply: "Money talks... but all mine ever says is 'Goodbye'." };
    }
    
    return { reply: "I'm running in offline simulation mode without an API key right now, so my brain is a little limited! Try asking me 'how much did I spend?'" };
  }

  const recentTx = transactions.slice(0, 50).map(t => `$${t.amount} on ${t.category}`);

  try {
    const response = await openai.chat.completions.create({
      model: getModelName(),
      messages: [
        { role: 'system', content: 'You are an intelligent, concise personal finance assistant. Analyze the user\'s transaction history to give answers.' },
        { role: 'system', content: `Context: ${JSON.stringify(recentTx)}` },
        { role: 'user', content: userQuery }
      ],
      temperature: 0.6,
    });
    return { reply: response.choices[0].message.content };
  } catch (error) {
    console.error("AI Chat Error:", error);
    return { reply: "Sorry, I had trouble processing that request via the AI network." };
  }
}

module.exports = {
  categorizeExpense,
  generateInsights,
  generateChatResponse
};
