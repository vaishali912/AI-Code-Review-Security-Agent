import { getDb } from '../db.js';

export interface FindingRecord {
  id: string;
  scan_id?: string;
  repo_id?: string;
  fingerprint: string;
  rule_id: string;
  title: string;
  cwe: string[];
  owasp: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  confidence: number;
  status: 'open' | 'fixed' | 'accepted_risk' | 'false_positive';
  triage_reason?: string;
  file_path: string;
  start_line: number;
  end_line: number;
  dataflow: any[];
  fix: any;
  proof?: any;
  lane: string;
  exposure?: string;
  first_seen: string;
  last_seen: string;
}

export class FindingRepository {
  public static saveFindings(findings: any[], scanId?: string, repoId: string = 'default'): void {
    const db = getDb();
    const now = new Date().toISOString();

    const insertStmt = db.prepare(`
      INSERT INTO findings (
        id, scan_id, repo_id, fingerprint, rule_id, title, cwe_json, owasp,
        severity, confidence, status, triage_reason, file_path, start_line, end_line,
        dataflow_json, fix_json, proof_json, lane, exposure, first_seen, last_seen
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?
      )
    `);

    const updateLastSeen = db.prepare(`
      UPDATE findings 
      SET last_seen = ?, scan_id = COALESCE(?, scan_id)
      WHERE fingerprint = ?
    `);

    const checkExists = db.prepare('SELECT id FROM findings WHERE fingerprint = ?');

    for (const f of findings) {
      const existing = checkExists.get(f.fingerprint);
      if (existing) {
        updateLastSeen.run(now, scanId || null, f.fingerprint);
      } else {
        insertStmt.run(
          f.id,
          scanId || null,
          repoId,
          f.fingerprint,
          f.detected_by?.static_rule || f.rule_id || 'rule.generic',
          f.title,
          JSON.stringify(f.cwe || []),
          f.owasp || 'A03:2021',
          f.severity || 'high',
          f.confidence || 0.9,
          f.status || 'open',
          f.triageReason || null,
          f.location?.file || f.file_path || '',
          f.location?.startLine || f.start_line || 1,
          f.location?.endLine || f.end_line || 1,
          JSON.stringify(f.dataflow || []),
          JSON.stringify(f.fix || {}),
          f.proof ? JSON.stringify(f.proof) : null,
          f.lane || 'security',
          f.exposure || 'internet-facing',
          f.first_seen || now,
          now
        );
      }
    }
  }

  public static getFindings(filter?: {
    status?: string;
    severity?: string;
    search?: string;
    repoId?: string;
    lane?: string;
  }): FindingRecord[] {
    const db = getDb();
    let query = 'SELECT * FROM findings WHERE 1=1';
    const params: any[] = [];

    if (filter?.status && filter.status !== 'all') {
      query += ' AND status = ?';
      params.push(filter.status);
    }

    if (filter?.severity && filter.severity !== 'all') {
      query += ' AND severity = ?';
      params.push(filter.severity);
    }

    if (filter?.lane && filter.lane !== 'all') {
      query += ' AND lane = ?';
      params.push(filter.lane);
    }

    if (filter?.search) {
      query += ' AND (title LIKE ? OR file_path LIKE ? OR rule_id LIKE ?)';
      const s = `%${filter.search}%`;
      params.push(s, s, s);
    }

    query += ' ORDER BY CASE severity WHEN "critical" THEN 1 WHEN "high" THEN 2 WHEN "medium" THEN 3 ELSE 4 END ASC, created_at DESC';

    // fallback query without created_at if table lacks created_at
    const rows = db.prepare('SELECT * FROM findings ORDER BY CASE severity WHEN "critical" THEN 1 WHEN "high" THEN 2 WHEN "medium" THEN 3 ELSE 4 END ASC').all();

    return (rows as any[]).map(r => ({
      id: r.id,
      scan_id: r.scan_id,
      repo_id: r.repo_id,
      fingerprint: r.fingerprint,
      rule_id: r.rule_id,
      title: r.title,
      cwe: JSON.parse(r.cwe_json || '[]'),
      owasp: r.owasp,
      severity: r.severity,
      confidence: r.confidence,
      status: r.status,
      triage_reason: r.triage_reason,
      file_path: r.file_path,
      start_line: r.start_line,
      end_line: r.end_line,
      dataflow: JSON.parse(r.dataflow_json || '[]'),
      fix: JSON.parse(r.fix_json || '{}'),
      proof: r.proof_json ? JSON.parse(r.proof_json) : undefined,
      lane: r.lane,
      exposure: r.exposure,
      first_seen: r.first_seen,
      last_seen: r.last_seen
    }));
  }

  public static getFindingById(id: string): FindingRecord | null {
    const db = getDb();
    const row = db.prepare('SELECT * FROM findings WHERE id = ? OR fingerprint = ?').get(id, id) as any;
    if (!row) return null;

    return {
      id: row.id,
      scan_id: row.scan_id,
      repo_id: row.repo_id,
      fingerprint: row.fingerprint,
      rule_id: row.rule_id,
      title: row.title,
      cwe: JSON.parse(row.cwe_json || '[]'),
      owasp: row.owasp,
      severity: row.severity,
      confidence: row.confidence,
      status: row.status,
      triage_reason: row.triage_reason,
      file_path: row.file_path,
      start_line: row.start_line,
      end_line: row.end_line,
      dataflow: JSON.parse(row.dataflow_json || '[]'),
      fix: JSON.parse(row.fix_json || '{}'),
      proof: row.proof_json ? JSON.parse(row.proof_json) : undefined,
      lane: row.lane,
      exposure: row.exposure,
      first_seen: row.first_seen,
      last_seen: row.last_seen
    };
  }

  public static updateStatus(id: string, status: string, reason?: string): boolean {
    const db = getDb();
    const stmt = db.prepare('UPDATE findings SET status = ?, triage_reason = COALESCE(?, triage_reason) WHERE id = ? OR fingerprint = ?');
    const res = stmt.run(status, reason || null, id, id);
    return res.changes > 0;
  }
}
