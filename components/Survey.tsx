import React, { useState } from 'react';
import { UserPreferences } from '../types';
import { ArrowRightIcon, CheckIcon } from '@heroicons/react/24/outline';

interface SurveyProps {
  onComplete: (preferences: UserPreferences) => void;
  onSkip: () => void;
}

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
    title: "What role are you targeting next?",
    placeholder: "e.g. Founding Engineer, Product Manager",
    type: 'text',
    suggestions: COMMON_ROLES
  },
  {
    id: 'yearsOfExperience',
    title: "How many years of professional experience?",
    options: ["0-2 years (Junior)", "3-5 years (Mid-Level)", "5-8 years (Senior)", "8-12 years (Staff)", "12+ years (Lead/Exec)"],
    type: 'select'
  },
  {
    id: 'targetLocations',
    title: "Where are you hunting? (Select hubs)",
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
    title: "What is your base salary expectation?",
    options: ["Under $100k", "$100k - $150k", "$150k - $200k", "$200k+", "Open / Equity heavy"],
    type: 'select'
  },
  {
    id: 'preferredDomains',
    title: "Which spaces excite you?",
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
    // Save current answer
    if (currentQuestion.type === 'text') {
      setPreferences(prev => ({ ...prev, [currentQuestion.id]: inputValue }));
      setShowSuggestions(false);
    } else if (currentQuestion.type === 'select') {
      // Already handled by selection
    } else if (currentQuestion.type === 'multi-select') {
      setPreferences(prev => ({ ...prev, [currentQuestion.id]: selectedOptions }));
    }

    // Move to next step or finish
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
      setInputValue('');
      setSelectedOptions([]);
    } else {
      // Compile final object
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
    // Auto-advance for single select after a short delay for better UX
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
    }, 250);
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
    <div className="w-full max-w-2xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Progress Bar */}
      <div className="w-full h-1 bg-gray-100 dark:bg-white/10 rounded-full mb-12 overflow-hidden">
        <div 
          className="h-full bg-orange-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mb-8">
        <span className="text-xs font-semibold tracking-wider text-orange-600 dark:text-orange-400 uppercase mb-2 block">
          Step {currentStep + 1} of {QUESTIONS.length}
        </span>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          {currentQuestion.title}
        </h2>
      </div>

      <div className="space-y-6">
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
              className="w-full bg-transparent border-b-2 border-gray-200 dark:border-gray-700 text-2xl py-2 text-gray-900 dark:text-white focus:border-orange-500 focus:outline-none transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-600"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && inputValue && handleNext()}
            />
            {/* Suggestions Dropdown */}
            {showSuggestions && currentQuestion.suggestions && inputValue.length > 0 && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-white/10 shadow-lg z-10 max-h-60 overflow-y-auto">
                {currentQuestion.suggestions
                  .filter(s => s.toLowerCase().includes(inputValue.toLowerCase()))
                  .map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setInputValue(suggestion);
                        setShowSuggestions(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-200 transition-colors first:rounded-t-xl last:rounded-b-xl"
                    >
                      {suggestion}
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}

        {currentQuestion.type === 'select' && (
          <div className="grid grid-cols-1 gap-3">
            {currentQuestion.options?.map((option) => (
              <button
                key={option}
                onClick={() => handleSelectOption(option)}
                className="text-left px-6 py-4 rounded-xl border border-gray-200 dark:border-white/10 hover:border-orange-500 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all group"
              >
                <span className="text-lg font-medium text-gray-700 dark:text-gray-200 group-hover:text-orange-700 dark:group-hover:text-orange-200">
                  {option}
                </span>
              </button>
            ))}
          </div>
        )}

        {currentQuestion.type === 'multi-select' && (
          <div className="grid grid-cols-1 gap-3">
            {currentQuestion.options?.map((option) => {
              const [mainText, subText] = option.includes('::') ? option.split('::') : [option, ''];
              const isSelected = selectedOptions.includes(option);
              
              return (
                <button
                  key={option}
                  onClick={() => toggleMultiSelect(option)}
                  className={`text-left px-6 py-4 rounded-xl border transition-all flex justify-between items-center group ${
                    isSelected 
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/20' 
                      : 'border-gray-200 dark:border-white/10 hover:border-orange-300 dark:hover:border-white/30'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className={`text-lg font-medium ${
                      isSelected ? 'text-orange-900 dark:text-orange-100' : 'text-gray-700 dark:text-gray-200'
                    }`}>
                      {mainText.trim()}
                    </span>
                    {subText && (
                      <span className={`text-sm ${
                        isSelected ? 'text-orange-700 dark:text-orange-200' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {subText.trim()}
                      </span>
                    )}
                  </div>
                  {isSelected && <CheckIcon className="w-6 h-6 text-orange-500" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-12 flex items-center justify-between">
        <button
          onClick={onSkip}
          className="text-sm font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          Skip Survey
        </button>

        <button
          onClick={handleNext}
          disabled={
            (currentQuestion.type === 'text' && !inputValue) ||
            (currentQuestion.type === 'multi-select' && selectedOptions.length === 0)
          }
          className="flex items-center gap-2 px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-full font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Next <ArrowRightIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

