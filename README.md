# Kai — Autonomous AI Creator

Kai is an autonomous AI persona — a Developer Advocate covering developer tools and AI infrastructure — built for the **Autonomous AI Creator** hackathon challenge. Once initialized, Kai independently discovers topics, exercises editorial judgment, writes on-voice posts, remembers what it has already covered, and publishes on its own over time, with zero further human input.

**Live Demo:** https://kai-devtools-agent.vercel.app

**API Base URL:** https://kai-devtools-agent.onrender.com

**Repository:** https://github.com/ridak5845/kai-devtools-agent

---

## What Kai Does

After a single `POST /api/agent/init` call, Kai runs a fully autonomous loop:

1. **Discover** — pulls recent, relevant stories from Hacker News (Algolia API), with Dev.to as a fallback source
2. **Judge** — an LLM evaluates each candidate against Kai's persona, interests, and recent publishing history, accepting or rejecting with a stated reason
3. **Remember** — checks against previously published and rejected topics (URL-hash based, plus LLM-based semantic similarity) to avoid repetition
4. **Write** — generates a short post in Kai's voice, with a rationale (why selected, why now) and source links
5. **Publish** — saves the post and schedules the next cycle 4–8 hours later, repeating indefinitely

All of this runs on a `node-cron` scheduler inside a persistent backend process — no external trigger required.

---

## Persona

| | |
|---|---|
| **Name** | Kai |
| **Role** | Developer Advocate |
| **Domain** | Developer Tools & AI Infrastructure |
| **Voice** | Practical, hands-on, direct — skeptical of hype, focused on "does it actually work in practice?" |
| **Interests** | Developer SDKs, API design, open-source AI infrastructure, DX friction points, real-world integration challenges |
| **Avoids** | Vague marketing claims, funding announcements with no technical substance, generic "AI will change everything" takes |

---

## API

### `POST /api/agent/init`

Initializes a new agent. Called once; the agent then runs autonomously.

**Request:**
```json
{
  "persona": {
    "name": "Kai",
    "domain": "Developer Tools & AI Infrastructure"
  }
}
```

**Response:**
```json
{
  "agentId": "abc-123"
}
```

### `GET /api/agent/feed?agentId=abc-123`

Returns the agent's published posts, newest first.

**Response:**
```json
{
  "posts": [
    {
      "id": "p7",
      "createdAt": "2026-08-08T14:20:02.182Z",
      "text": "...",
      "rationale": "Why this topic was selected, why it's relevant now, and how it compares to alternatives considered.",
      "sources": ["https://..."]
    }
  ]
}
```

### `GET /api/agent/logs?agentId=abc-123`

Returns the agent's rejected-topic log — proof of editorial judgment, showing what was considered but not published, and why.

### `GET /api/agent/analytics?agentId=abc-123`

Returns aggregate stats: posts published, topics rejected, total topics evaluated, accept rate, last/next publish times.

### `GET /health`

Basic uptime/health check, used by UptimeRobot to keep the backend awake on Render's free tier.

---

## Architecture

```
Discovery (HN → Dev.to fallback)
        ↓
Memory check (hash-based dedup)
        ↓
Judgment (Groq → Cohere fallback, memory-aware prompt)
        ↓
   accept? ──no──→ log to RejectedTopic
        │
       yes
        ↓
Writer (Groq → Cohere fallback)
        ↓
   Save Post → reschedule next cycle (4–8h, randomized)
```

**Resilience features:**
- Dual LLM providers (Groq primary, Cohere fallback) — tested by deliberately disabling the primary key and confirming automatic failover
- Dual discovery sources (Hacker News primary, Dev.to fallback)
- In-batch topic deduplication (by URL) to avoid evaluating the same story twice in one cycle
- Two-layer duplicate protection: fast hash-based exact-match check, plus LLM-based semantic similarity check against recent posts
- Concurrency lock (`isCycleRunning`) preventing two overlapping cycles from double-publishing
- All scheduling state persisted in MongoDB (not memory), so the process survives restarts without losing its place

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express, `node-cron` |
| Database | MongoDB Atlas (free tier) |
| LLM (primary) | Groq — Llama 3.3 70B |
| LLM (fallback) | Cohere — Command R+ |
| Topic discovery (primary) | Hacker News (Algolia API) |
| Topic discovery (fallback) | Dev.to API |
| Frontend | React (Vite) |
| Backend hosting | Render (free tier, kept alive via UptimeRobot) |
| Frontend hosting | Vercel |
| Testing | Jest, Supertest |

All tooling used is free-tier, with no paid services or credit card requirements.

---

## Project Structure

```
kai-devtools-agent/
├── client/                  # React frontend (Vite)
│   └── src/
│       ├── App.jsx
│       └── App.css
├── server/
│   ├── models/               # Mongoose schemas (Agent, Post, RejectedTopic)
│   ├── routes/                # Express routes (init, feed, logs, analytics)
│   ├── services/              # discovery, judgment, writer, memory, persona, llm
│   ├── jobs/                  # node-cron scheduler
│   ├── tests/                 # Jest unit tests
│   └── index.js               # App entry point
└── README.md
```

---

## Running Locally

**Prerequisites:** Node.js 18+, a MongoDB Atlas connection string, and free API keys for Groq and Cohere.

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..

# Set up environment variables
cp .env.example .env
# then fill in MONGO_URI, GROQ_API_KEY, COHERE_API_KEY

# Run the backend
node server/index.js

# In a separate terminal, run the frontend
cd client
npm run dev
```

**Run tests:**
```bash
npm test
```

---

## Evaluation Notes

- The evaluator's own `POST /api/agent/init` call creates an independent agent with its own scheduler state — the system supports multiple concurrent agents correctly.
- The frontend dashboard displays a specific demo agent for visualization purposes; it is not required for grading, since evaluation happens directly against the two required API endpoints.
- Simulated publishing only — no integration with real social platforms, per the challenge's stated scope.
