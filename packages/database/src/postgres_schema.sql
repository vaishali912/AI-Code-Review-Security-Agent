-- ==============================================================================
-- Sherlock Production PostgreSQL Schema (AWS RDS / Supabase / Neon / Cloud SQL)
-- ==============================================================================

-- Organizations & Tenants
CREATE TABLE IF NOT EXISTS organizations (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    plan VARCHAR(50) DEFAULT 'team' CHECK (plan IN ('free', 'team', 'business', 'enterprise')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users & Authentication (Local + Google OAuth + GitHub)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    password_hash VARCHAR(255),
    password_salt VARCHAR(64),
    provider VARCHAR(50) DEFAULT 'local' CHECK (provider IN ('local', 'google', 'github', 'sso')),
    provider_id VARCHAR(255),
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Sessions (Stateful or Refresh Tokens)
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization Memberships (RBAC)
CREATE TABLE IF NOT EXISTS memberships (
    id VARCHAR(36) PRIMARY KEY,
    org_id VARCHAR(36) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, user_id)
);

-- Repositories
CREATE TABLE IF NOT EXISTS repositories (
    id VARCHAR(36) PRIMARY KEY,
    org_id VARCHAR(36) REFERENCES organizations(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    default_branch VARCHAR(100) DEFAULT 'main',
    is_active BOOLEAN DEFAULT TRUE,
    policy_config JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scans & Reviews
CREATE TABLE IF NOT EXISTS scans (
    id VARCHAR(36) PRIMARY KEY,
    repo_id VARCHAR(36) REFERENCES repositories(id) ON DELETE CASCADE,
    commit_sha VARCHAR(64) NOT NULL,
    branch VARCHAR(100) DEFAULT 'main',
    scanned_files INTEGER DEFAULT 0,
    total_findings INTEGER DEFAULT 0,
    critical_count INTEGER DEFAULT 0,
    high_count INTEGER DEFAULT 0,
    medium_count INTEGER DEFAULT 0,
    low_count INTEGER DEFAULT 0,
    suppressed_count INTEGER DEFAULT 0,
    duration_ms INTEGER DEFAULT 0,
    passed_gate BOOLEAN DEFAULT TRUE,
    summary_json JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vulnerability Findings (Deduplicated by Fingerprint)
CREATE TABLE IF NOT EXISTS findings (
    id VARCHAR(36) PRIMARY KEY,
    scan_id VARCHAR(36) REFERENCES scans(id) ON DELETE CASCADE,
    repo_id VARCHAR(36) REFERENCES repositories(id) ON DELETE CASCADE,
    fingerprint CHAR(32) NOT NULL,
    rule_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    cwe TEXT[] NOT NULL,
    owasp VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
    confidence NUMERIC(3,2) NOT NULL,
    status VARCHAR(30) DEFAULT 'open' CHECK (status IN ('open', 'fixed', 'accepted_risk', 'false_positive')),
    triage_reason TEXT,
    file_path TEXT NOT NULL,
    start_line INTEGER NOT NULL,
    end_line INTEGER NOT NULL,
    dataflow JSONB NOT NULL DEFAULT '[]',
    fix JSONB NOT NULL DEFAULT '{}',
    proof JSONB,
    lane VARCHAR(50) DEFAULT 'security',
    exposure VARCHAR(50) DEFAULT 'internet-facing',
    first_seen TIMESTAMPTZ DEFAULT NOW(),
    last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- Scoped Repository Learnings & False Positive Memory
CREATE TABLE IF NOT EXISTS learnings (
    id VARCHAR(36) PRIMARY KEY,
    repo_id VARCHAR(36) REFERENCES repositories(id) ON DELETE CASCADE,
    scope VARCHAR(20) DEFAULT 'repo' CHECK (scope IN ('repo', 'path', 'org')),
    target_path TEXT,
    feedback_text TEXT NOT NULL,
    synthesized_rule TEXT NOT NULL,
    associated_rule_id VARCHAR(100),
    author VARCHAR(255) DEFAULT 'developer',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    org_id VARCHAR(36) REFERENCES organizations(id) ON DELETE CASCADE,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_findings_fingerprint ON findings(fingerprint);
CREATE INDEX IF NOT EXISTS idx_findings_status ON findings(status);
CREATE INDEX IF NOT EXISTS idx_findings_repo ON findings(repo_id);
CREATE INDEX IF NOT EXISTS idx_scans_repo ON scans(repo_id);
CREATE INDEX IF NOT EXISTS idx_audit_org ON audit_logs(org_id);
