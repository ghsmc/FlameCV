import React, { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { CompanyMatch } from '../types';
import {
  XMarkIcon,
  CheckIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

interface SwipeDeckProps {
  companies: CompanyMatch[];
  onClose: () => void;
  onCompanyAction: (company: CompanyMatch, action: 'yes' | 'no') => void;
}

const SWIPE_THRESHOLD = 100;

const getCareerPageUrl = (domain: string): string => {
  const baseDomain = domain.startsWith('http') ? domain : `https://${domain}`;
  return `${baseDomain}/careers`;
};

const getTierColor = (tier: string) => {
  switch (tier) {
    case 'Reach':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
    case 'Target':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    case 'Safety':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
  }
};

export const SwipeDeck: React.FC<SwipeDeckProps> = ({ companies, onClose, onCompanyAction }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);

  const currentCompany = companies[currentIndex];
  const remainingCount = companies.length - currentIndex;

  const handleSwipe = (swipeDirection: 'left' | 'right') => {
    if (!currentCompany) return;

    setDirection(swipeDirection);

    if (swipeDirection === 'right') {
      // Yes - open careers page
      window.open(getCareerPageUrl(currentCompany.domain), '_blank');
    }

    onCompanyAction(currentCompany, swipeDirection === 'right' ? 'yes' : 'no');

    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setDirection(null);
      setDragX(0);
    }, 300);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    setIsDragging(false);

    if (info.offset.x > SWIPE_THRESHOLD) {
      handleSwipe('right');
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      handleSwipe('left');
    } else {
      setDragX(0);
    }
  };

  const handleDrag = (_: any, info: PanInfo) => {
    setDragX(info.offset.x);
  };

  if (currentIndex >= companies.length) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 bg-white dark:bg-[#020617] flex flex-col items-center justify-center p-6"
      >
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckIcon className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            All done!
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            You've reviewed all {companies.length} matches
          </p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            Back to Results
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-white dark:bg-[#020617] flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <span className="font-semibold text-gray-900 dark:text-white">{remainingCount}</span> remaining
        </div>
      </div>

      {/* Card Stack */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        {/* Background cards for depth effect */}
        {companies.slice(currentIndex + 1, currentIndex + 3).map((_, i) => (
          <div
            key={i}
            className="absolute w-[calc(100%-2rem)] sm:w-full max-w-md aspect-[3/4] bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-white/10 shadow-lg"
            style={{
              transform: `scale(${0.95 - i * 0.05}) translateY(${(i + 1) * 15}px)`,
              zIndex: -i - 1,
              opacity: 0.5 - i * 0.2,
            }}
          />
        ))}

        {/* Current Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.9}
            onDragStart={() => setIsDragging(true)}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              x: direction === 'left' ? -500 : direction === 'right' ? 500 : 0,
              rotate: direction === 'left' ? -20 : direction === 'right' ? 20 : dragX * 0.05,
            }}
            exit={{
              x: direction === 'left' ? -500 : 500,
              opacity: 0,
              rotate: direction === 'left' ? -20 : 20,
            }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing"
          >
            {/* Swipe Indicators */}
            <div className="absolute inset-0 pointer-events-none z-10">
              <motion.div
                className="absolute top-8 left-8 px-4 py-2 bg-red-500 text-white font-bold text-xl rounded-lg border-4 border-red-600 transform -rotate-12"
                animate={{ opacity: dragX < -50 ? Math.min(1, Math.abs(dragX) / 100) : 0 }}
              >
                NOPE
              </motion.div>
              <motion.div
                className="absolute top-8 right-8 px-4 py-2 bg-emerald-500 text-white font-bold text-xl rounded-lg border-4 border-emerald-600 transform rotate-12"
                animate={{ opacity: dragX > 50 ? Math.min(1, dragX / 100) : 0 }}
              >
                YES!
              </motion.div>
            </div>

            {/* Card Content */}
            <div className="p-4 sm:p-6">
              {/* Logo & Name */}
              <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                <img
                  src={`https://img.logo.dev/${currentCompany.domain}?token=pk_c2nKhfMyRIOeCjrk-6-RRw`}
                  alt={`${currentCompany.name} logo`}
                  className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl object-contain bg-white border border-gray-100 dark:border-gray-800 shadow-sm"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentCompany.name)}&background=f3f4f6&color=6b7280&size=80`;
                  }}
                />
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2">
                    {currentCompany.name}
                  </h3>
                  <span className={`inline-flex text-xs sm:text-sm font-semibold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full ${getTierColor(currentCompany.tier)}`}>
                    {currentCompany.tier}
                  </span>
                </div>
              </div>

              {/* Description */}
              {currentCompany.description && (
                <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg leading-relaxed mb-4 sm:mb-6 line-clamp-3 sm:line-clamp-none">
                  {currentCompany.description}
                </p>
              )}

              {/* Stats */}
              <div className="space-y-3 mb-6">
                {currentCompany.location && (
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <MapPinIcon className="w-5 h-5" />
                    <span>{currentCompany.location}</span>
                  </div>
                )}
                {currentCompany.funding && (
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <CurrencyDollarIcon className="w-5 h-5" />
                    <span>{currentCompany.funding}</span>
                  </div>
                )}
              </div>

              {/* Match Reason */}
              <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Why you match:</p>
                <p className="text-gray-700 dark:text-gray-300 italic">"{currentCompany.reason}"</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="p-4 sm:p-6 flex items-center justify-center gap-6 sm:gap-8">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleSwipe('left')}
          className="w-14 h-14 sm:w-16 sm:h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 shadow-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
        >
          <XMarkIcon className="w-6 h-6 sm:w-8 sm:h-8" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleSwipe('right')}
          className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-emerald-600 transition-colors"
        >
          <CheckIcon className="w-8 h-8 sm:w-10 sm:h-10" />
        </motion.button>
      </div>

      {/* Instructions */}
      <div className="pb-4 sm:pb-6 text-center text-xs sm:text-sm text-gray-400 dark:text-gray-500 px-4">
        Swipe right or tap <span className="text-emerald-500">Yes</span> to view careers &bull; Swipe left or tap <span className="text-red-500">No</span> to skip
      </div>
    </motion.div>
  );
};
