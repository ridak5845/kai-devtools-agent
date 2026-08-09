import { useState, useEffect } from 'react';
import './App.css';
import Dock from './Dock';
import BorderGlow from './BorderGlow';
import SpotlightCard from './SpotlightCard';
import Ferrofluid from './Ferrofluid';
import { VscDashboard, VscGraph, VscListUnordered, VscSettingsGear } from 'react-icons/vsc';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const OFFICIAL_AGENT_ID = 'df2ea341-7af3-4a29-8719-22162373ae40';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [agentId, setAgentId] = useState(OFFICIAL_AGENT_ID);
  const [showDevInput, setShowDevInput] = useState(!OFFICIAL_AGENT_ID);

  const [posts, setPosts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = async (id) => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [feedRes, logsRes, analyticsRes] = await Promise.all([
        fetch(`${API_URL}/api/agent/feed?agentId=${id}`),
        fetch(`${API_URL}/api/agent/logs?agentId=${id}`),
        fetch(`${API_URL}/api/agent/analytics?agentId=${id}`)
      ]);

      if (!feedRes.ok || !logsRes.ok || !analyticsRes.ok) {
        throw new Error('Failed to fetch agent data');
      }

      const feedData = await feedRes.json();
      const logsData = await logsRes.json();
      const analyticsData = await analyticsRes.json();

      setPosts(feedData.posts);
      setLogs(logsData.rejections);
      setAnalytics(analyticsData);
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
      fetchAll(idToUse);
    } else {
      setLoading(false);
    }
  }, []);

  const handleLoadFeed = () => {
    localStorage.setItem('kai_agent_id', agentId);
    fetchAll(agentId);
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <VscDashboard size={20} /> },
    { id: 'analytics', label: 'Analytics', icon: <VscGraph size={20} /> },
    { id: 'logs', label: 'Logs', icon: <VscListUnordered size={20} /> },
    { id: 'settings', label: 'Settings', icon: <VscSettingsGear size={20} /> }
  ];

  const dockItems = tabs.map((tab) => ({
    icon: tab.icon,
    label: tab.label,
    onClick: () => setActiveTab(tab.id),
    className: activeTab === tab.id ? 'dock-item-active' : ''
  }));

  return (
    <>
      <div className="bg-fluid">
        <Ferrofluid
          colors={["#1d2331", "#8b53fe", "#8eff01"]}
          backgroundColor="#07090b"
          speed={0.4}
          scale={1.6}
          turbulence={0.9}
          fluidity={0.15}
          rimWidth={0.22}
          sharpness={2.8}
          shimmer={1.2}
          glow={1.8}
          flowDirection="down"
          opacity={0.85}
          mouseInteraction={true}
          mouseStrength={0.8}
          mouseRadius={0.3}
        />
      </div>

      <div className="app-shell">
        <main className="app-content">
          <div className="app-content-inner">
            <div className="live-badge">
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

            {showDevInput && (
              <SpotlightCard className="agent-input-spotlight" spotlightColor="rgba(142, 255, 1, 0.25)">
                <div className="agent-input">
                  <input
                    type="text"
                    placeholder="Enter agent ID (dev/testing only)"
                    value={agentId}
                    onChange={(e) => setAgentId(e.target.value)}
                    aria-label="Agent ID input for testing"
                  />
                  <button onClick={handleLoadFeed} aria-label="Load data for entered agent ID">
                    Load
                  </button>
                </div>
              </SpotlightCard>
            )}

            {loading && <p className="status-msg">Loading...</p>}
            {error && <p className="status-msg error">Error: {error}</p>}

            {!loading && !error && agentId && (
              <>
                {activeTab === 'dashboard' && (
                  <DashboardTab posts={posts} analytics={analytics} />
                )}
                {activeTab === 'analytics' && (
                  <AnalyticsTab analytics={analytics} />
                )}
                {activeTab === 'logs' && (
                  <LogsTab logs={logs} />
                )}
                {activeTab === 'settings' && (
                  <SettingsTab />
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <Dock items={dockItems} panelHeight={64} baseItemSize={48} magnification={64} />
    </>
  );
}

function DashboardTab({ posts, analytics }) {
  return (
    <>
      <section className="status-card" aria-label="Autonomous agent status">
        <div className="status-row">
          <span className="pulse-dot" aria-hidden="true" />
          <span className="status-text">Autonomous publishing active</span>
        </div>
        <div className="status-details">
          <span><strong>Persona:</strong> Kai — Developer Advocate</span>
          <span><strong>Domain:</strong> AI Infrastructure &amp; Developer Tools</span>
          <span><strong>Publishing cadence:</strong> Every 4-8 hours</span>
          {analytics?.nextPublishAt && (
            <span><strong>Next publish:</strong> {new Date(analytics.nextPublishAt).toLocaleString()}</span>
          )}
        </div>
        <p className="status-note">New posts appear automatically over time — no manual input required.</p>
      </section>

      {analytics && (
        <div className="feed-meta">
          <span>Posts published: {analytics.postsPublished}</span>
          <span>Duplicate protection: URL hash memory enabled</span>
        </div>
      )}

      {posts.length === 0 && (
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
          <BorderGlow
            key={post.id}
            backgroundColor="#1a2030"
            glowColor="270 90% 65%"
            colors={['#8eff01', '#8b53fe', '#1d2331']}
            borderRadius={24}
            glowRadius={36}
            glowIntensity={1.1}
            edgeSensitivity={35}
            coneSpread={28}
            fillOpacity={0.4}
          >
            <article className="post">
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
                        <a href={src} target="_blank" rel="noopener noreferrer">{src}</a>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </article>
          </BorderGlow>
        ))}
      </section>
    </>
  );
}

function AnalyticsTab({ analytics }) {
  if (!analytics) return null;

  return (
    <section className="analytics-grid" aria-label="Analytics overview">
      <div className="stat-card">
        <span className="stat-label">Posts Published</span>
        <span className="stat-value">{analytics.postsPublished}</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Topics Rejected</span>
        <span className="stat-value">{analytics.topicsRejected}</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Topics Evaluated</span>
        <span className="stat-value">{analytics.totalTopicsEvaluated}</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Accept Rate</span>
        <span className="stat-value">{analytics.acceptRate}%</span>
      </div>
      <div className="stat-card stat-card-wide">
        <span className="stat-label">Last Published</span>
        <span className="stat-value-sm">
          {analytics.lastPublishedAt
            ? new Date(analytics.lastPublishedAt).toLocaleString()
            : 'No posts yet'}
        </span>
      </div>
      <div className="stat-card stat-card-wide">
        <span className="stat-label">Next Scheduled Publish</span>
        <span className="stat-value-sm">
          {analytics.nextPublishAt
            ? new Date(analytics.nextPublishAt).toLocaleString()
            : 'Not scheduled'}
        </span>
      </div>
    </section>
  );
}

function LogsTab({ logs }) {
  if (logs.length === 0) {
    return (
      <div className="empty-state">
        <p>No rejected topics yet.</p>
        <p className="empty-sub">
          When Kai evaluates a topic and decides not to publish, the decision and reasoning will appear here.
        </p>
      </div>
    );
  }

  return (
    <section className="logs-list" aria-label="Editorial rejection logs">
      {logs.map((log, i) => (
        <article key={i} className="log-entry">
          <div className="log-header">
            <span className="log-badge">Rejected</span>
            <time className="log-time">{new Date(log.createdAt).toLocaleString()}</time>
          </div>
          <p className="log-topic">{log.topic}</p>
          <p className="log-reason">{log.reason}</p>
        </article>
      ))}
    </section>
  );
}

function SettingsTab() {
  return (
    <section className="settings-panel" aria-label="Persona configuration">
      <div className="settings-row">
        <span className="settings-label">Name</span>
        <span className="settings-value">Kai</span>
      </div>
      <div className="settings-row">
        <span className="settings-label">Role</span>
        <span className="settings-value">Developer Advocate</span>
      </div>
      <div className="settings-row">
        <span className="settings-label">Domain</span>
        <span className="settings-value">Developer Tools &amp; AI Infrastructure</span>
      </div>
      <div className="settings-row">
        <span className="settings-label">Voice</span>
        <span className="settings-value">Practical, hands-on, direct — no corporate hedging</span>
      </div>
      <div className="settings-row">
        <span className="settings-label">Interests</span>
        <span className="settings-value">
          Developer SDKs, API design, open-source AI infrastructure, DX friction points, real-world integration challenges
        </span>
      </div>
      <div className="settings-row">
        <span className="settings-label">Primary LLM</span>
        <span className="settings-value">Groq (Llama 3.3 70B) — Cohere fallback</span>
      </div>
      <div className="settings-row">
        <span className="settings-label">Topic discovery</span>
        <span className="settings-value">Hacker News (Algolia) — Dev.to fallback</span>
      </div>
      <p className="settings-note">This configuration is read-only and reflects the persona's actual system prompt.</p>
    </section>
  );
}

export default App;