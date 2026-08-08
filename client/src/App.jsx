import { useState, useEffect } from 'react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [agentId, setAgentId] = useState('');

  const fetchFeed = async (id) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/agent/feed?agentId=${id}`);
      if (!response.ok) throw new Error('Failed to fetch feed');
      const data = await response.json();
      setPosts(data.posts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedId = localStorage.getItem('kai_agent_id');
    if (savedId) {
      setAgentId(savedId);
      fetchFeed(savedId);
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
      <header className="header">
        <h1>Kai</h1>
        <p className="subtitle">Developer Advocate · Developer Tools & AI Infrastructure</p>
      </header>

      <div className="agent-input">
        <input
          type="text"
          placeholder="Enter agent ID"
          value={agentId}
          onChange={(e) => setAgentId(e.target.value)}
        />
        <button onClick={handleLoadFeed} aria-label="Load feed for entered agent ID">Load Feed</button>
      </div>

      {loading && <p className="status">Loading...</p>}
      {error && <p className="status error">Error: {error}</p>}
      {!loading && !error && posts.length === 0 && agentId && (
        <p className="status">No posts yet. Kai is still thinking.</p>
      )}

      <div className="feed">
        {posts.map((post) => (
          <article key={post.id} className="post">
            <p className="post-text">{post.text}</p>
            <div className="post-meta">
              <span className="post-date">
                {new Date(post.createdAt).toLocaleString()}
              </span>
            </div>
            <details className="rationale">
              <summary>Why this post?</summary>
              <p>{post.rationale}</p>
              {post.sources.length > 0 && (
                <div className="sources">
                  <strong>Sources:</strong>
                  <ul>
                    {post.sources.map((src, i) => (
                      <li key={i}>
                        <a href={src} target="_blank" rel="noopener noreferrer">
                          {src}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </details>
          </article>
        ))}
      </div>
    </main>
  );  
}

export default App;