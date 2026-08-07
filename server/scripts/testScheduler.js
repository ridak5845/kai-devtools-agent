require('dotenv').config();
const mongoose = require('mongoose');
const cron = require('node-cron');
const Agent = require('../models/Agent');
const { schedulerTick, getNextPublishTime } = require('../jobs/scheduler');

const AGENT_ID = process.argv[2];

async function run() {
  if (!AGENT_ID) {
    console.error('Please provide an agentId as an argument.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB\n');

  // Force this agent to be immediately due for testing
  const agent = await Agent.findOne({ agentId: AGENT_ID });
  if (!agent) {
    console.error('Agent not found.');
    process.exit(1);
  }
  agent.nextPublishAt = new Date();
  await agent.save();
  console.log('Agent set to publish immediately.\n');

  console.log('Starting FAST test scheduler - checking every 1 minute (TEST ONLY, not production speed)\n');

  // Run once immediately so we do not have to wait a full minute
  await schedulerTick();

  // Then continue checking every minute
  cron.schedule('* * * * *', async () => {
    console.log(`\n[${new Date().toISOString()}] Tick...`);
    await schedulerTick();
  });
}

run();
