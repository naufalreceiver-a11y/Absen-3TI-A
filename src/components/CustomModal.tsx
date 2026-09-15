import React from 'react';
import { AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';

interface CustomModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  isConfirm?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  title,
  message,
  isConfirm = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const isDanger = title.toLowerCase().includes('hapus') || title.toLowerCase().includes('delete');

  return (
    <div
      id="custom-modal"
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 border border-slate-100">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isDanger
                ? 'bg-rose-100 text-rose-600'
                : isConfirm
                ? 'bg-amber-100 text-amber-600'
                : 'bg-blue-100 text-blue-600'
            }`}
          >
            {isDanger ? (
              <AlertCircle className="w-5 h-5" />
            ) : isConfirm ? (
              <HelpCircle className="w-5 h-5" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 id="modal-title" className="text-base font-bold text-slate-800">
              {title}
            </h3>
          </div>
        </div>

        <p id="modal-message" className="text-slate-600 text-sm leading-relaxed pl-1">
          {message}
        </p>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
          {isConfirm && (
            <button
              id="modal-cancel"
              type="button"
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 font-semibold text-xs sm:text-sm transition cursor-pointer"
              onClick={onCancel}
            >
              Batal
            </button>
          )}
          <button
            id="modal-ok"
            type="button"
            className={`px-4 py-2 rounded-xl text-white font-semibold text-xs sm:text-sm transition cursor-pointer shadow-xs ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            onClick={onConfirm}
          >
            {isConfirm ? 'Lanjutkan' : 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
};
