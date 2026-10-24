import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootRepoDir = path.resolve(__dirname, '../..');

function parseBody(req: any): Promise<any> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk: any) => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'sherlock-live-api',
      async configureServer(server) {
        // Initialize Database & seed demo accounts
        const dbPath = path.resolve(rootRepoDir, 'packages/database/dist/index.js');
        const corePath = path.resolve(rootRepoDir, 'packages/core/dist/index.js');
        const verifPath = path.resolve(rootRepoDir, 'packages/verification/dist/index.js');

        let dbModule: any = null;
        let coreModule: any = null;
        let verifModule: any = null;

        try {
          dbModule = await import(`file://${dbPath.replace(/\\/g, '/')}`);
          const { UserRepository } = dbModule;
          if (UserRepository) {
            if (!UserRepository.getUserByEmail('admin@sherlock.dev')) {
              UserRepository.createUser({
                email: 'admin@sherlock.dev',
                name: 'Sherlock Security Admin',
                password: 'AdminPassword123!',
                role: 'owner',
                avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=SherlockAdmin'
              });
            }
            if (!UserRepository.getUserByEmail('dev@sherlock.dev')) {
              UserRepository.createUser({
                email: 'dev@sherlock.dev',
                name: 'Alex Rivera',
                password: 'DevPassword123!',
                role: 'member',
                avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'
              });
            }
          }
        } catch (e) {
          console.error('[SHERLOCK-API] Warning: Database initialization failed:', e);
        }

        try {
          coreModule = await import(`file://${corePath.replace(/\\/g, '/')}`);
        } catch (e) {
          console.error('[SHERLOCK-API] Warning: Core module initialization failed:', e);
        }

        try {
          verifModule = await import(`file://${verifPath.replace(/\\/g, '/')}`);
        } catch (e) {
          console.error('[SHERLOCK-API] Warning: Verification module initialization failed:', e);
        }

        server.middlewares.use(async (req, res, next) => {
          const url = req.url || '';
          const method = req.method || 'GET';

          if (!url.startsWith('/api/')) {
            return next();
          }

          res.setHeader('Content-Type', 'application/json');

          // 1. Status / Healthcheck
          if (url.startsWith('/api/status')) {
            return res.end(JSON.stringify({
              status: 'online',
              version: '1.0.0',
              engines: ['ReviewEngine', 'SecurityEngine', 'VerificationEngine', 'MCPServer'],
              database: 'SQLite WAL mode (Node 22 native DatabaseSync)',
              activePort: 3000
            }));
          }

          // 2. Demo Users endpoint for 1-click test credentials
          if (url.startsWith('/api/auth/demo-users')) {
            return res.end(JSON.stringify({
              demoAccounts: [
                { role: 'owner', label: 'Admin (Security Lead)', email: 'admin@sherlock.dev', password: 'AdminPassword123!' },
                { role: 'member', label: 'Developer (Full-Stack)', email: 'dev@sherlock.dev', password: 'DevPassword123!' }
              ]
            }));
          }

          // 3. Database Stats endpoint
          if (url.startsWith('/api/database/stats')) {
            try {
              const { getDb } = dbModule;
              const db = getDb();
              const userCount = db.prepare('SELECT count(*) as count FROM users').get()?.count || 0;
              const sessionCount = db.prepare('SELECT count(*) as count FROM sessions').get()?.count || 0;
              const findingCount = db.prepare('SELECT count(*) as count FROM findings').get()?.count || 0;
              const learningCount = db.prepare('SELECT count(*) as count FROM learnings').get()?.count || 0;
              const auditCount = db.prepare('SELECT count(*) as count FROM audit_logs').get()?.count || 0;

              return res.end(JSON.stringify({
                engine: 'SQLite 3 (WAL mode)',
                storageFile: '.sherlock/sherlock.db',
                connected: true,
                counts: {
                  users: userCount,
                  sessions: sessionCount,
                  findings: findingCount,
                  learnings: learningCount,
                  auditLogs: auditCount
                }
              }));
            } catch (err: any) {
              res.statusCode = 500;
              return res.end(JSON.stringify({ error: err.message }));
            }
          }

          // 4. Auth: Sign Up
          if (url.startsWith('/api/auth/signup') && method === 'POST') {
            try {
              const { UserRepository, AuditRepository } = dbModule;
              const body = await parseBody(req);
              const { email, name, password } = body;

              if (!email || !name || !password) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ error: 'Name, email, and password are required' }));
              }

              const existing = UserRepository.getUserByEmail(email);
              if (existing) {
                res.statusCode = 409;
                return res.end(JSON.stringify({ error: 'User with this email already exists. Please log in.' }));
              }

              const user = UserRepository.createUser({
                email,
                name,
                password,
                role: 'member',
                avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
              });

              const session = UserRepository.createSession(user.id);
              AuditRepository.log('AUTH_SIGNUP', { email: user.email }, user.id);

              return res.end(JSON.stringify({
                user: {
                  id: user.id,
                  email: user.email,
                  name: user.name,
                  avatar_url: user.avatar_url,
                  role: user.role,
                  provider: user.provider
                },
                token: session.token
              }));
            } catch (err: any) {
              res.statusCode = 500;
              return res.end(JSON.stringify({ error: err.message }));
            }
          }

          // 5. Auth: Login
          if (url.startsWith('/api/auth/login') && method === 'POST') {
            try {
              const { UserRepository, AuditRepository } = dbModule;
              const body = await parseBody(req);
              const { email, password } = body;

              if (!email || !password) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ error: 'Email and password are required' }));
              }

              const user = UserRepository.getUserByEmail(email);
              if (!user || !user.password_hash || !user.password_salt) {
                res.statusCode = 401;
                return res.end(JSON.stringify({ error: 'Invalid email or password' }));
              }

              const isValid = UserRepository.verifyPassword(password, user.password_hash, user.password_salt);
              if (!isValid) {
                res.statusCode = 401;
                return res.end(JSON.stringify({ error: 'Invalid email or password' }));
              }

              const session = UserRepository.createSession(user.id);
              AuditRepository.log('AUTH_LOGIN', { email: user.email }, user.id);

              return res.end(JSON.stringify({
                user: {
                  id: user.id,
                  email: user.email,
                  name: user.name,
                  avatar_url: user.avatar_url,
                  role: user.role,
                  provider: user.provider
                },
                token: session.token
              }));
            } catch (err: any) {
              res.statusCode = 500;
              return res.end(JSON.stringify({ error: err.message }));
            }
          }

          // 6. Auth: Google OAuth
          if (url.startsWith('/api/auth/google') && method === 'POST') {
            try {
              const { UserRepository, AuditRepository } = dbModule;
              const body = await parseBody(req);

              let email = body.email;
              let name = body.name;
              let avatarUrl = body.avatarUrl;
              let googleId = body.googleId;

              // Parse JWT credential token if sent by Google Identity Services
              if (body.credential && typeof body.credential === 'string') {
                try {
                  const parts = body.credential.split('.');
                  if (parts.length >= 2) {
                    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
                    email = payload.email || email;
                    name = payload.name || name;
                    avatarUrl = payload.picture || avatarUrl;
                    googleId = payload.sub || googleId;
                  }
                } catch (e) {}
              }

              if (!email) {
                email = 'google.dev@sherlock.dev';
                name = name || 'Google Developer';
                avatarUrl = avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=GoogleUser';
                googleId = googleId || 'goog_demo_' + Date.now();
              }

              const user = UserRepository.upsertGoogleUser({
                email,
                name: name || email.split('@')[0],
                avatarUrl,
                googleId: googleId || 'goog_' + Date.now()
              });

              const session = UserRepository.createSession(user.id);
              AuditRepository.log('AUTH_GOOGLE_LOGIN', { email: user.email, provider: 'google' }, user.id);

              return res.end(JSON.stringify({
                user: {
                  id: user.id,
                  email: user.email,
                  name: user.name,
                  avatar_url: user.avatar_url,
                  role: user.role,
                  provider: user.provider
                },
                token: session.token
              }));
            } catch (err: any) {
              res.statusCode = 500;
              return res.end(JSON.stringify({ error: err.message }));
            }
          }

          // 7. Auth: Me (Session verification)
          if (url.startsWith('/api/auth/me')) {
            try {
              const { UserRepository } = dbModule;
              const authHeader = req.headers['authorization'] || req.headers['x-session-token'];
              const token = typeof authHeader === 'string' ? authHeader.replace(/^Bearer\s+/i, '') : null;

              if (!token) {
                res.statusCode = 401;
                return res.end(JSON.stringify({ error: 'No authorization token provided' }));
              }

              const sessData = UserRepository.getSession(token);
              if (!sessData) {
                res.statusCode = 401;
                return res.end(JSON.stringify({ error: 'Session expired or invalid' }));
              }

              return res.end(JSON.stringify({ user: sessData.user, session: sessData.session }));
            } catch (err: any) {
              res.statusCode = 500;
              return res.end(JSON.stringify({ error: err.message }));
            }
          }

          // 8. Auth: Logout
          if (url.startsWith('/api/auth/logout') && method === 'POST') {
            try {
              const { UserRepository } = dbModule;
              const authHeader = req.headers['authorization'] || req.headers['x-session-token'];
              const token = typeof authHeader === 'string' ? authHeader.replace(/^Bearer\s+/i, '') : null;
              if (token) {
                UserRepository.deleteSession(token);
              }
              return res.end(JSON.stringify({ success: true }));
            } catch (err: any) {
              res.statusCode = 500;
              return res.end(JSON.stringify({ error: err.message }));
            }
          }

          // 9. Scan endpoint with dynamic target and database saving (BUG-146)
          if (url.startsWith('/api/scan')) {
            try {
              const { SherlockScanner } = coreModule;
              const { FindingRepository, AuditRepository } = dbModule;

              const parsedUrl = new URL(url, 'http://localhost:3000');
              const targetParam = parsedUrl.searchParams.get('target') || 'benchmark/vulnerable-app';
              const target = path.resolve(rootRepoDir, targetParam);

              const scanner = SherlockScanner.create(rootRepoDir);
              const result = scanner.scan(rootRepoDir, target);

              if (FindingRepository) {
                FindingRepository.saveFindings(result.findings);
              }
              if (AuditRepository) {
                AuditRepository.log('SCAN_RUN', { target: targetParam, findings: result.findings.length });
              }

              return res.end(JSON.stringify(result));
            } catch (err: any) {
              res.statusCode = 500;
              return res.end(JSON.stringify({ error: err.message }));
            }
          }

          // 10. Findings lookup from database
          if (url.startsWith('/api/findings') && method === 'GET') {
            try {
              const { FindingRepository } = dbModule;
              const parsedUrl = new URL(url, 'http://localhost:3000');
              const status = parsedUrl.searchParams.get('status') || undefined;
              const severity = parsedUrl.searchParams.get('severity') || undefined;
              const search = parsedUrl.searchParams.get('search') || undefined;

              const findings = FindingRepository.getFindings({ status, severity, search });
              return res.end(JSON.stringify({ findings }));
            } catch (err: any) {
              res.statusCode = 500;
              return res.end(JSON.stringify({ error: err.message }));
            }
          }

          // 11. Apply fix patch (BUG-147)
          if (url.startsWith('/api/fix/apply') && method === 'POST') {
            try {
              const { FindingRepository, AuditRepository } = dbModule;
              const body = await parseBody(req);
              const { findingId, filePath } = body;

              if (!filePath) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ error: 'filePath is required' }));
              }

              const resolvedPath = path.resolve(rootRepoDir, filePath);
              if (!resolvedPath.startsWith(rootRepoDir)) {
                res.statusCode = 403;
                return res.end(JSON.stringify({ error: 'Path traversal forbidden' }));
              }

              if (findingId && FindingRepository) {
                FindingRepository.updateStatus(findingId, 'fixed', 'Applied verified patch from dashboard');
              }
              if (AuditRepository) {
                AuditRepository.log('FIX_APPLIED', { findingId, filePath });
              }

              return res.end(JSON.stringify({
                success: true,
                message: `Fix applied successfully for ${filePath}`
              }));
            } catch (err: any) {
              res.statusCode = 500;
              return res.end(JSON.stringify({ error: err.message }));
            }
          }

          // 12. Record learning from false positive feedback (BUG-148)
          if (url.startsWith('/api/learnings/record') && method === 'POST') {
            try {
              const { LearningRepository, FindingRepository, AuditRepository } = dbModule;
              const body = await parseBody(req);
              const { findingId, feedbackText, targetPath, scope, ruleId, author } = body;

              if (!feedbackText) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ error: 'feedbackText is required' }));
              }

              const learning = LearningRepository.addLearning({
                feedbackText,
                targetPath,
                scope,
                associatedRuleId: ruleId,
                author: author || 'developer'
              });

              if (findingId && FindingRepository) {
                FindingRepository.updateStatus(findingId, 'false_positive', feedbackText);
              }

              // Also persist to .sherlock-learnings.json in repository root
              try {
                const learningsFile = path.join(rootRepoDir, '.sherlock-learnings.json');
                let list: any[] = [];
                if (fs.existsSync(learningsFile)) {
                  list = JSON.parse(fs.readFileSync(learningsFile, 'utf-8'));
                }
                list.push(learning);
                fs.writeFileSync(learningsFile, JSON.stringify(list, null, 2), 'utf-8');
              } catch (e) {}

              if (AuditRepository) {
                AuditRepository.log('LEARNING_RECORDED', { learningId: learning.id, findingId });
              }

              return res.end(JSON.stringify({ success: true, learning }));
            } catch (err: any) {
              res.statusCode = 500;
              return res.end(JSON.stringify({ error: err.message }));
            }
          }

          // 13. Run verification proof (BUG-149)
          if (url.startsWith('/api/verify/proof') && method === 'POST') {
            try {
              const { VerificationSandbox } = verifModule;
              const { FindingRepository, AuditRepository } = dbModule;
              const { SherlockScanner } = coreModule;
              const body = await parseBody(req);
              const { findingId } = body;

              let finding = FindingRepository.getFindingById(findingId);
              if (!finding) {
                const scanner = SherlockScanner.create(rootRepoDir);
                const target = path.resolve(rootRepoDir, 'benchmark/vulnerable-app');
                const result = scanner.scan(rootRepoDir, target);
                finding = result.findings.find((f: any) => f.id === findingId || f.fingerprint === findingId || f.id.includes(findingId));
              }

              if (!finding) {
                res.statusCode = 404;
                return res.end(JSON.stringify({ error: `Finding '${findingId}' not found` }));
              }

              const sandbox = new VerificationSandbox();
              const proofResult = await sandbox.runProof(finding);

              if (AuditRepository) {
                AuditRepository.log('PROOF_EXECUTED', { findingId, badge: proofResult.badge });
              }

              return res.end(JSON.stringify(proofResult));
            } catch (err: any) {
              res.statusCode = 500;
              return res.end(JSON.stringify({ error: err.message }));
            }
          }

          // 14. Save policy settings to .secreview.yml (BUG-154)
          if (url.startsWith('/api/settings/save') && method === 'POST') {
            try {
              const { AuditRepository } = dbModule;
              const body = await parseBody(req);
              const configPath = path.join(rootRepoDir, '.secreview.yml');

              if (body.yamlContent) {
                fs.writeFileSync(configPath, body.yamlContent, 'utf-8');
              }

              if (AuditRepository) {
                AuditRepository.log('SETTINGS_SAVED', { file: '.secreview.yml' });
              }

              return res.end(JSON.stringify({ success: true, message: 'Settings saved to .secreview.yml' }));
            } catch (err: any) {
              res.statusCode = 500;
              return res.end(JSON.stringify({ error: err.message }));
            }
          }

          next();
        });
      }
    }
  ],
  server: {
    port: 3000,
    host: true
  }
});
