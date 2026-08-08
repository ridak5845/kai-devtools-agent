const request = require('supertest');
const mongoose = require('mongoose');
require('dotenv').config();
const app = require('../index');
const Agent = require('../models/Agent');

let testAgentId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  // Clean up the test agent we create
  if (testAgentId) {
    await Agent.deleteOne({ agentId: testAgentId });
  }
  await mongoose.disconnect();
});

describe('POST /api/agent/init', () => {
  test('creates an agent and returns an agentId', async () => {
    const response = await request(app)
      .post('/api/agent/init')
      .send({ persona: { name: 'TestBot', domain: 'Testing' } });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('agentId');
    expect(typeof response.body.agentId).toBe('string');

    testAgentId = response.body.agentId; // save for later tests and cleanup
  });

  test('returns 400 if persona is missing', async () => {
    const response = await request(app)
      .post('/api/agent/init')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  test('returns 400 if persona.name is missing', async () => {
    const response = await request(app)
      .post('/api/agent/init')
      .send({ persona: { domain: 'Testing' } });

    expect(response.status).toBe(400);
  });
});

describe('GET /api/agent/feed', () => {
  test('returns an empty posts array for a fresh agent', async () => {
    const response = await request(app)
      .get(`/api/agent/feed?agentId=${testAgentId}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('posts');
    expect(Array.isArray(response.body.posts)).toBe(true);
    expect(response.body.posts.length).toBe(0);
  });

  test('returns 400 if agentId is missing', async () => {
    const response = await request(app)
      .get('/api/agent/feed');

    expect(response.status).toBe(400);
  });

  test('returns empty array for a non-existent agentId (not an error)', async () => {
    const response = await request(app)
      .get('/api/agent/feed?agentId=this-agent-does-not-exist');

    expect(response.status).toBe(200);
    expect(response.body.posts).toEqual([]);
  });
});

describe('GET /health', () => {
  test('returns status ok', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
});