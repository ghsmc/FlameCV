import React from 'react';
import { CompanyMatch, CareerAdvice } from '../types';
import { BriefcaseIcon, CurrencyDollarIcon, UserIcon } from '@heroicons/react/24/outline';

interface TargetCompaniesProps {
  careerAdvice?: CareerAdvice;
  // Fallback for older interface if needed, though we use careerAdvice primarily now
  companies?: CompanyMatch[];
}

const TierBadge: React.FC<{ tier: string }> = ({ tier }) => {
  let colors = "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
  if (tier === 'Reach') colors = "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
  if (tier === 'Target') colors = "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
  if (tier === 'Safety') colors = "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";

  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${colors}`}>
      {tier}
    </span>
  );
};

export const TargetCompanies: React.FC<TargetCompaniesProps> = ({ careerAdvice, companies }) => {
  // Handle fallback if only companies list is provided (backward compatibility)
  const displayCompanies = careerAdvice?.companyMatches || companies || [];
  
  if (!careerAdvice && displayCompanies.length === 0) return null;

  return (
    <div className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800 w-full animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
      
      <div className="flex flex-col gap-8">
        
        {/* Reality Check Header */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight flex items-center gap-2">
            <span className="text-2xl">🔮</span> Career Reality Check
          </h3>
          {careerAdvice?.realityCheck && (
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl text-base border-l-4 border-orange-500 pl-4 py-1 italic">
              "{careerAdvice.realityCheck}"
            </p>
          )}
        </div>

        {/* Stats Grid */}
        {careerAdvice && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10">
              <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">
                <UserIcon className="w-4 h-4" /> Assessed Level
              </div>
              <div className="font-bold text-gray-900 dark:text-white">{careerAdvice.currentLevel}</div>
            </div>
            
            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10">
              <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">
                <CurrencyDollarIcon className="w-4 h-4" /> Market Value
              </div>
              <div className="font-bold text-gray-900 dark:text-white">{careerAdvice.estimatedSalary}</div>
            </div>

            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10">
              <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">
                <BriefcaseIcon className="w-4 h-4" /> Target Roles
              </div>
              <div className="flex flex-wrap gap-1.5">
                {careerAdvice.recommendedRoles.map((role, i) => (
                  <span key={i} className="text-xs bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 px-2 py-0.5 rounded text-gray-800 dark:text-gray-200">
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Company Matches */}
        <div>
           <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
            Potential Matches
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayCompanies.map((company, index) => (
              <div 
                key={index}
                className="flex flex-col p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B1121] hover:border-gray-300 dark:hover:border-gray-700 transition-colors shadow-sm h-full"
              >
                <div className="flex items-start justify-between mb-3">
                  <img 
                    src={`https://img.logo.dev/${company.domain}?token=pk_c2nKhfMyRIOeCjrk-6-RRw`}
                    alt={`${company.name} logo`}
                    className="w-10 h-10 rounded object-contain bg-white border border-gray-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${company.name}&background=random`;
                    }}
                  />
                  {company.tier && <TierBadge tier={company.tier} />}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                    {company.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {company.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};