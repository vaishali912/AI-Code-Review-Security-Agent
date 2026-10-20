import { describe, it, expect } from 'vitest';
import { INITIAL_FINDINGS, FindingItem } from '../data/mockData.js';

describe('Findings Filter Logic', () => {
  it('filters by search keyword in title or file location', () => {
    const search = 'SQL injection';
    const filtered = INITIAL_FINDINGS.filter(f =>
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.location.file.toLowerCase().includes(search.toLowerCase())
    );

    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every(f => f.title.includes('SQL') || f.location.file.includes('users'))).toBe(true);
  });

  it('filters correctly by severity level', () => {
    const criticalFindings = INITIAL_FINDINGS.filter(f => f.severity === 'critical');
    expect(criticalFindings.length).toBe(2);
    expect(criticalFindings.every(f => f.severity === 'critical')).toBe(true);

    const highFindings = INITIAL_FINDINGS.filter(f => f.severity === 'high');
    expect(highFindings.length).toBe(4);
  });

  it('filters correctly by triage status and lane', () => {
    const openSecurity = INITIAL_FINDINGS.filter(f => f.status === 'open' && f.lane === 'security');
    expect(openSecurity.length).toBe(INITIAL_FINDINGS.length);
  });
});

describe('Findings Status Update & Triage Logic', () => {
  it('updates finding status to fixed with resolution message', () => {
    let items = [...INITIAL_FINDINGS];
    const targetId = 'fnd_sqli_users_01';
    const reason = 'Applied parameterized query patch';

    items = items.map(f => {
      if (f.id === targetId) {
        return { ...f, status: 'fixed', triageReason: reason };
      }
      return f;
    });

    const updated = items.find(f => f.id === targetId);
    expect(updated?.status).toBe('fixed');
    expect(updated?.triageReason).toBe(reason);
  });

  it('records false positive dismissal reason correctly', () => {
    let items = [...INITIAL_FINDINGS];
    const targetId = 'fnd_xss_userbio_04';
    const reason = 'Sanitized by Gateway WAF before rendering';

    items = items.map(f => {
      if (f.id === targetId) {
        return { ...f, status: 'false_positive', triageReason: reason };
      }
      return f;
    });

    const dismissed = items.find(f => f.id === targetId);
    expect(dismissed?.status).toBe('false_positive');
    expect(dismissed?.triageReason).toBe(reason);
  });
});
