import * as fs from 'fs';
import * as path from 'path';

export interface LearningItem {
  id: string;
  scope: 'repo' | 'path' | 'org';
  targetPath?: string;
  feedbackText: string;
  synthesizedRule: string;
  associatedRuleId?: string;
  createdAt: string;
  author?: string;
}

export class LearningsStore {
  private filePath: string;
  private learnings: LearningItem[] = [];

  constructor(storageDir: string) {
    this.filePath = path.join(storageDir, '.sherlock-learnings.json');
    this.load();
  }

  private load(): void {
    if (fs.existsSync(this.filePath)) {
      try {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        this.learnings = JSON.parse(raw);
      } catch (err) {
        this.learnings = [];
      }
    }
  }

  public save(): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.filePath, JSON.stringify(this.learnings, null, 2), 'utf-8');
    } catch (err) {
      console.warn('[Sherlock] Failed to save learnings:', err);
    }
  }

  public recordFeedback(
    feedbackText: string,
    targetPath?: string,
    associatedRuleId?: string,
    author: string = 'developer'
  ): LearningItem {
    const id = 'lrn_' + Date.now().toString(36);
    const synthesizedRule = this.synthesizeRule(feedbackText);

    const item: LearningItem = {
      id,
      scope: targetPath ? 'path' : 'repo',
      targetPath,
      feedbackText,
      synthesizedRule,
      associatedRuleId,
      createdAt: new Date().toISOString(),
      author
    };

    this.learnings.push(item);
    this.save();
    return item;
  }

  public getLearnings(targetPath?: string): LearningItem[] {
    if (!targetPath) return this.learnings;
    return this.learnings.filter(l => !l.targetPath || targetPath.includes(l.targetPath));
  }

  public isSuppressedByLearnings(ruleId: string, filePath: string): { suppressed: boolean; reason?: string } {
    const applicable = this.getLearnings(filePath);
    for (const l of applicable) {
      if (l.associatedRuleId && l.associatedRuleId === ruleId) {
        return { suppressed: true, reason: `Suppressed by recorded developer learning: "${l.feedbackText}"` };
      }
      if (l.synthesizedRule.toLowerCase().includes(ruleId.toLowerCase())) {
        return { suppressed: true, reason: `Suppressed by learning rule: "${l.synthesizedRule}"` };
      }
    }
    return { suppressed: false };
  }

  private synthesizeRule(feedback: string): string {
    // Generate normalized instruction
    return `Learned constraint: developer clarified that ${feedback.trim()}`;
  }
}
