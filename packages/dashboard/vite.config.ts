import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootRepoDir = path.resolve(__dirname, '../..');

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'sherlock-live-api',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          const url = req.url || '';

          if (url.startsWith('/api/status')) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              status: 'online',
              version: '1.0.0',
              engines: ['ReviewEngine', 'SecurityEngine', 'VerificationEngine', 'MCPServer'],
              activePort: 3002
            }));
            return;
          }

          if (url.startsWith('/api/scan')) {
            try {
              const corePath = path.resolve(rootRepoDir, 'packages/core/dist/index.js');
              const { SherlockScanner } = await import(`file://${corePath.replace(/\\/g, '/')}`);
              const target = path.resolve(rootRepoDir, 'benchmark/vulnerable-app');
              const scanner = SherlockScanner.create(rootRepoDir);
              const result = scanner.scan(rootRepoDir, target);

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            }
            return;
          }

          next();
        });
      }
    }
  ],
  server: {
    port: 3002,
    host: true
  }
});
