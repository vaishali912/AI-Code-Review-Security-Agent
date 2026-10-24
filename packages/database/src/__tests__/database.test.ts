import test from 'node:test';
import assert from 'node:assert/strict';
import { getDb, closeDb } from '../db.js';
import { UserRepository } from '../repositories/userRepo.js';
import { FindingRepository } from '../repositories/findingRepo.js';
import { LearningRepository } from '../repositories/learningRepo.js';

// Use in-memory database for isolated test
process.env.DATABASE_PATH = ':memory:';

test('Database - User Registration & Password Verification', () => {
  const user = UserRepository.createUser({
    email: 'dev@example.com',
    name: 'Alice Security',
    password: 'SuperSecretPassword123!',
    role: 'admin'
  });

  assert.ok(user.id.startsWith('usr_'));
  assert.equal(user.email, 'dev@example.com');
  assert.equal(user.role, 'admin');

  // Verify correct password
  assert.ok(UserRepository.verifyPassword('SuperSecretPassword123!', user.password_hash!, user.password_salt!));
  // Verify wrong password fails
  assert.equal(UserRepository.verifyPassword('WrongPassword', user.password_hash!, user.password_salt!), false);
});

test('Database - Google OAuth Upsert & Linking', () => {
  const googleUser = UserRepository.upsertGoogleUser({
    email: 'google-dev@gmail.com',
    name: 'Google Engineer',
    avatarUrl: 'https://lh3.googleusercontent.com/avatar',
    googleId: 'google_oauth_sub_987654321'
  });

  assert.equal(googleUser.email, 'google-dev@gmail.com');
  assert.equal(googleUser.provider, 'google');
  assert.equal(googleUser.provider_id, 'google_oauth_sub_987654321');

  // Upserting again should link existing user without creating duplicate
  const reloaded = UserRepository.upsertGoogleUser({
    email: 'google-dev@gmail.com',
    name: 'Google Engineer Updated',
    googleId: 'google_oauth_sub_987654321'
  });

  assert.equal(reloaded.id, googleUser.id);
});

test('Database - Session Creation, Verification & Revocation', () => {
  const user = UserRepository.createUser({
    email: 'session-test@example.com',
    name: 'Session Tester',
    password: 'Password123!'
  });

  const session = UserRepository.createSession(user.id);
  assert.ok(session.token.startsWith('shk_sess_'));

  const valid = UserRepository.getSession(session.token);
  assert.ok(valid !== null);
  assert.equal(valid.user.email, 'session-test@example.com');

  // Revoke session
  UserRepository.deleteSession(session.token);
  assert.equal(UserRepository.getSession(session.token), null);
});

test('Database - Finding Persistence and Deduplication', () => {
  const sampleFinding = {
    id: 'fnd_test_sqli_01',
    fingerprint: 'fp_sha256_mock_01',
    rule_id: 'sherlock.sqli.unparameterized',
    title: 'SQL Injection in GET /test',
    cwe: ['CWE-89'],
    owasp: 'A03:2021',
    severity: 'high',
    confidence: 0.95,
    location: { file: 'src/test.ts', startLine: 10, endLine: 10 },
    dataflow: [],
    fix: { description: 'Parameterize query', patch: '' }
  };

  FindingRepository.saveFindings([sampleFinding]);

  const fetched = FindingRepository.getFindingById('fnd_test_sqli_01');
  assert.ok(fetched !== null);
  assert.equal(fetched.title, 'SQL Injection in GET /test');

  // Update status
  FindingRepository.updateStatus(fetched.id, 'fixed', 'Applied parameterized patch');
  const updated = FindingRepository.getFindingById('fnd_test_sqli_01');
  assert.equal(updated?.status, 'fixed');
  assert.equal(updated?.triage_reason, 'Applied parameterized patch');
});

test('Database - Learning Feedback Persistence', () => {
  const item = LearningRepository.addLearning({
    targetPath: 'src/gateway.ts',
    feedbackText: 'Sanitized in database gateway WAF',
    author: 'tech-lead'
  });

  assert.ok(item.id.startsWith('lrn_'));
  const learnings = LearningRepository.getLearnings('src/gateway.ts');
  assert.ok(learnings.some(l => l.feedback_text.includes('Sanitized in database gateway')));
});
