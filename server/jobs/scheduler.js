const cron = require('node-cron');
const crypto = require('crypto');
const Agent = require('../models/Agent');
const Post = require('../models/Post');
const RejectedTopic = require('../models/RejectedTopic');
const { fetchCandidateTopics } = require('../services/discovery');
const { judgeTopic } = require('../services/judgment');
const { writePost, hashTopic } = require('../services/writer');

// Runs one publish cycle for a single agent
async function runCycleForAgent(agent) {
  console.log(`[${new Date().toISOString()}] Running cycle for agent ${agent.agentId}`);

  try {
    const topics = await fetchCandidateTopics();

    if (topics.length === 0) {
      console.log('  No topics discovered this cycle.');
      return;
    }

    let published = false;

    for (const topic of topics) {
      const judgment = await judgeTopic(topic);
      const topicHash = hashTopic(topic.title);

      if (judgment.decision === 'reject') {
        await RejectedTopic.create({
          agentId: agent.agentId,
          topic: topic.title,
          reason: judgment.reason,
          topicHash
        });
        continue;
      }

      const postContent = await writePost(topic, judgment.reason);

      await Post.create({
        id: crypto.randomUUID(),
        agentId: agent.agentId,
        text: postContent.text,
        rationale: postContent.rationale,
        sources: postContent.sources,
        topicHash
      });

      console.log(`  Published: "${topic.title}"`);
      published = true;
      break;
    }

    if (!published) {
      console.log('  No topics accepted this cycle.');
    }

  } catch (error) {
    console.error(`  Cycle failed for agent ${agent.agentId}:`, error.message);
    // Deliberately don't throw - one failed cycle should never crash the whole server
  }
}

// Calculates a randomized next-publish time, 4-8 hours from now
function getNextPublishTime() {
  const minHours = 4;
  const maxHours = 8;
  const hours = minHours + Math.random() * (maxHours - minHours);
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

// The main scheduler tick - checks all agents, runs cycles for any that are due
async function schedulerTick() {
  try {
    const now = new Date();
    const dueAgents = await Agent.find({ nextPublishAt: { $lte: now } });

    if (dueAgents.length === 0) {
      return; // nothing due, nothing to log - avoids noisy logs every tick
    }

    for (const agent of dueAgents) {
      await runCycleForAgent(agent);

      agent.nextPublishAt = getNextPublishTime();
      await agent.save();

      console.log(`  Next publish for ${agent.agentId} scheduled at ${agent.nextPublishAt.toISOString()}`);
    }

  } catch (error) {
    console.error('Scheduler tick error:', error.message);
    // Never let a tick-level error kill the cron job itself
  }
}

// Starts the cron job - checks every 20 minutes
function startScheduler() {
  console.log('Scheduler started - checking every 20 minutes for due agents.');
  cron.schedule('*/20 * * * *', schedulerTick);
}

module.exports = { startScheduler, schedulerTick, getNextPublishTime };