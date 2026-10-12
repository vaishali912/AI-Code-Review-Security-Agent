import { Router } from 'express';

const router = Router();
declare const db: any;

// Vulnerability 1: SQL Injection in GET /users
router.get('/users', async (req, res) => {
  const userId = req.query.id;
  // Dangerous string interpolation into database query
  const result = await db.query(`SELECT * FROM users WHERE id = '${userId}'`);
  res.json(result);
});

// Vulnerability 2: Missing auth guard on mutating endpoint
router.delete('/users/:id', async (req, res) => {
  const targetId = req.params.id;
  await db.query(`DELETE FROM users WHERE id = '${targetId}'`);
  res.json({ success: true });
});

export default router;
