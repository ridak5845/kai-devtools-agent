const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Agent = require('../models/Agent');
const Post = require('../models/Post');

// POST /api/agent/init
router.post('/init', async (req, res) => {
  try {
    const { persona } = req.body;

    if (!persona || !persona.name || !persona.domain) {
      return res.status(400).json({ error: 'persona.name and persona.domain are required' });
    }

    const agentId = crypto.randomUUID();

    const agent = new Agent({
      agentId,
      persona: {
        name: persona.name,
        domain: persona.domain
      },
      nextPublishAt: new Date() // ready to publish immediately for first cycle
    });

    await agent.save();

    res.json({ agentId });

  } catch (error) {
    console.error('Init error:', error.message);
    res.status(500).json({ error: 'Failed to initialize agent' });
  }
});

// GET /api/agent/feed?agentId=...
router.get('/feed', async (req, res) => {
  try {
    const { agentId } = req.query;

    if (!agentId) {
      return res.status(400).json({ error: 'agentId query parameter is required' });
    }

    const posts = await Post.find({ agentId }).sort({ createdAt: -1 });

    const formattedPosts = posts.map(post => ({
      id: post.id,
      createdAt: post.createdAt.toISOString(),
      text: post.text,
      rationale: post.rationale,
      sources: post.sources
    }));

    res.json({ posts: formattedPosts });

  } catch (error) {
    console.error('Feed error:', error.message);
    res.status(500).json({ error: 'Failed to retrieve feed' });
  }
});

module.exports = router;