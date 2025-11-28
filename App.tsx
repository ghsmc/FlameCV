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
const smoothEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

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
    // Initialize theme immediately to avoid flash
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    // Delay content reveal for smooth entrance after portal animation
    const timer = setTimeout(() => setShowContent(true), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
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
    <div className="min-h-screen bg-gray-50 dark:bg-[#020617] text-gray-900 dark:text-gray-100 font-sans selection:bg-orange-100 selection:text-orange-900 dark:selection:bg-orange-900/30 dark:selection:text-orange-100 transition-colors duration-300">
      
      {/* Portal Transition Overlay */}
      <motion.div className="fixed inset-0 z-[100] flex flex-col pointer-events-none">
        <motion.div 
          initial={{ y: 0 }}
          animate={{ y: "-100%" }}
          transition={{ duration: 1.5, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
          className="h-[50vh] w-full bg-white dark:bg-[#020617] origin-top"
        />
        <motion.div 
          initial={{ y: 0 }}
          animate={{ y: "100%" }}
          transition={{ duration: 1.5, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
          className="h-[50vh] w-full bg-white dark:bg-[#020617] origin-bottom"
        />
      </motion.div>

      {/* Full Width Landscape Background (Idle State Only) */}
      <AnimatePresence>
        {state === AppState.IDLE && showContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: smoothEase }}
            className="fixed top-0 left-0 right-0 h-full overflow-hidden z-0 pointer-events-none"
            aria-hidden="true"
          >
            {/* Sky gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-orange-100/80 via-white to-white dark:from-orange-950/40 dark:via-[#020617] dark:to-[#020617]" />
            
            {/* Sun */}
            <div 
              className="absolute top-[15%] right-[15%] w-24 h-24 sm:w-32 sm:h-32 rounded-full blur-3xl opacity-80 dark:opacity-40"
              style={{
                background: 'radial-gradient(circle, #fb923c 0%, #ea580c 100%)',
              }}
            />
            <div 
              className="absolute top-[18%] right-[18%] w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-orange-500 blur-lg opacity-90 dark:bg-orange-500/50"
            />

            {/* Back mountain layer */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-[45%] opacity-80 dark:opacity-30"
              style={{
                background: 'linear-gradient(180deg, #fdba74 0%, #f97316 100%)', // Light orange
                clipPath: 'polygon(0% 100%, 0% 40%, 15% 20%, 30% 35%, 45% 15%, 60% 30%, 75% 10%, 90% 25%, 100% 20%, 100% 100%)',
              }}
            />
            
            {/* Middle mountain layer */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-[35%] opacity-90 dark:opacity-40"
              style={{
                background: 'linear-gradient(180deg, #fb923c 0%, #ea580c 100%)', // Medium orange
                clipPath: 'polygon(0% 100%, 0% 60%, 20% 35%, 35% 55%, 50% 30%, 65% 45%, 80% 25%, 100% 40%, 100% 100%)',
              }}
            />
            
            {/* Front hill layer */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-[25%] opacity-100 dark:opacity-50"
              style={{
                background: 'linear-gradient(180deg, #f97316 0%, #dc2626 100%)', // Deep orange-red
                clipPath: 'polygon(0% 100%, 0% 75%, 25% 55%, 50% 70%, 75% 50%, 100% 65%, 100% 100%)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Layout Container */}
      <div className="relative z-10 max-w-[1400px] mx-auto p-4 md:p-8 min-h-screen flex flex-col">
        
        {/* Header - Boxed Style */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease: smoothEase }}
          className="w-full border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-xl mb-8"
        >
          <div className="h-16 px-6 flex items-center justify-between">
            <div 
              className="flex items-center gap-2.5 cursor-pointer" 
              onClick={handleReset}
            >
              <Logo className="w-8 h-8" />
              <h1 className="text-base font-semibold tracking-tight text-gray-900 dark:text-white hidden sm:block">
                Matchpoint
              </h1>
            </div>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Candidates</a>
              <a href="#" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Startups</a>
              <a href="#" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Pricing</a>
              <a href="#" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Docs</a>
            </nav>

            <div className="flex items-center gap-4">
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-none text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors border-r border-gray-200 dark:border-white/10 pr-4"
              >
                {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
              </button>
              <button className="hidden sm:block text-sm font-medium text-gray-900 dark:text-white hover:opacity-70">
                Login
              </button>
            </div>
          </div>
        </motion.header>

        {/* Main Content Area */}
        <main className="flex-grow flex flex-col">
          <AnimatePresence mode="wait">
            
            {/* Landing Page - Split Layout */}
            {state === AppState.IDLE && showContent && (
              <motion.div
                key="landing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: smoothEase }}
                className="flex-grow flex flex-col"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-8">
                  
                  {/* Left Column: Text Content */}
                  <div className="flex flex-col justify-center items-start text-left py-12 lg:py-24 px-4">
                    {/* Tag */}
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center gap-2 mb-8"
                    >
                      <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                      <span className="text-xs font-mono uppercase tracking-widest text-gray-500 dark:text-gray-400">
                        New: Founder Matching v2.0
                      </span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                      className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.1] mb-8"
                    >
                      Find your next{' '}
                      <span className="bg-[linear-gradient(90deg,#f97316_0%,#dc2626_25%,#991b1b_50%,#dc2626_75%,#f97316_100%)] dark:bg-[linear-gradient(90deg,#fb923c_0%,#ef4444_25%,#b91c1c_50%,#ef4444_75%,#fb923c_100%)] bg-clip-text text-transparent flame-text">
                        unicorn role
                      </span>
                    </motion.h1>

                    {/* Subtext */}
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl mb-10"
                    >
                      The first autonomous talent agent that operates everywhere you want to work. From YC seeds to Series C scaling—offload the search.
                    </motion.p>

                    {/* Buttons Placeholder (Functional part is on right, but adding visual buttons per request structure) */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="flex flex-wrap gap-4"
                    >
                      <div className="text-sm text-gray-400 italic">
                        Use the tool on the right to start →
                      </div>
                    </motion.div>
                  </div>

                  {/* Right Column: Functional "Window" */}
                  <div className="relative pt-8 lg:pt-12">
                    {/* Main Editor Window */}
                    <motion.div 
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      className="relative z-20 w-full bg-white dark:bg-[#020617] border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden"
                    >
                      {/* Editor Header */}
                      <div className="h-10 border-b border-gray-100 dark:border-white/5 flex items-center px-4 gap-3 bg-gray-50/50 dark:bg-white/[0.02]">
                        <div className="flex-1 text-center">
                          <span className="text-xs font-medium text-gray-400 font-mono">upload_resume.tsx</span>
                        </div>
                      </div>
                      
                      {/* File Upload Component */}
                      <div className="p-8 md:p-12 bg-gray-50/50 dark:bg-black/20 h-[420px] flex flex-col justify-center">
                        <FileUpload onFileSelect={handleFileSelect} />
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Bottom Section: Logo Scroll (Boxed) */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="border border-gray-200 dark:border-white/10 bg-white dark:bg-[#020617] overflow-hidden relative h-20 flex items-center"
                >
                  {/* Gradient Masks */}
                  <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white dark:from-[#020617] to-transparent z-10 pointer-events-none"></div>
                  <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white dark:from-[#020617] to-transparent z-10 pointer-events-none"></div>

                  <div className="flex gap-16 animate-scroll whitespace-nowrap hover:pause-animation w-max">
                    {[...Array(3)].map((_, i) => (
                      <React.Fragment key={i}>
                        <div className="flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity">
                          <img src="https://img.logo.dev/linear.app?token=pk_c2nKhfMyRIOeCjrk-6-RRw" className="h-7 object-contain" alt="Linear" />
                        </div>
                        <div className="flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity">
                          <img src="https://img.logo.dev/cursor.com?token=pk_c2nKhfMyRIOeCjrk-6-RRw" className="h-6 object-contain" alt="Cursor" />
                        </div>
                        <div className="flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity">
                          <img src="https://img.logo.dev/vercel.com?token=pk_c2nKhfMyRIOeCjrk-6-RRw" className="h-5 object-contain" alt="Vercel" />
                        </div>
                        <div className="flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity">
                          <img src="https://img.logo.dev/supabase.com?token=pk_c2nKhfMyRIOeCjrk-6-RRw" className="h-7 object-contain" alt="Supabase" />
                        </div>
                        <div className="flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity">
                          <img src="https://img.logo.dev/anthropic.com?token=pk_c2nKhfMyRIOeCjrk-6-RRw" className="h-6 object-contain" alt="Anthropic" />
                        </div>
                        <div className="flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity">
                          <img src="https://img.logo.dev/openai.com?token=pk_c2nKhfMyRIOeCjrk-6-RRw" className="h-6 object-contain" alt="OpenAI" />
                        </div>
                        <div className="flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity">
                          <img src="https://img.logo.dev/mistral.ai?token=pk_c2nKhfMyRIOeCjrk-6-RRw" className="h-6 object-contain" alt="Mistral" />
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                </motion.div>

                {/* Upload Section (Duplicated Window Style) */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="mt-12 mb-24 max-w-4xl mx-auto"
                >
                  <div className="relative z-20 w-full bg-white dark:bg-[#020617] border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden">
                    <div className="h-10 border-b border-gray-100 dark:border-white/5 flex items-center px-4 gap-3 bg-gray-50/50 dark:bg-white/[0.02]">
                      <div className="flex-1 text-center">
                        <span className="text-xs font-medium text-gray-400 font-mono">upload_resume.tsx</span>
                      </div>
                    </div>
                    
                    <div className="p-8 md:p-12 bg-gray-50/50 dark:bg-black/20">
                      <div className="max-w-xl mx-auto">
                        <FileUpload onFileSelect={handleFileSelect} />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Upload Section (Duplicated Window Style) */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="mt-12 mb-24 max-w-4xl mx-auto"
                >
                  <div className="relative z-20 w-full bg-white dark:bg-[#020617] border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden">
                    <div className="h-10 border-b border-gray-100 dark:border-white/5 flex items-center px-4 gap-3 bg-gray-50/50 dark:bg-white/[0.02]">
                      <div className="flex-1 text-center">
                        <span className="text-xs font-medium text-gray-400 font-mono">upload_resume.tsx</span>
                      </div>
                    </div>
                    
                    <div className="p-8 md:p-12 bg-gray-50/50 dark:bg-black/20">
                      <div className="max-w-xl mx-auto">
                        <FileUpload onFileSelect={handleFileSelect} />
                      </div>
                    </div>
                  </div>
                </motion.div>

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
                className="max-w-3xl mx-auto w-full py-12"
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
                className="flex-grow flex flex-col items-center justify-center"
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
                className="flex-grow flex flex-col items-center justify-center"
              >
                 {/* ... Error content ... */}
                 <div className="text-center max-w-md">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400 font-semibold text-lg">!</div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Matching Failed</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
                    <button 
                      onClick={handleReset}
                      className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:opacity-90 transition-opacity duration-200"
                    >
                      Try Again
                    </button>
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
                className="w-full max-w-5xl mx-auto py-12"
              >
                <RoastResult 
                  data={matchData} 
                  onReset={handleReset} 
                />
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default App;
