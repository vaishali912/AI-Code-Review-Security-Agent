import { Finding, ReviewLane } from '@sherlock/core';

export interface LaneBreakdown {
  lane: ReviewLane;
  title: string;
  description: string;
  findings: Finding[];
}

export function partitionByLanes(findings: Finding[]): Record<ReviewLane, Finding[]> {
  const lanes: Record<ReviewLane, Finding[]> = {
    security: [],
    bug: [],
    quality: [],
    performance: [],
    tests: []
  };

  for (const f of findings) {
    lanes[f.lane || 'security'].push(f);
  }

  return lanes;
}

export function getLaneMeta(lane: ReviewLane): { title: string; icon: string; description: string } {
  switch (lane) {
    case 'security':
      return { title: 'Security Vulnerabilities', icon: '🛡️', description: 'Exploitable security defects, auth gaps, injection vectors' };
    case 'bug':
      return { title: 'Logic & Error Handling', icon: '🐛', description: 'Unhandled edge cases, null pointers, race conditions' };
    case 'quality':
      return { title: 'Code Quality & Maintainability', icon: '✨', description: 'Dead code, complexity, anti-patterns' };
    case 'performance':
      return { title: 'Performance & Latency', icon: '⚡', description: 'N+1 queries, unindexed lookups, memory bloat' };
    case 'tests':
      return { title: 'Test Coverage & Assertions', icon: '🧪', description: 'Untested paths, missing assertions, flaky mocks' };
  }
}
