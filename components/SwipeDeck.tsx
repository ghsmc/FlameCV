import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { CompanyMatch } from '../types';
import {
  XMarkIcon,
  CheckIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ArrowLeftIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';

interface SwipeDeckProps {
  companies: CompanyMatch[];
  onClose: () => void;
  onCompanyAction: (company: CompanyMatch, action: 'yes' | 'no') => void;
}

const SWIPE_THRESHOLD = 80;

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
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  const [likedCompanies, setLikedCompanies] = useState<Set<string>>(new Set());
  
  // Motion values for smooth dragging
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  const nopeOpacity = useTransform(x, [-100, -50, 0], [1, 0.5, 0]);
  const yesOpacity = useTransform(x, [0, 50, 100], [0, 0.5, 1]);

  const currentCompany = companies[currentIndex];
  const remainingCount = companies.length - currentIndex;

  const handleSwipe = (swipeDirection: 'left' | 'right', openUrl: boolean = false) => {
    if (!currentCompany) return;

    setExitDirection(swipeDirection);
    
    if (swipeDirection === 'right') {
      // Mark as liked
      setLikedCompanies(prev => new Set(prev).add(currentCompany.domain));
      
      // Only open URL if explicitly requested (button tap, not swipe)
      if (openUrl) {
        window.open(getCareerPageUrl(currentCompany.domain), '_blank');
      }
    }

    onCompanyAction(currentCompany, swipeDirection === 'right' ? 'yes' : 'no');

    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setExitDirection(null);
      x.set(0);
    }, 300);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    
    // Use both offset and velocity to determine swipe
    if (offset > SWIPE_THRESHOLD || velocity > 500) {
      handleSwipe('right');
    } else if (offset < -SWIPE_THRESHOLD || velocity < -500) {
      handleSwipe('left');
    } else {
      // Snap back
      x.set(0);
    }
  };

  const openCareersPage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentCompany) {
      window.open(getCareerPageUrl(currentCompany.domain), '_blank');
    }
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
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            You've reviewed all {companies.length} matches
          </p>
          <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-8">
            {likedCompanies.size} companies liked
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
        <div className="flex items-center gap-3">
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            {likedCompanies.size} liked
          </span>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-gray-900 dark:text-white">{remainingCount}</span> left
          </div>
        </div>
      </div>

      {/* Card Stack */}
      <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden touch-none">
        {/* Background cards for depth effect */}
        {companies.slice(currentIndex + 1, currentIndex + 3).map((_, i) => (
          <div
            key={i}
            className="absolute w-[calc(100%-2rem)] max-w-md aspect-[3/4] bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-white/10 shadow-lg pointer-events-none"
            style={{
              transform: `scale(${0.95 - i * 0.05}) translateY(${(i + 1) * 12}px)`,
              zIndex: -i - 1,
              opacity: 0.5 - i * 0.2,
            }}
          />
        ))}

        {/* Current Card */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentIndex}
            drag="x"
            dragDirectionLock
            dragElastic={0.7}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
            style={{ x, rotate }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              x: exitDirection === 'left' ? -400 : exitDirection === 'right' ? 400 : undefined,
            }}
            exit={{
              x: exitDirection === 'left' ? -400 : 400,
              opacity: 0,
              transition: { duration: 0.2 }
            }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden touch-pan-y"
          >
            {/* Swipe Indicators */}
            <div className="absolute inset-0 pointer-events-none z-10">
              <motion.div
                className="absolute top-6 left-6 px-3 py-1.5 bg-red-500 text-white font-bold text-lg rounded-lg border-4 border-red-600 transform -rotate-12"
                style={{ opacity: nopeOpacity }}
              >
                NOPE
              </motion.div>
              <motion.div
                className="absolute top-6 right-6 px-3 py-1.5 bg-emerald-500 text-white font-bold text-lg rounded-lg border-4 border-emerald-600 transform rotate-12"
                style={{ opacity: yesOpacity }}
              >
                LIKE!
              </motion.div>
            </div>

            {/* Card Content */}
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {/* Logo & Name */}
              <div className="flex items-start gap-3 mb-4">
                <img
                  src={`https://img.logo.dev/${currentCompany.domain}?token=pk_c2nKhfMyRIOeCjrk-6-RRw`}
                  alt={`${currentCompany.name} logo`}
                  className="w-14 h-14 rounded-xl object-contain bg-white border border-gray-100 dark:border-gray-800 shadow-sm flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentCompany.name)}&background=f3f4f6&color=6b7280&size=80`;
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 truncate">
                    {currentCompany.name}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex text-xs font-semibold px-2 py-0.5 rounded-full ${getTierColor(currentCompany.tier)}`}>
                      {currentCompany.tier}
                    </span>
                    {currentCompany.matchScore && (
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        {currentCompany.matchScore}% match
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              {currentCompany.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4 line-clamp-3">
                  {currentCompany.description}
                </p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap gap-3 mb-4 text-sm">
                {currentCompany.location && (
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{currentCompany.location}</span>
                  </div>
                )}
                {currentCompany.funding && (
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                    <CurrencyDollarIcon className="w-4 h-4" />
                    <span>{currentCompany.funding}</span>
                  </div>
                )}
              </div>

              {/* Match Reason */}
              <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl mb-3">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Why you match:</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 italic line-clamp-2">"{currentCompany.reason}"</p>
              </div>

              {/* View Careers Link */}
              <button
                onClick={openCareersPage}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
              >
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                View Careers Page
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="p-4 flex items-center justify-center gap-8 pb-6">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => handleSwipe('left')}
          className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 shadow-lg active:bg-red-200 dark:active:bg-red-900/30 transition-colors"
        >
          <XMarkIcon className="w-8 h-8" />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => handleSwipe('right', true)}
          className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg active:bg-emerald-600 transition-colors"
        >
          <CheckIcon className="w-10 h-10" />
        </motion.button>
      </div>

      {/* Instructions */}
      <div className="pb-6 text-center text-xs text-gray-400 dark:text-gray-500 px-4">
        Swipe right to like • Tap <span className="text-emerald-500">✓</span> to like & view careers • Swipe left or tap <span className="text-red-500">✕</span> to skip
      </div>
    </motion.div>
  );
};
