import React from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { AnalysisData } from '../types';
import { TargetCompanies } from './TargetCompanies';

interface RoastResultProps {
  data: AnalysisData;
  onReset: () => void;
  onFix?: () => void;
  title?: string;
  isFixMode?: boolean;
}

export const RoastResult: React.FC<RoastResultProps> = ({ 
  data, 
  onReset
}) => {
  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
      {/* Content - Just Startup Match */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <TargetCompanies careerAdvice={data.careerAdvice} />
      </div>
      
      {/* Footer Actions */}
      <div className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800 w-full flex flex-col items-center">
        <div className="flex flex-col items-center gap-6 w-full max-w-sm">
          <div className="grid grid-cols-1 w-full">
            <button
              onClick={onReset}
              className="flex items-center justify-center px-4 py-2.5 border border-gray-200 dark:border-gray-800 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-[0.98]"
            >
              <ArrowPathIcon className="w-3.5 h-3.5 mr-2" />
              Match Another Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
