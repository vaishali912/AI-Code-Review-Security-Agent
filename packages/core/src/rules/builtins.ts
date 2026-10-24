import * as ts from 'typescript';
import { SecurityRule, CandidateFinding } from './types.js';
import { FileAST, CodeGraph } from '../graph/codeGraph.js';

export const BUILTIN_RULES: SecurityRule[] = [
  // 1. SQL Injection (CWE-89)
  {
    id: 'sherlock.sqli.unparameterized',
    title: 'SQL injection via unparameterized query',
    cwe: ['CWE-89'],
    owasp: 'A03:2021',
    severity: 'high',
    lane: 'security',
    description: 'Dynamic user input formatted directly into SQL query without parameterization.',
    check: (fileAST: FileAST, codeGraph: CodeGraph): CandidateFinding[] => {
      const findings: CandidateFinding[] = [];
      const { sourceFile, filePath, content } = fileAST;

      const visit = (node: ts.Node) => {
        if (ts.isCallExpression(node)) {
          const callText = node.expression.getText(sourceFile);
          // Check for db query, but exclude safe prisma.$queryRaw tagged templates (not $queryRawUnsafe)
          const isDbQuery = /(?:db|pool|client|connection|prisma|sequelize|knex)\.(?:query|\$queryRawUnsafe|raw|execute)/i.test(callText);
          const isSafePrisma = /prisma\.\$queryRaw$/i.test(callText);

          if (isDbQuery && !isSafePrisma && node.arguments.length > 0) {
            const firstArg = node.arguments[0];
            const argText = firstArg.getText(sourceFile);
            const line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;

            // If knex.raw has bindings passed as second argument, it is safe parameterization
            const hasExplicitBindings = node.arguments.length > 1;
            if (hasExplicitBindings && /knex\.raw/i.test(callText)) {
              // Knex safe parameterization
              return;
            }

            // Check if template literal with expressions or binary expression concatenation
            const isTemplateWithExpr = ts.isTemplateExpression(firstArg) && firstArg.templateSpans.length > 0;
            const isConcat = ts.isBinaryExpression(firstArg) && firstArg.operatorToken.kind === ts.SyntaxKind.PlusToken;

            if (isTemplateWithExpr || isConcat) {
              const route = codeGraph.getRouteForLine(filePath, line);
              const paramMatch = argText.match(/(?:req\.(?:query|params|body)|id|input|search|user_id)/);
              const sourceVar = paramMatch ? paramMatch[0] : 'req.query.id';

              const sourceLine = Math.max(1, line - 4);
              findings.push({
                ruleId: 'sherlock.sqli.unparameterized',
                title: `SQL injection in ${route ? `${route.method} ${route.path}` : pathBasename(filePath)}`,
                cwe: ['CWE-89'],
                owasp: 'A03:2021',
                severity: 'high',
                lane: 'security',
                file: filePath,
                startLine: line,
                endLine: line,
                dataflow: [
                  { role: 'source', file: filePath, line: sourceLine, snippet: sourceVar, description: 'Untrusted user input entry point' },
                  { role: 'propagator', file: filePath, line: Math.max(sourceLine, line - 1), snippet: `${sourceVar} flows unescaped` },
                  { role: 'sink', file: filePath, line, snippet: firstArg.getText(sourceFile), description: 'Unparameterized SQL query execution' }
                ],
                sinkSnippet: firstArg.getText(sourceFile),
                sourceSnippet: sourceVar,
                explanation: `Untrusted user input from ${sourceVar} is concatenated into an SQL statement via ${callText}(...). An attacker can inject SQL control characters (such as ' OR '1'='1) to alter query logic, bypass authentication, or exfiltrate database records.`,
                evidence: [`${filePath}:${line}`],
                fixDescription: 'Replace string concatenation with parameterized SQL query placeholder ($1 or ?).',
                suggestedPatch: `--- a/${filePath}\n+++ b/${filePath}\n@@ -${line},1 +${line},1 @@\n-${callText}(${argText})\n+${callText}('SELECT * FROM items WHERE id = $1', [${sourceVar}])`,
                exposure: route?.isInternetFacing ? 'internet-facing' : 'authenticated',
                confidence: 0.94
              });
            }
          }
        }
        ts.forEachChild(node, visit);
      };

      visit(sourceFile);
      return findings;
    }
  },

  // 2. Command Injection (CWE-78)
  {
    id: 'sherlock.cmd.injection',
    title: 'Command injection via untrusted execution',
    cwe: ['CWE-78'],
    owasp: 'A03:2021',
    severity: 'critical',
    lane: 'security',
    description: 'User input passed directly to child_process exec or execSync.',
    check: (fileAST: FileAST, codeGraph: CodeGraph): CandidateFinding[] => {
      const findings: CandidateFinding[] = [];
      const { sourceFile, filePath } = fileAST;

      const visit = (node: ts.Node) => {
        if (ts.isCallExpression(node)) {
          const callText = node.expression.getText(sourceFile);
          if (/(?:child_process\.)?(?:exec|execSync)/.test(callText) && node.arguments.length > 0) {
            const firstArg = node.arguments[0];
            const isTemplate = ts.isTemplateExpression(firstArg) && firstArg.templateSpans.length > 0;
            const isConcat = ts.isBinaryExpression(firstArg) && firstArg.operatorToken.kind === ts.SyntaxKind.PlusToken;

            if (isTemplate || isConcat) {
              const line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
              const route = codeGraph.getRouteForLine(filePath, line);
              findings.push({
                ruleId: 'sherlock.cmd.injection',
                title: 'OS Command injection via unescaped shell execution',
                cwe: ['CWE-78'],
                owasp: 'A03:2021',
                severity: 'critical',
                lane: 'security',
                file: filePath,
                startLine: line,
                endLine: line,
                dataflow: [
                  { role: 'source', file: filePath, line: Math.max(1, line - 3), snippet: 'req.body.cmd / input' },
                  { role: 'sink', file: filePath, line, snippet: firstArg.getText(sourceFile), description: 'Shell execution call' }
                ],
                sinkSnippet: firstArg.getText(sourceFile),
                explanation: 'User input is interpolated into an operating system command shell. An attacker can supply shell metacharacters (e.g. `; rm -rf /` or `| curl evil.com`) to execute arbitrary commands on the server.',
                evidence: [`${filePath}:${line}`],
                fixDescription: 'Use child_process.execFile or spawn with argument arrays rather than shell execution.',
                suggestedPatch: `--- a/${filePath}\n+++ b/${filePath}\n@@ -${line},1 +${line},1 @@\n-${callText}(${firstArg.getText(sourceFile)})\n+execFile('command', [arg], (err, stdout) => { ... })`,
                exposure: route?.isInternetFacing ? 'internet-facing' : 'authenticated',
                confidence: 0.96
              });
            }
          }
        }
        ts.forEachChild(node, visit);
      };

      visit(sourceFile);
      return findings;
    }
  },

  // 3. Cross-Site Scripting (XSS) (CWE-79)
  {
    id: 'sherlock.xss.dangerouslysetinnerhtml',
    title: 'Cross-Site Scripting (XSS) via dangerouslySetInnerHTML',
    cwe: ['CWE-79'],
    owasp: 'A03:2021',
    severity: 'high',
    lane: 'security',
    description: 'React dangerouslySetInnerHTML rendered without sanitization.',
    check: (fileAST: FileAST, codeGraph: CodeGraph): CandidateFinding[] => {
      const findings: CandidateFinding[] = [];
      const { sourceFile, filePath } = fileAST;

      const visit = (node: ts.Node) => {
        if (ts.isJsxAttribute(node) && node.name.getText(sourceFile) === 'dangerouslySetInnerHTML') {
          const line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
          const attrVal = node.initializer ? node.initializer.getText(sourceFile) : '';
          const isSanitized = /(?:DOMPurify\.sanitize|\b(?:sanitizeHtml|escapeHtml)\b)/i.test(attrVal) && !/unsanitized|noSanitize|rawHtml/i.test(attrVal);
          if (!isSanitized) {
            findings.push({
              ruleId: 'sherlock.xss.dangerouslysetinnerhtml',
              title: 'DOM XSS via unpurified dangerouslySetInnerHTML',
              cwe: ['CWE-79'],
              owasp: 'A03:2021',
              severity: 'high',
              lane: 'security',
              file: filePath,
              startLine: line,
              endLine: line,
              dataflow: [
                { role: 'source', file: filePath, line: Math.max(1, line - 2), snippet: 'props / state HTML payload' },
                { role: 'sink', file: filePath, line, snippet: attrVal, description: 'Direct DOM injection sink' }
              ],
              sinkSnippet: attrVal,
              explanation: 'Rendering unescaped HTML content in React via dangerouslySetInnerHTML allows attackers to inject malicious script tags, leading to session hijacking or credential theft.',
              evidence: [`${filePath}:${line}`],
              fixDescription: 'Sanitize the HTML payload using DOMPurify.sanitize() before setting dangerouslySetInnerHTML.',
              suggestedPatch: `--- a/${filePath}\n+++ b/${filePath}\n@@ -${line},1 +${line},1 @@\n-${attrVal}\n+{{ __html: DOMPurify.sanitize(content) }}`,
              exposure: 'internet-facing',
              confidence: 0.92
            });
          }
        }
        ts.forEachChild(node, visit);
      };

      visit(sourceFile);
      return findings;
    }
  },

  // 4. Server-Side Request Forgery (SSRF) (CWE-918)
  {
    id: 'sherlock.ssrf.fetch',
    title: 'Server-Side Request Forgery (SSRF) in HTTP client',
    cwe: ['CWE-918'],
    owasp: 'A10:2021',
    severity: 'high',
    lane: 'security',
    description: 'Untrusted user input passed as URL to fetch, axios, or http.get.',
    check: (fileAST: FileAST, codeGraph: CodeGraph): CandidateFinding[] => {
      const findings: CandidateFinding[] = [];
      const { sourceFile, filePath } = fileAST;

      const visit = (node: ts.Node) => {
        if (ts.isCallExpression(node)) {
          const callText = node.expression.getText(sourceFile);
          if (/(?:^|\.)(?:fetch|axios\.get|axios\.post|http\.get|https\.get)$/.test(callText) && node.arguments.length > 0) {
            const firstArg = node.arguments[0];
            const argText = firstArg.getText(sourceFile);
            const line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;

            if (/(?:req\.(?:query|body|params)|url|targetUrl|endpoint)/i.test(argText) && !/allowlist|whitelist|ALLOWED_HOSTS/i.test(argText)) {
              findings.push({
                ruleId: 'sherlock.ssrf.fetch',
                title: 'Potential SSRF via unvalidated outbound HTTP request',
                cwe: ['CWE-918'],
                owasp: 'A10:2021',
                severity: 'high',
                lane: 'security',
                file: filePath,
                startLine: line,
                endLine: line,
                dataflow: [
                  { role: 'source', file: filePath, line: Math.max(1, line - 3), snippet: 'req.query.url' },
                  { role: 'sink', file: filePath, line, snippet: `${callText}(${argText})` }
                ],
                sinkSnippet: argText,
                explanation: 'A server-side HTTP request is initiated with a destination URL supplied or influenced by an untrusted user. An attacker can target internal network services (e.g. AWS metadata endpoint http://169.254.169.254 or internal microservices).',
                evidence: [`${filePath}:${line}`],
                fixDescription: 'Validate destination URLs against a strict domain/IP allowlist and block private CIDR ranges.',
                suggestedPatch: `--- a/${filePath}\n+++ b/${filePath}\n@@ -${line},1 +${line},1 @@\n-${callText}(${argText})\n+if (!isAllowedUrl(${argText})) throw new Error('Forbidden host');\n+${callText}(${argText})`,
                exposure: 'internet-facing',
                confidence: 0.89
              });
            }
          }
        }
        ts.forEachChild(node, visit);
      };

      visit(sourceFile);
      return findings;
    }
  },

  // 5. Path Traversal (CWE-22)
  {
    id: 'sherlock.pathtraversal.fs',
    title: 'Path traversal via unsanitized file path',
    cwe: ['CWE-22'],
    owasp: 'A01:2021',
    severity: 'high',
    lane: 'security',
    description: 'User-provided file name or path passed to fs filesystem methods without normalization / bounds check.',
    check: (fileAST: FileAST, codeGraph: CodeGraph): CandidateFinding[] => {
      const findings: CandidateFinding[] = [];
      const { sourceFile, filePath } = fileAST;

      const visit = (node: ts.Node) => {
        if (ts.isCallExpression(node)) {
          const callText = node.expression.getText(sourceFile);
          if (/(?:fs|fs\/promises)\.(?:readFile|readFileSync|createReadStream|unlink|writeFile)/.test(callText) && node.arguments.length > 0) {
            const firstArg = node.arguments[0];
            const argText = firstArg.getText(sourceFile);
            const line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;

            if (/(?:req\.(?:query|params|body)|filename|filePath|path)/i.test(argText) && !/path\.resolve.*startsWith|path\.basename/i.test(argText)) {
              findings.push({
                ruleId: 'sherlock.pathtraversal.fs',
                title: 'Path traversal in filesystem access',
                cwe: ['CWE-22'],
                owasp: 'A01:2021',
                severity: 'high',
                lane: 'security',
                file: filePath,
                startLine: line,
                endLine: line,
                dataflow: [
                  { role: 'source', file: filePath, line: Math.max(1, line - 2), snippet: 'req.query.filename' },
                  { role: 'sink', file: filePath, line, snippet: `${callText}(${argText})` }
                ],
                sinkSnippet: argText,
                explanation: 'A file system call accesses a path incorporating user input without checking for dot-dot-slash ("../") sequences. An attacker can escape the designated directory and read sensitive system files (e.g. /etc/passwd or .env).',
                evidence: [`${filePath}:${line}`],
                fixDescription: 'Use path.basename() or verify that path.resolve() stays within the intended base directory.',
                suggestedPatch: `--- a/${filePath}\n+++ b/${filePath}\n@@ -${line},1 +${line},1 @@\n-${callText}(${argText})\n+const safeName = path.basename(${argText});\n+${callText}(path.join(SAFE_DIR, safeName))`,
                exposure: 'internet-facing',
                confidence: 0.91
              });
            }
          }
        }
        ts.forEachChild(node, visit);
      };

      visit(sourceFile);
      return findings;
    }
  },

  // 6. Broken Access Control & IDOR (CWE-862, CWE-639)
  {
    id: 'sherlock.authz.missing_guard',
    title: 'Missing authentication/authorization check on sensitive endpoint',
    cwe: ['CWE-862', 'CWE-639'],
    owasp: 'A01:2021',
    severity: 'critical',
    lane: 'security',
    description: 'API endpoint, Next.js route handler, or server action performing database mutation without user session or permission check.',
    check: (fileAST: FileAST, codeGraph: CodeGraph): CandidateFinding[] => {
      const findings: CandidateFinding[] = [];
      const { routes, filePath, content } = fileAST;

      for (const route of routes) {
        // Look for sensitive mutating actions (DELETE, POST, PUT, Server Actions)
        const isMutating = ['POST', 'PUT', 'DELETE', 'POST (Server Action)'].includes(route.method);
        const isSensitivePath = /(?:user|admin|account|order|payment|invoice|delete|update|role)/i.test(route.path);

        if (isMutating && isSensitivePath && !route.hasAuthGuard) {
          findings.push({
            ruleId: 'sherlock.authz.missing_guard',
            title: `Missing authorization guard on ${route.method} ${route.path}`,
            cwe: ['CWE-862', 'CWE-639'],
            owasp: 'A01:2021',
            severity: 'critical',
            lane: 'security',
            file: filePath,
            startLine: route.line,
            endLine: route.line,
            dataflow: [
              { role: 'source', file: filePath, line: route.line, snippet: `${route.method} ${route.path}`, description: 'Public endpoint entry point' },
              { role: 'sink', file: filePath, line: route.line, snippet: route.handlerName || 'route handler', description: 'Action executed without session validation' }
            ],
            sinkSnippet: `${route.method} ${route.path}`,
            explanation: `The mutating route ${route.path} lacks an authentication or authorization middleware guard. Unauthenticated clients can trigger this operation, leading to Broken Access Control (OWASP A01).`,
            evidence: [`${filePath}:${route.line}`],
            fixDescription: 'Add authentication middleware (e.g. requireAuth or getServerSession) before the handler.',
            suggestedPatch: `--- a/${filePath}\n+++ b/${filePath}\n@@ -${route.line},1 +${route.line},1 @@\n-router.${route.method.toLowerCase()}('${route.path}', handler)\n+router.${route.method.toLowerCase()}('${route.path}', requireAuth, handler)`,
            exposure: 'internet-facing',
            confidence: 0.93
          });
        }
      }

      return findings;
    }
  },

  // 7. Insecure JWT Handling (CWE-287, CWE-347)
  {
    id: 'sherlock.jwt.unverified_decode',
    title: 'Insecure JWT handling: decode without cryptographic verification',
    cwe: ['CWE-287', 'CWE-347'],
    owasp: 'A07:2021',
    severity: 'high',
    lane: 'security',
    description: 'Using jwt.decode() instead of jwt.verify() for authorization decisions.',
    check: (fileAST: FileAST, codeGraph: CodeGraph): CandidateFinding[] => {
      const findings: CandidateFinding[] = [];
      const { sourceFile, filePath } = fileAST;

      const visit = (node: ts.Node) => {
        if (ts.isCallExpression(node)) {
          const callText = node.expression.getText(sourceFile);
          if (callText === 'jwt.decode' || callText === 'jsonwebtoken.decode') {
            const line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
            findings.push({
              ruleId: 'sherlock.jwt.unverified_decode',
              title: 'Unverified JWT token decode in authentication logic',
              cwe: ['CWE-287', 'CWE-347'],
              owasp: 'A07:2021',
              severity: 'high',
              lane: 'security',
              file: filePath,
              startLine: line,
              endLine: line,
              dataflow: [
                { role: 'source', file: filePath, line, snippet: 'token' },
                { role: 'sink', file: filePath, line, snippet: node.getText(sourceFile) }
              ],
              sinkSnippet: node.getText(sourceFile),
              explanation: 'jwt.decode() only parses the payload without verifying the cryptographic signature. An attacker can forge arbitrary claims (such as { "role": "admin" }) without knowing the secret.',
              evidence: [`${filePath}:${line}`],
              fixDescription: 'Replace jwt.decode() with jwt.verify(token, secret, { algorithms: ["HS256"] }).',
              suggestedPatch: `--- a/${filePath}\n+++ b/${filePath}\n@@ -${line},1 +${line},1 @@\n-${node.getText(sourceFile)}\n+jwt.verify(token, process.env.JWT_SECRET!, { algorithms: ['HS256'] })`,
              exposure: 'internet-facing',
              confidence: 0.95
            });
          }
        }
        ts.forEachChild(node, visit);
      };

      visit(sourceFile);
      return findings;
    }
  },

  // 8. Cryptographic Failures & Insecure Randomness (CWE-330, CWE-327)
  {
    id: 'sherlock.crypto.insecure_random',
    title: 'Insecure pseudo-random number generator for security-sensitive token',
    cwe: ['CWE-330', 'CWE-327'],
    owasp: 'A02:2021',
    severity: 'medium',
    lane: 'security',
    description: 'Math.random() used to generate tokens, salts, session IDs, or passwords.',
    check: (fileAST: FileAST, codeGraph: CodeGraph): CandidateFinding[] => {
      const findings: CandidateFinding[] = [];
      const { sourceFile, filePath } = fileAST;

      const visit = (node: ts.Node) => {
        if (ts.isCallExpression(node) && node.expression.getText(sourceFile) === 'Math.random') {
          const line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
          const parent = node.parent;
          const parentText = parent ? parent.getText(sourceFile).toLowerCase() : '';

          if (/(?:token|secret|password|session|nonce|key|id|code|auth)/.test(parentText)) {
            findings.push({
              ruleId: 'sherlock.crypto.insecure_random',
              title: 'Insecure randomness (Math.random) used for security token',
              cwe: ['CWE-330'],
              owasp: 'A02:2021',
              severity: 'medium',
              lane: 'security',
              file: filePath,
              startLine: line,
              endLine: line,
              dataflow: [
                { role: 'sink', file: filePath, line, snippet: parentText.slice(0, 80) }
              ],
              sinkSnippet: 'Math.random()',
              explanation: 'Math.random() is a PRNG with predictable output seeds and cannot be used for cryptographic secrets, reset tokens, or session identifiers.',
              evidence: [`${filePath}:${line}`],
              fixDescription: 'Use crypto.randomBytes() or crypto.randomUUID() from node:crypto.',
              suggestedPatch: `--- a/${filePath}\n+++ b/${filePath}\n@@ -${line},1 +${line},1 @@\n-Math.random().toString(36).substring(2)\n+crypto.randomBytes(32).toString('hex')`,
              exposure: 'internal',
              confidence: 0.88
            });
          }
        }
        ts.forEachChild(node, visit);
      };

      visit(sourceFile);
      return findings;
    }
  },

  // 9. Prototype Pollution (CWE-1321)
  {
    id: 'sherlock.proto.pollution',
    title: 'Prototype pollution via unvalidated object merge/assignment',
    cwe: ['CWE-1321'],
    owasp: 'A03:2021',
    severity: 'high',
    lane: 'security',
    description: 'Merging untrusted user object without filtering __proto__ or constructor.',
    check: (fileAST: FileAST, codeGraph: CodeGraph): CandidateFinding[] => {
      const findings: CandidateFinding[] = [];
      const { sourceFile, filePath } = fileAST;

      const visit = (node: ts.Node) => {
        if (ts.isCallExpression(node)) {
          const callText = node.expression.getText(sourceFile);
          if (callText === 'Object.assign' && node.arguments.length > 1) {
            const secondArgText = node.arguments[1].getText(sourceFile);
            if (/req\.body|data|input/.test(secondArgText)) {
              const line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
              findings.push({
                ruleId: 'sherlock.proto.pollution',
                title: 'Potential prototype pollution via unfiltered Object.assign(target, req.body)',
                cwe: ['CWE-1321'],
                owasp: 'A03:2021',
                severity: 'high',
                lane: 'security',
                file: filePath,
                startLine: line,
                endLine: line,
                dataflow: [
                  { role: 'source', file: filePath, line: Math.max(1, line - 2), snippet: secondArgText },
                  { role: 'sink', file: filePath, line, snippet: `Object.assign(${node.arguments.map(a => a.getText(sourceFile)).join(', ')})` }
                ],
                sinkSnippet: secondArgText,
                explanation: 'Directly assigning request body properties to an object can allow an attacker to inject `__proto__` or `constructor.prototype` properties, corrupting Object.prototype and leading to RCE or auth bypass.',
                evidence: [`${filePath}:${line}`],
                fixDescription: 'Validate keys against a strict schema (e.g. Zod) or use Object.create(null) for dictionary objects.',
                suggestedPatch: `--- a/${filePath}\n+++ b/${filePath}\n@@ -${line},1 +${line},1 @@\n-Object.assign(target, req.body)\n+const validated = schema.parse(req.body);\n+Object.assign(target, validated)`,
                exposure: 'internet-facing',
                confidence: 0.87
              });
            }
          }
        }
        ts.forEachChild(node, visit);
      };

      visit(sourceFile);
      return findings;
    }
  },

  // 10. CORS Misconfiguration (CWE-942)
  {
    id: 'sherlock.cors.permissive_credentials',
    title: 'Permissive CORS configuration with credentials',
    cwe: ['CWE-942'],
    owasp: 'A05:2021',
    severity: 'high',
    lane: 'security',
    description: 'CORS header Access-Control-Allow-Origin: * combined with credentials: true.',
    check: (fileAST: FileAST, codeGraph: CodeGraph): CandidateFinding[] => {
      const findings: CandidateFinding[] = [];
      const { sourceFile, filePath, content } = fileAST;

      if (/cors\(\{/i.test(content) || /res\.header\(['"]Access-Control/i.test(content)) {
        if (/origin:\s*['"]\*['"]/i.test(content) && /credentials:\s*true/i.test(content)) {
          const lines = content.split('\n');
          const line = lines.findIndex(l => /credentials:\s*true/i.test(l)) + 1 || 1;
          findings.push({
            ruleId: 'sherlock.cors.permissive_credentials',
            title: 'Permissive CORS policy: wildcard origin with credentials enabled',
            cwe: ['CWE-942'],
            owasp: 'A05:2021',
            severity: 'high',
            lane: 'security',
            file: filePath,
            startLine: line,
            endLine: line,
            dataflow: [{ role: 'sink', file: filePath, line, snippet: 'cors({ origin: "*", credentials: true })' }],
            sinkSnippet: 'credentials: true',
            explanation: 'Wildcard CORS origin with credentials: true allows arbitrary third-party websites to make authenticated requests on behalf of users, breaking same-origin isolation.',
            evidence: [`${filePath}:${line}`],
            fixDescription: 'Specify an explicit origin domain or validate origin against an allowlist.',
            suggestedPatch: `--- a/${filePath}\n+++ b/${filePath}\n@@ -${line},1 +${line},1 @@\n-origin: '*'\n+origin: process.env.ALLOWED_ORIGIN || 'https://app.example.com'`,
            exposure: 'internet-facing',
            confidence: 0.96
          });
        }
      }

      return findings;
    }
  }
];

function pathBasename(p: string): string {
  const parts = p.replace(/\\/g, '/').split('/');
  return parts[parts.length - 1] || p;
}
