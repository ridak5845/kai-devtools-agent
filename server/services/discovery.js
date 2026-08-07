const axios = require('axios');

const keywords = [
  'ai', 'llm', 'sdk', 'api', 'open source', 'developer',
  'infrastructure', 'model', 'framework', 'library', 'tool',
  'agent', 'inference', 'cli', 'copilot'
];

// Primary source: Hacker News (via Algolia)
async function fetchFromHackerNews() {
  const response = await axios.get('https://hn.algolia.com/api/v1/search_by_date', {
    params: {
      tags: 'story',
      numericFilters: 'points>10',
      hitsPerPage: 50
    },
    timeout: 8000
  });

  const hits = response.data.hits || [];

  const filtered = hits.filter(hit => {
    const title = (hit.title || '').toLowerCase();
    return keywords.some(keyword => title.includes(keyword));
  });

  return filtered.map(hit => ({
    title: hit.title,
    url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
    points: hit.points,
    createdAt: hit.created_at
  }));
}

/// Fallback source: Dev.to (public API, no auth needed)
async function fetchFromDevTo() {
  const response = await axios.get('https://dev.to/api/articles', {
    params: { top: 7, per_page: 50 },
    timeout: 8000
  });

  const articles = response.data || [];

  const filtered = articles.filter(article => {
    const title = (article.title || '').toLowerCase();
    return keywords.some(keyword => title.includes(keyword));
  });

  return filtered.map(article => ({
    title: article.title,
    url: article.url,
    points: article.positive_reactions_count,
    createdAt: article.published_at
  }));
}

// Main function: tries HN first, falls back to Dev.to on any failure
async function fetchCandidateTopics() {
  try {
    const topics = await fetchFromHackerNews();
    if (topics.length > 0) {
      return topics;
    }
    console.log('HN returned no relevant topics, trying Dev.to...');
    return await fetchFromDevTo();

  } catch (error) {
    console.error('HN discovery failed, falling back to Dev.to:', error.message);

    try {
      return await fetchFromDevTo();
    } catch (fallbackError) {
      console.error('Dev.to fallback also failed:', fallbackError.message);
      return [];
    }
  }
}

module.exports = { fetchCandidateTopics };