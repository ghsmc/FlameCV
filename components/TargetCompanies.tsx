import React, { useState } from 'react';
import { CompanyMatch, CareerAdvice } from '../types';
import { BriefcaseIcon, CurrencyDollarIcon, UserIcon, ArrowTrendingUpIcon, ShieldCheckIcon, SparklesIcon, ArrowTopRightOnSquareIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';

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

const CompanyCard: React.FC<{ company: CompanyMatch; recommendedRoles?: string[] }> = ({ company, recommendedRoles }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const careerUrl = getCareerPageUrl(company.domain, company.name);

  return (
    <div 
      className="flex flex-col gap-3 p-4 rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-white/5 hover:border-gray-200 dark:hover:border-white/10 transition-all animate-in fade-in zoom-in-95 duration-300"
    >
      <div className="flex items-start gap-4">
        <img 
          src={`https://img.logo.dev/${company.domain}?token=pk_c2nKhfMyRIOeCjrk-6-RRw`}
          alt={`${company.name} logo`}
          className="w-12 h-12 rounded-lg object-contain bg-white border border-gray-100 shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${company.name}&background=random`;
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h5 className="font-bold text-gray-900 dark:text-white text-sm truncate">
              {company.name}
            </h5>
            {company.funding && (
              <span className="text-[10px] font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded shrink-0">
                {company.funding}
              </span>
            )}
          </div>
          
          {company.location && (
            <p className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1 mb-2">
              📍 {company.location}
            </p>
          )}

          {company.description && (
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-2 line-clamp-2">
              {company.description}
            </p>
          )}

          <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-relaxed italic border-t border-gray-100 dark:border-white/5 pt-2 mt-1">
            "{company.reason}"
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-1">
        <button
          onClick={() => setIsVisible(false)}
          className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
        >
          <XMarkIcon className="w-4 h-4" /> No
        </button>
        <a
          href={careerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
        >
          <CheckIcon className="w-4 h-4" /> Yes
        </a>
      </div>
    </div>
  );
};

const TierSection: React.FC< { title: string; icon: React.ReactNode; companies: CompanyMatch[]; colorClass: string; bgClass: string; borderClass: string; recommendedRoles?: string[] }> = ({ title, icon, companies, colorClass, bgClass, borderClass, recommendedRoles }) => {
  if (companies.length === 0) return null;
  
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 border-b border-gray-100 dark:border-white/5 pb-4">
        <div className={`p-2 rounded-lg ${bgClass} ${colorClass}`}>
          {icon}
        </div>
        <h4 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
          {title}
        </h4>
        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 ml-auto">
          {companies.length} Matches
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {companies.map((company, index) => (
          <CompanyCard 
            key={`${company.name}-${index}`} 
            company={company} 
            recommendedRoles={recommendedRoles} 
          />
        ))}
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
        
        {/* Personalized Message Hero */}
        {careerAdvice && (
          <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-lg">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-red-500 to-purple-600"></div>
            
            <div className="p-8 md:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center text-xl">
                  🎾
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-none">
                    Message from Matchpoint
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Your personal talent agent
                  </p>
                </div>
              </div>

              <div className="prose prose-lg dark:prose-invert max-w-none mb-10">
                <p className="text-xl md:text-2xl font-medium leading-relaxed text-gray-800 dark:text-gray-100">
                  "{careerAdvice.realityCheck}"
                </p>
              </div>

              {/* Integrated Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-gray-100 dark:border-white/10">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-widest">
                    <UserIcon className="w-4 h-4" /> Assessed Level
                  </div>
                  <div className="font-bold text-gray-900 dark:text-white text-xl">{careerAdvice.currentLevel}</div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2 text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-widest">
                    <CurrencyDollarIcon className="w-4 h-4" /> Market Value
                  </div>
                  <div className="font-bold text-gray-900 dark:text-white text-xl">{careerAdvice.estimatedSalary}</div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2 text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-widest">
                    <BriefcaseIcon className="w-4 h-4" /> Best Fit Roles
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {careerAdvice.recommendedRoles.map((role, i) => (
                      <span key={i} className="text-xs font-semibold bg-gray-100 dark:bg-white/10 px-2.5 py-1 rounded-md text-gray-700 dark:text-gray-200">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tiered Company Matches */}
        <div className="flex flex-col gap-16">
          <TierSection 
            title="Reach (High Growth / Unicorns)" 
            icon={<SparklesIcon className="w-5 h-5" />} 
            companies={reach} 
            colorClass="text-purple-600 dark:text-purple-400"
            bgClass="bg-purple-50 dark:bg-purple-900/20"
            borderClass="border-purple-100 dark:border-purple-900/30"
            recommendedRoles={careerAdvice?.recommendedRoles}
          />
          <TierSection 
            title="Target (Series A-B / Building)" 
            icon={<ArrowTrendingUpIcon className="w-5 h-5" />} 
            companies={target} 
            colorClass="text-green-600 dark:text-green-400"
            bgClass="bg-green-50 dark:bg-green-900/20"
            borderClass="border-green-100 dark:border-green-900/30"
            recommendedRoles={careerAdvice?.recommendedRoles}
          />
          <TierSection 
            title="Safety (Seed / Early Stage)" 
            icon={<ShieldCheckIcon className="w-5 h-5" />} 
            companies={safety} 
            colorClass="text-blue-600 dark:text-blue-400"
            bgClass="bg-blue-50 dark:bg-blue-900/20"
            borderClass="border-blue-100 dark:border-blue-900/30"
            recommendedRoles={careerAdvice?.recommendedRoles}
          />
        </div>

      </div>
    </div>
  );
};