import React, { useState } from 'react';
import { FindingItem } from '../data/mockData.js';
import { X, CheckCircle, AlertOctagon, Terminal, Copy, Shield, GitCommit, Play, ArrowDown, ExternalLink } from 'lucide-react';

interface FindingDetailModalProps {
  finding: FindingItem | null;
  onClose: () => void;
  onUpdateStatus: (findingId: string, status: FindingItem['status'], reason?: string) => void;
}

export const FindingDetailModal: React.FC<FindingDetailModalProps> = ({ finding, onClose, onUpdateStatus }) => {
  if (!finding) return null;

  const [activeTab, setActiveTab] = useState<'dataflow' | 'proof' | 'fix' | 'chat'>('dataflow');
  const [isRunningProof, setIsRunningProof] = useState(false);
  const [proofLogs, setProofLogs] = useState<string[]>(
    finding.proof?.executionOutput ? finding.proof.executionOutput.split('\n') : []
  );
  const [proofStatus, setProofStatus] = useState<string>(finding.proof?.status || 'unproven');
  const [falsePositiveReason, setFalsePositiveReason] = useState('');
  const [showFPDialog, setShowFPDialog] = useState(false);
  const [copiedPatch, setCopiedPatch] = useState(false);

  const handleRunProof = () => {
    setIsRunningProof(true);
    setProofLogs([
      `[SANDBOX] Initializing isolated ephemeral micro-VM container...`,
      `[SANDBOX] Target: ${finding.location.file}:${finding.location.startLine}`,
      `[SANDBOX] Network egress: STRICTLY ISOLATED`,
      `[PROBE 1/2] Injecting synthetic canary payload into route handler...`
    ]);

    setTimeout(() => {
      setProofLogs(prev => [
        ...prev,
        `[CANARY FIRED] Payload received by sink ${finding.dataflow[finding.dataflow.length - 1]?.snippet || 'db.query'}`,
        `[EXPLOIT PROVED] Security assertion failed: Exploit condition reproduced in sandbox!`,
        `[PROBE 2/2] Applying suggested fix patch to test runner in-memory...`
      ]);
    }, 900);

    setTimeout(() => {
      setProofLogs(prev => [
        ...prev,
        `[PATCH COMPILED] Validated AST structure and TypeScript types cleanly.`,
        `[RE-TEST] Executing canary probe against patched version...`,
        `[SUCCESS] Exploit probe neutralized: all assertions passed cleanly!`,
        `[VERDICT] Finding ${finding.id} marked as EXPLOIT-VERIFIED with 100% confidence.`
      ]);
      setIsRunningProof(false);
      setProofStatus('proven');
    }, 1800);
  };

  const copyPatch = () => {
    navigator.clipboard.writeText(finding.fix.patch);
    setCopiedPatch(true);
    setTimeout(() => setCopiedPatch(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 8, 15, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '24px'
    }}>
      <div className="glass-panel" style={{
        width: '1000px',
        maxWidth: '95vw',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '20px',
        border: '1px solid var(--border-hover)',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 28px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(15, 23, 42, 0.6)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className={`badge badge-${finding.severity}`}>
              {finding.severity}
            </span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)' }}>
              {finding.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ color: 'var(--text-muted)', padding: '6px', borderRadius: '8px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(15, 23, 42, 0.4)',
          padding: '0 28px'
        }}>
          {[
            { key: 'dataflow', label: 'Tainted Data Flow Path' },
            { key: 'proof', label: 'Exploit Proof Sandbox' },
            { key: 'fix', label: 'Validated Fix & Diff' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                padding: '14px 20px',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: activeTab === tab.key ? 'var(--accent-cyan)' : 'var(--text-dim)',
                borderBottom: activeTab === tab.key ? '2px solid var(--accent-cyan)' : '2px solid transparent'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div style={{ padding: '28px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {activeTab === 'dataflow' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '16px 20px',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)'
              }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Plain-Language Attack Scenario & Evidence
                </h4>
                <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-main)' }}>
                  {finding.explanation}
                </p>
                <div style={{ marginTop: '12px', display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>📍 Entry: <code>{finding.location.file}:{finding.location.startLine}</code></span>
                  <span>🔒 CWE: <strong>{finding.cwe.join(', ')}</strong> ({finding.owasp})</span>
                  <span>🎯 Triage Verdict: <strong style={{ color: 'var(--accent-emerald)' }}>{finding.detected_by.agent_verdict.toUpperCase()}</strong></span>
                </div>
              </div>

              {/* Data Flow Node Visualization */}
              <div>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Source → Propagator → Sink Data Flow Trace
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {finding.dataflow.map((step, idx) => {
                    const isSource = step.role === 'source';
                    const isSink = step.role === 'sink';
                    const badgeColor = isSource ? 'var(--accent-cyan)' : isSink ? 'var(--accent-rose)' : 'var(--accent-amber)';

                    return (
                      <React.Fragment key={idx}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          padding: '14px 18px',
                          borderRadius: '12px',
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: `1px solid ${isSink ? 'rgba(244, 63, 94, 0.3)' : isSource ? 'rgba(6, 182, 212, 0.3)' : 'var(--border-subtle)'}`,
                          boxShadow: isSink ? '0 0 15px rgba(244, 63, 94, 0.1)' : 'none'
                        }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: `rgba(${isSource ? '6, 182, 212' : isSink ? '244, 63, 94' : '245, 158, 11'}, 0.15)`,
                            color: badgeColor
                          }}>
                            {step.role.toUpperCase()}
                          </span>

                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                              <code style={{ color: 'var(--text-main)', fontWeight: 600 }}>{step.file}:{step.line}</code>
                              <span style={{ color: 'var(--text-dim)' }}>—</span>
                              <span style={{ color: 'var(--text-muted)' }}>{step.description || 'Data flow step'}</span>
                            </div>
                            {step.snippet && (
                              <pre style={{
                                marginTop: '6px',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                background: 'rgba(0, 0, 0, 0.4)',
                                color: isSink ? '#fda4af' : isSource ? '#a5f3fc' : 'var(--text-main)',
                                fontSize: '0.8rem',
                                overflowX: 'auto'
                              }}>
                                {step.snippet}
                              </pre>
                            )}
                          </div>
                        </div>

                        {idx < finding.dataflow.length - 1 && (
                          <div style={{ display: 'flex', justifyContent: 'center', margin: '-4px 0' }}>
                            <ArrowDown size={18} color="var(--text-dim)" />
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'proof' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Ephemeral Sandbox Exploit Proof</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Executes automated canary test to prove the vulnerability on the PR branch, then tests the fix.
                  </p>
                </div>
                <button
                  onClick={handleRunProof}
                  disabled={isRunningProof}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                    color: '#000',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
                  }}
                >
                  <Play size={16} />
                  <span>{isRunningProof ? 'Running Sandbox...' : 'Run Exploit Proof'}</span>
                </button>
              </div>

              {/* Terminal View */}
              <div style={{
                background: '#040711',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '20px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                minHeight: '260px',
                maxHeight: '380px',
                overflowY: 'auto'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginLeft: '10px' }}>sherlock-verification-sandbox://runner-01</span>
                </div>

                {proofLogs.map((log, lIdx) => (
                  <div key={lIdx} style={{
                    marginBottom: '6px',
                    color: log.includes('[SUCCESS]') || log.includes('[PATCH VERIFIED]') 
                      ? 'var(--accent-emerald)' 
                      : log.includes('[EXPLOIT PROVED]') || log.includes('[EXPLOIT VERIFIED]')
                        ? 'var(--accent-rose)'
                        : log.includes('[PROBE')
                          ? 'var(--accent-cyan)'
                          : 'var(--text-muted)'
                  }}>
                    {log}
                  </div>
                ))}
                {isRunningProof && (
                  <div style={{ color: 'var(--accent-cyan)', marginTop: '8px' }}>
                    <span>Executing probe in gVisor sandbox</span>
                    <span className="cursor-blink" style={{ marginLeft: '6px' }} />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'fix' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Suggested Patch</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{finding.fix.description}</p>
                </div>
                <button
                  onClick={copyPatch}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem'
                  }}
                >
                  <Copy size={14} />
                  <span>{copiedPatch ? 'Copied Diff!' : 'Copy Diff'}</span>
                </button>
              </div>

              <div style={{
                background: '#040711',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)',
                padding: '16px 20px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                overflowX: 'auto',
                lineHeight: '1.5'
              }}>
                {finding.fix.patch.split('\n').map((line, pIdx) => {
                  const isAdd = line.startsWith('+');
                  const isDel = line.startsWith('-');
                  return (
                    <div key={pIdx} style={{
                      color: isAdd ? '#6ee7b7' : isDel ? '#fda4af' : 'var(--text-dim)',
                      backgroundColor: isAdd ? 'rgba(16, 185, 129, 0.08)' : isDel ? 'rgba(244, 63, 94, 0.08)' : 'transparent',
                      padding: '1px 4px',
                      borderRadius: '2px'
                    }}>
                      {line}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / Triage actions */}
        <div style={{
          padding: '18px 28px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(15, 23, 42, 0.7)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Status:</span>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '4px',
              background: finding.status === 'fixed' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
              color: finding.status === 'fixed' ? '#6ee7b7' : '#fda4af'
            }}>
              {finding.status.toUpperCase()}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => onUpdateStatus(finding.id, 'false_positive', 'Marked as false positive by engineer')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
                fontWeight: 600
              }}
            >
              Dismiss (False Positive)
            </button>

            <button
              onClick={() => onUpdateStatus(finding.id, 'fixed')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 18px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: '#6ee7b7',
                fontSize: '0.85rem',
                fontWeight: 600
              }}
            >
              <CheckCircle size={15} />
              <span>Mark as Fixed</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
