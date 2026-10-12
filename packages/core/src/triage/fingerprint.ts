import * as crypto from 'crypto';

export function computeFingerprint(ruleId: string, sinkSnippet: string, routeOrFile: string): string {
  // Normalize sink snippet by stripping whitespace and quotes
  const normalizedSink = sinkSnippet.replace(/\s+/g, ' ').trim();
  const normalizedTarget = routeOrFile.replace(/\\/g, '/').toLowerCase();
  const raw = `${ruleId}::${normalizedSink}::${normalizedTarget}`;
  return crypto.createHash('sha256').update(raw).digest('hex').slice(0, 32);
}

export function generateFindingId(): string {
  return 'fnd_' + crypto.randomBytes(8).toString('hex');
}
