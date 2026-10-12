import { Router } from 'express';

const router = Router();

// Vulnerability 5: SSRF
router.get('/proxy', async (req, res) => {
  const targetUrl = req.query.url as string;
  // Unvalidated outbound HTTP request
  const response = await fetch(targetUrl);
  const data = await response.text();
  res.send(data);
});

export default router;
