const axios = require('axios');

async function run() {
  console.log('Testing Dev.to API access...\n');
  try {
    const response = await axios.get('https://dev.to/api/articles', {
      params: { top: 7, per_page: 10 },
      timeout: 8000
    });
    const articles = response.data;
    console.log(`Success! Fetched ${articles.length} articles from Dev.to.\n`);
    articles.slice(0, 5).forEach((a, i) => {
      console.log(`${i + 1}. ${a.title} (${a.positive_reactions_count} reactions)`);
    });
  } catch (error) {
    console.error('Dev.to test failed:', error.response?.status, error.message);
  }
}

run();