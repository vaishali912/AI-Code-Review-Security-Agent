import React, { useState } from 'react';
import { GitPullRequest, MessageSquare, Send, CheckCircle2, ShieldAlert } from 'lucide-react';
import { FindingItem } from '../data/mockData.js';

interface PRWalkthroughViewProps {
  findings: FindingItem[];
}

export const PRWalkthroughView: React.FC<PRWalkthroughViewProps> = ({ findings }) => {
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'bot'; text: string; time: string }>>([
    {
      role: 'bot',
      text: 'Sherlock AI Review posted for commit `7c32bf1`. Found 2 Critical, 4 High vulnerabilities in PR #42. Replying to comments is active. Type `@sherlock explain`, `@sherlock fix`, or `@sherlock ignore <reason>` below.',
      time: '10:42 AM'
    }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const userText = input.trim();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setChatMessages(prev => [...prev, { role: 'user', text: userText, time }]);
    setInput('');

    setTimeout(() => {
      let botReply = '';
      if (userText.includes('explain')) {
        botReply = `🛡️ **Sherlock Analysis**: User input from \`req.query.id\` flows directly into SQL execution sink at \`src/routes/users.ts:10\`. No parameterization or validation was detected along the data-flow path, allowing attackers to inject boolean conditions like \`' OR '1'='1'\`.`;
      } else if (userText.includes('fix')) {
        botReply = `🔧 **Proposed Fix**: Replaced string interpolation with parameterized placeholder ($1) in \`db.query\`. Validated in sandbox with 0 syntax or lint regressions.`;
      } else if (userText.includes('ignore')) {
        botReply = `✅ **Suppressed**: Recorded learning memory for path \`src/routes/users.ts\`. This reason will feed the evaluation harness and prevent repeat alerts.`;
      } else {
        botReply = `Command received. Sherlock is actively monitoring PR #42. Gate status is currently **BLOCKING** due to unaddressed Critical findings.`;
      }

      setChatMessages(prev => [...prev, { role: 'bot', text: botReply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }, 600);
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* PR Header Banner */}
      <div className="glass-panel" style={{ padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <GitPullRequest size={20} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
              PR #42: Feature/User-Management-API & File-Processing
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            Author: <strong>developer</strong> · Branch: <code>feature/user-management</code> → <code>main</code> · 4 changed files (+112 / -18)
          </p>
        </div>

        <div style={{
          padding: '8px 16px',
          borderRadius: '8px',
          background: 'rgba(244, 63, 94, 0.15)',
          border: '1px solid rgba(244, 63, 94, 0.4)',
          color: '#fda4af',
          fontWeight: 700,
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <ShieldAlert size={16} />
          <span>OVERALL RISK: CRITICAL</span>
        </div>
      </div>

      {/* Changes by File Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '16px' }}>
          📋 Changes by File & Security Risk Focus
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', textAlign: 'left' }}>
              <th style={{ padding: '10px 14px' }}>File Path</th>
              <th style={{ padding: '10px 14px' }}>Lines +/-</th>
              <th style={{ padding: '10px 14px' }}>Risk</th>
              <th style={{ padding: '10px 14px' }}>Sherlock Focus</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <td style={{ padding: '12px 14px' }}><code>src/routes/users.ts</code></td>
              <td style={{ padding: '12px 14px', color: '#6ee7b7' }}>+34 / -4</td>
              <td style={{ padding: '12px 14px' }}><span className="badge badge-critical">Critical</span></td>
              <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>SQLi in GET & Missing auth guard on DELETE</td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <td style={{ padding: '12px 14px' }}><code>src/routes/files.ts</code></td>
              <td style={{ padding: '12px 14px', color: '#6ee7b7' }}>+48 / -8</td>
              <td style={{ padding: '12px 14px' }}><span className="badge badge-critical">Critical</span></td>
              <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>Command Injection in exec & Path Traversal in readFile</td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <td style={{ padding: '12px 14px' }}><code>src/routes/proxy.ts</code></td>
              <td style={{ padding: '12px 14px', color: '#6ee7b7' }}>+16 / -2</td>
              <td style={{ padding: '12px 14px' }}><span className="badge badge-high">High</span></td>
              <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>Outbound SSRF in fetch(targetUrl)</td>
            </tr>
            <tr>
              <td style={{ padding: '12px 14px' }}><code>src/components/UserProfile.tsx</code></td>
              <td style={{ padding: '12px 14px', color: '#6ee7b7' }}>+14 / -4</td>
              <td style={{ padding: '12px 14px' }}><span className="badge badge-high">High</span></td>
              <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>React DOM XSS in dangerouslySetInnerHTML</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Architecture & Flow Diagram */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '16px' }}>
          📐 Architecture & Data Flow Diagram (Mermaid Rendering)
        </h3>
        <div style={{
          background: 'rgba(5, 8, 15, 0.7)',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'center'
        }}>
          {/* Visual SVG diagram simulating the rendered Mermaid diagram */}
          <svg width="780" height="200" viewBox="0 0 780 200" style={{ maxWidth: '100%' }}>
            <rect x="20" y="70" width="140" height="60" rx="10" fill="#1e293b" stroke="#06b6d4" strokeWidth="2" />
            <text x="90" y="105" fill="#f8fafc" fontSize="13" textAnchor="middle" fontWeight="bold">Client Request</text>

            <path d="M 160 100 L 260 100" stroke="#06b6d4" strokeWidth="2" markerEnd="url(#arrow)" />
            <text x="210" y="90" fill="#94a3b8" fontSize="11" textAnchor="middle">req.query.id</text>

            <rect x="260" y="70" width="160" height="60" rx="10" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
            <text x="340" y="95" fill="#f8fafc" fontSize="13" textAnchor="middle" fontWeight="bold">src/routes/users.ts</text>
            <text x="340" y="115" fill="#fde68a" fontSize="10" textAnchor="middle">[TAINT PROPAGATOR]</text>

            <path d="M 420 100 L 520 100" stroke="#f43f5e" strokeWidth="2" />
            <text x="470" y="90" fill="#fda4af" fontSize="11" textAnchor="middle">unparameterized</text>

            <rect x="520" y="70" width="180" height="60" rx="10" fill="#1e293b" stroke="#f43f5e" strokeWidth="2" />
            <text x="610" y="95" fill="#f8fafc" fontSize="13" textAnchor="middle" fontWeight="bold">PostgreSQL db.query</text>
            <text x="610" y="115" fill="#fda4af" fontSize="10" textAnchor="middle">[EXPLOITABLE SINK]</text>
          </svg>
        </div>
      </div>

      {/* PR Conversational Chat Assistant */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={18} color="var(--accent-cyan)" />
          <span>Conversational PR Assistant (@sherlock in Pull Request)</span>
        </h3>

        <div style={{
          background: 'rgba(5, 8, 15, 0.7)',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          padding: '16px',
          minHeight: '220px',
          maxHeight: '340px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {chatMessages.map((msg, idx) => (
            <div key={idx} style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              padding: '12px 16px',
              borderRadius: '12px',
              background: msg.role === 'user' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.04)',
              border: msg.role === 'user' ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid var(--border-subtle)',
              fontSize: '0.85rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontWeight: 700, color: msg.role === 'user' ? 'var(--accent-cyan)' : '#a5f3fc' }}>
                  {msg.role === 'user' ? 'You' : 'Sherlock Bot'}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{msg.time}</span>
              </div>
              <p style={{ lineHeight: '1.5', color: 'var(--text-main)' }}>{msg.text}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
          <input
            type="text"
            placeholder="Type a command: @sherlock explain, @sherlock fix, or @sherlock ignore <reason>..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '10px 16px',
              color: 'var(--text-main)',
              fontSize: '0.9rem'
            }}
          />
          <button
            onClick={handleSend}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              background: 'var(--accent-cyan)',
              color: '#000',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Send size={15} />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
