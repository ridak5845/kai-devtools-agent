require('dotenv').config();
const axios = require('axios');

async function callGroq(systemPrompt, userPrompt) {
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    const content = response.data.choices[0].message.content;
    return JSON.parse(content);

  } catch (error) {
    console.error('Groq LLM error:', error.response?.data || error.message);
    throw error; // We'll catch this one level up, where fallback logic lives (Milestone 2)
  }
}

module.exports = { callGroq };