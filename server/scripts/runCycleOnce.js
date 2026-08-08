require('dotenv').config();
const mongoose = require('mongoose');
const crypto = require('crypto');
const { fetchCandidateTopics } = require('../services/discovery');
const { judgeTopic } = require('../services/judgment');
const { writePost, hashTopic } = require('../services/writer');
const { isAlreadyPublished, isRecentlyRejected, getRecentPostSummaries } = require('../services/memory');
const Post = require('../models/Post');
const RejectedTopic = require('../models/RejectedTopic');

const AGENT_ID = process.argv[2]; // pass agentId as a command-line argument

async function runCycle() {
  if (!AGENT_ID) {
    console.error('Please provide an agentId as an argument. Example:');
    console.error('node server/scripts/runCycleOnce.js <agentId>');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB\n');

  console.log('Step 1: Discovering topics...');
  const topics = await fetchCandidateTopics();
  console.log(`Found ${topics.length} candidate topics\n`);

  if (topics.length === 0) {
    console.log('No topics found this cycle. Exiting.');
    process.exit(0);
  }

  let published = false;

  for (const topic of topics) {
    const topicHash = hashTopic(topic.url);

    const alreadyPublished = await isAlreadyPublished(AGENT_ID, topicHash);
    const alreadyRejected = await isRecentlyRejected(AGENT_ID, topicHash);

    if (alreadyPublished || alreadyRejected) {
      console.log(`Skipping already-seen topic: "${topic.title}"\n`);
      continue;
    }

    console.log(`Evaluating: "${topic.title}"`);
    const recentPosts = await getRecentPostSummaries(AGENT_ID);
    const judgment = await judgeTopic(topic, recentPosts);
    console.log(`  Decision: ${judgment.decision.toUpperCase()} - ${judgment.reason}\n`);

    if (judgment.decision === 'reject') {
      await RejectedTopic.create({
        agentId: AGENT_ID,
        topic: topic.title,
        reason: judgment.reason,
        topicHash
      });
      continue; // move to next topic
    }

    // Accepted - write the post
    console.log('Writing post...');
    const postContent = await writePost(topic, judgment.reason);

    const post = await Post.create({
      id: crypto.randomUUID(),
      agentId: AGENT_ID,
      text: postContent.text,
      rationale: postContent.rationale,
      sources: postContent.sources,
      topicHash
    });

    console.log('\nPublished!');
    console.log('TEXT:', post.text);
    console.log('RATIONALE:', post.rationale);
    console.log('SOURCES:', post.sources);

    published = true;
    break; // only publish one post per cycle for now
  }

  if (!published) {
    console.log('No topics were accepted this cycle. Nothing published.');
  }

  process.exit(0);
}

runCycle().catch(error => {
  console.error('Cycle failed:', error.message);
  process.exit(1);
});