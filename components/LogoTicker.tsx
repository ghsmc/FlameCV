import React from 'react';

const LOGOS = [
  { name: 'Cursor', domain: 'cursor.com' },
  { name: 'Resend', domain: 'resend.com' },
  { name: 'Supabase', domain: 'supabase.com' },
  { name: 'Raycast', domain: 'raycast.com' },
  { name: 'Linear', domain: 'linear.app' },
  { name: 'Perplexity', domain: 'perplexity.ai' },
  { name: 'Hugging Face', domain: 'huggingface.co' },
  { name: 'PostHog', domain: 'posthog.com' },
  { name: 'Railway', domain: 'railway.app' },
  { name: 'Modal', domain: 'modal.com' },
  { name: 'Replicate', domain: 'replicate.com' },
  { name: 'Neon', domain: 'neon.tech' },
  { name: 'Mistral', domain: 'mistral.ai' },
  { name: 'LangChain', domain: 'langchain.com' },
];

export const LogoTicker: React.FC = () => {
  return (
    <div className="w-full overflow-hidden py-6 mask-gradient-x relative">
      {/* Gradient Masks */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white dark:from-[#020617] to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white dark:from-[#020617] to-transparent z-10 pointer-events-none"></div>

      <div className="flex gap-12 animate-scroll whitespace-nowrap hover:pause-animation w-max">
        {/* Double the list for seamless scrolling */}
        {[...LOGOS, ...LOGOS, ...LOGOS, ...LOGOS].map((logo, i) => (
          <div 
            key={`${logo.name}-${i}`} 
            className="flex flex-col items-center justify-center shrink-0 transition-transform duration-300 hover:scale-110"
          >
            <img 
              src={`https://img.logo.dev/${logo.domain}?token=pk_c2nKhfMyRIOeCjrk-6-RRw`} 
              alt={logo.name}
              className="h-8 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

