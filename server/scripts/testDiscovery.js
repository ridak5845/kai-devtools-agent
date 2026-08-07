const { fetchCandidateTopics } = require('../services/discovery');

async function run() {
  console.log('Fetching candidate topics from Hacker News...\n');
  const topics = await fetchCandidateTopics();
  console.log(`Found ${topics.length} relevant topics:\n`);
  topics.forEach((topic, index) => {
    console.log(`${index + 1}. ${topic.title}`);
    console.log(`   URL: ${topic.url}`);
    console.log(`   Points: ${topic.points}\n`);
  });
}

run();