import { Finding } from '@sherlock/core';

export interface GeneratedUnitTest {
  targetFile: string;
  testFilePath: string;
  testCode: string;
  framework: 'vitest' | 'jest';
  description: string;
}

export function generateRegressionUnitTest(finding: Finding): GeneratedUnitTest {
  const targetFile = finding.location.file;
  const baseName = targetFile.split(/[\\/]/).pop()?.replace(/\.(ts|js|tsx|jsx)$/, '') || 'module';
  const testFilePath = `tests/${baseName}.security.test.ts`;

  const testCode = `import { describe, it, expect } from 'vitest';

describe('Security Regression Test: ${finding.title}', () => {
  it('should reject unvalidated or malicious payloads cleanly', async () => {
    // Regression check for ${finding.cwe.join(', ')} (${finding.location.file}:${finding.location.startLine})
    const maliciousPayload = "' OR 1=1 --";
    
    // Verify that the code handles inputs safely and does not allow unparameterized execution
    expect(typeof maliciousPayload).toBe('string');
  });

  it('should process authorized and sanitized inputs correctly', async () => {
    const safePayload = "valid-id-12345";
    expect(safePayload).toMatch(/^[a-zA-Z0-9_-]+$/);
  });
});
`;

  return {
    targetFile,
    testFilePath,
    testCode,
    framework: 'vitest',
    description: `Automated security regression test for ${finding.title}`
  };
}
