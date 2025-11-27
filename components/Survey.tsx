import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPreferences } from '../types';
import { ArrowRightIcon, CheckIcon } from '@heroicons/react/24/outline';

interface SurveyProps {
  onComplete: (preferences: UserPreferences) => void;
  onSkip: () => void;
}

const smoothEase = [0.22, 1, 0.36, 1];

const COMMON_ROLES = [
  "Founding Engineer",
  "Full Stack Engineer",
  "Frontend Engineer",
  "Backend Engineer",
  "Product Engineer",
  "Machine Learning Engineer",
  "AI Engineer",
  "DevOps Engineer",
  "Product Manager",
  "Product Designer",
  "Growth Marketer",
  "Sales Development Rep",
  "Account Executive",
  "Chief of Staff",
  "Data Scientist",
  "Solutions Engineer"
];

const QUESTIONS = [
  {
    id: 'targetRole',
    title: "What role are you targeting?",
    placeholder: "e.g. Founding Engineer, Product Manager",
    type: 'text',
    suggestions: COMMON_ROLES
  },
  {
    id: 'yearsOfExperience',
    title: "Years of professional experience?",
    options: ["0-2 years (Junior)", "3-5 years (Mid-Level)", "5-8 years (Senior)", "8-12 years (Staff)", "12+ years (Lead/Exec)"],
    type: 'select'
  },
  {
    id: 'targetLocations',
    title: "Where are you looking?",
    options: ["San Francisco / Bay Area", "New York City", "London", "Remote", "Austin", "Los Angeles", "Seattle", "Boston"],
    type: 'multi-select'
  },
  {
    id: 'startupStage',
    title: "What's your risk appetite?",
    options: [
      "Seed (1-10 ppl) :: Chaos mode. High equity. Building from scratch.",
      "Series A (10-50 ppl) :: Finding product-market fit. Growing fast.",
      "Series B+ (50+ ppl) :: Scaling up. More stability, less equity.",
      "Big Tech / Public :: Safety blanket. High salary, low risk."
    ],
    type: 'multi-select'
  },
  {
    id: 'salaryExpectation',
    title: "Base salary expectation?",
    options: ["Under $100k", "$100k - $150k", "$150k - $200k", "$200k+", "Open / Equity heavy"],
    type: 'select'
  },
  {
    id: 'preferredDomains',
    title: "Which spaces interest you?",
    options: ["AI / LLMs", "Fintech", "Crypto / Web3", "B2B SaaS", "Consumer", "Climate Tech", "Health / Bio", "Hard Tech / Hardware"],
    type: 'multi-select'
  }
];

export const Survey: React.FC<SurveyProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState<Partial<UserPreferences>>({});
  const [inputValue, setInputValue] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const currentQuestion = QUESTIONS[currentStep];

  const handleNext = () => {
    if (currentQuestion.type === 'text') {
      setPreferences(prev => ({ ...prev, [currentQuestion.id]: inputValue }));
      setShowSuggestions(false);
    } else if (currentQuestion.type === 'multi-select') {
      setPreferences(prev => ({ ...prev, [currentQuestion.id]: selectedOptions }));
    }

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
      setInputValue('');
      setSelectedOptions([]);
    } else {
      const finalPrefs: UserPreferences = {
        targetRole: (preferences.targetRole || (currentQuestion.id === 'targetRole' ? inputValue : "")) as string || "Any",
        yearsOfExperience: (preferences.yearsOfExperience || (currentQuestion.id === 'yearsOfExperience' ? inputValue : "")) as string || "Not specified",
        targetLocations: (preferences.targetLocations || (currentQuestion.id === 'targetLocations' ? selectedOptions : [])) as string[] || [],
        startupStage: (preferences.startupStage || (currentQuestion.id === 'startupStage' ? selectedOptions : [])) as string[] || [],
        salaryExpectation: (preferences.salaryExpectation || (currentQuestion.id === 'salaryExpectation' ? inputValue : "")) as string || "Open",
        preferredDomains: (preferences.preferredDomains || (currentQuestion.id === 'preferredDomains' ? selectedOptions : [])) as string[] || [],
      };
      
      onComplete(finalPrefs);
    }
  };

  const handleSelectOption = (option: string) => {
    setPreferences(prev => ({ ...prev, [currentQuestion.id]: option }));
    setTimeout(() => {
      if (currentStep < QUESTIONS.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
         const finalPrefs: UserPreferences = {
            targetRole: preferences.targetRole as string || "Any",
            yearsOfExperience: (currentQuestion.id === 'yearsOfExperience' ? option : preferences.yearsOfExperience) as string || "Not specified",
            targetLocations: preferences.targetLocations as string[] || [],
            startupStage: preferences.startupStage as string[] || [],
            salaryExpectation: (currentQuestion.id === 'salaryExpectation' ? option : preferences.salaryExpectation) as string || "Open",
            preferredDomains: preferences.preferredDomains as string[] || [],
         };
         onComplete(finalPrefs);
      }
    }, 200);
  };

  const toggleMultiSelect = (option: string) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(prev => prev.filter(o => o !== option));
    } else {
      setSelectedOptions(prev => [...prev, option]);
    }
  };

  const progress = ((currentStep) / QUESTIONS.length) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-8">
      
      {/* Progress Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: smoothEase }}
        className="w-full h-1 bg-gray-100 dark:bg-white/10 rounded-full mb-12 overflow-hidden"
      >
        <motion.div 
          className="h-full bg-orange-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: smoothEase }}
        />
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: smoothEase }}
        >
          <div className="mb-8">
            <span className="text-xs font-medium tracking-wider text-orange-600 dark:text-orange-400 uppercase mb-3 block">
              Step {currentStep + 1} of {QUESTIONS.length}
            </span>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              {currentQuestion.title}
            </h2>
          </div>

          <div className="space-y-3">
            {currentQuestion.type === 'text' && (
              <div className="relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder={currentQuestion.placeholder}
                  className="w-full bg-transparent border-b-2 border-gray-200 dark:border-gray-700 text-xl py-3 text-gray-900 dark:text-white focus:border-orange-500 focus:outline-none transition-colors duration-200 placeholder:text-gray-300 dark:placeholder:text-gray-600"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && inputValue && handleNext()}
                />
                <AnimatePresence>
                  {showSuggestions && currentQuestion.suggestions && inputValue.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2, ease: smoothEase }}
                      className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-white/10 shadow-lg z-10 max-h-60 overflow-y-auto"
                    >
                      {currentQuestion.suggestions
                        .filter(s => s.toLowerCase().includes(inputValue.toLowerCase()))
                        .slice(0, 6)
                        .map((suggestion, i) => (
                          <motion.button
                            key={suggestion}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.03 }}
                            onClick={() => {
                              setInputValue(suggestion);
                              setShowSuggestions(false);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-200 transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl"
                          >
                            {suggestion}
                          </motion.button>
                        ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {currentQuestion.type === 'select' && (
              <div className="space-y-2">
                {currentQuestion.options?.map((option, i) => (
                  <motion.button
                    key={option}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3, ease: smoothEase }}
                    onClick={() => handleSelectOption(option)}
                    className="w-full text-left px-5 py-4 rounded-xl border border-gray-200 dark:border-white/10 hover:border-orange-400 dark:hover:border-orange-500 hover:bg-orange-50/50 dark:hover:bg-orange-500/5 transition-all duration-200"
                  >
                    <span className="text-base font-medium text-gray-700 dark:text-gray-200">
                      {option}
                    </span>
                  </motion.button>
                ))}
              </div>
            )}

            {currentQuestion.type === 'multi-select' && (
              <div className="space-y-2">
                {currentQuestion.options?.map((option, i) => {
                  const [mainText, subText] = option.includes('::') ? option.split('::') : [option, ''];
                  const isSelected = selectedOptions.includes(option);
                  
                  return (
                    <motion.button
                      key={option}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.3, ease: smoothEase }}
                      onClick={() => toggleMultiSelect(option)}
                      className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 flex justify-between items-center ${
                        isSelected 
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10' 
                          : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className={`text-base font-medium ${
                          isSelected ? 'text-orange-900 dark:text-orange-100' : 'text-gray-700 dark:text-gray-200'
                        }`}>
                          {mainText.trim()}
                        </span>
                        {subText && (
                          <span className={`text-sm mt-0.5 ${
                            isSelected ? 'text-orange-700 dark:text-orange-300' : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {subText.trim()}
                          </span>
                        )}
                      </div>
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                        isSelected 
                          ? 'border-orange-500 bg-orange-500' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {isSelected && <CheckIcon className="w-3 h-3 text-white" />}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4, ease: smoothEase }}
        className="mt-12 flex items-center justify-between"
      >
        <button
          onClick={onSkip}
          className="text-sm font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
        >
          Skip survey
        </button>

        <button
          onClick={handleNext}
          disabled={
            (currentQuestion.type === 'text' && !inputValue) ||
            (currentQuestion.type === 'multi-select' && selectedOptions.length === 0)
          }
          className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity duration-200"
        >
          {currentStep === QUESTIONS.length - 1 ? 'Finish' : 'Next'}
          <ArrowRightIcon className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
};
