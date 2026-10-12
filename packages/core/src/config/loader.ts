import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import { SecReviewConfig } from '../types/config.js';

export const DEFAULT_CONFIG: SecReviewConfig = {
  version: '1.0',
  ignorePaths: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.next/**',
    '**/*.test.ts',
    '**/*.test.js',
    '**/*.spec.ts',
    '**/*.spec.js',
    '**/tests/**',
    '**/__tests__/**',
    '**/coverage/**'
  ],
  gate: {
    failOnSeverity: 'high',
    blockOnNewOnly: true,
    maxFindings: 10
  },
  review: {
    commentCap: 10,
    showMermaidDiagrams: true,
    enabledLanes: ['security', 'bug', 'quality', 'performance', 'tests'],
    suppressLowConfidence: true
  },
  verification: {
    exploitProofEnabled: true,
    sandboxTimeoutSeconds: 120
  }
};

export function loadConfig(rootDir: string, customConfigPath?: string): SecReviewConfig {
  const possiblePaths = customConfigPath 
    ? [customConfigPath] 
    : [
        path.join(rootDir, '.secreview.yml'),
        path.join(rootDir, '.secreview.yaml'),
        path.join(rootDir, 'secreview.config.json')
      ];

  for (const configPath of possiblePaths) {
    if (fs.existsSync(configPath)) {
      try {
        const rawContent = fs.readFileSync(configPath, 'utf-8');
        const parsed = configPath.endsWith('.json') 
          ? JSON.parse(rawContent) 
          : yaml.parse(rawContent);

        return mergeConfig(DEFAULT_CONFIG, parsed);
      } catch (err) {
        console.warn(`[Sherlock] Failed to parse config at ${configPath}:`, err);
      }
    }
  }

  return DEFAULT_CONFIG;
}

function mergeConfig(base: SecReviewConfig, override: Partial<SecReviewConfig>): SecReviewConfig {
  return {
    ...base,
    ...override,
    ignorePaths: Array.from(new Set([...(base.ignorePaths || []), ...(override.ignorePaths || [])])),
    gate: { ...base.gate, ...override.gate },
    review: { ...base.review, ...override.review },
    verification: { ...base.verification, ...override.verification },
    severityOverrides: { ...base.severityOverrides, ...override.severityOverrides },
    customSanitizers: [...(base.customSanitizers || []), ...(override.customSanitizers || [])],
    customRules: [...(base.customRules || []), ...(override.customRules || [])]
  };
}
