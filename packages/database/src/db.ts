import { DatabaseSync } from 'node:sqlite';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { SCHEMA_SQL } from './schema.js';

let instance: DatabaseSync | null = null;

export function getDatabasePath(): string {
  if (process.env.DATABASE_PATH) {
    return process.env.DATABASE_PATH;
  }
  // Default to repo root directory .sherlock/sherlock.db or data/sherlock.db
  const baseDir = process.cwd();
  const dir = path.join(baseDir, '.sherlock');
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {
      // ignore
    }
  }
  return path.join(dir, 'sherlock.db');
}

export function getDb(customPath?: string): DatabaseSync {
  if (instance && !customPath) {
    return instance;
  }

  const dbPath = customPath || getDatabasePath();
  const db = new DatabaseSync(dbPath);

  // Configure pragmas for high performance & integrity
  db.exec('PRAGMA foreign_keys = ON;');
  try {
    db.exec('PRAGMA journal_mode = WAL;');
  } catch {
    // In-memory or some systems may not support WAL mode
  }

  // Execute migrations/schema
  db.exec(SCHEMA_SQL);

  if (!customPath) {
    instance = db;
  }

  return db;
}

export function closeDb(): void {
  if (instance) {
    try {
      instance.close();
    } catch {
      // ignore
    }
    instance = null;
  }
}
