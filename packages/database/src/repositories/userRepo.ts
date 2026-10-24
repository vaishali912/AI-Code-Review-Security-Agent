import * as crypto from 'node:crypto';
import { getDb } from '../db.js';

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  password_hash?: string;
  password_salt?: string;
  provider: 'local' | 'google' | 'github';
  provider_id?: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  created_at: string;
  updated_at: string;
}

export interface SessionRecord {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

export class UserRepository {
  public static hashPassword(password: string): { hash: string; salt: string } {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return { hash, salt };
  }

  public static verifyPassword(password: string, hash: string, salt: string): boolean {
    const computedHash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computedHash, 'hex'));
  }

  public static createUser(data: {
    email: string;
    name: string;
    password?: string;
    avatarUrl?: string;
    provider?: 'local' | 'google' | 'github';
    providerId?: string;
    role?: 'owner' | 'admin' | 'member' | 'viewer';
  }): UserRecord {
    const db = getDb();
    const id = 'usr_' + crypto.randomBytes(8).toString('hex');
    const now = new Date().toISOString();

    let passwordHash: string | null = null;
    let passwordSalt: string | null = null;

    if (data.password) {
      const { hash, salt } = this.hashPassword(data.password);
      passwordHash = hash;
      passwordSalt = salt;
    }

    const stmt = db.prepare(`
      INSERT INTO users (id, email, name, avatar_url, password_hash, password_salt, provider, provider_id, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.email.toLowerCase().trim(),
      data.name.trim(),
      data.avatarUrl || null,
      passwordHash,
      passwordSalt,
      data.provider || 'local',
      data.providerId || null,
      data.role || 'member',
      now,
      now
    );

    return this.getUserById(id)!;
  }

  public static getUserById(id: string): UserRecord | null {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    const row = stmt.get(id);
    return (row as unknown as UserRecord) || null;
  }

  public static getUserByEmail(email: string): UserRecord | null {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const row = stmt.get(email.toLowerCase().trim());
    return (row as unknown as UserRecord) || null;
  }

  public static upsertGoogleUser(data: {
    email: string;
    name: string;
    avatarUrl?: string;
    googleId: string;
  }): UserRecord {
    const db = getDb();
    const existing = this.getUserByEmail(data.email);

    if (existing) {
      // Update provider to Google if not set
      const now = new Date().toISOString();
      const stmt = db.prepare(`
        UPDATE users 
        SET provider = 'google', provider_id = ?, avatar_url = COALESCE(?, avatar_url), updated_at = ?
        WHERE id = ?
      `);
      stmt.run(data.googleId, data.avatarUrl || null, now, existing.id);
      return this.getUserById(existing.id)!;
    }

    return this.createUser({
      email: data.email,
      name: data.name,
      avatarUrl: data.avatarUrl,
      provider: 'google',
      providerId: data.googleId,
      role: 'member'
    });
  }

  public static createSession(userId: string, durationDays: number = 7): SessionRecord {
    const db = getDb();
    const id = 'ses_' + crypto.randomBytes(12).toString('hex');
    const token = 'shk_sess_' + crypto.randomBytes(32).toString('hex');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString();

    const stmt = db.prepare(`
      INSERT INTO sessions (id, user_id, token, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(id, userId, token, expiresAt, now.toISOString());

    return {
      id,
      user_id: userId,
      token,
      expires_at: expiresAt,
      created_at: now.toISOString()
    };
  }

  public static getSession(token: string): { session: SessionRecord; user: UserRecord } | null {
    const db = getDb();
    const stmt = db.prepare(`
      SELECT s.id as s_id, s.user_id, s.token, s.expires_at, s.created_at as s_created,
             u.id as u_id, u.email, u.name, u.avatar_url, u.role, u.provider, u.created_at as u_created, u.updated_at as u_updated
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = ?
    `);

    const row = stmt.get(token) as any;
    if (!row) return null;

    // Check expiry
    if (new Date(row.expires_at).getTime() < Date.now()) {
      this.deleteSession(token);
      return null;
    }

    return {
      session: {
        id: row.s_id,
        user_id: row.user_id,
        token: row.token,
        expires_at: row.expires_at,
        created_at: row.s_created
      },
      user: {
        id: row.u_id,
        email: row.email,
        name: row.name,
        avatar_url: row.avatar_url,
        provider: row.provider,
        role: row.role,
        created_at: row.u_created,
        updated_at: row.u_updated
      }
    };
  }

  public static deleteSession(token: string): void {
    const db = getDb();
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  }

  public static deleteUserSessions(userId: string): void {
    const db = getDb();
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
  }
}
