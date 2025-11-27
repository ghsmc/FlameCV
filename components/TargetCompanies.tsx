import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CompanyMatch, CareerAdvice } from '../types';
import { 
  BriefcaseIcon, 
  CurrencyDollarIcon, 
  UserIcon, 
  ArrowTrendingUpIcon, 
  ShieldCheckIcon, 
  SparklesIcon, 
  ArrowTopRightOnSquareIcon,
  UsersIcon,
  CalendarIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  CommandLineIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

interface TargetCompaniesProps {
  careerAdvice?: CareerAdvice;
  companies?: CompanyMatch[];
}

// Helper function to generate career page URLs
const getCareerPageUrl = (domain: string): string => {
  const baseDomain = domain.startsWith('http') ? domain : `https://${domain}`;
  return `${baseDomain}/careers`;
};

// Match score color helper
const getMatchScoreColor = (score?: number) => {
  if (!score) return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  if (score >= 85) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
  if (score >= 70) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
  if (score >= 50) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
  return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
};

const CompanyCard: React.FC<{ 
  company: CompanyMatch; 
  index: number;
  tierColor: string;
}> = ({ company, index, tierColor }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const careerUrl = getCareerPageUrl(company.domain);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group relative flex flex-col bg-white dark:bg-white/[0.03] rounded-2xl border border-gray-200/80 dark:border-white/[0.06] hover:border-gray-300 dark:hover:border-white/10 hover:shadow-lg dark:hover:shadow-none transition-all duration-300 overflow-hidden"
    >
      {/* Match Score Badge */}
      {company.matchScore && (
        <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold ${getMatchScoreColor(company.matchScore)}`}>
          {company.matchScore}% match
        </div>
      )}

      {/* Main Content */}
      <div className="p-5">
        {/* Header: Logo + Name + Industry */}
        <div className="flex items-start gap-4 mb-4">
          <img 
            src={`https://img.logo.dev/${company.domain}?token=pk_c2nKhfMyRIOeCjrk-6-RRw`}
            alt={`${company.name} logo`}
            className="w-14 h-14 rounded-xl object-contain bg-white border border-gray-100 dark:border-gray-800 shrink-0 shadow-sm"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=f3f4f6&color=6b7280&size=56`;
            }}
          />
          <div className="flex-1 min-w-0">
            <h5 className="font-bold text-gray-900 dark:text-white text-base truncate mb-1">
              {company.name}
            </h5>
            {company.industry && (
              <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md ${tierColor}`}>
                {company.industry}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {company.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4 line-clamp-2">
            {company.description}
          </p>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {company.location && (
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <MapPinIcon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{company.location}</span>
            </div>
          )}
          {company.employeeCount && (
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <UsersIcon className="w-3.5 h-3.5 shrink-0" />
              <span>{company.employeeCount} people</span>
            </div>
          )}
          {company.funding && (
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <CurrencyDollarIcon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{company.funding}</span>
            </div>
          )}
          {company.foundedYear && (
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
              <span>Founded {company.foundedYear}</span>
            </div>
          )}
        </div>

        {/* Tech Stack */}
        {company.techStack && company.techStack.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <CommandLineIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <div className="flex flex-wrap gap-1.5">
              {company.techStack.slice(0, 4).map((tech, i) => (
                <span 
                  key={i} 
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Investors */}
        {company.investors && company.investors.length > 0 && (
          <div className="flex items-center gap-2 mb-4 text-xs text-gray-500 dark:text-gray-400">
            <BuildingOfficeIcon className="w-3.5 h-3.5 shrink-0" />
            <span>Backed by {company.investors.slice(0, 2).join(', ')}</span>
          </div>
        )}

        {/* Hiring Roles */}
        {company.hiringRoles && company.hiringRoles.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {company.hiringRoles.map((role, i) => (
              <span 
                key={i} 
                className="text-xs font-medium px-2 py-1 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-800/30"
              >
                Hiring: {role}
              </span>
            ))}
          </div>
        )}

        {/* Expandable Match Reason */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-left py-2 border-t border-gray-100 dark:border-white/5"
        >
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Why this matches you
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
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed pt-2 italic">
                "{company.reason}"
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Footer */}
      <div className="mt-auto border-t border-gray-100 dark:border-white/5 p-3 bg-gray-50/50 dark:bg-white/[0.02]">
        <a
          href={careerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-semibold text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
        >
          View Careers
          <ArrowTopRightOnSquareIcon className="w-4 h-4" />
        </a>
      </div>
    </motion.div>
  );
};

const TierSection: React.FC<{ 
  title: string; 
  subtitle: string;
  icon: React.ReactNode; 
  companies: CompanyMatch[]; 
  colorClass: string; 
  bgClass: string; 
}> = ({ title, subtitle, icon, companies, colorClass, bgClass }) => {
  if (companies.length === 0) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6"
    >
      {/* Section Header */}
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${bgClass} ${colorClass}`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h4 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              {title}
            </h4>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400">
              {companies.length}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>
      
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {companies.map((company, index) => (
          <CompanyCard 
            key={`${company.name}-${index}`} 
            company={company}
            index={index}
            tierColor={`${bgClass} ${colorClass}`}
          />
        ))}
      </div>
    </motion.div>
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
      <div className="flex flex-col gap-12">
        
        {/* Personalized Message Hero */}
        {careerAdvice && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-gradient-to-br from-white to-gray-50 dark:from-white/[0.03] dark:to-white/[0.01]"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-red-500 to-purple-600"></div>
            
            <div className="p-8 md:p-10">
              {/* Header */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                  <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Your Profile Analysis
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Personalized career insights
                  </p>
                </div>
              </div>

              {/* Reality Check Quote */}
              <blockquote className="text-xl md:text-2xl font-medium leading-relaxed text-gray-800 dark:text-gray-100 mb-10 pl-6 border-l-4 border-orange-500">
                {careerAdvice.realityCheck}
              </blockquote>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-gray-100 dark:border-white/10">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    <UserIcon className="w-4 h-4" /> Level
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {careerAdvice.currentLevel}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    <CurrencyDollarIcon className="w-4 h-4" /> Market Value
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {careerAdvice.estimatedSalary}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    <BriefcaseIcon className="w-4 h-4" /> Target Roles
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {careerAdvice.recommendedRoles.slice(0, 3).map((role, i) => (
                      <span 
                        key={i} 
                        className="text-sm font-semibold bg-orange-50 dark:bg-orange-900/20 px-3 py-1.5 rounded-lg text-orange-700 dark:text-orange-300 border border-orange-100 dark:border-orange-800/30"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Summary Stats Bar */}
        <div className="flex items-center justify-between py-4 px-6 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{displayCompanies.length}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Matches</div>
            </div>
            <div className="w-px h-8 bg-gray-200 dark:bg-white/10" />
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-gray-600 dark:text-gray-400">{reach.length} Reach</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-gray-600 dark:text-gray-400">{target.length} Target</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-gray-600 dark:text-gray-400">{safety.length} Safety</span>
              </span>
            </div>
          </div>
        </div>

        {/* Tiered Company Matches */}
        <div className="flex flex-col gap-16">
          <TierSection 
            title="Reach" 
            subtitle="Ambitious targets — stretch but achievable"
            icon={<SparklesIcon className="w-6 h-6" />} 
            companies={reach} 
            colorClass="text-purple-600 dark:text-purple-400"
            bgClass="bg-purple-50 dark:bg-purple-900/20"
          />
          <TierSection 
            title="Target" 
            subtitle="Great mutual fit — strong chance of success"
            icon={<ArrowTrendingUpIcon className="w-6 h-6" />} 
            companies={target} 
            colorClass="text-green-600 dark:text-green-400"
            bgClass="bg-green-50 dark:bg-green-900/20"
          />
          <TierSection 
            title="Safety" 
            subtitle="High likelihood — you'd be a strong candidate"
            icon={<ShieldCheckIcon className="w-6 h-6" />} 
            companies={safety} 
            colorClass="text-blue-600 dark:text-blue-400"
            bgClass="bg-blue-50 dark:bg-blue-900/20"
          />
        </div>

      </div>
    </div>
  );
};
