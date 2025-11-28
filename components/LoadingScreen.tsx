import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export interface ThinkingStep {
  phase: string;
  content: string;
  timestamp: number;
}

interface LoadingScreenProps {
  thinkingSteps?: ThinkingStep[];
  showThinking?: boolean;
}

// Section configuration matching the AI Reasoning view
const SECTION_CONFIG: {
  phase: string;
  title: string;
  subtitle: string;
}[] = [
  {
    phase: 'resume',
    title: 'Resume Deep Dive',
    subtitle: 'Analyzing your experience and skills',
  },
  {
    phase: 'preferences',
    title: 'What You Really Want',
    subtitle: 'Reading between the lines',
  },
  {
    phase: 'intersection',
    title: 'The Sweet Spot',
    subtitle: 'Where you\'ll thrive',
  },
  {
    phase: 'search',
    title: 'Your Search Strategy',
    subtitle: 'Planning the perfect matches',
  },
];

// Shimmer text effect
const ShimmerText: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <motion.span
    className={`relative inline-block bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-orange-500 to-gray-900 dark:from-white dark:via-orange-400 dark:to-white bg-[length:200%_100%] ${className}`}
    animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
  >
    {children}
  </motion.span>
);

// Animated dots for active state
const ThinkingDots: React.FC = () => (
  <span className="inline-flex ml-1.5">
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="w-1 h-1 bg-orange-500 rounded-full mx-0.5"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          delay: i * 0.2,
        }}
      />
    ))}
  </span>
);

// Typewriter effect for streaming content
const TypewriterText: React.FC<{ text: string; speed?: number }> = ({ text, speed = 15 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    setIsComplete(false);
    let index = 0;
    
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span>
      {displayedText}
      {!isComplete && (
        <motion.span
          className="inline-block w-0.5 h-4 bg-orange-500 ml-0.5 align-middle"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}
    </span>
  );
};

// Single reasoning section card
const ReasoningSection: React.FC<{
  config: typeof SECTION_CONFIG[0];
  step: ThinkingStep | undefined;
  index: number;
  isActive: boolean;
  isComplete: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ config, step, index, isActive, isComplete, isExpanded, onToggle }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className={`rounded-xl border overflow-hidden transition-all duration-300 ${
        isActive
          ? 'border-orange-300 dark:border-orange-500/30 bg-orange-50/50 dark:bg-orange-900/10'
          : isComplete
          ? 'border-gray-200 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]'
          : 'border-gray-200/50 dark:border-white/[0.03] bg-gray-50/30 dark:bg-white/[0.01] opacity-50'
      }`}
    >
      <button
        onClick={onToggle}
        disabled={!step}
        className={`w-full px-4 py-3.5 flex items-center gap-3 text-left transition-colors ${
          step ? 'hover:bg-gray-100/50 dark:hover:bg-white/[0.02] cursor-pointer' : 'cursor-default'
        }`}
      >
        {/* Step number indicator */}
        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
          isActive
            ? 'bg-orange-500 text-white'
            : isComplete
            ? 'bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400'
            : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-600'
        }`}>
          {isActive ? (
            <motion.div
              className="w-2 h-2 bg-white rounded-full"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          ) : (
            <span className="text-xs font-medium">{index + 1}</span>
          )}
        </div>
        
        {/* Title */}
        <div className="flex-1 min-w-0">
          {isActive ? (
            <div className="flex items-center">
              <ShimmerText className="font-medium text-sm sm:text-base">
                {config.title}
              </ShimmerText>
              <ThinkingDots />
            </div>
          ) : (
            <span className={`font-medium text-sm sm:text-base ${
              isComplete ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'
            }`}>
              {config.title}
            </span>
          )}
          {isActive && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-orange-600 dark:text-orange-400 mt-0.5"
            >
              {config.subtitle}
            </motion.p>
          )}
        </div>
        
        {/* Chevron */}
        {step && (
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0"
          >
            <ChevronDownIcon className={`w-4 h-4 ${
              isActive ? 'text-orange-500' : 'text-gray-400'
            }`} />
          </motion.div>
        )}
      </button>

      {/* Expandable content */}
      <AnimatePresence>
        {isExpanded && step && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <div ref={contentRef} className="px-4 pb-4">
              <div className="pl-9">
                <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                  {isActive ? (
                    <TypewriterText text={step.content} speed={8} />
                  ) : (
                    step.content
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Stars background component
const Stars: React.FC = () => {
  const [stars] = useState(() => 
    Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 60}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 3,
    }))
  );

  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: star.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  thinkingSteps = [],
  showThinking = false
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [completedPhases, setCompletedPhases] = useState<Set<string>>(new Set());

  // Get the step data for each phase
  const getStepForPhase = (phase: string) => {
    return thinkingSteps.find(s => s.phase === phase);
  };

  // Determine active phase (last one that has content)
  const activePhase = thinkingSteps.length > 0 
    ? thinkingSteps[thinkingSteps.length - 1]?.phase 
    : null;

  // Track completed phases
  useEffect(() => {
    if (activePhase) {
      // Mark previous phases as complete
      const phaseIndex = SECTION_CONFIG.findIndex(s => s.phase === activePhase);
      const newCompleted = new Set<string>();
      
      for (let i = 0; i < phaseIndex; i++) {
        newCompleted.add(SECTION_CONFIG[i].phase);
      }
      
      setCompletedPhases(newCompleted);
      
      // Auto-expand the active section
      setExpandedSection(activePhase);
    }
  }, [activePhase]);

  // When a phase completes, collapse it after a delay
  useEffect(() => {
    if (completedPhases.size > 0) {
      const lastCompleted = Array.from(completedPhases).pop();
      if (lastCompleted && expandedSection === lastCompleted) {
        // Keep expanded for a moment, then collapse
        const timer = setTimeout(() => {
          if (activePhase && activePhase !== lastCompleted) {
            setExpandedSection(activePhase);
          }
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [completedPhases, activePhase, expandedSection]);

  // Calculate progress for background animation
  const progress = Math.min(thinkingSteps.length / 6, 1);
  const isNight = progress > 0.6;
  const rotation = progress * 180;

  // Check if we're in the searching phase
  const isSearching = thinkingSteps.some(s => s.phase === 'searching' || s.phase === 'structuring');

  if (showThinking && thinkingSteps.length > 0) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden">
        {/* Animated Landscape Background */}
        <motion.div 
          className="absolute inset-0 z-0"
          animate={{
            background: isNight 
              ? 'linear-gradient(to bottom, #020617 0%, #1e1b4b 100%)'
              : progress > 0.4 
                ? 'linear-gradient(to bottom, #4c1d95 0%, #db2777 50%, #ea580c 100%)'
                : 'linear-gradient(to bottom, #38bdf8 0%, #bae6fd 100%)'
          }}
          transition={{ duration: 2, ease: "easeInOut" }}
        >
          {/* Stars Layer */}
          <motion.div 
            className="absolute inset-0"
            animate={{ opacity: isNight ? 1 : 0 }}
            transition={{ duration: 2 }}
          >
            <Stars />
          </motion.div>

          {/* Celestial Rotating Container */}
          <motion.div
            className="absolute left-1/2 bottom-0 w-[200vmax] h-[200vmax] origin-center"
            style={{ 
              marginBottom: '-200vmax',
              marginLeft: '-100vmax',
            }}
            animate={{ rotate: rotation }} 
            transition={{ type: "spring", stiffness: 10, damping: 20 }}
          >
            {/* SUN */}
            <div className="absolute top-[15%] left-[25%] -translate-x-1/2 -translate-y-1/2">
              <div className="relative w-32 h-32 sm:w-48 sm:h-48">
                <div className="absolute inset-0 rounded-full bg-orange-400 blur-3xl opacity-60" />
                <div className="absolute inset-4 rounded-full bg-orange-300 blur-2xl opacity-80" />
                <div className="absolute inset-8 rounded-full bg-orange-100 blur-xl" />
                <div className="absolute inset-10 rounded-full bg-white shadow-[0_0_100px_rgba(251,146,60,0.8)]" />
              </div>
            </div>

            {/* MOON */}
            <div className="absolute bottom-[15%] right-[25%] -translate-x-1/2 -translate-y-1/2 rotate-180">
              <div className="relative w-24 h-24 sm:w-32 sm:h-32">
                <div className="absolute inset-0 rounded-full bg-slate-200 blur-xl opacity-20" />
                <div className="absolute inset-2 rounded-full bg-slate-100 blur-md opacity-90" />
                <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-slate-300/50 rounded-full blur-[1px]" />
                <div className="absolute bottom-1/3 right-1/4 w-6 h-6 bg-slate-300/40 rounded-full blur-[1px]" />
                <div className="absolute inset-0 rounded-full shadow-[0_0_50px_rgba(255,255,255,0.4)]" />
              </div>
            </div>
          </motion.div>

          {/* Mountains */}
          <div className="absolute bottom-0 left-0 right-0 h-full pointer-events-none z-10">
            <motion.div 
              className="absolute bottom-0 left-0 right-0 h-[45%]"
              animate={{
                filter: isNight 
                  ? 'brightness(0.2) contrast(1.1) hue-rotate(-15deg)' 
                  : progress > 0.4 
                    ? 'brightness(0.6) sepia(0.4) hue-rotate(-10deg)' 
                    : 'brightness(1) contrast(1)'
              }}
              transition={{ duration: 2 }}
              style={{
                background: 'linear-gradient(180deg, #fdba74 0%, #f97316 100%)',
                clipPath: 'polygon(0% 100%, 0% 40%, 15% 20%, 30% 35%, 45% 15%, 60% 30%, 75% 10%, 90% 25%, 100% 20%, 100% 100%)',
              }}
            />
            
            <motion.div 
              className="absolute bottom-0 left-0 right-0 h-[35%]"
              animate={{
                filter: isNight 
                  ? 'brightness(0.15) contrast(1.1) hue-rotate(-15deg)' 
                  : progress > 0.4 
                    ? 'brightness(0.5) sepia(0.5) hue-rotate(-15deg)' 
                    : 'brightness(1) contrast(1)'
              }}
              transition={{ duration: 2 }}
              style={{
                background: 'linear-gradient(180deg, #fb923c 0%, #ea580c 100%)',
                clipPath: 'polygon(0% 100%, 0% 60%, 20% 35%, 35% 55%, 50% 30%, 65% 45%, 80% 25%, 100% 40%, 100% 100%)',
              }}
            />
            
            <motion.div 
              className="absolute bottom-0 left-0 right-0 h-[25%]"
              animate={{
                filter: isNight 
                  ? 'brightness(0.1) contrast(1.2) hue-rotate(-20deg)' 
                  : progress > 0.4 
                    ? 'brightness(0.4) sepia(0.6) hue-rotate(-20deg)' 
                    : 'brightness(1) contrast(1)'
              }}
              transition={{ duration: 2 }}
              style={{
                background: 'linear-gradient(180deg, #f97316 0%, #dc2626 100%)',
                clipPath: 'polygon(0% 100%, 0% 75%, 25% 55%, 50% 70%, 75% 50%, 100% 65%, 100% 100%)',
              }}
            />
          </div>
        </motion.div>

        {/* Content Overlay */}
        <div className="relative z-20 w-full max-w-xl px-4 sm:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-4 sm:p-6"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="relative w-10 h-10">
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400 to-red-500"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="absolute inset-2 rounded-full bg-white dark:bg-gray-900" />
                <motion.div
                  className="absolute inset-3 rounded-full bg-gradient-to-br from-orange-400 to-red-500"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              </div>
              
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  {isSearching ? 'Finding Your Matches' : 'Analyzing Your Profile'}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {isSearching ? 'Searching for startups that fit you perfectly' : 'See how the AI thinks about your profile'}
                </p>
              </div>
            </div>

            {/* Reasoning sections */}
            <div className="space-y-2">
              {SECTION_CONFIG.map((config, index) => {
                const step = getStepForPhase(config.phase);
                const isActive = activePhase === config.phase;
                const isComplete = completedPhases.has(config.phase);
                
                return (
                  <ReasoningSection
                    key={config.phase}
                    config={config}
                    step={step}
                    index={index}
                    isActive={isActive}
                    isComplete={isComplete}
                    isExpanded={expandedSection === config.phase}
                    onToggle={() => setExpandedSection(
                      expandedSection === config.phase ? null : config.phase
                    )}
                  />
                );
              })}
            </div>

            {/* Searching indicator */}
            {isSearching && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10"
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <motion.div
                      className="w-2 h-2 bg-white rounded-full"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  </motion.div>
                  <div className="flex-1">
                    <ShimmerText className="font-medium text-sm">
                      {thinkingSteps.find(s => s.phase === 'structuring') 
                        ? 'Preparing your matches...' 
                        : 'Searching for startups...'}
                    </ShimmerText>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Using Google Search to find real companies
                    </p>
                  </div>
                  <ThinkingDots />
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // Initial loading state (before thinking starts)
  const initialMessages = [
    "Starting analysis",
    "Loading your resume",
    "Preparing AI engine",
  ];
  const [initialMessage, setInitialMessage] = useState(initialMessages[0]);
  
  useEffect(() => {
    if (showThinking) return;
    
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % initialMessages.length;
      setInitialMessage(initialMessages[idx]);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [showThinking]);

  return (
    <div className="flex flex-col items-center justify-center py-20 w-full">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative mb-8"
      >
        <div className="relative w-16 h-16">
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400/30 to-red-500/30"
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.5, 0.2, 0.5]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-2 rounded-full bg-gradient-to-br from-orange-400 to-red-500"
            animate={{ 
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="absolute inset-4 rounded-full bg-white dark:bg-[#020617]" />
          <motion.div
            className="absolute inset-5 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, #f97316, #ef4444, #f97316)',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
          Analyzing
          <ThinkingDots />
        </h2>
        <AnimatePresence mode="wait">
          <motion.p 
            key={initialMessage}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="text-sm text-gray-500 dark:text-gray-400"
          >
            {initialMessage}
          </motion.p>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
