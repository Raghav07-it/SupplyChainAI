import { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, subtitle, children, maxWidth = 'max-w-lg' }) => {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      {/* Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-[#0B0F17]/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      {/* Modal Dialog */}
      <div
        className={`relative bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-xl shadow-2xl ${maxWidth} w-full p-6 animate-fade-in z-10`}
      >
        <div className="flex items-start justify-between mb-4 border-b border-[var(--border-color)] pb-3">
          <div>
            {title && (
              <h2 className="text-base font-bold text-[var(--text-high-contrast)] flex items-center gap-2">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-high-contrast)] hover:bg-[var(--surface-overlay)] transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
