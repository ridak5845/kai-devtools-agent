const { callGroq } = require('./llm');
const persona = require('./persona');

async function judgeTopic(topic) {
  const systemPrompt = `You are the editorial judgment system for an AI persona named ${persona.name}, a ${persona.role} focused on ${persona.domain}.

Persona voice: ${persona.voiceDescription}

Persona interests:
${persona.interests.map(i => `- ${i}`).join('\n')}

Persona dislikes and avoids:
${persona.dislikes.map(d => `- ${d}`).join('\n')}

Your job is to decide whether a candidate topic is worth publishing about, based on genuine fit with this persona's interests and voice - not just surface keyword matches. Be a real editor: reject topics that are off-topic, low-substance, pure hype, or not something this persona would credibly write about.

Always respond ONLY with a valid JSON object in this exact shape:
{
  "decision": "accept" or "reject",
  "reason": "a clear, specific explanation for the decision, 1-2 sentences"
}`;

  const userPrompt = `Candidate topic:
Title: ${topic.title}
URL: ${topic.url}
Points: ${topic.points}

Should this be published about? Respond with the required JSON only.`;

  const result = await callGroq(systemPrompt, userPrompt);
  return result;
}

module.exports = { judgeTopic };