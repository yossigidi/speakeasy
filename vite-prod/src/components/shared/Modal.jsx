import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, showClose = true }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="modal-content glass-card-strong w-full max-w-md max-h-[85vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {(title || showClose) && (
            <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50">
              {title && <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>}
              {showClose && (
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          )}
          <div className="p-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
