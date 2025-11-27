import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowPathIcon, ChevronDownIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import { AnalysisData, ThinkingProcess } from '../types';
import { TargetCompanies } from './TargetCompanies';

interface RoastResultProps {
  data: AnalysisData;
  onReset: () => void;
}

const SECTION_CONFIG: Record<string, { label: string; color: string }> = {
  resumeAnalysis: { label: 'Resume Analysis', color: 'blue' },
  preferencesAnalysis: { label: 'Preferences', color: 'purple' },
  intersectionAnalysis: { label: 'Sweet Spot', color: 'orange' },
  searchStrategy: { label: 'Search Strategy', color: 'green' },
};

const ThinkingSection: React.FC<{ thinking: ThinkingProcess }> = ({ thinking }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const sections = [
    { key: 'resumeAnalysis', data: thinking.resumeAnalysis },
    { key: 'preferencesAnalysis', data: thinking.preferencesAnalysis },
    { key: 'intersectionAnalysis', data: thinking.intersectionAnalysis },
    { key: 'searchStrategy', data: thinking.searchStrategy },
  ];

  return (
    <div className="mt-12 border-t border-gray-100 dark:border-gray-800 pt-8">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left group"
        whileTap={{ scale: 0.995 }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 group-hover:bg-orange-50 group-hover:text-orange-600 dark:group-hover:bg-orange-950/30 dark:group-hover:text-orange-400 transition-colors">
            <LightBulbIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
              View AI Reasoning
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              See how the AI analyzed your profile
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDownIcon className="w-5 h-5 text-gray-400" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <div className="mt-6 space-y-3">
              {sections.map(({ key, data }, index) => {
                const config = SECTION_CONFIG[key];
                const isExpanded = expandedSection === key;
                
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-xl border border-gray-200 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02] overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedSection(isExpanded ? null : key)}
                      className="w-full px-4 py-3.5 flex items-center gap-3 text-left hover:bg-gray-100/50 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Step number indicator */}
                      <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          {index + 1}
                        </span>
                      </div>
                      
                      <span className="font-medium text-gray-900 dark:text-white flex-1">
                        {data.title || config.label}
                      </span>
                      
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4">
                            <div className="pl-9 space-y-4">
                              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                {data.content}
                              </p>
                              
                              {data.insights && data.insights.length > 0 && (
                                <div className="space-y-2">
                                  <p className="text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                                    Key Insights
                                  </p>
                                  <ul className="space-y-2">
                                    {data.insights.map((insight, i) => (
                                      <motion.li 
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                                      >
                                        <span className="w-1 h-1 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                                        <span>{insight}</span>
                                      </motion.li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const RoastResult: React.FC<RoastResultProps> = ({ 
  data, 
  onReset
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="w-full"
    >
      {/* Content - Startup Matches */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <TargetCompanies careerAdvice={data.careerAdvice} />
      </motion.div>

      {/* AI Thinking Process */}
      {data.thinking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <ThinkingSection thinking={data.thinking} />
        </motion.div>
      )}
      
      {/* Footer Actions */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800 w-full flex flex-col items-center"
      >
        <div className="flex flex-col items-center gap-6 w-full max-w-sm">
          <div className="grid grid-cols-1 w-full">
            <motion.button
              onClick={onReset}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center px-4 py-2.5 border border-gray-200 dark:border-gray-800 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowPathIcon className="w-3.5 h-3.5 mr-2" />
              Match Another Profile
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
