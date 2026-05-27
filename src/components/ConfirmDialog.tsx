import { Modal } from './Modal';

type ConfirmDialogProps = {
  cancelLabel: string;
  confirmLabel: string;
  message: string;
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
  closeLabel?: string;
  destructive?: boolean;
};

export function ConfirmDialog({
  cancelLabel,
  confirmLabel,
  message,
  title,
  onCancel,
  onConfirm,
  closeLabel,
  destructive = false,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} onClose={onCancel} closeLabel={closeLabel}>
      <div className="space-y-5 px-5 py-5">
        <p className="text-sm text-slate-600">{message}</p>
        <div className="flex justify-end gap-2 border-t border-slate-200/80 pt-4">
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={destructive ? 'btn-danger' : 'btn-primary'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
