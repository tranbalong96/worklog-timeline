import type { ReactNode } from 'react';
import { X } from 'lucide-react';

type ModalProps = {
  children: ReactNode;
  maxWidthClassName?: string;
  title: string;
  onClose: () => void;
};

export function Modal({ children, maxWidthClassName = 'max-w-xl', title, onClose }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6">
      <div className={`max-h-[90vh] w-full overflow-y-auto rounded-lg bg-white shadow-xl ${maxWidthClassName}`}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            onClick={onClose}
            aria-label="Close modal"
            title="Close"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
