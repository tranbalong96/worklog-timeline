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
        <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
          <button
            type="button"
            className="inline-flex min-h-10 items-center rounded-md px-4 text-sm font-medium text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-100"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`inline-flex min-h-10 items-center rounded-md px-4 text-sm font-medium text-white ${
              destructive ? 'bg-red-700 hover:bg-red-800' : 'bg-slate-950 hover:bg-slate-800'
            }`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
