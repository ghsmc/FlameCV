import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ArrowPathIcon, SparklesIcon, ClipboardDocumentIcon, ClipboardDocumentCheckIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { jsPDF } from 'jspdf';
import { AnalysisData } from '../types';
import { ScoreRing } from './ScoreRing';
import { TargetCompanies } from './TargetCompanies';

interface RoastResultProps {
  data: AnalysisData;
  onReset: () => void;
  onFix?: () => void;
  title?: string;
  isFixMode?: boolean;
}

export const RoastResult: React.FC<RoastResultProps> = ({ 
  data, 
  onReset, 
  onFix, 
  title = "The Verdict",
  isFixMode = false 
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'roast' | 'reality'>('roast');
  
  // Only show tabs if not in fix mode and career advice exists
  const showTabs = !isFixMode && data.careerAdvice;

  const handleCopy = () => {
    navigator.clipboard.writeText(data.markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (isFixMode) {
      // Generate PDF for fixed resume
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      let yPosition = margin;
      
      // Helper function to add text with word wrap
      const addText = (text: string, fontSize: number = 11, isBold: boolean = false, color: [number, number, number] = [0, 0, 0]) => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        doc.setTextColor(color[0], color[1], color[2]);
        
        const lines = doc.splitTextToSize(text, maxWidth);
        
        if (yPosition + (lines.length * fontSize * 0.4) > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        
        lines.forEach((line: string) => {
          doc.text(line, margin, yPosition);
          yPosition += fontSize * 0.4;
        });
        
        yPosition += 5; // Add spacing after text
      };
      
      // Parse markdown content and format for PDF
      const content = data.markdownContent;
      const lines = content.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (!line) {
          yPosition += 5;
          continue;
        }
        
        // Handle headings
        if (line.startsWith('# ')) {
          if (yPosition > margin) yPosition += 10;
          addText(line.substring(2), 18, true, [0, 0, 0]);
        } else if (line.startsWith('## ')) {
          if (yPosition > margin) yPosition += 8;
          addText(line.substring(3), 16, true, [0, 0, 0]);
        } else if (line.startsWith('### ')) {
          if (yPosition > margin) yPosition += 6;
          addText(line.substring(4), 14, true, [0, 0, 0]);
        } else if (line.startsWith('- ') || line.startsWith('* ')) {
          // Handle bullet points
          const bulletText = line.substring(2);
          doc.setFontSize(11);
          doc.text('•', margin, yPosition);
          const bulletLines = doc.splitTextToSize(bulletText, maxWidth - 10);
          bulletLines.forEach((bulletLine: string, idx: number) => {
            if (yPosition > pageHeight - margin) {
              doc.addPage();
              yPosition = margin;
            }
            doc.text(bulletLine, margin + 8, yPosition);
            if (idx < bulletLines.length - 1) yPosition += 11 * 0.4;
          });
          yPosition += 11 * 0.4 + 3;
        } else {
          // Regular text
          addText(line, 11, false, [0, 0, 0]);
        }
      }
      
      // Save PDF
      doc.save('resume-fixed.pdf');
    } else {
      // Download markdown for roast
      const blob = new Blob([data.markdownContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'resume-roast.md';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
      {/* Header Actions */}
      <div className="sticky top-16 z-20 flex items-center justify-between py-4 mb-8 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800/50">
        <div className="flex items-center gap-4">
          <ScoreRing score={data.score} grade={data.grade} />
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
              {title}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
              {data.summary}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isFixMode && (
             <>
                <button
                 onClick={handleDownload}
                 className="hidden sm:flex items-center justify-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors px-3 py-1.5 rounded-md"
               >
                 <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                 {isFixMode ? 'Save PDF' : 'Save'}
               </button>
               <button
                 onClick={handleCopy}
                 className="hidden sm:flex items-center justify-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors px-3 py-1.5 rounded-md"
               >
                 {copied ? <ClipboardDocumentCheckIcon className="w-3.5 h-3.5 text-green-600" /> : <ClipboardDocumentIcon className="w-3.5 h-3.5" />}
                 {copied ? "Copied" : "Copy"}
               </button>
             </>
          )}
          <button
            onClick={onReset}
            className="flex items-center justify-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors px-3 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowPathIcon className="w-3.5 h-3.5" />
            Restart
          </button>
        </div>
      </div>

      {/* Tabs */}
      {showTabs && (
        <div className="sticky top-[73px] z-10 mb-8 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('roast')}
              className={`
                flex-1 px-4 py-3 text-sm font-medium transition-all
                ${activeTab === 'roast'
                  ? 'text-gray-900 dark:text-white border-b-2 border-orange-500 bg-white/50 dark:bg-white/5'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                }
              `}
            >
              Roast
            </button>
            <button
              onClick={() => setActiveTab('reality')}
              className={`
                flex-1 px-4 py-3 text-sm font-medium transition-all
                ${activeTab === 'reality'
                  ? 'text-gray-900 dark:text-white border-b-2 border-orange-500 bg-white/50 dark:bg-white/5'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                }
              `}
            >
              Reality Check
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {activeTab === 'roast' || !showTabs ? (
        <div className={`
          prose prose-slate dark:prose-invert max-w-none
          prose-headings:font-semibold prose-headings:tracking-tight prose-h1:text-xl
          prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-p:leading-7 prose-p:mb-4
          prose-li:text-gray-600 dark:prose-li:text-gray-300
          prose-strong:font-semibold prose-strong:text-gray-900 dark:prose-strong:text-white
          prose-hr:border-gray-200 dark:prose-hr:border-gray-800
        `}>
          <ReactMarkdown
            components={{
              h1: ({node, ...props}) => 
                isFixMode 
                  ? <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-4 border-b border-gray-200 dark:border-gray-800" {...props} />
                  : <h3 className="text-lg font-bold uppercase tracking-wider text-gray-900 dark:text-white mt-12 mb-4 first:mt-0" {...props} />,
              h2: ({node, ...props}) => 
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-10 mb-4 first:mt-0" {...props} />,
              h3: ({node, ...props}) => 
                <h3 className="text-lg font-bold uppercase tracking-wider text-gray-900 dark:text-white mt-8 mb-4 first:mt-0" {...props} />,
              p: ({node, ...props}) => 
                <p className="text-gray-600 dark:text-gray-300 leading-7 mb-4 break-words" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc pl-6 space-y-2 my-6 marker:text-gray-400 dark:marker:text-gray-600" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal pl-6 space-y-2 my-6 marker:text-gray-400 dark:marker:text-gray-600" {...props} />,
              li: ({node, ...props}) => <li className="pl-2 text-gray-600 dark:text-gray-300 leading-7" {...props} />,
              strong: ({node, ...props}) => <strong className="font-semibold text-gray-900 dark:text-white" {...props} />,
              em: ({node, ...props}) => <em className="italic text-gray-700 dark:text-gray-200" {...props} />,
              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 italic my-4 text-gray-600 dark:text-gray-400" {...props} />,
              code: ({node, inline, ...props}: any) => 
                inline 
                  ? <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-gray-900 dark:text-gray-100" {...props} />
                  : <code className="block bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm font-mono text-gray-900 dark:text-gray-100 overflow-x-auto my-4" {...props} />,
              hr: ({node, ...props}) => <hr className="border-gray-200 dark:border-gray-800 my-8" {...props} />,
            }}
          >
            {data.markdownContent}
          </ReactMarkdown>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <TargetCompanies careerAdvice={data.careerAdvice} />
        </div>
      )}
      
      {/* Footer Actions */}
      <div className="mt-8 flex flex-col items-center">

        <div className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800 w-full flex flex-col items-center">
          {isFixMode ? (
             <div className="flex flex-col items-center gap-4 w-full max-w-sm">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Ready to apply? Download your new resume.</p>
              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg text-white bg-gray-900 dark:bg-white dark:text-black hover:bg-black dark:hover:bg-gray-100 transition-all shadow-sm active:scale-[0.98]"
              >
                <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                Download PDF
              </button>
             </div>
          ) : (
            <div className="flex flex-col items-center gap-6 w-full max-w-sm">
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">"Feedback is the breakfast of champions."</p>
              <div className="grid grid-cols-2 gap-3 w-full">
                <button
                  onClick={onReset}
                  className="flex items-center justify-center px-4 py-2.5 border border-gray-200 dark:border-gray-800 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-[0.98]"
                >
                  Roast Another
                </button>
                
                {onFix && (
                  <button
                    onClick={onFix}
                    className="relative overflow-hidden flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-500 dark:bg-orange-600 dark:hover:bg-orange-500 transition-all shadow-sm hover:shadow-md active:scale-[0.98] group"
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
                    <SparklesIcon className="w-4 h-4 mr-2 text-white/90" />
                    Fix It For Me
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};