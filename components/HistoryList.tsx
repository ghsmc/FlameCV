import React from 'react';
import { HistoryItem } from '../types';
import { ScoreRing } from './ScoreRing';
import { ClockIcon, DocumentTextIcon, TrashIcon } from '@heroicons/react/24/outline';

interface HistoryListProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ history, onSelect, onClear }) => {
  if (history.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mt-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-6 px-2">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {history.map((item) => (
          <div 
            key={item.id}
            onClick={() => onSelect(item)}
            className="group cursor-pointer bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4 hover:border-orange-300 dark:hover:border-orange-500/50 hover:shadow-md transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <ScoreRing score={item.analysis.score} grade={item.analysis.grade} size="sm" />
              <div className="flex flex-col">
                <span className="font-medium text-gray-900 dark:text-white text-sm truncate max-w-[180px]">
                  {item.fileName}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(item.timestamp).toLocaleDateString()} • {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
               <DocumentTextIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};