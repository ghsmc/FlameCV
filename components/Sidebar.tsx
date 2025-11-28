import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HistoryItem } from '../types';
import { 
  PlusIcon,
  TrashIcon,
  ClockIcon,
  Bars3BottomLeftIcon,
} from '@heroicons/react/24/outline';

interface SidebarProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
  onNewAnalysis: () => void;
  isOpen: boolean;
  onToggle: () => void;
  user: { email: string } | null;
}

// Generate a short, interesting title
const generateTitle = (item: HistoryItem): string => {
  const matches = item.analysis.careerAdvice?.companyMatches || [];
  const targetRole = item.analysis.careerAdvice?.recommendedRoles?.[0];
  const level = item.analysis.careerAdvice?.currentLevel;
  
  if (targetRole) {
    return targetRole;
  }
  
  if (level && matches.length > 0) {
    return `${level} • ${matches.length} matches`;
  }
  
  if (matches.length > 0) {
    return `${matches.length} startup matches`;
  }
  
  const nameWithoutExt = item.fileName.replace(/\.[^/.]+$/, '');
  return nameWithoutExt.slice(0, 25);
};

// Group history by date
const groupByDate = (items: HistoryItem[]): { label: string; items: HistoryItem[] }[] => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const groups: { label: string; items: HistoryItem[] }[] = [
    { label: 'Today', items: [] },
    { label: 'Yesterday', items: [] },
    { label: 'Last 7 days', items: [] },
    { label: 'Last 30 days', items: [] },
    { label: 'Older', items: [] },
  ];

  items.forEach(item => {
    const date = new Date(item.timestamp);
    if (date >= today) {
      groups[0].items.push(item);
    } else if (date >= yesterday) {
      groups[1].items.push(item);
    } else if (date >= lastWeek) {
      groups[2].items.push(item);
    } else if (date >= lastMonth) {
      groups[3].items.push(item);
    } else {
      groups[4].items.push(item);
    }
  });

  return groups.filter(g => g.items.length > 0);
};

export const Sidebar: React.FC<SidebarProps> = ({
  history,
  onSelect,
  onClear,
  onNewAnalysis,
  isOpen,
  onToggle,
  user,
}) => {
  const groupedHistory = groupByDate(history);

  return (
    <>
      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed left-0 top-0 bottom-0 w-[280px] bg-white/80 dark:bg-[#020617]/95 backdrop-blur-xl border-r border-gray-200/50 dark:border-white/5 z-40 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-white/5">
              <button
                onClick={onNewAnalysis}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 dark:from-orange-500/20 dark:to-red-500/20 border border-orange-200/50 dark:border-orange-500/20 rounded-xl hover:from-orange-500/20 hover:to-red-500/20 dark:hover:from-orange-500/30 dark:hover:to-red-500/30 transition-all text-sm font-medium text-gray-900 dark:text-white"
              >
                <PlusIcon className="w-5 h-5 text-orange-500" />
                New Analysis
              </button>
            </div>

            {/* History List */}
            <div className="flex-1 overflow-y-auto p-3">
              {user && history.length > 0 ? (
                <div className="space-y-6">
                  {groupedHistory.map((group) => (
                    <div key={group.label}>
                      <h4 className="text-[10px] font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider px-2 mb-2">
                        {group.label}
                      </h4>
                      <div className="space-y-1">
                        {group.items.map((item) => {
                          const matches = item.analysis.careerAdvice?.companyMatches || [];
                          const topMatch = matches[0];
                          
                          return (
                            <button
                              key={item.id}
                              onClick={() => onSelect(item)}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100/80 dark:hover:bg-white/5 transition-colors text-left group"
                            >
                              {/* Logo or Icon */}
                              {topMatch ? (
                                <img
                                  src={`https://img.logo.dev/${topMatch.domain}?token=pk_c2nKhfMyRIOeCjrk-6-RRw`}
                                  alt=""
                                  className="w-6 h-6 rounded-md bg-white border border-gray-200 dark:border-gray-700 object-contain flex-shrink-0"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-md bg-gray-100 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                                  <ClockIcon className="w-3.5 h-3.5 text-gray-400" />
                                </div>
                              )}
                              
                              {/* Title */}
                              <span className="text-sm text-gray-700 dark:text-gray-300 truncate group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                {generateTitle(item)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : user ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <ClockIcon className="w-10 h-10 text-gray-300 dark:text-gray-700 mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No analyses yet
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Upload a resume to get started
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Sign in to save your analyses
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {user && history.length > 0 && (
              <div className="p-3 border-t border-gray-100 dark:border-white/5">
                <button
                  onClick={onClear}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                  Clear history
                </button>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Toggle Button - Aligned with navbar */}
      <motion.button
        onClick={onToggle}
        animate={{ left: isOpen ? 292 : 24 }}
        transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="fixed top-6 z-50 p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
      >
        <svg 
          className="w-5 h-5 text-gray-600 dark:text-gray-400" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="9" y1="3" x2="9" y2="21" />
        </svg>
      </motion.button>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 bg-black/20 dark:bg-black/40 z-30 lg:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
};

