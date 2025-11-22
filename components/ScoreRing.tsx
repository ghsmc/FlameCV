import React from 'react';

interface ScoreRingProps {
  score: number;
  grade: string;
  size?: 'sm' | 'lg';
}

export const ScoreRing: React.FC<ScoreRingProps> = ({ score, grade, size = 'lg' }) => {
  const radius = size === 'lg' ? 36 : 20;
  const stroke = size === 'lg' ? 6 : 4;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  const dim = size === 'lg' ? 80 : 48;
  const fontSize = size === 'lg' ? 'text-2xl' : 'text-sm';
  const subFontSize = size === 'lg' ? 'text-xs' : 'text-[8px]';

  // Determine color based on score
  let colorClass = "stroke-red-500";
  if (score >= 90) colorClass = "stroke-green-500";
  else if (score >= 70) colorClass = "stroke-blue-500";
  else if (score >= 50) colorClass = "stroke-yellow-500";

  return (
    <div className="relative flex items-center justify-center">
      <svg
        height={dim}
        width={dim}
        className="transform -rotate-90"
      >
        <circle
          stroke="currentColor"
          strokeWidth={stroke}
          fill="transparent"
          r={normalizedRadius}
          cx={dim / 2}
          cy={dim / 2}
          className="text-gray-200 dark:text-gray-800"
        />
        <circle
          stroke="currentColor"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease-in-out' }}
          strokeLinecap="round"
          fill="transparent"
          r={normalizedRadius}
          cx={dim / 2}
          cy={dim / 2}
          className={colorClass}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className={`font-bold text-gray-900 dark:text-white ${fontSize}`}>
          {grade}
        </span>
        <span className={`font-medium text-gray-500 dark:text-gray-400 ${subFontSize}`}>
          {score}/100
        </span>
      </div>
    </div>
  );
};