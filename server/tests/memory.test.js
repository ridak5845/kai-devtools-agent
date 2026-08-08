const mongoose = require('mongoose');
require('dotenv').config();
const Post = require('../models/Post');
const RejectedTopic = require('../models/RejectedTopic');
const { isAlreadyPublished, isRecentlyRejected } = require('../services/memory');

const TEST_AGENT_ID = 'test-agent-memory-suite';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  // Clean up test data so it doesn't pollute our real database
  await Post.deleteMany({ agentId: TEST_AGENT_ID });
  await RejectedTopic.deleteMany({ agentId: TEST_AGENT_ID });
  await mongoose.disconnect();
});

describe('memory service', () => {
  test('isAlreadyPublished returns false for a new topic', async () => {
    const result = await isAlreadyPublished(TEST_AGENT_ID, 'hash-that-does-not-exist');
    expect(result).toBe(false);
  });

  test('isAlreadyPublished returns true after a post is created', async () => {
    await Post.create({
      id: 'test-post-1',
      agentId: TEST_AGENT_ID,
      text: 'Test post content',
      rationale: 'Test rationale',
      sources: ['https://example.com'],
      topicHash: 'test-hash-123'
    });

    const result = await isAlreadyPublished(TEST_AGENT_ID, 'test-hash-123');
    expect(result).toBe(true);
  });

  test('isRecentlyRejected returns false for a new topic', async () => {
    const result = await isRecentlyRejected(TEST_AGENT_ID, 'hash-that-does-not-exist');
    expect(result).toBe(false);
  });

  test('isRecentlyRejected returns true after a rejection is logged', async () => {
    await RejectedTopic.create({
      agentId: TEST_AGENT_ID,
      topic: 'Some rejected topic',
      reason: 'Not relevant',
      topicHash: 'rejected-hash-456'
    });

    const result = await isRecentlyRejected(TEST_AGENT_ID, 'rejected-hash-456');
    expect(result).toBe(true);
  });

  test('checks are scoped to the correct agentId', async () => {
    const result = await isAlreadyPublished('a-different-agent-id', 'test-hash-123');
    expect(result).toBe(false);
  });
});