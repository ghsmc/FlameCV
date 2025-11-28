import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HistoryItem } from '../types';
import { ClockIcon, TrashIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface HistoryListProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

// Generate a dynamic, interesting title based on the analysis content
const generateTitle = (item: HistoryItem): string => {
  const matches = item.analysis.careerAdvice?.companyMatches || [];
  const targetRole = item.analysis.careerAdvice?.recommendedRoles?.[0];
  const level = item.analysis.careerAdvice?.currentLevel;
  const salary = item.analysis.careerAdvice?.estimatedSalary;
  
  // Creative title patterns
  const patterns = [
    // Role-focused
    () => targetRole && matches.length > 0 && `Your path to ${targetRole}`,
    () => targetRole && `${targetRole} opportunities unlocked`,
    
    // Level + salary focused  
    () => level && salary && `${level} • ${salary} range`,
    () => level && matches.length > 0 && `${level} → ${matches.length} perfect fits`,
    
    // Match-focused
    () => matches.length >= 10 && `${matches.length} startups want you`,
    () => matches.length > 0 && matches[0].tier === 'Reach' && `Reach for ${matches[0].name}`,
    () => matches.length > 0 && `${matches.length} matches found`,
  ];
  
  // Find first valid pattern
  for (const pattern of patterns) {
    const result = pattern();
    if (result) return result;
  }
  
  // Fallback
  const nameWithoutExt = item.fileName.replace(/\.[^/.]+$/, '');
  return `Analysis: ${nameWithoutExt}`;
};

export const HistoryList: React.FC<HistoryListProps> = ({ history, onSelect, onClear }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (history.length === 0) return null;

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedId(expandedId === id ? null : id);
  };

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

      <div className="space-y-2">
        {history.map((item, index) => {
          const matches = item.analysis.careerAdvice?.companyMatches || [];
          const topMatches = matches.slice(0, 5);
          const remainingCount = Math.max(0, matches.length - 5);
          const summary = item.analysis.summary || item.analysis.careerAdvice?.realityCheck || '';
          const title = generateTitle(item);
          const isExpanded = expandedId === item.id;
          
          return (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden hover:border-gray-300 dark:hover:border-white/20 transition-all"
            >
              {/* Main Row - Title + Top 3 Logos */}
              <div 
                className="flex items-center justify-between px-4 py-3 cursor-pointer group"
                onClick={() => onSelect(item)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Expand/Collapse Button */}
                  <button
                    onClick={(e) => toggleExpand(item.id, e)}
                    className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-white/10 transition-colors flex-shrink-0"
                  >
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                    </motion.div>
                  </button>
                  
                  {/* Title */}
                  <span className="font-medium text-gray-900 dark:text-white text-sm truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {title}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                  {/* Top 3 Company Logos */}
                  {topMatches.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      {topMatches.slice(0, 3).map((company, i) => (
                        <div key={i} className="relative group/logo">
                          <img
                            src={`https://img.logo.dev/${company.domain}?token=pk_c2nKhfMyRIOeCjrk-6-RRw`}
                            alt={company.name}
                            className="w-6 h-6 rounded-md border border-gray-200 dark:border-gray-700 bg-white object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=f3f4f6&color=6b7280&size=24`;
                            }}
                          />
                          {/* Tooltip on hover */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs rounded-md whitespace-nowrap opacity-0 group-hover/logo:opacity-100 transition-opacity pointer-events-none z-10">
                            {company.name}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-white" />
                          </div>
                        </div>
                      ))}
                      {matches.length > 3 && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          +{matches.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Timestamp */}
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(item.timestamp).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {/* Expandable Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-1 border-t border-gray-100 dark:border-white/5">
                      {/* Summary */}
                      {summary && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                          {summary}
                        </p>
                      )}

                      {/* Matched Companies Logos */}
                      {topMatches.length > 0 && (
                        <div className="mb-3">
                          <span className="text-xs text-gray-500 dark:text-gray-500 font-medium mb-2 block">
                            {matches.length} startup matches
                          </span>
                          <div className="flex items-center gap-2 flex-wrap">
                            {topMatches.map((company, i) => (
                              <div key={i} className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 rounded-lg px-2 py-1">
                                <img
                                  src={`https://img.logo.dev/${company.domain}?token=pk_c2nKhfMyRIOeCjrk-6-RRw`}
                                  alt={company.name}
                                  className="w-5 h-5 rounded object-contain bg-white"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=f3f4f6&color=6b7280&size=20`;
                                  }}
                                />
                                <span className="text-xs text-gray-700 dark:text-gray-300">{company.name}</span>
                              </div>
                            ))}
                            {remainingCount > 0 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                +{remainingCount} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Tier breakdown */}
                      {matches.length > 0 && (
                        <div className="flex items-center gap-4">
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

                      {/* View Full Analysis Button */}
                      <button
                        onClick={() => onSelect(item)}
                        className="mt-4 w-full py-2 text-sm font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                      >
                        View Full Analysis
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
