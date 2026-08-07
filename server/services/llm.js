require('dotenv').config();
const axios = require('axios');

// Primary: Groq
async function callGroqRaw(systemPrompt, userPrompt) {
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
}

// Fallback: Cohere
async function callCohereRaw(systemPrompt, userPrompt) {
  const combinedPrompt = `${systemPrompt}\n\n${userPrompt}\n\nRespond with valid JSON only, no other text.`;

  const response = await axios.post(
    'https://api.cohere.com/v2/chat',
    {
      model: 'command-r-plus-08-2024',
      messages: [
        { role: 'user', content: combinedPrompt }
      ]
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.COHERE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    }
  );

  const rawText = response.data.message.content[0].text;

  // Cohere doesn't guarantee pure JSON output like Groq does,
  // so we extract just the JSON object in case there's extra text around it
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Cohere response did not contain valid JSON');
  }

  return JSON.parse(jsonMatch[0]);
}

// Public function: tries Groq first, falls back to Cohere on any failure
async function callGroq(systemPrompt, userPrompt) {
  try {
    return await callGroqRaw(systemPrompt, userPrompt);
  } catch (error) {
    console.error('Groq failed, falling back to Cohere:', error.response?.data || error.message);

    try {
      return await callCohereRaw(systemPrompt, userPrompt);
    } catch (fallbackError) {
      console.error('Cohere fallback also failed:', fallbackError.response?.data || fallbackError.message);
      throw new Error('Both Groq and Cohere failed for this request.');
    }
  }
}

module.exports = { callGroq };