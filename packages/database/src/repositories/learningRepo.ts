import * as crypto from 'node:crypto';
import { getDb } from '../db.js';

export interface LearningRecord {
  id: string;
  repo_id?: string;
  scope: string;
  target_path?: string;
  feedback_text: string;
  synthesized_rule: string;
  associated_rule_id?: string;
  author: string;
  created_at: string;
}

export class LearningRepository {
  public static addLearning(data: {
    repoId?: string;
    scope?: string;
    targetPath?: string;
    feedbackText: string;
    synthesizedRule?: string;
    associatedRuleId?: string;
    author?: string;
  }): LearningRecord {
    const db = getDb();
    const id = 'lrn_' + crypto.randomBytes(8).toString('hex');
    const now = new Date().toISOString();
    const rule = data.synthesizedRule || `Learned constraint: developer clarified that ${data.feedbackText.trim()}`;

    const stmt = db.prepare(`
      INSERT INTO learnings (id, repo_id, scope, target_path, feedback_text, synthesized_rule, associated_rule_id, author, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.repoId || null,
      data.scope || (data.targetPath ? 'path' : 'repo'),
      data.targetPath || null,
      data.feedbackText.trim(),
      rule,
      data.associatedRuleId || null,
      data.author || 'developer',
      now
    );

    return {
      id,
      repo_id: data.repoId,
      scope: data.scope || (data.targetPath ? 'path' : 'repo'),
      target_path: data.targetPath,
      feedback_text: data.feedbackText.trim(),
      synthesized_rule: rule,
      associated_rule_id: data.associatedRuleId,
      author: data.author || 'developer',
      created_at: now
    };
  }

  public static getLearnings(targetPath?: string): LearningRecord[] {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM learnings ORDER BY created_at DESC').all() as any[];

    if (!targetPath) return rows;
    return rows.filter(r => !r.target_path || targetPath.includes(r.target_path));
  }

  public static deleteLearning(id: string): boolean {
    const db = getDb();
    const res = db.prepare('DELETE FROM learnings WHERE id = ?').run(id);
    return res.changes > 0;
  }
}
