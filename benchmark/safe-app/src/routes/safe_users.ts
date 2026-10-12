import { Router } from 'express';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();
declare const db: any;
declare const requireAuth: any;

// Safe 1: Parameterized SQL query
router.get('/safe-users', async (req, res) => {
  const userId = req.query.id;
  // Parameterized with $1 placeholder
  const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
  res.json(result);
});

// Safe 2: Sanitized with parseInt
router.get('/safe-profile', async (req, res) => {
  const numericId = parseInt(req.query.id as string, 10);
  const result = await db.query(`SELECT * FROM users WHERE id = ${numericId}`);
  res.json(result);
});

// Safe 3: Mutating endpoint protected with authentication guard
router.delete('/safe-users/:id', requireAuth, async (req, res) => {
  const targetId = req.params.id;
  await db.query('DELETE FROM users WHERE id = $1', [targetId]);
  res.json({ success: true });
});

// Safe 4: File path sanitized with path.basename
router.get('/safe-download', (req, res) => {
  const safeFilename = path.basename(req.query.filename as string);
  fs.readFile(path.join('/app/uploads', safeFilename), 'utf-8', (err, data) => {
    if (err) return res.status(404).send('Not found');
    res.send(data);
  });
});

export default router;
