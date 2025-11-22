import React, { useEffect, useState } from 'react';
import { LOADING_MESSAGES } from '../constants';
import { Logo } from './Logo';

interface LoadingScreenProps {
  messages?: string[];
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ messages = LOADING_MESSAGES }) => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    setMessageIndex(0);
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [messages]);

  return (
    <div className="flex flex-col items-center justify-center py-20 w-full">
      <div className="relative mb-8">
        <Logo className="w-12 h-12 animate-pulse" />
        <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full animate-pulse"></div>
      </div>

      <div className="h-16 flex items-center justify-center">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white text-center animate-in fade-in slide-in-from-bottom-2 duration-300 key={messageIndex}">
          {messages[messageIndex]}
        </h2>
      </div>
    </div>
  );
};