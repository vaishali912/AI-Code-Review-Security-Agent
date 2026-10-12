import { Router } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';

const router = Router();

// Vulnerability 3: Path Traversal
router.get('/download', (req, res) => {
  const filename = req.query.filename as string;
  // Unsanitized filename passed into fs.readFile
  fs.readFile(path.join('/app/uploads', filename), 'utf-8', (err, data) => {
    if (err) return res.status(404).send('File not found');
    res.send(data);
  });
});

// Vulnerability 4: Command Injection
router.post('/convert', (req, res) => {
  const format = req.body.format;
  // Unquoted user input in shell execution
  exec(`convert-tool --format ${format} input.png`, (err, stdout) => {
    if (err) return res.status(500).send('Error');
    res.send(stdout);
  });
});

export default router;
