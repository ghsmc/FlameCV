import React from 'react';
import { CompanyMatch, CareerAdvice } from '../types';
import { BriefcaseIcon, CurrencyDollarIcon, UserIcon, ArrowTrendingUpIcon, ShieldCheckIcon, SparklesIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

interface TargetCompaniesProps {
  careerAdvice?: CareerAdvice;
  companies?: CompanyMatch[];
}

// Helper function to generate career page URLs
const getCareerPageUrl = (domain: string, companyName: string): string => {
  // Common career page patterns
  const baseDomain = domain.startsWith('http') ? domain : `https://${domain}`;
  const commonPaths = ['/careers', '/jobs', '/careers/jobs', '/join-us', '/work-with-us'];
  
  // Try the most common pattern first
  return `${baseDomain}/careers`;
};

// Helper function to generate job search URLs as fallback
const getJobSearchUrl = (companyName: string, recommendedRoles?: string[]): string => {
  // Use LinkedIn job search (no API key needed, just a search URL)
  const roleQuery = recommendedRoles && recommendedRoles.length > 0 
    ? encodeURIComponent(recommendedRoles[0])
    : '';
  const companyQuery = encodeURIComponent(companyName);
  
  // LinkedIn job search URL
  if (roleQuery) {
    return `https://www.linkedin.com/jobs/search/?keywords=${roleQuery}&f_C=${companyQuery}`;
  }
  return `https://www.linkedin.com/jobs/search/?f_C=${companyQuery}`;
};

const TierSection: React.FC< { title: string; icon: React.ReactNode; companies: CompanyMatch[]; colorClass: string; recommendedRoles?: string[] }> = ({ title, icon, companies, colorClass, recommendedRoles }) => {
  if (companies.length === 0) return null;
  
  return (
    <div className="flex flex-col gap-4">
      <h4 className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${colorClass}`}>
        {icon} {title}
      </h4>
      <div className="grid grid-cols-1 gap-3">
        {companies.map((company, index) => {
          const careerUrl = getCareerPageUrl(company.domain, company.name);
          const searchUrl = getJobSearchUrl(company.name, recommendedRoles);
          
          return (
            <div 
              key={index}
              className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-white/5 hover:border-gray-200 dark:hover:border-white/10 transition-all"
            >
              <img 
                src={`https://img.logo.dev/${company.domain}?token=pk_c2nKhfMyRIOeCjrk-6-RRw`}
                alt={`${company.name} logo`}
                className="w-12 h-12 rounded-lg object-contain bg-white border border-gray-100 shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${company.name}&background=random`;
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h5 className="font-bold text-gray-900 dark:text-white text-sm">
                    {company.name}
                  </h5>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-2">
                  {company.reason}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={careerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 flex items-center gap-1 transition-colors"
                  >
                    <BriefcaseIcon className="w-3 h-3" />
                    Careers Page
                  </a>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <a
                    href={searchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
                  >
                    <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                    LinkedIn Jobs
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const TargetCompanies: React.FC<TargetCompaniesProps> = ({ careerAdvice, companies }) => {
  const displayCompanies = careerAdvice?.companyMatches || companies || [];
  
  if (!careerAdvice && displayCompanies.length === 0) return null;

  // Group by tiers
  const reach = displayCompanies.filter(c => c.tier === 'Reach');
  const target = displayCompanies.filter(c => c.tier === 'Target');
  const safety = displayCompanies.filter(c => c.tier === 'Safety');

  return (
    <div className="w-full">
      
      <div className="flex flex-col gap-10">
        
        {/* Reality Check Header */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight flex items-center gap-2">
            <span className="text-2xl">🔮</span> Career Reality Check
          </h3>
          {careerAdvice?.realityCheck && (
            <div className="bg-orange-50 dark:bg-orange-900/10 border-l-4 border-orange-500 p-4 rounded-r-lg">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm italic">
                "{careerAdvice.realityCheck}"
              </p>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        {careerAdvice && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                <UserIcon className="w-3.5 h-3.5" /> Level
              </div>
              <div className="font-bold text-gray-900 dark:text-white text-lg">{careerAdvice.currentLevel}</div>
            </div>
            
            <div className="bg-white dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                <CurrencyDollarIcon className="w-3.5 h-3.5" /> Est. Comp
              </div>
              <div className="font-bold text-gray-900 dark:text-white text-lg">{careerAdvice.estimatedSalary}</div>
            </div>

            <div className="bg-white dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                <BriefcaseIcon className="w-3.5 h-3.5" /> Target Roles
              </div>
              <div className="flex flex-wrap gap-1.5">
                {careerAdvice.recommendedRoles.map((role, i) => (
                  <span key={i} className="text-[10px] font-medium bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tiered Company Matches */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <TierSection 
            title="Reach (Dream)" 
            icon={<SparklesIcon className="w-4 h-4" />} 
            companies={reach} 
            colorClass="text-purple-600 dark:text-purple-400"
            recommendedRoles={careerAdvice?.recommendedRoles}
          />
          <TierSection 
            title="Target (Realistic)" 
            icon={<ArrowTrendingUpIcon className="w-4 h-4" />} 
            companies={target} 
            colorClass="text-green-600 dark:text-green-400"
            recommendedRoles={careerAdvice?.recommendedRoles}
          />
          <TierSection 
            title="Safety (Solid)" 
            icon={<ShieldCheckIcon className="w-4 h-4" />} 
            companies={safety} 
            colorClass="text-blue-600 dark:text-blue-400"
            recommendedRoles={careerAdvice?.recommendedRoles}
          />
        </div>

      </div>
    </div>
  );
};