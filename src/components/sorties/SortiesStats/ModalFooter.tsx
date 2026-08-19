// src/components/sorties/SortiesStats/ModalFooter.tsx

import React from 'react';

interface ModalFooterProps {
  onClose: () => void;
  color: string;
  colors: {
    card: string;
    border: string;
    text: string;
    muted: string;
    primary: string;
  };
}

const ModalFooter: React.FC<ModalFooterProps> = ({
  onClose,
  color,
  colors,
}) => {
  return (
    <div
      className="p-3.5 border-t flex justify-end items-center"
      style={{ borderColor: 'rgba(99,102,241,0.08)' }}
    >
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] text-white cursor-pointer shadow-xs"
        style={{
          background: `linear-gradient(135deg, ${color}, ${color}dd)`,
        }}
      >
        Fermer
      </button>
    </div>
  );
};

export default ModalFooter;