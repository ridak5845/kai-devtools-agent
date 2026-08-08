require('dotenv').config();
const mongoose = require('mongoose');
const Post = require('../models/Post');

async function cleanup() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB\n');

  const AGENT_ID = process.argv[2];
  if (!AGENT_ID) {
    console.error('Please provide an agentId as an argument.');
    process.exit(1);
  }

  const posts = await Post.find({ agentId: AGENT_ID }).sort({ createdAt: 1 });
  console.log(`Found ${posts.length} posts for this agent.\n`);

  const seenHashes = new Set();
  let deletedCount = 0;

  for (const post of posts) {
    if (seenHashes.has(post.topicHash)) {
      console.log(`Deleting duplicate: "${post.text.slice(0, 60)}..."`);
      await Post.deleteOne({ _id: post._id });
      deletedCount++;
    } else {
      seenHashes.add(post.topicHash);
    }
  }

  console.log(`\nDone. Deleted ${deletedCount} duplicate(s).`);
  process.exit(0);
}

cleanup().catch(error => {
  console.error('Cleanup failed:', error.message);
  process.exit(1);
});