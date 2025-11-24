import React, { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { LoadingScreen } from './components/LoadingScreen';
import { RoastResult } from './components/RoastResult';
import { QuoteCarousel } from './components/QuoteCarousel';
import { HistoryList } from './components/HistoryList';
import { AppState, FileData, AnalysisData, HistoryItem } from './types';
import { generateRoast, generateImprovement } from './services/gemini';
import { saveResume, getResumes, clearAllResumes, getResumeCount } from './services/supabase';
import { Logo } from './components/Logo';
import { LOADING_MESSAGES, FIXING_MESSAGES } from './constants';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [roastData, setRoastData] = useState<AnalysisData | null>(null);
  const [fixedData, setFixedData] = useState<AnalysisData | null>(null);
  const [currentFile, setCurrentFile] = useState<FileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [roastCount, setRoastCount] = useState<number>(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    // Theme Initialization
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }

    // Load History and Count from Database
    const loadHistory = async () => {
      try {
        const resumes = await getResumes();
        setHistory(resumes);
        
        // Get total count from database
        const count = await getResumeCount();
        setRoastCount(count);
      } catch (e) {
        console.error("Failed to load history", e);
        // Fallback to localStorage if database fails
        const storedCount = localStorage.getItem('userRoastCount');
        if (storedCount) {
          setRoastCount(parseInt(storedCount, 10));
        }
        const storedHistory = localStorage.getItem('roastHistory');
        if (storedHistory) {
          try {
            const parsed = JSON.parse(storedHistory);
            setHistory(parsed);
          } catch (err) {
            console.error("Failed to parse localStorage history", err);
          }
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
        // Add to local state
        setHistory([newItem, ...history]);
        // Update count
        const count = await getResumeCount();
        setRoastCount(count);
      } else {
        // Fallback to localStorage if database save fails
        const fallbackItem: HistoryItem = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          fileName: file.name,
          analysis: data,
          resume: file
        };
        const newHistory = [fallbackItem, ...history].slice(0, 10);
        setHistory(newHistory);
        localStorage.setItem('roastHistory', JSON.stringify(newHistory));
        const newCount = roastCount + 1;
        setRoastCount(newCount);
        localStorage.setItem('userRoastCount', newCount.toString());
      }
    } catch (err) {
      console.error("Error saving to history:", err);
      // Fallback to localStorage
      const fallbackItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        fileName: file.name,
        analysis: data,
        resume: file
      };
      const newHistory = [fallbackItem, ...history].slice(0, 10);
      setHistory(newHistory);
      localStorage.setItem('roastHistory', JSON.stringify(newHistory));
      const newCount = roastCount + 1;
      setRoastCount(newCount);
      localStorage.setItem('userRoastCount', newCount.toString());
    }
  };

  const clearHistory = async () => {
    try {
      const success = await clearAllResumes();
      if (success) {
        setHistory([]);
        setRoastCount(0);
        localStorage.removeItem('roastHistory');
        localStorage.removeItem('userRoastCount');
      } else {
        // Fallback to localStorage clear
        setHistory([]);
        localStorage.removeItem('roastHistory');
        localStorage.removeItem('userRoastCount');
        setRoastCount(0);
      }
    } catch (err) {
      console.error("Error clearing history:", err);
      // Fallback to localStorage clear
      setHistory([]);
      localStorage.removeItem('roastHistory');
      localStorage.removeItem('userRoastCount');
      setRoastCount(0);
    }
  };

  const handleHistorySelect = (item: HistoryItem) => {
    setRoastData(item.analysis);
    // Now we have the resume data stored, so we can fix it directly
    setCurrentFile(item.resume);
    setState(AppState.COMPLETE);
  };

  const handleFileSelect = async (file: FileData) => {
    setState(AppState.ANALYZING);
    setError(null);
    setCurrentFile(file);

    try {
      const data = await generateRoast(file.base64, file.mimeType);
      setRoastData(data);
      await addToHistory(file, data);
      setState(AppState.COMPLETE);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unable to analyze document.");
      setState(AppState.ERROR);
    }
  };

  const handleFixResume = async () => {
    if (!currentFile || !roastData || !currentFile.base64) {
      setError("Cannot fix resume from history. Please re-upload the file.");
      return;
    }

    setState(AppState.FIXING);
    setError(null);

    try {
      const data = await generateImprovement(
        currentFile.base64, 
        currentFile.mimeType, 
        roastData.markdownContent
      );
      setFixedData(data);
      setState(AppState.FIX_COMPLETE);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unable to fix resume.");
      setState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setState(AppState.IDLE);
    setRoastData(null);
    setFixedData(null);
    setCurrentFile(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] text-gray-900 dark:text-gray-100 font-sans selection:bg-orange-100 selection:text-orange-900 dark:selection:bg-orange-900/30 dark:selection:text-orange-100 transition-colors duration-200">
      
      {/* Header */}
      <header className="fixed w-full top-0 z-50 border-b border-gray-100/80 dark:border-white/5 bg-white/70 dark:bg-[#020617]/70 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer group" onClick={handleReset}>
            <Logo className="w-7 h-7 group-hover:scale-105 transition-transform duration-200" />
            <h1 className="text-base font-semibold tracking-tighter text-gray-900 dark:text-white">
              FlameCV
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="max-w-4xl mx-auto px-6 pt-36 pb-20">
        
        {state === AppState.IDLE && (
          <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            <div className="max-w-3xl mb-10 space-y-5">
              <h2 className="text-5xl sm:text-6xl font-bold text-gray-900 dark:text-white tracking-tighter text-balance leading-[1.1]">
                Your resume, <br className="hidden sm:block"/>
                <span className="bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-500 bg-clip-text text-transparent">roasted</span>{' '}
                and{' '}
                <span className="bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-300 dark:to-blue-500 bg-clip-text text-transparent">refined</span>.
              </h2>
            </div>

            <QuoteCarousel />

            {/* Live Counter */}
            <div className="flex justify-center mb-8 animate-in fade-in slide-in-from-bottom-2 delay-200">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300 tabular-nums tracking-tight">
                  <span className="font-bold text-gray-900 dark:text-white">{roastCount.toLocaleString()}</span> resumes roasted
                </span>
              </div>
            </div>
            
            <div className="w-full mt-4">
              <FileUpload onFileSelect={handleFileSelect} />
            </div>

            {/* Recent History - Hidden but data still stored */}
            {/* <HistoryList 
              history={history} 
              onSelect={handleHistorySelect} 
              onClear={clearHistory} 
            /> */}
            
            <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-8 w-full border-t border-gray-100 dark:border-white/5 pt-12">
              {[
                { title: "Brutal Honesty", desc: "We strip away the fluff, buzzwords, and corporate oatmeal." },
                { title: "Tactical Fixes", desc: "Don't just get burned. Get rewrites you can copy-paste." },
                { title: "Cloud Storage", desc: "Your resumes are stored securely in the cloud so you can access them anywhere." }
              ].map((item, i) => (
                <div key={i} className="text-left group">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 tracking-tight group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{item.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {(state === AppState.ANALYZING || state === AppState.FIXING) && (
          <div className="min-h-[60vh] flex flex-col items-center justify-center">
            <LoadingScreen messages={state === AppState.FIXING ? FIXING_MESSAGES : LOADING_MESSAGES} />
          </div>
        )}

        {state === AppState.ERROR && (
          <div className="flex flex-col items-center justify-center py-20 animate-in fade-in">
            <div className="text-center max-w-md">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400 font-bold text-xl">
                !
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Analysis Failed</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
              <button 
                onClick={handleReset}
                className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {state === AppState.COMPLETE && roastData && (
          <RoastResult 
            data={roastData} 
            onReset={handleReset} 
            onFix={currentFile?.base64 ? handleFixResume : undefined}
            title="The Verdict"
            isFixMode={false}
          />
        )}

        {state === AppState.FIX_COMPLETE && fixedData && (
          <RoastResult 
            data={fixedData} 
            onReset={handleReset} 
            title="Improved Resume"
            isFixMode={true}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-6 py-12 border-t border-gray-100 dark:border-white/5">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Logo className="w-5 h-5 opacity-80 grayscale hover:grayscale-0 transition-all" />
            <span className="text-sm font-medium text-gray-500 dark:text-gray-500 tracking-tight">FlameCV</span>
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-600">
             &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;