import * as crypto from 'node:crypto';
import { getDb } from '../db.js';

export interface AuditRecord {
  id: string;
  org_id?: string;
  user_id?: string;
  action: string;
  details: any;
  created_at: string;
}

export class AuditRepository {
  public static log(action: string, details: any, userId?: string, orgId?: string): AuditRecord {
    const db = getDb();
    const id = 'aud_' + crypto.randomBytes(8).toString('hex');
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO audit_logs (id, org_id, user_id, action, details_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, orgId || null, userId || null, action, JSON.stringify(details || {}), now);

    return {
      id,
      org_id: orgId,
      user_id: userId,
      action,
      details,
      created_at: now
    };
  }

  public static getLogs(limit: number = 50): AuditRecord[] {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?').all(limit) as any[];
    return rows.map(r => ({
      id: r.id,
      org_id: r.org_id,
      user_id: r.user_id,
      action: r.action,
      details: JSON.parse(r.details_json || '{}'),
      created_at: r.created_at
    }));
  }
}
