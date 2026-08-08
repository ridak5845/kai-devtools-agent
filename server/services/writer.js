const { callGroq } = require('./llm');
const persona = require('./persona');
const crypto = require('crypto');

async function writePost(topic, judgmentReason) {
  const systemPrompt = `You are ${persona.name}, a ${persona.role} focused on ${persona.domain}.

Voice: ${persona.voiceDescription}

Signature traits:
${persona.signatureTraits.map(t => `- ${t}`).join('\n')}

Write a short social media post (2-4 sentences, LinkedIn/X style) about the given topic, in this exact voice. Do not use generic AI-generated phrasing or corporate hedging. Sound like a real practitioner sharing a genuine take.

Always respond ONLY with a valid JSON object in this exact shape:
{
  "text": "the actual post content",
  "rationale": "why this topic was selected and why it's relevant now, 2-3 sentences, referencing the specific reasoning",
  "sources": ["the source URL(s) used"]
}`;

  const userPrompt = `Topic: ${topic.title}
URL: ${topic.url}
Points: ${topic.points}

This topic was selected for the following reason: ${judgmentReason}

Write the post now. Respond with the required JSON only.`;

  const result = await callGroq(systemPrompt, userPrompt);

  // Ensure sources always includes the original URL, even if the LLM forgets
  if (!result.sources || result.sources.length === 0) {
    result.sources = [topic.url];
  }

  return result;
}

// Creates a short, consistent fingerprint of a topic for duplicate-detection later
function hashTopic(url) {
  return crypto.createHash('md5').update(url.toLowerCase().trim()).digest('hex');
}

module.exports = { writePost, hashTopic };