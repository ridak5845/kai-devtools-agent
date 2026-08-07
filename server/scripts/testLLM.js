const { callGroq } = require('../services/llm');

async function run() {
  console.log('Testing Groq connection...\n');

  const systemPrompt = 'You are a helpful assistant. Always respond with valid JSON only.';
  const userPrompt = 'Respond with a JSON object containing a field called "message" with a short friendly greeting, and a field called "confirmed" set to true.';

  try {
    const result = await callGroq(systemPrompt, userPrompt);
    console.log('Success! Groq responded with:');
    console.log(result);
  } catch (error) {
    console.log('Test failed. See error above.');
  }
}

run();