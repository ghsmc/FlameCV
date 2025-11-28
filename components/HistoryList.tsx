import React from 'react';
import { motion } from 'framer-motion';
import { HistoryItem } from '../types';
import { ClockIcon, TrashIcon, BuildingOfficeIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

interface HistoryListProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ history, onSelect, onClear }) => {
  if (history.length === 0) return null;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <ClockIcon className="w-5 h-5 text-gray-400" />
          Previous Analyses
        </h3>
        <button 
          onClick={onClear}
          className="text-xs text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 flex items-center gap-1 transition-colors"
        >
          <TrashIcon className="w-3.5 h-3.5" />
          Clear History
        </button>
      </div>

      <div className="space-y-4">
        {history.map((item, index) => {
          const matches = item.analysis.careerAdvice?.companyMatches || [];
          const topMatches = matches.slice(0, 4);
          const remainingCount = matches.length - 4;
          const summary = item.analysis.summary || item.analysis.careerAdvice?.realityCheck || '';
          
          return (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelect(item)}
              className="group cursor-pointer bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl p-5 hover:border-orange-300 dark:hover:border-orange-500/30 hover:shadow-lg transition-all"
            >
              {/* Header: Date & File */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 flex items-center justify-center">
                    <BuildingOfficeIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {item.fileName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(item.timestamp).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })} • {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  <span className="hidden sm:inline">View</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </div>
              </div>

              {/* Summary */}
              {summary && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {summary}
                </p>
              )}

              {/* Matched Companies Logos */}
              {topMatches.length > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 dark:text-gray-500 font-medium">
                    {matches.length} matches:
                  </span>
                  <div className="flex items-center -space-x-2">
                    {topMatches.map((company, i) => (
                      <img
                        key={i}
                        src={`https://img.logo.dev/${company.domain}?token=pk_c2nKhfMyRIOeCjrk-6-RRw`}
                        alt={company.name}
                        title={company.name}
                        className="w-8 h-8 rounded-lg border-2 border-white dark:border-gray-900 bg-white object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=f3f4f6&color=6b7280&size=32`;
                        }}
                      />
                    ))}
                    {remainingCount > 0 && (
                      <div className="w-8 h-8 rounded-lg border-2 border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          +{remainingCount}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tier breakdown */}
              {matches.length > 0 && (
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-white/5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {matches.filter(m => m.tier === 'Reach').length} Reach
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {matches.filter(m => m.tier === 'Target').length} Target
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {matches.filter(m => m.tier === 'Safety').length} Safety
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
