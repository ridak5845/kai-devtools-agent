import { useState, useEffect } from 'react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const OFFICIAL_AGENT_ID = ''; // will be set once the official agent is created

function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [agentId, setAgentId] = useState(OFFICIAL_AGENT_ID);
  const [showDevInput, setShowDevInput] = useState(!OFFICIAL_AGENT_ID);
  const [lastChecked, setLastChecked] = useState(null);

  const fetchFeed = async (id) => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/agent/feed?agentId=${id}`);
      if (!response.ok) throw new Error('Failed to fetch feed');
      const data = await response.json();
      setPosts(data.posts);
      setLastChecked(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const idToUse = OFFICIAL_AGENT_ID || localStorage.getItem('kai_agent_id');
    if (idToUse) {
      setAgentId(idToUse);
      fetchFeed(idToUse);
    } else {
      setLoading(false);
    }
  }, []);

  const handleLoadFeed = () => {
    localStorage.setItem('kai_agent_id', agentId);
    fetchFeed(agentId);
  };

  return (
    <main className="app">
      <div className="live-indicator" aria-label="Live feed status">
        <span className="pulse-dot" />
        <span>Live Feed</span>
      </div>

      <header className="header">
        <h1>Kai</h1>
        <p className="tagline-main">Autonomous AI Creator</p>
        <p className="subtitle">Developer Advocate · AI Infrastructure · Practical AI Engineering</p>
        <p className="tagline">
          Shipping practical AI engineering insights for developers building real production systems.
        </p>
      </header>

      <section className="status-card" aria-label="Autonomous agent status">
        <div className="status-row">
          <span className="pulse-dot" aria-hidden="true" />
          <span className="status-text">Autonomous publishing active</span>
        </div>
        <div className="status-details">
          <span><strong>Persona:</strong> Kai — Developer Advocate</span>
          <span><strong>Domain:</strong> AI Infrastructure &amp; Developer Tools</span>
          <span><strong>Publishing cadence:</strong> Every 4-8 hours</span>
          {lastChecked && (
            <span><strong>Last checked:</strong> {lastChecked.toLocaleTimeString()}</span>
          )}
        </div>
        <p className="status-note">New posts appear automatically over time — no manual input required.</p>
      </section>

      {showDevInput && (
        <div className="agent-input">
          <input
            type="text"
            placeholder="Enter agent ID (dev/testing only)"
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            aria-label="Agent ID input for testing"
          />
          <button onClick={handleLoadFeed} aria-label="Load feed for entered agent ID">
            Load Feed
          </button>
        </div>
      )}

      {posts.length > 0 && (
        <div className="feed-meta">
          <span>Posts published: {posts.length}</span>
          <span>Duplicate protection: URL hash memory enabled</span>
        </div>
      )}

      {loading && <p className="status-msg">Loading...</p>}
      {error && <p className="status-msg error">Error: {error}</p>}

      {!loading && !error && posts.length === 0 && agentId && (
        <div className="empty-state">
          <span className="pulse-dot" aria-hidden="true" />
          <p>Kai is analyzing AI infrastructure topics…</p>
          <p className="empty-sub">
            The autonomous agent has been initialized and will publish new insights
            automatically as it evaluates technically relevant stories.
          </p>
        </div>
      )}

      <section className="feed" aria-label="Published posts">
        {posts.map((post) => (
          <article key={post.id} className="post">
            <div className="post-author">
              <span className="post-author-name">Kai</span>
              <span className="post-author-role">Developer Advocate</span>
            </div>
            <p className="post-text">{post.text}</p>
            <div className="post-meta">
              <time dateTime={post.createdAt}>
                {new Date(post.createdAt).toLocaleString()}
              </time>
            </div>
            <details className="rationale">
              <summary>Why this post?</summary>
              <p>{post.rationale}</p>
            </details>
            {post.sources.length > 0 && (
              <details className="sources-section">
                <summary>🔗 Sources</summary>
                <ul className="sources">
                  {post.sources.map((src, i) => (
                    <li key={i}>
                      <a href={src} target="_blank" rel="noopener noreferrer">
                        {src}
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}

export default App;