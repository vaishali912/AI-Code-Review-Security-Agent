import React, { useState } from 'react';
import { Button } from '../ui/Button.js';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/Dialog.js';
import { Tooltip } from '../ui/Tooltip.js';
import { cn } from '../../lib/utils.js';
import { CheckCircle2, XCircle, AlertCircle, Lock } from 'lucide-react';

interface ApprovalBarProps {
  isVerified: boolean;
  onApprove: (reason: string) => void;
  onRequestChanges: (reason: string) => void;
  onClose?: () => void;
  verificationBadgeText?: string;
  className?: string;
}

export const ApprovalBar: React.FC<ApprovalBarProps> = ({
  isVerified,
  onApprove,
  onRequestChanges,
  onClose,
  verificationBadgeText = 'Verification green in sandbox',
  className
}) => {
  const [dialogAction, setDialogAction] = useState<'approve' | 'request_changes' | null>(null);
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (dialogAction === 'approve') {
      onApprove(reason);
    } else if (dialogAction === 'request_changes') {
      onRequestChanges(reason);
    }
    setDialogAction(null);
    setReason('');
  };

  return (
    <div className={cn('sticky bottom-0 z-20 border-t border-[var(--line)] bg-[var(--surface)] p-3 px-6 flex items-center justify-between gap-4 shadow-md', className)}>
      <div className="flex items-center gap-2.5 text-xs font-mono">
        {isVerified ? (
          <span className="flex items-center gap-1.5 text-[#30A46C]">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-semibold">{verificationBadgeText}</span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-[#E5A50A]">
            <AlertCircle className="w-4 h-4" />
            <span>Verification pending: automated proof must pass prior to merge</span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {onClose && (
          <Button size="sm" variant="ghost" onClick={onClose}>
            Close
          </Button>
        )}

        <Button
          size="sm"
          variant="secondary"
          onClick={() => setDialogAction('request_changes')}
        >
          Request Changes
        </Button>

        {isVerified ? (
          <Button
            size="sm"
            variant="primary"
            onClick={() => setDialogAction('approve')}
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-[#30A46C]" />
            <span>Approve & Merge Fix</span>
          </Button>
        ) : (
          <Tooltip content="Approval is locked until the verification agent passes all canary probes">
            <span className="inline-block cursor-not-allowed">
              <Button size="sm" variant="primary" disabled className="opacity-50">
                <Lock className="w-3.5 h-3.5 mr-1 text-[var(--ink-faint)]" />
                <span>Approve (Blocked)</span>
              </Button>
            </span>
          </Tooltip>
        )}
      </div>

      {/* Confirmation Dialog requiring reason */}
      <Dialog open={Boolean(dialogAction)} onOpenChange={(open: boolean) => !open && setDialogAction(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogAction === 'approve' ? 'Approve Fix & Merge' : 'Request Changes'}
            </DialogTitle>
            <DialogDescription>
              {dialogAction === 'approve'
                ? 'Human approval will merge the verified fix branch into the target pull request.'
                : 'State the required modifications for the agent fix loop.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <label className="font-mono text-xs text-[var(--ink)] block">
              Documented Rationale <span className="text-[#E5484D]">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                dialogAction === 'approve'
                  ? 'e.g. Verified sandbox test assertions pass and no performance regressions observed.'
                  : 'e.g. Please update function signature to match new database driver version.'
              }
              className="w-full p-2.5 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--bg-subtle)] text-[var(--ink)] font-mono text-xs focus:border-[var(--line-strong)]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--line)]">
            <Button variant="ghost" size="sm" onClick={() => setDialogAction(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant={dialogAction === 'approve' ? 'primary' : 'danger'}
              onClick={handleConfirm}
              disabled={!reason.trim()}
            >
              Confirm {dialogAction === 'approve' ? 'Approval' : 'Request'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
