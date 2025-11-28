import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CompanyMatch, CareerAdvice } from '../types';
import { SwipeDeck } from './SwipeDeck';
import {
  BriefcaseIcon,
  CurrencyDollarIcon,
  UserIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UsersIcon,
  CalendarIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  CommandLineIcon,
  ChevronDownIcon,
  CheckIcon,
  XMarkIcon,
  HandRaisedIcon,
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
  onAction: (company: CompanyMatch, action: 'yes' | 'no') => void;
}> = ({ company, index, tierColor, onAction }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const careerUrl = getCareerPageUrl(company.domain);

  const handleYes = () => {
    window.open(careerUrl, '_blank');
    onAction(company, 'yes');
  };

  const handleNo = () => {
    setIsHidden(true);
    onAction(company, 'no');
  };

  if (isHidden) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group relative flex flex-col bg-white dark:bg-white/[0.03] rounded-xl sm:rounded-2xl border border-gray-200/80 dark:border-white/[0.06] hover:border-gray-300 dark:hover:border-white/10 hover:shadow-lg dark:hover:shadow-none transition-all duration-300 overflow-hidden"
    >
      {/* Match Score Badge */}
      {company.matchScore && (
        <div className={`absolute top-2 sm:top-3 right-2 sm:right-3 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold ${getMatchScoreColor(company.matchScore)}`}>
          {company.matchScore}%
        </div>
      )}

      {/* Main Content */}
      <div className="p-3 sm:p-5">
        {/* Header: Logo + Name + Industry */}
        <div className="flex items-start gap-2.5 sm:gap-4 mb-3 sm:mb-4">
          <img
            src={`https://img.logo.dev/${company.domain}?token=pk_c2nKhfMyRIOeCjrk-6-RRw`}
            alt={`${company.name} logo`}
            className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl object-contain bg-white border border-gray-100 dark:border-gray-800 shrink-0 shadow-sm"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=f3f4f6&color=6b7280&size=56`;
            }}
          />
          <div className="flex-1 min-w-0">
            <h5 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base truncate mb-0.5 sm:mb-1 pr-8 sm:pr-12">
              {company.name}
            </h5>
            {company.industry && (
              <span className={`inline-flex items-center text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-md ${tierColor}`}>
                {company.industry}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {company.description && (
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3 sm:mb-4 line-clamp-2">
            {company.description}
          </p>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
          {company.location && (
            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
              <MapPinIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="truncate">{company.location}</span>
            </div>
          )}
          {company.employeeCount && (
            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
              <UsersIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span>{company.employeeCount}</span>
            </div>
          )}
          {company.funding && (
            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
              <CurrencyDollarIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="truncate">{company.funding}</span>
            </div>
          )}
          {company.foundedYear && (
            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
              <CalendarIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span>{company.foundedYear}</span>
            </div>
          )}
        </div>

        {/* Tech Stack - Hidden on mobile to save space */}
        {company.techStack && company.techStack.length > 0 && (
          <div className="hidden sm:flex items-center gap-2 mb-4">
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

        {/* Investors - Hidden on mobile */}
        {company.investors && company.investors.length > 0 && (
          <div className="hidden sm:flex items-center gap-2 mb-4 text-xs text-gray-500 dark:text-gray-400">
            <BuildingOfficeIcon className="w-3.5 h-3.5 shrink-0" />
            <span>Backed by {company.investors.slice(0, 2).join(', ')}</span>
          </div>
        )}

        {/* Hiring Roles */}
        {company.hiringRoles && company.hiringRoles.length > 0 && (
          <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-3 sm:mb-4">
            {company.hiringRoles.slice(0, 2).map((role, i) => (
              <span
                key={i}
                className="text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 border border-violet-100 dark:border-violet-800/30"
              >
                {role}
              </span>
            ))}
          </div>
        )}

        {/* Expandable Match Reason */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-left py-1.5 sm:py-2 border-t border-gray-100 dark:border-white/5"
        >
          <span className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400">
            Why this matches you
          </span>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDownIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
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
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed pt-2 italic">
                "{company.reason}"
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Footer - Yes/No Buttons */}
      <div className="mt-auto border-t border-gray-100 dark:border-white/5 p-2 sm:p-3 bg-gray-50/50 dark:bg-white/[0.02]">
        <div className="flex gap-2">
          <button
            onClick={handleNo}
            className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg sm:rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors border border-red-200 dark:border-red-800/30 active:scale-95"
          >
            <XMarkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            No
          </button>
          <button
            onClick={handleYes}
            className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg sm:rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors border border-emerald-200 dark:border-emerald-800/30 active:scale-95"
          >
            <CheckIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Yes
          </button>
        </div>
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
  onCompanyAction: (company: CompanyMatch, action: 'yes' | 'no') => void;
}> = ({ title, subtitle, icon, companies, colorClass, bgClass, onCompanyAction }) => {
  if (companies.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4 sm:gap-6"
    >
      {/* Section Header */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${bgClass} ${colorClass}`}>
          <div className="w-5 h-5 sm:w-6 sm:h-6">{icon}</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <h4 className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              {title}
            </h4>
            <span className="text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400">
              {companies.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5">
        {companies.map((company, index) => (
          <CompanyCard
            key={`${company.name}-${index}`}
            company={company}
            index={index}
            tierColor={`${bgClass} ${colorClass}`}
            onAction={onCompanyAction}
          />
        ))}
      </div>
    </motion.div>
  );
};

export const TargetCompanies: React.FC<TargetCompaniesProps> = ({ careerAdvice, companies }) => {
  const [showSwipeMode, setShowSwipeMode] = useState(false);
  const [removedCompanies, setRemovedCompanies] = useState<Set<string>>(new Set());

  const displayCompanies = careerAdvice?.companyMatches || companies || [];

  if (!careerAdvice && displayCompanies.length === 0) return null;

  // Filter out removed companies
  const activeCompanies = displayCompanies.filter(c => !removedCompanies.has(c.name));

  // Group by tiers
  const reach = activeCompanies.filter(c => c.tier === 'Reach');
  const target = activeCompanies.filter(c => c.tier === 'Target');
  const safety = activeCompanies.filter(c => c.tier === 'Safety');

  const handleCompanyAction = (company: CompanyMatch, action: 'yes' | 'no') => {
    if (action === 'no') {
      setRemovedCompanies(prev => new Set([...prev, company.name]));
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-12">
        
        {/* Personalized Message Hero */}
        {careerAdvice && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-gray-200 dark:border-white/10 bg-gradient-to-br from-white to-gray-50 dark:from-white/[0.03] dark:to-white/[0.01]"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-red-500 to-purple-600"></div>

            <div className="p-4 sm:p-6 md:p-10">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4 sm:mb-8">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg flex-shrink-0">
                  <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                    Your Profile Analysis
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Personalized career insights
                  </p>
                </div>
              </div>

              {/* Reality Check Quote */}
              <blockquote className="text-base sm:text-xl md:text-2xl font-medium leading-relaxed text-gray-800 dark:text-gray-100 mb-6 sm:mb-10 pl-4 sm:pl-6 border-l-4 border-orange-500">
                {careerAdvice.realityCheck}
              </blockquote>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 pt-4 sm:pt-8 border-t border-gray-100 dark:border-white/10">
                <div className="space-y-1 sm:space-y-2">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Level
                  </div>
                  <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {careerAdvice.currentLevel}
                  </div>
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    <CurrencyDollarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Market Value
                  </div>
                  <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {careerAdvice.estimatedSalary}
                  </div>
                </div>

                <div className="space-y-1 sm:space-y-2 col-span-2 sm:col-span-1">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    <BriefcaseIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Target Roles
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {careerAdvice.recommendedRoles.slice(0, 3).map((role, i) => (
                      <span
                        key={i}
                        className="text-xs sm:text-sm font-semibold bg-orange-50 dark:bg-orange-900/20 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-orange-700 dark:text-orange-300 border border-orange-100 dark:border-orange-800/30"
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 py-3 sm:py-4 px-3 sm:px-6 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-3 sm:gap-6 w-full sm:w-auto">
            <div className="text-center flex-shrink-0">
              <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{activeCompanies.length}</div>
              <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Matches</div>
            </div>
            <div className="w-px h-6 sm:h-8 bg-gray-200 dark:bg-white/10" />
            <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-sm flex-wrap">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-500" />
                <span className="text-gray-600 dark:text-gray-400">{reach.length} Reach</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-500" />
                <span className="text-gray-600 dark:text-gray-400">{target.length} Target</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500" />
                <span className="text-gray-600 dark:text-gray-400">{safety.length} Safety</span>
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowSwipeMode(true)}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs sm:text-sm font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all shadow-md hover:shadow-lg w-full sm:w-auto"
          >
            <HandRaisedIcon className="w-4 h-4" />
            Swipe Mode
          </button>
        </div>

        {/* Tiered Company Matches */}
        <div className="flex flex-col gap-8 sm:gap-16">
          <TierSection
            title="Reach"
            subtitle="Ambitious targets — stretch but achievable"
            icon={<SparklesIcon className="w-6 h-6" />}
            companies={reach}
            colorClass="text-purple-600 dark:text-purple-400"
            bgClass="bg-purple-50 dark:bg-purple-900/20"
            onCompanyAction={handleCompanyAction}
          />
          <TierSection
            title="Target"
            subtitle="Great mutual fit — strong chance of success"
            icon={<ArrowTrendingUpIcon className="w-6 h-6" />}
            companies={target}
            colorClass="text-amber-600 dark:text-amber-400"
            bgClass="bg-amber-50 dark:bg-amber-900/20"
            onCompanyAction={handleCompanyAction}
          />
          <TierSection
            title="Safety"
            subtitle="High likelihood — you'd be a strong candidate"
            icon={<ShieldCheckIcon className="w-6 h-6" />}
            companies={safety}
            colorClass="text-blue-600 dark:text-blue-400"
            bgClass="bg-blue-50 dark:bg-blue-900/20"
            onCompanyAction={handleCompanyAction}
          />
        </div>

      </div>

      {/* Swipe Mode Overlay */}
      <AnimatePresence>
        {showSwipeMode && (
          <SwipeDeck
            companies={activeCompanies}
            onClose={() => setShowSwipeMode(false)}
            onCompanyAction={handleCompanyAction}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
