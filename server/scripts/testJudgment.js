const { judgeTopic } = require('../services/judgment');

const testTopics = [
  {
    title: 'Databricks drove down AI coding spend 70%',
    url: 'https://www.databricks.com/blog/managing-ai-coding-costs-scale',
    points: 16
  },
  {
    title: 'This Mine Predicts Major Wars. It\'s Opening Again',
    url: 'https://www.bloomberg.com/graphics/2026-opinion-australia-tungsten-mine-us-war-defense-china/',
    points: 55
  },
  {
    title: 'Kitesurf: Agent-first browser that runs in V8 isolates',
    url: 'https://blog.cloudflare.com/kitesurf/',
    points: 110
  },
  {
    title: 'AI psychosis is the new leadership blind spot',
    url: 'https://www.fastcompany.com/91576086/ai-psychosis-is-the-new-leadership-blind-spot-ai-leadership-blind-spots',
    points: 153
  }
];

async function run() {
  console.log('Testing judgment on 4 real topics...\n');

  for (const topic of testTopics) {
    console.log(`Topic: ${topic.title}`);
    const result = await judgeTopic(topic);
    console.log(`Decision: ${result.decision.toUpperCase()}`);
    console.log(`Reason: ${result.reason}\n`);
  }
}

run();