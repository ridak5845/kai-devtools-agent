const Post = require('../models/Post');
const RejectedTopic = require('../models/RejectedTopic');

// Fetches recent post summaries for a given agent, used to give the LLM context
async function getRecentPostSummaries(agentId, limit = 8) {
  const posts = await Post.find({ agentId })
    .sort({ createdAt: -1 })
    .limit(limit);

  return posts.map(post => ({
    text: post.text,
    topicHash: post.topicHash,
    createdAt: post.createdAt
  }));
}

// Fetches recent rejected topic hashes, so we don't re-evaluate the exact same rejects repeatedly
async function getRecentRejectedHashes(agentId, limit = 20) {
  const rejects = await RejectedTopic.find({ agentId })
    .sort({ createdAt: -1 })
    .limit(limit);

  return rejects.map(r => r.topicHash);
}

// Checks whether a topic hash has already been published by this agent
async function isAlreadyPublished(agentId, topicHash) {
  const existing = await Post.findOne({ agentId, topicHash });
  return !!existing;
}

// Checks whether a topic hash was already rejected recently
async function isRecentlyRejected(agentId, topicHash) {
  const existing = await RejectedTopic.findOne({ agentId, topicHash });
  return !!existing;
}

module.exports = {
  getRecentPostSummaries,
  getRecentRejectedHashes,
  isAlreadyPublished,
  isRecentlyRejected
};