export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  password_hash TEXT,
  password_salt TEXT,
  provider TEXT NOT NULL DEFAULT 'local',
  provider_id TEXT,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL DEFAULT 'team',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS memberships (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TEXT NOT NULL,
  UNIQUE(org_id, user_id)
);

CREATE TABLE IF NOT EXISTS repositories (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  default_branch TEXT NOT NULL DEFAULT 'main',
  policy_config TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS scans (
  id TEXT PRIMARY KEY,
  repo_id TEXT REFERENCES repositories(id) ON DELETE CASCADE,
  commit_sha TEXT NOT NULL,
  branch TEXT NOT NULL DEFAULT 'main',
  scanned_files INTEGER NOT NULL DEFAULT 0,
  total_findings INTEGER NOT NULL DEFAULT 0,
  critical_count INTEGER NOT NULL DEFAULT 0,
  high_count INTEGER NOT NULL DEFAULT 0,
  medium_count INTEGER NOT NULL DEFAULT 0,
  low_count INTEGER NOT NULL DEFAULT 0,
  suppressed_count INTEGER NOT NULL DEFAULT 0,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  passed_gate INTEGER NOT NULL DEFAULT 1,
  summary_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS findings (
  id TEXT PRIMARY KEY,
  scan_id TEXT REFERENCES scans(id) ON DELETE CASCADE,
  repo_id TEXT,
  fingerprint TEXT NOT NULL,
  rule_id TEXT NOT NULL,
  title TEXT NOT NULL,
  cwe_json TEXT NOT NULL,
  owasp TEXT NOT NULL,
  severity TEXT NOT NULL,
  confidence REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  triage_reason TEXT,
  file_path TEXT NOT NULL,
  start_line INTEGER NOT NULL,
  end_line INTEGER NOT NULL,
  dataflow_json TEXT NOT NULL,
  fix_json TEXT NOT NULL,
  proof_json TEXT,
  lane TEXT NOT NULL DEFAULT 'security',
  exposure TEXT DEFAULT 'internet-facing',
  first_seen TEXT NOT NULL,
  last_seen TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS learnings (
  id TEXT PRIMARY KEY,
  repo_id TEXT,
  scope TEXT NOT NULL DEFAULT 'repo',
  target_path TEXT,
  feedback_text TEXT NOT NULL,
  synthesized_rule TEXT NOT NULL,
  associated_rule_id TEXT,
  author TEXT NOT NULL DEFAULT 'developer',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  org_id TEXT,
  user_id TEXT,
  action TEXT NOT NULL,
  details_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_findings_fingerprint ON findings(fingerprint);
CREATE INDEX IF NOT EXISTS idx_findings_status ON findings(status);
CREATE INDEX IF NOT EXISTS idx_scans_created ON scans(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
`;
