import React from 'react';

interface ScoreRingProps {
  score: number;
  grade: string;
  size?: 'sm' | 'lg';
}

export const ScoreRing: React.FC<ScoreRingProps> = ({ score, grade, size = 'lg' }) => {
  // Increased dimensions significantly to provide breathing room (whitespace)
  const dim = size === 'lg' ? 120 : 60;
  const stroke = size === 'lg' ? 8 : 4;
  const radius = (dim - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  // Adjusted font sizes and spacing
  const fontSize = size === 'lg' ? 'text-4xl' : 'text-sm';
  const subFontSize = size === 'lg' ? 'text-sm' : 'text-[10px]';
  const gap = size === 'lg' ? 'mt-1' : 'mt-0.5';

  // Brutally Honest Color Scale
  // 0-59: Red (Fail / Needs major work)
  // 60-79: Yellow (Average / "Corporate Oatmeal")
  // 80-100: Green (High Signal)
  let colorClass = "stroke-red-600 dark:stroke-red-500"; 
  if (score >= 80) {
    colorClass = "stroke-green-500";
  } else if (score >= 60) {
    colorClass = "stroke-yellow-400";
  }

  return (
    <div className="relative flex items-center justify-center">
      <svg
        height={dim}
        width={dim}
        className="transform -rotate-90"
      >
        {/* Background Track */}
        <circle
          stroke="currentColor"
          strokeWidth={stroke}
          fill="transparent"
          r={radius}
          cx={dim / 2}
          cy={dim / 2}
          className="text-gray-100 dark:text-gray-800/60"
        />
        {/* Progress Value */}
        <circle
          stroke="currentColor"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease-in-out' }}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={dim / 2}
          cy={dim / 2}
          className={colorClass}
        />
      </svg>
      
      {/* Centered Content */}
      <div className="absolute flex flex-col items-center justify-center pt-1">
        <span className={`font-bold text-gray-900 dark:text-white leading-none ${fontSize}`}>
          {grade}
        </span>
        <span className={`font-medium text-gray-400 dark:text-gray-500 leading-none ${subFontSize} ${gap}`}>
          {score}/100
        </span>
      </div>
    </div>
  );
};