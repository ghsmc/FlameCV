import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUpload } from './components/FileUpload';
import { LoadingScreen, ThinkingStep } from './components/LoadingScreen';
import { RoastResult } from './components/RoastResult';
import { LogoTicker } from './components/LogoTicker';
import { Survey } from './components/Survey';
import { AppState, FileData, AnalysisData, HistoryItem, UserPreferences } from './types';
import { generateRoast } from './services/gemini';
import { saveResume, getResumes, getResumeCount } from './services/supabase';
import { Logo } from './components/Logo';
import { SunIcon, MoonIcon, BoltIcon, UserGroupIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

// Smooth easing curve for professional feel
const smoothEase = [0.22, 1, 0.36, 1];

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [matchData, setMatchData] = useState<AnalysisData | null>(null);
  const [currentFile, setCurrentFile] = useState<FileData | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [matchCount, setMatchCount] = useState<number>(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([]);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Delay content reveal for smooth entrance
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }

    const loadHistory = async () => {
      try {
        const resumes = await getResumes();
        setHistory(resumes);
        const count = await getResumeCount();
        setMatchCount(count);
      } catch (e) {
        console.error("Failed to load history", e);
        const storedCount = localStorage.getItem('userMatchCount');
        if (storedCount) {
          setMatchCount(parseInt(storedCount, 10));
        }
      }
    };

    loadHistory();
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const addToHistory = async (file: FileData, data: AnalysisData) => {
    try {
      const newItem = await saveResume(file, data);
      if (newItem) {
        setHistory([newItem, ...history]);
        const count = await getResumeCount();
        setMatchCount(count);
      } else {
        const fallbackItem: HistoryItem = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          fileName: file.name,
          analysis: data,
          resume: file
        };
        const newHistory = [fallbackItem, ...history].slice(0, 10);
        setHistory(newHistory);
        const newCount = matchCount + 1;
        setMatchCount(newCount);
        localStorage.setItem('userMatchCount', newCount.toString());
      }
    } catch (err) {
      console.error("Error saving to history:", err);
      const newCount = matchCount + 1;
      setMatchCount(newCount);
      localStorage.setItem('userMatchCount', newCount.toString());
    }
  };

  const handleFileSelect = async (file: FileData) => {
    setCurrentFile(file);
    setError(null);
    setState(AppState.SURVEY);
  };

  const handleSurveyComplete = async (prefs: UserPreferences) => {
    setPreferences(prefs);
    await startAnalysis(currentFile!, prefs);
  };

  const handleSkipSurvey = async () => {
    setPreferences(null);
    await startAnalysis(currentFile!, null);
  };

  const handleThinkingUpdate = useCallback((phase: string, content: string) => {
    setThinkingSteps(prev => [...prev, { phase, content, timestamp: Date.now() }]);
  }, []);

  const startAnalysis = async (file: FileData, prefs: UserPreferences | null) => {
    setState(AppState.ANALYZING);
    setError(null);
    setThinkingSteps([]);

    try {
      const data = await generateRoast(file.base64, file.mimeType, prefs, handleThinkingUpdate);
      setMatchData(data);
      await addToHistory(file, data);
      setState(AppState.COMPLETE);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unable to find matches.");
      setState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setState(AppState.IDLE);
    setMatchData(null);
    setCurrentFile(null);
    setPreferences(null);
    setError(null);
    setThinkingSteps([]);
  };

  const features = [
    { 
      title: "Instant Matching", 
      desc: "Our AI scans thousands of high-growth startups to find your perfect fit.",
      icon: BoltIcon
    },
    { 
      title: "Founder-Led Teams", 
      desc: "Prioritize roles where you work directly with founders and core teams.",
      icon: UserGroupIcon
    },
    { 
      title: "Career Acceleration", 
      desc: "Join companies at the inflection point. Optimize for learning and equity.",
      icon: ArrowTrendingUpIcon
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] text-gray-900 dark:text-gray-100 font-sans selection:bg-orange-100 selection:text-orange-900 dark:selection:bg-orange-900/30 dark:selection:text-orange-100 transition-colors duration-300">
      
      {/* Header - appears first */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
        transition={{ duration: 0.6, ease: smoothEase }}
        className="fixed w-full top-0 z-50 border-b border-gray-100/80 dark:border-white/5 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-xl"
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2.5 cursor-pointer" 
            onClick={handleReset}
          >
            <Logo className="w-7 h-7" />
            <h1 className="text-base font-semibold tracking-tight text-gray-900 dark:text-white">
              Matchpoint
            </h1>
          </div>
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors duration-200"
          >
            {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
          </button>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 pt-32 pb-20">
        <AnimatePresence mode="wait">
          
          {/* Landing Page */}
          {state === AppState.IDLE && showContent && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: smoothEase }}
            >
              {/* 
                HERO SECTION 
                Narrow content width (640px) for optimal reading
                Centered alignment, generous vertical rhythm
              */}
              <section className="relative flex flex-col items-center text-center pt-8 pb-24 overflow-hidden">
                {/* CSS Landscape Effect */}
                <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                  {/* Sky gradient */}
                  <div className="absolute inset-0 bg-gradient-to-b from-orange-50 via-white to-white dark:from-orange-950/20 dark:via-[#020617] dark:to-[#020617]" />
                  
                  {/* Back mountain layer */}
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-[40%] opacity-[0.07] dark:opacity-[0.15]"
                    style={{
                      background: 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)',
                      clipPath: 'polygon(0% 100%, 0% 60%, 15% 45%, 30% 55%, 45% 35%, 60% 50%, 75% 30%, 90% 45%, 100% 40%, 100% 100%)',
                    }}
                  />
                  
                  {/* Middle mountain layer */}
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-[30%] opacity-[0.05] dark:opacity-[0.12]"
                    style={{
                      background: 'linear-gradient(135deg, #ea580c 0%, #b91c1c 100%)',
                      clipPath: 'polygon(0% 100%, 0% 70%, 20% 50%, 35% 65%, 50% 45%, 65% 60%, 80% 40%, 100% 55%, 100% 100%)',
                    }}
                  />
                  
                  {/* Front hill layer */}
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-[20%] opacity-[0.03] dark:opacity-[0.08]"
                    style={{
                      background: 'linear-gradient(135deg, #c2410c 0%, #991b1b 100%)',
                      clipPath: 'polygon(0% 100%, 0% 80%, 25% 60%, 50% 75%, 75% 55%, 100% 70%, 100% 100%)',
                    }}
                  />
                </div>

                {/* Eyebrow / Social Proof */}
                <motion.div 
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3, ease: smoothEase }}
                  className="mb-8 relative z-10"
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/10 text-sm text-gray-600 dark:text-gray-400">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500"></span>
                    </span>
                    {matchCount.toLocaleString()} matches made
                  </div>
                </motion.div>

                {/* Primary Headline */}
                <motion.h1 
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4, ease: smoothEase }}
                  className="text-[2.75rem] sm:text-5xl lg:text-6xl font-semibold text-gray-900 dark:text-white tracking-[-0.02em] leading-[1.1] max-w-[640px] relative z-10"
                >
                  Get matched to{' '}
                  <span className="bg-[linear-gradient(90deg,#f97316_0%,#dc2626_25%,#991b1b_50%,#dc2626_75%,#f97316_100%)] dark:bg-[linear-gradient(90deg,#fb923c_0%,#ef4444_25%,#b91c1c_50%,#ef4444_75%,#fb923c_100%)] bg-clip-text text-transparent inline-block pr-[0.02em] flame-text">startups</span>{' '}
                  instantly
                </motion.h1>

                {/* Supporting Copy */}
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5, ease: smoothEase }}
                  className="mt-6 text-lg text-gray-500 dark:text-gray-400 max-w-[480px] leading-relaxed relative z-10"
                >
                  Upload your resume and discover early-stage startups that match your skills and ambitions.
                </motion.p>
                
                {/* Primary CTA */}
                <motion.div 
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6, ease: smoothEase }}
                  className="mt-10 w-full max-w-[480px] relative z-10"
                >
                  <FileUpload onFileSelect={handleFileSelect} />
                </motion.div>
              </section>

              {/* 
                SOCIAL PROOF SECTION
                Full width, subtle separator
              */}
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.75, ease: smoothEase }}
                className="py-6 border-y border-gray-200 dark:border-white/10"
              >
                <p className="text-center text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] mb-4 font-mono">
                  Join candidates matched to teams at
                </p>
                <LogoTicker />
              </motion.section>
              
              {/* 
                FEATURES SECTION
                3-column grid on desktop, consistent card sizing
              */}
              <motion.section 
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9, ease: smoothEase }}
                className="py-24"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-10">
                  {features.map((item, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 1.0 + i * 0.08, ease: smoothEase }}
                      className="p-6 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]"
                    >
                      <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                        <item.icon className="w-5 h-5 text-orange-600 dark:text-orange-500" />
                      </div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                        {item.desc}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            </motion.div>
          )}

          {/* Survey */}
          {state === AppState.SURVEY && (
            <motion.div
              key="survey"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: smoothEase }}
            >
              <Survey onComplete={handleSurveyComplete} onSkip={handleSkipSurvey} />
            </motion.div>
          )}

          {/* Analyzing */}
          {state === AppState.ANALYZING && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: smoothEase }}
              className="min-h-[60vh] flex flex-col items-center justify-center"
            >
              <LoadingScreen 
                thinkingSteps={thinkingSteps}
                showThinking={thinkingSteps.length > 0}
              />
            </motion.div>
          )}

          {/* Error */}
          {state === AppState.ERROR && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: smoothEase }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="text-center max-w-md">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1, ease: smoothEase }}
                  className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400 font-semibold text-lg"
                >
                  !
                </motion.div>
                <motion.h3 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.15, ease: smoothEase }}
                  className="text-lg font-semibold text-gray-900 dark:text-white mb-2"
                >
                  Matching Failed
                </motion.h3>
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2, ease: smoothEase }}
                  className="text-gray-500 dark:text-gray-400 mb-6"
                >
                  {error}
                </motion.p>
                <motion.button 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.25, ease: smoothEase }}
                  onClick={handleReset}
                  className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:opacity-90 transition-opacity duration-200"
                >
                  Try Again
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Results */}
          {state === AppState.COMPLETE && matchData && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: smoothEase }}
            >
              <RoastResult 
                data={matchData} 
                onReset={handleReset} 
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={showContent ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6, delay: 1.3, ease: smoothEase }}
        className="max-w-6xl mx-auto px-6 py-12 border-t border-gray-100 dark:border-white/5"
      >
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Logo className="w-5 h-5 opacity-60" />
            <span className="text-sm font-medium text-gray-400 dark:text-gray-500">Matchpoint</span>
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-600">
            &copy; {new Date().getFullYear()}
          </p>
        </div>
      </motion.footer>
    </div>
  );
};

export default App;
