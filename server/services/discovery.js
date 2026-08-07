const axios = require('axios');
const persona = require('./persona');

// Fetch recent stories from Hacker News (via Algolia's free search API)
async function fetchCandidateTopics() {
  try {
    const response = await axios.get('https://hn.algolia.com/api/v1/search_by_date', {
      params: {
        tags: 'story',
        numericFilters: 'points>10',
        hitsPerPage: 50
      },
      timeout: 8000
    });

    const hits = response.data.hits || [];

    // Keep only stories that look relevant to our persona's interests
    const keywords = [
      'ai', 'llm', 'sdk', 'api', 'open source', 'developer',
      'infrastructure', 'model', 'framework', 'library', 'tool',
      'agent', 'inference', 'cli', 'copilot'
    ];

    const filtered = hits.filter(hit => {
      const title = (hit.title || '').toLowerCase();
      return keywords.some(keyword => title.includes(keyword));
    });

    // Map to a clean, simple shape our next steps will use
    return filtered.map(hit => ({
      title: hit.title,
      url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
      points: hit.points,
      createdAt: hit.created_at
    }));

  } catch (error) {
    console.error('Discovery error (HN Algolia):', error.message);
    return []; // Return empty array on failure, never crash the pipeline
  }
}

module.exports = { fetchCandidateTopics };