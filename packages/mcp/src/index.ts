#!/usr/bin/env node
import { SherlockMCPServer, SHERLOCK_MCP_TOOLS } from './server.js';

export { SherlockMCPServer, SHERLOCK_MCP_TOOLS };

// If executed directly as a script
if (process.argv[1]?.endsWith('mcp/dist/index.js') || process.argv[1]?.endsWith('sherlock-mcp')) {
  const server = new SherlockMCPServer();
  server.startStdioServer();
}
