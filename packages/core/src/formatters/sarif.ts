import { ScanResult, Finding, Severity } from '../types/schema.js';

export function toSarif(scanResult: ScanResult): object {
  const rulesMap = new Map<string, any>();
  const results: any[] = [];

  for (const finding of scanResult.findings) {
    if (!rulesMap.has(finding.detected_by.static_rule)) {
      rulesMap.set(finding.detected_by.static_rule, {
        id: finding.detected_by.static_rule,
        name: finding.title,
        shortDescription: {
          text: finding.title
        },
        fullDescription: {
          text: finding.explanation
        },
        defaultConfiguration: {
          level: mapSeverityToSarifLevel(finding.severity)
        },
        properties: {
          tags: [...finding.cwe, finding.owasp, finding.lane],
          precision: finding.confidence >= 0.8 ? 'very-high' : 'high'
        }
      });
    }

    results.push({
      ruleId: finding.detected_by.static_rule,
      level: mapSeverityToSarifLevel(finding.severity),
      message: {
        text: `${finding.title}: ${finding.explanation}`
      },
      locations: [
        {
          physicalLocation: {
            artifactLocation: {
              uri: finding.location.file.replace(/\\/g, '/')
            },
            region: {
              startLine: finding.location.startLine,
              endLine: finding.location.endLine
            }
          }
        }
      ],
      codeFlows: [
        {
          threadFlows: [
            {
              locations: finding.dataflow.map((df, index) => ({
                location: {
                  physicalLocation: {
                    artifactLocation: {
                      uri: df.file.replace(/\\/g, '/')
                    },
                    region: {
                      startLine: df.line
                    }
                  },
                  message: {
                    text: `[${df.role.toUpperCase()}] ${df.description || df.snippet || ''}`
                  }
                },
                executionOrder: index + 1
              }))
            }
          ]
        }
      ],
      fixes: finding.fix.patch ? [
        {
          description: {
            text: finding.fix.description
          }
        }
      ] : undefined,
      properties: {
        fingerprint: finding.fingerprint,
        confidence: finding.confidence,
        status: finding.status,
        exposure: finding.exposure
      }
    });
  }

  return {
    $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
    version: '2.1.0',
    runs: [
      {
        tool: {
          driver: {
            name: 'Sherlock',
            version: '1.0.0',
            informationUri: 'https://github.com/sherlock-security/sherlock',
            rules: Array.from(rulesMap.values())
          }
        },
        results
      }
    ]
  };
}

function mapSeverityToSarifLevel(severity: Severity): 'error' | 'warning' | 'note' | 'none' {
  switch (severity) {
    case 'critical':
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
    case 'info':
      return 'note';
    default:
      return 'warning';
  }
}
