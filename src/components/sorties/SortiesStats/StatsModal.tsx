// src/components/sorties/SortiesStats/StatsModal.tsx

import React from 'react';
import { X, Truck } from 'lucide-react';
import ModalHeader from './ModalHeader';
import SortieList from './SortieList';
import PaginationControls from './PaginationControls';
import ModalFooter from './ModalFooter';

interface Sortie {
  id: number;
  produit_id: number;
  produit_nom?: string;
  quantite: number;
  prix_unitaire: number;
  total_ligne: number;
  reference?: string;
  destination?: string;
  observation?: string;
  date_sortie: string;
  created_at?: string;
  image?: string;
  unite?: string;
}

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalData: {
    title: string;
    data: Sortie[];
    icon: React.ElementType;
    color: string;
  };
  dataLength: number;
  currentData: Sortie[];
  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  imageUrls: Record<number, string | null>;
  imageErrors: Record<number, boolean>;
  onImageError: (id: number) => void;
  onGoToPage: (page: number) => void;
  onGoToPrevious: () => void;
  onGoToNext: () => void;
  renderPageNumbers: () => number[];
  isDark: boolean;
  colors: {
    card: string;
    border: string;
    text: string;
    muted: string;
    primary: string;
    modalOverlay: string;
  };
  curveImage: string;
  hexToRgba: (color: string, alpha: number) => string;
}

const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  modalData,
  dataLength,
  currentData,
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  imageUrls,
  imageErrors,
  onImageError,
  onGoToPage,
  onGoToPrevious,
  onGoToNext,
  renderPageNumbers,
  isDark,
  colors,
  curveImage,
  hexToRgba,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3"
      style={{ background: colors.modalOverlay }}
      onClick={onClose}
    >
      <div
        className="relative rounded-xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl border flex flex-col"
        style={{
          background: colors.card,
          borderColor: 'rgba(99,102,241,0.15)',
          position: 'relative',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url(${curveImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: isDark ? 0.06 : 0.08,
            filter: 'blur(1px)',
          }}
        />

        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isDark 
              ? `radial-gradient(circle at 50% 30%, rgba(99,102,241,0.03), transparent 70%)`
              : `radial-gradient(circle at 50% 30%, rgba(99,102,241,0.02), transparent 70%)`,
          }}
        />

        <div className="relative z-10 flex flex-col h-full">
          <ModalHeader
            title={modalData.title}
            icon={modalData.icon}
            color={modalData.color}
            dataLength={dataLength}
            onClose={onClose}
            colors={colors}
            hexToRgba={hexToRgba}
          />

          <SortieList
            data={currentData}
            dataLength={dataLength}
            color={modalData.color}
            imageUrls={imageUrls}
            imageErrors={imageErrors}
            onImageError={onImageError}
            isDark={isDark}
            colors={colors}
          />

          {dataLength > 8 && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              startIndex={startIndex}
              endIndex={endIndex}
              dataLength={dataLength}
              color={modalData.color}
              onGoToPage={onGoToPage}
              onGoToPrevious={onGoToPrevious}
              onGoToNext={onGoToNext}
              renderPageNumbers={renderPageNumbers}
              colors={colors}
            />
          )}

          <ModalFooter
            onClose={onClose}
            color={modalData.color}
            colors={colors}
          />
        </div>
      </div>
    </div>
  );
};

export default StatsModal;