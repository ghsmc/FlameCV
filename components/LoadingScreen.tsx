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

// Shimmer effect component - confined to text/content only
const Shimmer: React.FC = () => (
  <motion.div
    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
    animate={{ x: ['-100%', '100%'] }}
    transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 0.5 }}
    style={{ width: '50%' }}
  />
);

// Smooth easing curve for professional feel
const smoothEase = [0.22, 1, 0.36, 1];

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

// Stars component
const Stars: React.FC = () => {
  // Generate static stars once to avoid re-renders
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

// Single thinking step card - clean single-line format
const ThinkingCard: React.FC<{
  step: ThinkingStep;
  isLatest: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  index: number;
  currentMessage: string;
  isLast: boolean;
}> = ({ step, isLatest, isExpanded, onToggle, index, currentMessage, isLast }) => {
  const config = PHASE_CONFIG[step.phase] || { label: step.phase, messages: [] };
  const label = config.label;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        duration: 0.3, 
        delay: index * 0.05,
        ease: [0.25, 0.46, 0.45, 0.94] 
      }}
      className="relative"
    >
      <div className={`
        flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-300
        ${isLatest 
          ? 'bg-orange-50 dark:bg-orange-900/20' 
          : 'bg-transparent'
        }
      `}>
        {/* Status Dot */}
        <div className={`
          w-2 h-2 rounded-full flex-shrink-0 transition-all duration-300
          ${isLatest 
            ? 'bg-orange-500' 
            : 'bg-gray-300 dark:bg-gray-600'
          }
        `}>
          {isLatest && (
            <motion.div
              className="w-full h-full rounded-full bg-orange-500"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </div>
        
        {/* Label and message on same line */}
        <div className="flex-1 min-w-0 flex items-baseline gap-2">
          <span className={`
            font-medium text-sm flex-shrink-0
            ${isLatest 
              ? 'text-orange-600 dark:text-orange-400' 
              : 'text-gray-500 dark:text-gray-500'
            }
          `}>
            {label}
          </span>
          {isLatest && (
            <motion.span
              key={currentMessage}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs text-gray-600 dark:text-gray-400 truncate"
            >
              {currentMessage}
            </motion.span>
          )}
        </div>
        
        {/* Thinking dots for latest only */}
        {isLatest && <ThinkingDots />}
      </div>
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

  // Calculate day/night cycle
  // Cycle: Day -> Sunset -> Night
  // We map 0..1 progress to a rotation angle
  // Cap progress at 1 to stop animation at end state
  const progress = Math.min(thinkingSteps.length / 7, 1);
  const isNight = progress > 0.6;
  
  // Rotation calculation
  // We simulate a giant wheel rotating clockwise.
  // Sun starts at ~10 o'clock (300 deg) relative to bottom center? 
  // Let's keep it simple:
  // 0 deg = Sun at top-leftish
  // 180 deg = Sun has set (bottom-right), Moon has risen (top-leftish)
  const rotation = progress * 180; 

  if (showThinking && thinkingSteps.length > 0) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden">
        {/* Animated Landscape Background */}
        <motion.div 
          className="absolute inset-0 z-0"
          animate={{
            background: isNight 
              ? 'linear-gradient(to bottom, #020617 0%, #1e1b4b 100%)' // Deep Night
              : progress > 0.4 
                ? 'linear-gradient(to bottom, #4c1d95 0%, #db2777 50%, #ea580c 100%)' // Sunset
                : 'linear-gradient(to bottom, #38bdf8 0%, #bae6fd 100%)' // Day
          }}
          transition={{ duration: 2, ease: "easeInOut" }}
        >
          {/* Stars Layer (fades in at night) */}
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
              marginBottom: '-200vmax', // Push mostly offscreen so center is at bottom of screen
              marginLeft: '-100vmax', // Center horizontally
            }}
            animate={{ rotate: rotation }} 
            transition={{ type: "spring", stiffness: 10, damping: 20 }} // Smooth spring for rotation
          >
            {/* SUN (Start position: Top Left of the wheel) */}
            {/* Position relative to center of huge circle */}
            <div className="absolute top-[15%] left-[25%] -translate-x-1/2 -translate-y-1/2">
               <div className="relative w-32 h-32 sm:w-48 sm:h-48">
                 <div className="absolute inset-0 rounded-full bg-orange-400 blur-3xl opacity-60" />
                 <div className="absolute inset-4 rounded-full bg-orange-300 blur-2xl opacity-80" />
                 <div className="absolute inset-8 rounded-full bg-orange-100 blur-xl" />
                 <div className="absolute inset-10 rounded-full bg-white shadow-[0_0_100px_rgba(251,146,60,0.8)]" />
               </div>
            </div>

            {/* MOON (Opposite side: Bottom Right of the wheel) */}
            <div className="absolute bottom-[15%] right-[25%] -translate-x-1/2 -translate-y-1/2 rotate-180">
               <div className="relative w-24 h-24 sm:w-32 sm:h-32">
                 <div className="absolute inset-0 rounded-full bg-slate-200 blur-xl opacity-20" />
                 <div className="absolute inset-2 rounded-full bg-slate-100 blur-md opacity-90" />
                 {/* Craters */}
                 <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-slate-300/50 rounded-full blur-[1px]" />
                 <div className="absolute bottom-1/3 right-1/4 w-6 h-6 bg-slate-300/40 rounded-full blur-[1px]" />
                 <div className="absolute inset-0 rounded-full shadow-[0_0_50px_rgba(255,255,255,0.4)]" />
               </div>
            </div>
          </motion.div>

          {/* Mountains (Static structure, dynamic color) */}
          <div className="absolute bottom-0 left-0 right-0 h-full pointer-events-none z-10">
             {/* Back mountain layer */}
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
             
             {/* Middle mountain layer */}
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
             
             {/* Front hill layer */}
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
        <div className="relative z-20 w-full max-w-xl px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
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
                <motion.h2 
                  key={statusText}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-lg font-semibold text-gray-900 dark:text-white relative inline-block"
                >
                  <span className="relative z-10">Thinking...</span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent dark:via-white/20 -skew-x-12"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                  />
                </motion.h2>
              </div>
            </div>

            {/* Thinking steps - clean list without scrollbar */}
            <div className="space-y-1">
              {thinkingSteps.map((step, index) => (
                <ThinkingCard
                  key={`${step.phase}-${index}`}
                  step={step}
                  isLatest={index === thinkingSteps.length - 1}
                  isExpanded={expandedStep === index}
                  onToggle={() => setExpandedStep(expandedStep === index ? null : index)}
                  index={index}
                  currentMessage={index === thinkingSteps.length - 1 ? currentPhaseMessage : ""}
                  isLast={index === thinkingSteps.length - 1}
                />
              ))}
            </div>
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
