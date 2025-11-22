import React, { useState, useEffect } from 'react';

const FEEDBACK_EXAMPLES = [
  "\"You claim 'leadership' but list zero direct reports. Quantify your influence or cut the buzzword.\"",
  "\"This summary is 4 lines of corporate fluff. Recruiters scan for 6 seconds. Give me: Role, Years, One Big Win.\"",
  "\"'Responsible for sales' is a job description. 'Grew revenue 40% YoY' is an achievement. Rewrite this.\"",
  "\"Your 'Skills' section is a laundry list. Move the critical tech stacks into your work experience where they prove value.\"",
  "\"Don't tell me you're a 'hard worker'. Show me the project you delivered two weeks ahead of schedule.\""
];

export const QuoteCarousel: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % FEEDBACK_EXAMPLES.length);
        setIsVisible(true);
      }, 500); // Wait for fade out transition
    }, 5000); // Change every 5 seconds for reading time

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-24 flex items-center justify-center mb-6 overflow-hidden max-w-2xl mx-auto px-4">
      <p 
        className={`
          text-lg md:text-xl font-medium text-gray-600 dark:text-gray-300 text-center leading-relaxed
          transition-all duration-500 ease-in-out transform font-serif italic
          ${isVisible ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-2 blur-sm'}
        `}
      >
        {FEEDBACK_EXAMPLES[index]}
      </p>
    </div>
  );
};