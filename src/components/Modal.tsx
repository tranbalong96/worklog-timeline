import type { ReactNode } from 'react';
import { X } from 'lucide-react';

type ModalProps = {
  children: ReactNode;
  closeLabel?: string;
  maxWidthClassName?: string;
  title: string;
  onClose: () => void;
};

export function Modal({
  children,
  closeLabel = 'Close modal',
  maxWidthClassName = 'max-w-xl',
  title,
  onClose,
}: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
      <div
        className={`app-panel max-h-[90vh] w-full overflow-y-auto ${maxWidthClassName}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
          <button
            type="button"
            className="btn-icon h-9 w-9"
            onClick={onClose}
            aria-label={closeLabel}
            title={closeLabel}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
