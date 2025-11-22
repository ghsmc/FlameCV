import React from 'react';
import { TargetCompany } from '../types';

interface TargetCompaniesProps {
  companies: TargetCompany[];
}

export const TargetCompanies: React.FC<TargetCompaniesProps> = ({ companies }) => {
  if (!companies || companies.length === 0) return null;

  return (
    <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 w-full animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 tracking-tight">
        Where you should apply
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {companies.map((company, index) => (
          <div 
            key={index}
            className="flex items-start p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B1121] hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
          >
            <div className="flex-shrink-0 mr-4">
              <img 
                src={`https://img.logo.dev/${company.domain}?token=pk_c2nKhfMyRIOeCjrk-6-RRw`}
                alt={`${company.name} logo`}
                className="w-10 h-10 rounded object-contain bg-white"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${company.name}&background=random`;
                }}
              />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                {company.name}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                {company.reason}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};