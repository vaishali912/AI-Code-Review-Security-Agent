import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  ArrowRight, 
  Terminal as TerminalIcon, 
  Copy, 
  Check, 
  CheckCircle2, 
  Lock, 
  Cpu, 
  FileCheck, 
  ExternalLink,
  ChevronRight,
  GitPullRequest
} from 'lucide-react';
import { Terminal } from '../../components/ui/Terminal.js';
import { DiffView } from '../../components/ui/DiffView.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { SeverityDot } from '../../components/ui/SeverityDot.js';
import { cn } from '../../lib/utils.js';

export const LandingPage: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Progressive scroll-drawn SVG trace line
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress(Math.min(1, Math.max(0, window.scrollY / totalHeight)));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const copySnippet = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const sampleScanLogs = [
    '$ sherlock scan . --strict',
    '[AST ENGINE] Parsed 24 TypeScript routes in 118ms',
    '[TAINT GRAPH] Identified 100 candidate data-flow paths',
    '[REACHABILITY] Filtering sanitized sinks & test fixtures...',
    '[VERIFICATION] Executing canary payloads in micro-VM...',
    '[RESULT] 100 candidates, 8 shown (92% noise suppressed)',
    '[GATE] 2 critical blockers identified before merge'
  ];

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#0A0A0A] font-sans relative selection:bg-[#0A0A0A] selection:text-[#FFFFFF]">
      {/* Signature Motif: Progressive SVG Trace Line along screen edges */}
      <div 
        className="hidden xl:block fixed left-6 top-16 bottom-0 w-8 pointer-events-none z-10"
        aria-hidden="true"
      >
        <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 32 1000">
          <path
            d="M 16 0 L 16 280 C 16 330 28 350 28 400 L 28 650 C 28 700 8 720 8 780 L 8 1000"
            fill="none"
            stroke="#E6E6E3"
            strokeWidth="1.5"
          />
          <path
            d="M 16 0 L 16 280 C 16 330 28 350 28 400 L 28 650 C 28 700 8 720 8 780 L 8 1000"
            fill="none"
            stroke="#0A0A0A"
            strokeWidth="1.5"
            style={{
              strokeDasharray: 1000,
              strokeDashoffset: 1000 * (1 - scrollProgress),
              transition: 'stroke-dashoffset 150ms ease-out'
            }}
          />
          {/* Node markers */}
          <circle cx="16" cy="40" r="4" fill="#E5A50A" />
          <text x="24" y="43" fill="#8A8A8A" fontSize="9" fontFamily="monospace">source</text>

          <circle cx="28" cy="400" r="4" fill="#3E63DD" />
          <text x="36" y="403" fill="#8A8A8A" fontSize="9" fontFamily="monospace">propagator</text>

          <circle cx="8" cy="780" r="4" fill="#E5484D" />
          <text x="16" y="783" fill="#8A8A8A" fontSize="9" fontFamily="monospace">sink</text>
        </svg>
      </div>

      {/* 1. Sticky Nav: Hairline bottom border, no blur */}
      <nav className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-[#E6E6E3] px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 text-inherit no-underline">
            <span className="w-6 h-6 rounded-[6px] bg-[#0A0A0A] text-[#FFFFFF] flex items-center justify-center font-mono font-bold text-xs">
              S
            </span>
            <span className="font-semibold text-sm tracking-tight text-[#0A0A0A]">
              SHERLOCK
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-xs text-[#5F5F5F] font-medium">
            <a href="#detect" className="hover:text-[#0A0A0A] transition-colors">Product</a>
            <Link to="/app/findings" className="hover:text-[#0A0A0A] transition-colors">Docs</Link>
            <a href="#principles" className="hover:text-[#0A0A0A] transition-colors">Security Principles</a>
            <a href="#integrations" className="hover:text-[#0A0A0A] transition-colors">Integrations</a>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-xs font-medium text-[#5F5F5F] hover:text-[#0A0A0A] px-3 py-1.5 transition-colors hidden sm:block"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="text-xs font-semibold px-3.5 py-1.5 rounded-[6px] bg-[#0A0A0A] text-[#FFFFFF] hover:opacity-90 transition-opacity"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* 2. Hero Section (Light) */}
      <section className="pt-20 pb-16 px-6 max-w-5xl mx-auto">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-[#5F5F5F] bg-[#F7F7F5] border border-[#E6E6E3] px-3 py-1 rounded-[6px]">
            <span className="text-[#30A46C] font-bold">●</span>
            <span>SHERLOCK v1.0 · HYBRID SAST & REPRODUCIBILITY ENGINE</span>
          </div>

          <h1 className="text-[clamp(2.75rem,6vw,5rem)] font-semibold tracking-[-0.04em] leading-[1.02] text-[#0A0A0A] max-w-4xl">
            Every pull request, security-reviewed.
          </h1>

          <p className="text-base sm:text-lg text-[#5F5F5F] max-w-2xl leading-relaxed">
            Sherlock finds vulnerabilities, proves they are exploitable, and ships the fix before you merge.
          </p>

          <div className="flex items-center gap-4 pt-2 flex-wrap">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-[6px] bg-[#0A0A0A] text-[#FFFFFF] text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <span>Get started free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/app/scan"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-[6px] border border-[#E6E6E3] bg-[#FFFFFF] text-[#0A0A0A] text-sm font-semibold hover:border-[#CFCFCB] hover:bg-[#F7F7F5] transition-colors"
            >
              <span>Interactive scanner</span>
            </Link>

            {/* Slash commands pill */}
            <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-[6px] border border-[#E6E6E3] bg-[#F7F7F5] font-mono text-xs text-[#0A0A0A]">
              <span className="font-semibold text-[#0A0A0A]">/detect</span>
              <span className="text-[#8A8A8A]">/verify</span>
              <span className="text-[#8A8A8A]">/fix</span>
            </div>
          </div>

          {/* Monochrome Integration Strip */}
          <div className="pt-12 border-t border-[#E6E6E3] mt-12">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A8A] mb-4">
              Works across the modern engineering workflow
            </div>
            <div className="flex items-center gap-8 sm:gap-12 flex-wrap text-sm font-mono font-medium text-[#5F5F5F]">
              <span>GITHUB</span>
              <span>GITLAB</span>
              <span>VS CODE</span>
              <span>SLACK</span>
              <span>CURSOR</span>
              <span>CLAUDE CODE</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Dark Band: /detect */}
      <section id="detect" className="bg-[#0A0A0B] text-[#F5F5F4] py-20 px-6 border-y border-[#26262A]">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="space-y-2">
            <div className="font-mono text-xs text-[#A1A1AA] flex items-center gap-2">
              <span className="font-bold text-[#F5F5F4]">/detect</span>
              <span>/verify</span>
              <span>/fix</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#F5F5F4]">
              Fewer findings. Better ones.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left 3 Short Points */}
            <div className="space-y-6">
              <div className="space-y-1.5 border-l-2 border-[#3A3A40] pl-4">
                <h3 className="text-sm font-semibold text-[#F5F5F4]">
                  Hybrid static analysis + agent triage
                </h3>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  Fast deterministic AST pattern matching flags candidate paths; AI triage verifies taint reachability against route handlers.
                </p>
              </div>

              <div className="space-y-1.5 border-l-2 border-[#3A3A40] pl-4">
                <h3 className="text-sm font-semibold text-[#F5F5F4]">
                  Reachability checks
                </h3>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  Traces untrusted parameters from external input sources to dangerous sinks, eliminating dead code alerts.
                </p>
              </div>

              <div className="space-y-1.5 border-l-2 border-[#3A3A40] pl-4">
                <h3 className="text-sm font-semibold text-[#F5F5F4]">
                  Evidence-or-silence guarantee
                </h3>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  Sherlock suppresses speculative warnings. If an alert reaches your PR, it includes exact code locations and reconstructed data flow.
                </p>
              </div>
            </div>

            {/* Right: Animated Terminal Panel */}
            <div>
              <Terminal
                title="sherlock scan --strict"
                lines={sampleScanLogs}
                animated={true}
                maxHeight="320px"
              />
              <div className="text-[11px] font-mono text-[#71717A] mt-2 text-right">
                Sample output from benchmark test suite
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Light Band: /verify */}
      <section id="verify" className="bg-[#FFFFFF] text-[#0A0A0A] py-20 px-6">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="space-y-2">
            <div className="font-mono text-xs text-[#5F5F5F] flex items-center gap-2">
              <span className="text-[#8A8A8A]">/detect</span>
              <span className="font-bold text-[#0A0A0A]">/verify</span>
              <span className="text-[#8A8A8A]">/fix</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#0A0A0A]">
              Proof, not guesses.
            </h2>
            <p className="text-sm text-[#5F5F5F] max-w-xl">
              Every flagged finding runs through an isolated micro-VM sandbox. Canary probes confirm exploitability before interrupting developers.
            </p>
          </div>

          {/* Product Mockup Card */}
          <div className="rounded-[10px] border border-[#E6E6E3] bg-[#FFFFFF] shadow-sm overflow-hidden p-6 space-y-4">
            <div className="flex items-start justify-between gap-4 border-b border-[#E6E6E3] pb-4 flex-wrap">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <SeverityDot level="high" />
                  <Badge variant="subtle">CWE-89</Badge>
                  <Badge variant="verified">
                    <Check className="w-3 h-3 mr-1 inline" />
                    Exploit Verified
                  </Badge>
                </div>
                <h3 className="text-sm font-semibold text-[#0A0A0A]">
                  SQL injection via unparameterized query in GET /users
                </h3>
                <div className="text-xs font-mono text-[#5F5F5F]">
                  src/routes/users.ts:10 · 94% confidence · 48ms sandbox reproduction
                </div>
              </div>

              <div className="text-xs font-mono text-[#30A46C] bg-[#30A46C]/10 border border-[#30A46C]/30 px-2.5 py-1 rounded-[6px]">
                Test Status: Failing Baseline → Clean on Patch
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 rounded-[6px] border border-[#E6E6E3] bg-[#F7F7F5] space-y-1">
                <div className="text-[11px] text-[#5F5F5F] uppercase font-semibold">Step 1: Unpatched Baseline Probe</div>
                <div className="text-[#E5484D] font-medium">[FAIL] Canary payload bypassed query: assertion failed</div>
                <div className="text-[#8A8A8A] text-[11px]">Exploit condition reproduced in 48ms</div>
              </div>

              <div className="p-3 rounded-[6px] border border-[#E6E6E3] bg-[#F7F7F5] space-y-1">
                <div className="text-[11px] text-[#5F5F5F] uppercase font-semibold">Step 2: Patched Verification Probe</div>
                <div className="text-[#30A46C] font-medium">[PASS] Parameterized placeholder neutralized payload cleanly</div>
                <div className="text-[#8A8A8A] text-[11px]">Validated AST structure & zero test regressions</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Dark Band: /fix */}
      <section id="fix" className="bg-[#0A0A0B] text-[#F5F5F4] py-20 px-6 border-y border-[#26262A]">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="space-y-2">
            <div className="font-mono text-xs text-[#A1A1AA] flex items-center gap-2">
              <span className="text-[#71717A]">/detect</span>
              <span className="text-[#71717A]">/verify</span>
              <span className="font-bold text-[#F5F5F4]">/fix</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#F5F5F4]">
              Fixes you can merge.
            </h2>
            <p className="text-sm text-[#A1A1AA] max-w-xl">
              Sherlock crafts minimal, type-checked patches. Each suggested fix is validated against project linters and regression suites.
            </p>
          </div>

          <div className="space-y-4">
            <DiffView
              patch={`--- a/src/routes/users.ts\n+++ b/src/routes/users.ts\n@@ -10,1 +10,1 @@\n-const result = await db.query(\`SELECT * FROM users WHERE id = '\${userId}'\`);\n+const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);`}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono text-[#F5F5F4]">
              <div className="p-3 rounded-[6px] border border-[#26262A] bg-[#141416] flex items-center justify-between">
                <span>Linter Checks</span>
                <span className="text-[#30A46C] font-semibold">0 ERRORS</span>
              </div>
              <div className="p-3 rounded-[6px] border border-[#26262A] bg-[#141416] flex items-center justify-between">
                <span>Type Check</span>
                <span className="text-[#30A46C] font-semibold">PASS</span>
              </div>
              <div className="p-3 rounded-[6px] border border-[#26262A] bg-[#141416] flex items-center justify-between">
                <span>Test Suite</span>
                <span className="text-[#30A46C] font-semibold">ALL GREEN</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Light Band: Works where you work (4 Cards) */}
      <section id="integrations" className="bg-[#FFFFFF] text-[#0A0A0A] py-20 px-6">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0A0A0A]">
              Works where you work.
            </h2>
            <p className="text-xs text-[#5F5F5F]">
              Direct native interfaces for PR automation, CI/CD gates, editor terminals, and agent runtimes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* PR Bot */}
            <div className="p-5 rounded-[10px] border border-[#E6E6E3] bg-[#FFFFFF] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-[#0A0A0A]">PR Bot</span>
                <Badge variant="subtle">GitHub / GitLab</Badge>
              </div>
              <p className="text-xs text-[#5F5F5F]">
                Reviews commits automatically, comments with verified exploit traces, and updates check runs.
              </p>
              <div className="p-2.5 rounded-[6px] border border-[#E6E6E3] bg-[#F7F7F5] flex items-center justify-between text-xs font-mono">
                <code>@sherlock review --strict</code>
                <button
                  onClick={() => copySnippet('@sherlock review --strict', 'prbot')}
                  className="text-[#5F5F5F] hover:text-[#0A0A0A]"
                >
                  {copiedKey === 'prbot' ? <Check className="w-3.5 h-3.5 text-[#30A46C]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* CI Gate */}
            <div className="p-5 rounded-[10px] border border-[#E6E6E3] bg-[#FFFFFF] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-[#0A0A0A]">CI Gate</span>
                <Badge variant="subtle">CLI / Actions</Badge>
              </div>
              <p className="text-xs text-[#5F5F5F]">
                Fails builds deterministically when unmitigated high or critical vulnerabilities exist.
              </p>
              <div className="p-2.5 rounded-[6px] border border-[#E6E6E3] bg-[#F7F7F5] flex items-center justify-between text-xs font-mono">
                <code>npx @sherlock/cli scan --fail-on=high</code>
                <button
                  onClick={() => copySnippet('npx @sherlock/cli scan --fail-on=high', 'cigate')}
                  className="text-[#5F5F5F] hover:text-[#0A0A0A]"
                >
                  {copiedKey === 'cigate' ? <Check className="w-3.5 h-3.5 text-[#30A46C]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* IDE */}
            <div className="p-5 rounded-[10px] border border-[#E6E6E3] bg-[#FFFFFF] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-[#0A0A0A]">IDE Integration</span>
                <Badge variant="subtle">VS Code / Cursor</Badge>
              </div>
              <p className="text-xs text-[#5F5F5F]">
                In-editor inline diagnostics showing taint flow paths directly on save.
              </p>
              <div className="p-2.5 rounded-[6px] border border-[#E6E6E3] bg-[#F7F7F5] flex items-center justify-between text-xs font-mono">
                <code>code --install-extension sherlock.security</code>
                <button
                  onClick={() => copySnippet('code --install-extension sherlock.security', 'ide')}
                  className="text-[#5F5F5F] hover:text-[#0A0A0A]"
                >
                  {copiedKey === 'ide' ? <Check className="w-3.5 h-3.5 text-[#30A46C]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* MCP */}
            <div className="p-5 rounded-[10px] border border-[#E6E6E3] bg-[#FFFFFF] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-[#0A0A0A]">MCP for Coding Agents</span>
                <Badge variant="subtle">Claude / Cursor</Badge>
              </div>
              <p className="text-xs text-[#5F5F5F]">
                Provides agent tools to verify security invariants while writing autonomous code.
              </p>
              <div className="p-2.5 rounded-[6px] border border-[#E6E6E3] bg-[#F7F7F5] flex items-center justify-between text-xs font-mono">
                <code>npx @sherlock/mcp-server</code>
                <button
                  onClick={() => copySnippet('npx @sherlock/mcp-server', 'mcp')}
                  className="text-[#5F5F5F] hover:text-[#0A0A0A]"
                >
                  {copiedKey === 'mcp' ? <Check className="w-3.5 h-3.5 text-[#30A46C]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Principles Grid (Replaces testimonials; no invented quotes) */}
      <section id="principles" className="bg-[#F7F7F5] text-[#0A0A0A] py-20 px-6 border-t border-[#E6E6E3]">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0A0A0A]">
              Security Principles
            </h2>
            <p className="text-xs text-[#5F5F5F]">
              How Sherlock protects code integrity, customer privacy, and execution environments.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-[6px] border border-[#E6E6E3] bg-[#FFFFFF] space-y-2">
              <div className="font-mono text-xs font-bold text-[#0A0A0A]">
                Ephemeral Sandboxes
              </div>
              <p className="text-xs text-[#5F5F5F] leading-relaxed">
                Reproduction probes run in isolated micro-VMs with strictly blocked network egress (RFC 1918 + loopback restricted).
              </p>
            </div>

            <div className="p-4 rounded-[6px] border border-[#E6E6E3] bg-[#FFFFFF] space-y-2">
              <div className="font-mono text-xs font-bold text-[#0A0A0A]">
                Zero Data Retention
              </div>
              <p className="text-xs text-[#5F5F5F] leading-relaxed">
                Source code is evaluated entirely in-memory and discarded immediately upon scan completion.
              </p>
            </div>

            <div className="p-4 rounded-[6px] border border-[#E6E6E3] bg-[#FFFFFF] space-y-2">
              <div className="font-mono text-xs font-bold text-[#0A0A0A]">
                Read-Only Agent Tools
              </div>
              <p className="text-xs text-[#5F5F5F] leading-relaxed">
                Sherlock agent cannot execute shell commands or exfiltrate state outside sandboxed test runners.
              </p>
            </div>

            <div className="p-4 rounded-[6px] border border-[#E6E6E3] bg-[#FFFFFF] space-y-2">
              <div className="font-mono text-xs font-bold text-[#0A0A0A]">
                Published Benchmarks
              </div>
              <p className="text-xs text-[#5F5F5F] leading-relaxed">
                Evaluated against the OWASP Benchmark suite: 94.2% true positive precision with 0 critical escapes. <span className="font-mono text-[10px] text-[#8A8A8A]">(sample data)</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Closing Call to Action & Operational Footer */}
      <section className="bg-[#0A0A0B] text-[#F5F5F4] py-20 px-6 border-t border-[#26262A]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[#F5F5F4]">
            Secure your next PR in under 5 minutes.
          </h2>
          <p className="text-sm sm:text-base text-[#A1A1AA] max-w-xl mx-auto">
            Install Sherlock in your repository or try the interactive findings inbox directly in your browser.
          </p>

          <div className="flex items-center justify-center gap-4 pt-2 flex-wrap">
            <Link
              to="/app/findings"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-[6px] bg-[#F5F5F4] text-[#0A0A0B] text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <span>Get started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/app/scan"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-[6px] border border-[#3A3A40] text-[#F5F5F4] text-sm font-semibold hover:bg-[#141416] transition-colors"
            >
              <span>Schedule a demo</span>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="max-w-5xl mx-auto pt-20 mt-16 border-t border-[#26262A] flex items-center justify-between gap-6 flex-wrap text-xs font-mono text-[#71717A]">
          <div className="flex items-center gap-6">
            <Link to="/app/findings" className="hover:text-[#F5F5F4] transition-colors">Product</Link>
            <Link to="/app/findings" className="hover:text-[#F5F5F4] transition-colors">Resources</Link>
            <Link to="/app/settings" className="hover:text-[#F5F5F4] transition-colors">Security & Legal</Link>
          </div>

          <div className="flex items-center gap-2 text-[#30A46C]">
            <span className="w-2 h-2 rounded-full bg-[#30A46C] animate-pulse" />
            <span>All systems operational</span>
          </div>
        </div>
      </section>
    </div>
  );
};
