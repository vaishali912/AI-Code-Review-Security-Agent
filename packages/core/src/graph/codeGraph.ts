import * as ts from 'typescript';
import * as path from 'path';
import * as fs from 'fs';

export interface RouteEndpoint {
  method: string;
  path: string;
  file: string;
  line: number;
  framework: 'express' | 'nextjs-app-router' | 'nextjs-server-action' | 'fastify' | 'trpc' | 'generic';
  handlerName?: string;
  middleware: string[];
  hasAuthGuard: boolean;
  isInternetFacing: boolean;
}

export interface SymbolDef {
  name: string;
  file: string;
  line: number;
  kind: 'function' | 'variable' | 'class' | 'interface' | 'import';
  exported: boolean;
}

export interface CallSite {
  callerFile: string;
  callerFunction?: string;
  calleeName: string;
  line: number;
  argumentsText: string[];
}

export interface FileAST {
  filePath: string;
  sourceFile: ts.SourceFile;
  content: string;
  routes: RouteEndpoint[];
  symbols: Map<string, SymbolDef>;
  callSites: CallSite[];
  imports: Map<string, string>; // importedName -> moduleSpecifier
}

export class CodeGraph {
  public files: Map<string, FileAST> = new Map();
  public routes: RouteEndpoint[] = [];
  public rootDir: string;

  constructor(rootDir: string) {
    this.rootDir = rootDir;
  }

  public addFile(filePath: string, content: string): FileAST {
    const ext = path.extname(filePath).toLowerCase();
    const isJsx = ext === '.tsx' || ext === '.jsx';
    const scriptKind = ext === '.tsx' 
      ? ts.ScriptKind.TSX 
      : ext === '.jsx' 
        ? ts.ScriptKind.JSX 
        : ext === '.ts' 
          ? ts.ScriptKind.TS 
          : ts.ScriptKind.JS;

    const sourceFile = ts.createSourceFile(
      filePath,
      content,
      ts.ScriptTarget.Latest,
      true,
      scriptKind
    );

    const routes: RouteEndpoint[] = [];
    const symbols = new Map<string, SymbolDef>();
    const callSites: CallSite[] = [];
    const imports = new Map<string, string>();

    let currentFunction: string | undefined;

    const isNextRouteFile = /app[\\/].*[\\/]route\.(ts|js)$/.test(filePath);
    const hasUseServer = content.includes("'use server'") || content.includes('"use server"');

    const visit = (node: ts.Node) => {
      // 1. Collect imports
      if (ts.isImportDeclaration(node)) {
        const moduleSpecifier = (node.moduleSpecifier as ts.StringLiteral).text;
        if (node.importClause) {
          if (node.importClause.name) {
            imports.set(node.importClause.name.text, moduleSpecifier);
          }
          if (node.importClause.namedBindings && ts.isNamedImports(node.importClause.namedBindings)) {
            for (const elem of node.importClause.namedBindings.elements) {
              imports.set(elem.name.text, moduleSpecifier);
            }
          }
        }
      }

      // 2. Collect symbols
      if (ts.isFunctionDeclaration(node) && node.name) {
        const line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
        const name = node.name.text;
        const exported = !!node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword);
        symbols.set(name, { name, file: filePath, line, kind: 'function', exported });

        // Check Next.js App Router HTTP handlers: GET, POST, PUT, DELETE, PATCH
        if (isNextRouteFile && exported && ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(name.toUpperCase())) {
          const authKeywords = ['auth', 'session', 'getserverSession', 'currentuser', 'verifytoken'];
          const bodyText = node.body ? node.body.getText(sourceFile).toLowerCase() : '';
          const hasAuth = authKeywords.some(kw => bodyText.includes(kw));

          routes.push({
            method: name.toUpperCase(),
            path: this.inferNextAppPath(filePath),
            file: filePath,
            line,
            framework: 'nextjs-app-router',
            handlerName: name,
            middleware: [],
            hasAuthGuard: hasAuth,
            isInternetFacing: true
          });
        }

        // Check Next.js Server Actions
        if (hasUseServer && exported) {
          const bodyText = node.body ? node.body.getText(sourceFile).toLowerCase() : '';
          const hasAuth = ['auth', 'session', 'getserverSession', 'requireuser'].some(kw => bodyText.includes(kw));
          routes.push({
            method: 'POST (Server Action)',
            path: `action://${name}`,
            file: filePath,
            line,
            framework: 'nextjs-server-action',
            handlerName: name,
            middleware: [],
            hasAuthGuard: hasAuth,
            isInternetFacing: true
          });
        }

        const prevFunc = currentFunction;
        currentFunction = name;
        ts.forEachChild(node, visit);
        currentFunction = prevFunc;
        return;
      }

      // Support variable statements (export const GET = async () => ..., export const myAction = async () => ...)
      if (ts.isVariableStatement(node)) {
        const exported = !!node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword);
        for (const decl of node.declarationList.declarations) {
          if (ts.isIdentifier(decl.name) && decl.initializer && (ts.isArrowFunction(decl.initializer) || ts.isFunctionExpression(decl.initializer))) {
            const name = decl.name.text;
            const line = sourceFile.getLineAndCharacterOfPosition(decl.getStart()).line + 1;
            symbols.set(name, { name, file: filePath, line, kind: 'function', exported });

            if (isNextRouteFile && exported && ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(name.toUpperCase())) {
              const authKeywords = ['auth', 'session', 'getserversession', 'currentuser', 'verifytoken'];
              const bodyText = decl.initializer.body ? decl.initializer.body.getText(sourceFile).toLowerCase() : '';
              const hasAuth = authKeywords.some(kw => bodyText.includes(kw));

              routes.push({
                method: name.toUpperCase(),
                path: this.inferNextAppPath(filePath),
                file: filePath,
                line,
                framework: 'nextjs-app-router',
                handlerName: name,
                middleware: [],
                hasAuthGuard: hasAuth,
                isInternetFacing: true
              });
            }

            if (hasUseServer && exported) {
              const bodyText = decl.initializer.body ? decl.initializer.body.getText(sourceFile).toLowerCase() : '';
              const hasAuth = ['auth', 'session', 'getserversession', 'requireuser'].some(kw => bodyText.includes(kw));
              routes.push({
                method: 'POST (Server Action)',
                path: `action://${name}`,
                file: filePath,
                line,
                framework: 'nextjs-server-action',
                handlerName: name,
                middleware: [],
                hasAuthGuard: hasAuth,
                isInternetFacing: true
              });
            }
          }
        }
      }

      // 3. Collect call expressions (Express routes, app.use, db.query, etc.)
      if (ts.isCallExpression(node)) {
        const line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
        const expr = node.expression;
        const exprText = expr.getText(sourceFile);

        callSites.push({
          callerFile: filePath,
          callerFunction: currentFunction,
          calleeName: exprText,
          line,
          argumentsText: node.arguments.map(arg => arg.getText(sourceFile))
        });

        // Express / Fastify route detection: app.get('/path', ...), router.post('/path', ...)
        const routeMatch = exprText.match(/(?:app|router|server)\.(get|post|put|delete|patch|all)/i);
        if (routeMatch && node.arguments.length >= 2) {
          const method = routeMatch[1].toUpperCase();
          const firstArg = node.arguments[0];
          let routePath = '/';
          if (ts.isStringLiteral(firstArg) || ts.isNoSubstitutionTemplateLiteral(firstArg)) {
            routePath = firstArg.text;
          }

          const middleware: string[] = [];
          for (let i = 1; i < node.arguments.length - 1; i++) {
            middleware.push(node.arguments[i].getText(sourceFile));
          }

          const authPattern = /auth|protect|verify|requireUser|isAuthenticated|jwt|guard|admin/i;
          const hasAuth = middleware.some(m => authPattern.test(m)) ||
            (node.arguments[node.arguments.length - 1].getText(sourceFile).match(authPattern) !== null);

          routes.push({
            method,
            path: routePath,
            file: filePath,
            line,
            framework: 'express',
            middleware,
            hasAuthGuard: hasAuth,
            isInternetFacing: !routePath.startsWith('/internal') && !routePath.startsWith('/admin')
          });
        }
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);

    const fileAST: FileAST = {
      filePath,
      sourceFile,
      content,
      routes,
      symbols,
      callSites,
      imports
    };

    this.files.set(filePath, fileAST);
    // Remove stale routes for this file before appending to prevent duplicate accumulation
    this.routes = this.routes.filter(r => r.file !== filePath);
    this.routes.push(...routes);
    return fileAST;
  }

  private inferNextAppPath(filePath: string): string {
    const rel = path.relative(this.rootDir, filePath).replace(/\\/g, '/');
    const match = rel.match(/(?:src\/)?app\/(.*?)\/route\.(ts|js)$/);
    if (match) {
      // Strip route groups like (dashboard) or (auth)
      const cleanPath = match[1].replace(/\/\(.*?\)/g, '').replace(/^\(.*?\)\//, '');
      return '/' + cleanPath.replace(/\[(.*?)\]/g, ':$1');
    }
    return '/api';
  }

  public getRouteForLine(filePath: string, line: number): RouteEndpoint | undefined {
    // Check if line falls inside a known route or file
    const fileRoutes = this.routes.filter(r => r.file === filePath);
    if (fileRoutes.length === 1) return fileRoutes[0];
    // Find closest route definition above line
    const priorRoutes = fileRoutes.filter(r => r.line <= line).sort((a, b) => b.line - a.line);
    return priorRoutes[0] || fileRoutes[0];
  }
}
