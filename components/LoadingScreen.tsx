import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ThinkingStep {
  phase: string;
  content: string;
  timestamp: number;
}

interface LoadingScreenProps {
  thinkingSteps?: ThinkingStep[];
  showThinking?: boolean;
}

const PHASE_CONFIG: Record<string, { label: string; messages: string[] }> = {
  thinking: {
    label: "Analyzing",
    messages: [
      "Reading between the lines",
      "Processing your experience",
      "Extracting key signals",
    ],
  },
  resume: {
    label: "Reading your resume",
    messages: [
      "Identifying your core skills",
      "Mapping your career trajectory",
      "Spotting patterns in your experience",
      "Assessing your technical depth",
    ],
  },
  preferences: {
    label: "Understanding your preferences",
    messages: [
      "Decoding what you really want",
      "Gauging your risk tolerance",
      "Understanding your priorities",
      "Reading between the lines",
    ],
  },
  intersection: {
    label: "Finding the sweet spot",
    messages: [
      "Matching skills to interests",
      "Identifying your unique positioning",
      "Finding where you'd thrive",
      "Calculating culture fit",
    ],
  },
  search: {
    label: "Planning the search",
    messages: [
      "Defining search criteria",
      "Calibrating match tiers",
      "Targeting the right verticals",
    ],
  },
  searching: {
    label: "Discovering startups",
    messages: [
      "Scanning YC companies",
      "Checking recent funding rounds",
      "Finding hidden gems",
      "Verifying company data",
      "Matching to your profile",
    ],
  },
  structuring: {
    label: "Preparing results",
    messages: [
      "Ranking your matches",
      "Finalizing recommendations",
      "Almost there",
    ],
  },
};

// Shimmer effect component
const Shimmer: React.FC = () => (
  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
);

// Animated dots for "thinking" effect
const ThinkingDots: React.FC = () => (
  <span className="inline-flex ml-1">
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="w-1 h-1 bg-current rounded-full mx-0.5"
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

// Single thinking step card
const ThinkingCard: React.FC<{
  step: ThinkingStep;
  isLatest: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  index: number;
  currentMessage: string;
}> = ({ step, isLatest, isExpanded, onToggle, index, currentMessage }) => {
  const config = PHASE_CONFIG[step.phase] || { label: step.phase, messages: [] };
  const label = config.label;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94] 
      }}
      className={`
        relative overflow-hidden rounded-xl border transition-all duration-300
        ${isLatest 
          ? 'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20 border-orange-200/60 dark:border-orange-800/40' 
          : 'bg-gray-50/80 dark:bg-white/[0.02] border-gray-200/60 dark:border-white/[0.06]'
        }
      `}
    >
      {isLatest && <Shimmer />}
      
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3.5 flex items-center gap-3 text-left relative z-10"
      >
        {/* Status indicator */}
        <div className={`
          w-2 h-2 rounded-full flex-shrink-0 transition-colors
          ${isLatest 
            ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]' 
            : 'bg-gray-300 dark:bg-gray-600'
          }
        `}>
          {isLatest && (
            <motion.div
              className="w-full h-full rounded-full bg-orange-400"
              animate={{ scale: [1, 1.8, 1], opacity: [1, 0, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </div>
        
        {/* Label */}
        <div className="flex-1 min-w-0">
          <span className={`
            font-medium transition-colors block
            ${isLatest 
              ? 'text-orange-900 dark:text-orange-200' 
              : 'text-gray-600 dark:text-gray-400'
            }
          `}>
            {label}
            {isLatest && <ThinkingDots />}
          </span>
          {isLatest && currentMessage && (
            <motion.span
              key={currentMessage}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-orange-600/70 dark:text-orange-400/60 block mt-0.5"
            >
              {currentMessage}
            </motion.span>
          )}
        </div>
        
        {/* Expand indicator */}
        {step.content && (
          <motion.svg 
            className="w-4 h-4 text-gray-400"
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </motion.svg>
        )}
      </button>

      {/* Expandable content */}
      <AnimatePresence>
        {isExpanded && step.content && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 relative z-10">
              <div className="pl-5 border-l-2 border-orange-200 dark:border-orange-800/40">
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {step.content.length > 400 
                    ? step.content.slice(0, 400) + "..." 
                    : step.content
                  }
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  thinkingSteps = [],
  showThinking = false
}) => {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [statusText, setStatusText] = useState("Thinking");
  const [currentPhaseMessage, setCurrentPhaseMessage] = useState("");
  const [messageIndex, setMessageIndex] = useState(0);

  // Get current phase and its messages
  const latestPhase = thinkingSteps.length > 0 
    ? thinkingSteps[thinkingSteps.length - 1]?.phase 
    : "thinking";
  const phaseConfig = PHASE_CONFIG[latestPhase] || { label: "Thinking", messages: [] };

  // Cycle through phase-specific messages
  useEffect(() => {
    if (phaseConfig.messages.length === 0) return;
    
    // Reset message index when phase changes
    setMessageIndex(0);
    setCurrentPhaseMessage(phaseConfig.messages[0]);
    
    const interval = setInterval(() => {
      setMessageIndex(prev => {
        const next = (prev + 1) % phaseConfig.messages.length;
        setCurrentPhaseMessage(phaseConfig.messages[next]);
        return next;
      });
    }, 2500);
    
    return () => clearInterval(interval);
  }, [latestPhase, phaseConfig.messages]);

  // Update status text when phase changes
  useEffect(() => {
    setStatusText(phaseConfig.label);
  }, [phaseConfig.label]);

  // Auto-expand latest step
  useEffect(() => {
    if (thinkingSteps.length > 0) {
      setExpandedStep(thinkingSteps.length - 1);
    }
  }, [thinkingSteps.length]);

  if (showThinking && thinkingSteps.length > 0) {
    return (
      <div className="w-full max-w-xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          {/* Animated orb */}
          <div className="relative w-10 h-10">
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400 to-red-500"
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute inset-1 rounded-full bg-gradient-to-br from-orange-300 to-orange-500"
              animate={{ 
                scale: [1, 0.9, 1],
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
            <motion.h2 
              key={statusText}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-lg font-semibold text-gray-900 dark:text-white"
            >
              {statusText}
              <ThinkingDots />
            </motion.h2>
            <AnimatePresence mode="wait">
              <motion.p 
                key={currentPhaseMessage}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="text-sm text-gray-500 dark:text-gray-400"
              >
                {currentPhaseMessage || "Reasoning through your profile"}
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Thinking steps */}
        <div className="space-y-3">
          {thinkingSteps.map((step, index) => (
            <ThinkingCard
              key={`${step.phase}-${index}`}
              step={step}
              isLatest={index === thinkingSteps.length - 1}
              isExpanded={expandedStep === index}
              onToggle={() => setExpandedStep(expandedStep === index ? null : index)}
              index={index}
              currentMessage={index === thinkingSteps.length - 1 ? currentPhaseMessage : ""}
            />
          ))}
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
        {/* Animated loading orb */}
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
