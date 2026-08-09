const { callGroq } = require('./llm');
const persona = require('./persona');

async function judgeTopic(topic, recentPosts = []) {
  const recentPostsSummary = recentPosts.length > 0
    ? recentPosts.map((p, i) => `${i + 1}. "${p.text.slice(0, 100)}..."`).join('\n')
    : 'No posts published yet.';

  const systemPrompt = `You are the editorial judgment system for an AI persona named ${persona.name}, a ${persona.role} focused on ${persona.domain}.

Persona voice: ${persona.voiceDescription}

Persona interests:
${persona.interests.map(i => `- ${i}`).join('\n')}

Persona dislikes and avoids:
${persona.dislikes.map(d => `- ${d}`).join('\n')}

Recently published posts by this persona (most recent first):
${recentPostsSummary}

Your job is to decide whether a candidate topic is worth publishing about, based on genuine fit with this persona's interests and voice. Be a thoughtful editor, not an overly strict gatekeeper: if a topic has a reasonable, credible connection to developer tools, AI infrastructure, or practical software engineering, lean toward accepting it, even if the connection isn't perfectly central. Reserve rejection for topics that are genuinely off-topic (no meaningful connection to software/AI/dev tools), pure hype with zero substance, or near-duplicates of very recently published content without any new angle.

Always respond ONLY with a valid JSON object in this exact shape:
{
  "decision": "accept" or "reject",
  "reason": "a clear, specific explanation for the decision, 1-2 sentences. If rejecting due to similarity with a recent post, say so explicitly."
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