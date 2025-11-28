import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUpload } from './components/FileUpload';
import { LoadingScreen, ThinkingStep } from './components/LoadingScreen';
import { RoastResult } from './components/RoastResult';
import { Survey } from './components/Survey';
import { AuthModal } from './components/AuthModal';
import { Sidebar } from './components/Sidebar';
import { LogoTicker } from './components/LogoTicker';
import { AppState, FileData, AnalysisData, HistoryItem, UserPreferences } from './types';
import { generateRoast } from './services/gemini';
import { saveResume, getResumes, getResumeCount, signIn, signUp, signOut, signInWithGoogle, getCurrentUser, onAuthStateChange, User } from './services/supabase';
import { Logo } from './components/Logo';
import { SunIcon, MoonIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

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
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
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
    const timer = setTimeout(() => setShowContent(true), 800);
    return () => clearTimeout(timer);
  }, []);

  // Auth state listener
  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };

    loadUser();

    // Subscribe to auth changes
    const unsubscribe = onAuthStateChange((newUser) => {
      setUser(newUser);
      if (newUser) {
        // Reload history when user logs in
        loadHistory(newUser.id);
        // Open sidebar when user logs in (only on desktop)
        if (window.innerWidth >= 1024) {
          setSidebarOpen(true);
        }
      } else {
        // Clear history when user logs out
        setHistory([]);
        setMatchCount(0);
        setSidebarOpen(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const loadHistory = async (userId?: string) => {
    try {
      const resumes = await getResumes(userId);
      setHistory(resumes);
      const count = await getResumeCount(userId);
      setMatchCount(count);
    } catch (e) {
      console.error("Failed to load history", e);
    }
  };

  useEffect(() => {
    if (user) {
      loadHistory(user.id);
    }
  }, [user]);

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
      console.log('Attempting to save resume:', { 
        userId: user?.id, 
        userEmail: user?.email,
        hasOriginalFile: !!file.originalFile,
        fileName: file.name 
      });
      
      const newItem = await saveResume(file, data, user?.id, file.originalFile);
      
      if (newItem) {
        console.log('Resume saved successfully:', newItem.id);
        setHistory([newItem, ...history]);
        const count = await getResumeCount(user?.id);
        setMatchCount(count);
      } else {
        console.error('saveResume returned null - save failed');
      }
    } catch (err) {
      console.error("Error saving to history:", err);
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    await signIn(email, password);
  };

  const handleSignUp = async (email: string, password: string) => {
    await signUp(email, password);
  };

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    setHistory([]);
    setMatchCount(0);
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

  const handleHistorySelect = (item: HistoryItem) => {
    setSidebarOpen(false);
    setMatchData(item.analysis);
    setCurrentFile(item.resume);
    setState(AppState.COMPLETE);
  };

  const handleClearHistory = async () => {
    if (confirm('Are you sure you want to clear your match history?')) {
      setHistory([]);
      setMatchCount(0);
      // TODO: Implement clearAllResumes(user?.id) when needed
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#020617] text-gray-900 dark:text-gray-100 font-sans selection:bg-orange-100 selection:text-orange-900 dark:selection:bg-orange-900/30 dark:selection:text-orange-100 transition-colors duration-300">
      
      {/* Sidebar */}
      <Sidebar
        history={history}
        onSelect={handleHistorySelect}
        onClear={handleClearHistory}
        onNewAnalysis={handleReset}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        user={user}
      />

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


      {/* Main Layout Container - Only shift on large screens (lg+) */}
      <div
        className={`relative z-10 min-h-screen flex flex-col transition-all duration-200 ${
          sidebarOpen ? 'lg:pl-[280px]' : ''
        }`}
      >
        <div className="max-w-5xl mx-auto px-3 sm:px-6 w-full flex flex-col flex-1">

        {/* Header - Floating Navbar */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease: smoothEase }}
          className="w-full py-4"
        >
          <div className="border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-xl rounded-xl px-3 sm:px-6 py-2.5 sm:py-3">
            <div className="flex items-center justify-between">
              <div
                className="flex items-center gap-2 sm:gap-2.5 cursor-pointer"
                onClick={handleReset}
              >
                <Logo className="w-7 h-7 sm:w-8 sm:h-8" />
                <h1 className="text-sm sm:text-base font-semibold tracking-tight text-gray-900 dark:text-white">
                  Matchpoint
                </h1>
              </div>

              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  onClick={toggleTheme}
                  className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {isDarkMode ? <SunIcon className="w-4 h-4 sm:w-5 sm:h-5" /> : <MoonIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
                <div className="w-px h-4 sm:h-5 bg-gray-200 dark:bg-white/10" />
                {user ? (
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400 hidden md:inline">
                      {user.email}
                    </span>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-gray-900 dark:text-white hover:opacity-70 transition-opacity"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-sm hover:shadow-md"
                    >
                      Sign up
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content Area */}
        <main className="flex-grow flex flex-col">
          <AnimatePresence mode="wait">

            {/* Landing Page - Centered Layout */}
            {state === AppState.IDLE && showContent && (
              <motion.div
                key="landing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: smoothEase }}
                className="flex-grow flex flex-col items-center justify-center text-center px-2 py-8 sm:py-16"
              >
                {/* Headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.1] mb-4 sm:mb-6"
                >
                  Get matched to
                  <br />
                  <span className="bg-[linear-gradient(90deg,#f97316_0%,#dc2626_25%,#991b1b_50%,#dc2626_75%,#f97316_100%)] dark:bg-[linear-gradient(90deg,#fb923c_0%,#ef4444_25%,#b91c1c_50%,#ef4444_75%,#fb923c_100%)] bg-clip-text text-transparent flame-text">
                    startups
                  </span>
                  {' '}instantly
                </motion.h1>

                {/* Subtext */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl mb-8 sm:mb-12 px-2"
                >
                  Upload your resume. We read it deeply and return a small, accurate set of early-stage startups where you genuinely fit.
                </motion.p>

                {/* File Upload - Centered with glow */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="w-full max-w-md p-4 sm:p-6 bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-white/10 shadow-xl shadow-orange-500/10 mb-8 sm:mb-12"
                >
                  <FileUpload onFileSelect={handleFileSelect} />
                </motion.div>

                {/* Logo Ticker */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                  className="w-full max-w-4xl"
                >
                  <LogoTicker />
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
                className="flex-grow flex items-center justify-center"
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
                  sidebarOpen={sidebarOpen}
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
                className="w-full max-w-5xl mx-auto py-6 sm:py-12"
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

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
        onGoogleSignIn={handleGoogleSignIn}
      />
    </div>
  );
};

export default App;
