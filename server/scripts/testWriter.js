const { writePost } = require('../services/writer');

async function run() {
  console.log('Testing writer on an accepted topic...\n');

  const topic = {
    title: 'Kitesurf: Agent-first browser that runs in V8 isolates',
    url: 'https://blog.cloudflare.com/kitesurf/',
    points: 110
  };

  const judgmentReason = 'The topic discusses a new developer tool, specifically a browser that utilizes V8 isolates, which aligns with interest in new developer tools and AI infrastructure.';

  const post = await writePost(topic, judgmentReason);

  console.log('Generated post:\n');
  console.log('TEXT:', post.text);
  console.log('\nRATIONALE:', post.rationale);
  console.log('\nSOURCES:', post.sources);
}

run();