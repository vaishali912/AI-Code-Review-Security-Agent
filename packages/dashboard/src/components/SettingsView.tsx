import React, { useState } from 'react';
import { Settings, Save, Brain, Plus, Shield } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [configYaml, setConfigYaml] = useState(`version: "1.0"
ignorePaths:
  - "**/node_modules/**"
  - "**/dist/**"
  - "**/.next/**"
  - "**/*.test.ts"
  - "**/*.spec.ts"

gate:
  failOnSeverity: "high"
  blockOnNewOnly: true
  maxFindings: 10

review:
  commentCap: 10
  showMermaidDiagrams: true
  enabledLanes:
    - "security"
    - "bug"
    - "quality"
    - "performance"
    - "tests"
  suppressLowConfidence: true

verification:
  exploitProofEnabled: true
  sandboxTimeoutSeconds: 120

customSanitizers:
  - name: "safeQueryParam"
    cwe: ["CWE-89"]
    sanitizes: ["string"]
`);

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
          Repository Policy & Learnings Memory
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Configure repo rules (.secreview.yml), custom trust boundaries/sanitizers, and manage learned suppression memories.
        </p>
      </div>

      {/* Learnings Memory Table (CP-4) */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Brain size={18} color="var(--accent-violet)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Active Learnings Memory Store</h3>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Synthesized from PR developer comments</span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', textAlign: 'left' }}>
              <th style={{ padding: '8px 12px' }}>Scope & Target</th>
              <th style={{ padding: '8px 12px' }}>Developer Clarification</th>
              <th style={{ padding: '8px 12px' }}>Synthesized Rule Constraint</th>
              <th style={{ padding: '8px 12px' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <td style={{ padding: '10px 12px' }}><code>src/routes/safe_users.ts</code></td>
              <td style={{ padding: '10px 12px', color: 'var(--text-main)' }}>"sanitized in database gateway with parseInt"</td>
              <td style={{ padding: '10px 12px', color: '#a5f3fc' }}>Trust parseInt conversion as integer bound</td>
              <td style={{ padding: '10px 12px', color: 'var(--text-dim)' }}>Oct 12, 2026</td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <td style={{ padding: '10px 12px' }}><code>repo: all paths</code></td>
              <td style={{ padding: '10px 12px', color: 'var(--text-main)' }}>"internal microservice calls use private VPC network"</td>
              <td style={{ padding: '10px 12px', color: '#a5f3fc' }}>Treat internal.company.local as safe SSRF host</td>
              <td style={{ padding: '10px 12px', color: 'var(--text-dim)' }}>Oct 10, 2026</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* .secreview.yml Editor */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={18} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>.secreview.yml Policy Editor</h3>
          </div>
          <button
            onClick={handleSave}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              background: 'var(--accent-cyan)',
              color: '#000',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}
          >
            <Save size={14} />
            <span>{saved ? 'Saved!' : 'Save Config'}</span>
          </button>
        </div>

        <textarea
          value={configYaml}
          onChange={(e) => setConfigYaml(e.target.value)}
          rows={16}
          style={{
            width: '100%',
            background: '#040711',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)',
            padding: '16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            color: '#a5f3fc',
            lineHeight: '1.5'
          }}
        />
      </div>
    </div>
  );
};
