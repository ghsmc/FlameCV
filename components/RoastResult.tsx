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
      // Generate professionally formatted PDF resume
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      let yPosition = margin;
      
      // Helper to check if we need a new page
      const checkPageBreak = (requiredSpace: number) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };
      
      // Helper to strip all markdown syntax
      const stripMarkdown = (text: string): string => {
        return text
          .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
          .replace(/\*(.*?)\*/g, '$1') // Italic
          .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Links
          .replace(/`([^`]+)`/g, '$1') // Code
          .replace(/^#{1,6}\s+/, '') // Headers
          .replace(/^[-*+]\s+/, '') // Bullets
          .replace(/^\d+\.\s+/, '') // Numbered lists
          .trim();
      };
      
      // Helper to add text with mixed formatting (handles bold within text)
      const addFormattedText = (text: string, fontSize: number = 10, x: number = margin, lineHeight: number = 5) => {
        doc.setFontSize(fontSize);
        const lineStartX = x;
        
        // First, strip all markdown and get clean text
        let cleanText = stripMarkdown(text);
        
        // Check if original had bold markers - if so, preserve bold structure
        const hasBold = text.includes('**');
        if (hasBold) {
          // Extract bold parts and their positions
          const boldMatches: Array<{text: string, start: number, end: number}> = [];
          let searchText = text;
          let offset = 0;
          
          while (searchText.includes('**')) {
            const startIdx = searchText.indexOf('**');
            const endIdx = searchText.indexOf('**', startIdx + 2);
            if (endIdx === -1) break;
            
            const boldText = searchText.substring(startIdx + 2, endIdx);
            boldMatches.push({
              text: boldText,
              start: offset + startIdx,
              end: offset + endIdx + 2
            });
            
            searchText = searchText.substring(endIdx + 2);
            offset += endIdx + 2;
          }
          
          // Render with bold formatting
          let currentX = x;
          let processedText = cleanText;
          
          // Simple approach: render bold parts separately
          const parts = text.split(/(\*\*[^*]+\*\*)/g);
          parts.forEach((part: string) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              const boldText = part.slice(2, -2);
              doc.setFont('helvetica', 'bold');
              const textWidth = doc.getTextWidth(boldText);
              if (currentX + textWidth > pageWidth - margin) {
                yPosition += lineHeight;
                currentX = x;
                checkPageBreak(lineHeight);
              }
              doc.text(boldText, currentX, yPosition);
              currentX += textWidth;
            } else if (part.trim()) {
              const cleanPart = stripMarkdown(part);
              doc.setFont('helvetica', 'normal');
              const textWidth = doc.getTextWidth(cleanPart);
              if (currentX + textWidth > pageWidth - margin) {
                yPosition += lineHeight;
                currentX = x;
                checkPageBreak(lineHeight);
              }
              doc.text(cleanPart, currentX, yPosition);
              currentX += textWidth;
            }
          });
          yPosition += lineHeight;
        } else {
          // No bold, just render normally
          const wrappedLines = doc.splitTextToSize(cleanText, maxWidth - (x - margin));
          wrappedLines.forEach((wrappedLine: string) => {
            checkPageBreak(lineHeight);
            doc.setFont('helvetica', 'normal');
            doc.text(wrappedLine, x, yPosition);
            yPosition += lineHeight;
          });
        }
      };
      
      // Parse markdown content
      const content = data.markdownContent;
      const lines = content.split('\n');
      
      // Skip "Rewritten Resume" header if present
      let startIndex = 0;
      if (lines[0]?.trim().toLowerCase().includes('rewritten resume')) {
        startIndex = 1;
        while (startIndex < lines.length && !lines[startIndex]?.trim()) {
          startIndex++;
        }
      }
      
      let inSection = false;
      let currentJobTitle = '';
      let currentJobMeta = '';
      
      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip empty lines
        if (!line) {
          if (inSection) yPosition += 3;
          continue;
        }
        
        // Skip "What Changed and Why" section
        if (line.toLowerCase().includes('what changed')) {
          break;
        }
        
        // Handle main title (name) - H1
        if (line.startsWith('# ') && i === startIndex) {
          const name = stripMarkdown(line.substring(2));
          checkPageBreak(12);
          doc.setFontSize(18);
          doc.setFont('helvetica', 'bold');
          doc.text(name, margin, yPosition);
          yPosition += 8;
        }
        // Handle section headers - H2
        else if (line.startsWith('## ')) {
          const sectionTitle = stripMarkdown(line.substring(3)).toUpperCase();
          checkPageBreak(10);
          yPosition += 6;
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(sectionTitle, margin, yPosition);
          // Add subtle underline
          doc.setDrawColor(180, 180, 180);
          doc.line(margin, yPosition + 1, pageWidth - margin, yPosition + 1);
          yPosition += 5;
          inSection = true;
        }
        // Handle subsection/company/job headers - H3
        else if (line.startsWith('### ')) {
          const subsectionTitle = stripMarkdown(line.substring(4));
          checkPageBreak(8);
          yPosition += 4;
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          
          // Check if it's a job entry (has | separator for location/date)
          if (subsectionTitle.includes('|')) {
            const parts = subsectionTitle.split('|').map(p => p.trim());
            currentJobTitle = parts[0];
            currentJobMeta = parts.slice(1).join(' | ');
            
            // Job title on left
            doc.text(currentJobTitle, margin, yPosition);
            
            // Meta info (location, date) on right
            if (currentJobMeta) {
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(10);
              const metaWidth = doc.getTextWidth(currentJobMeta);
              doc.text(currentJobMeta, pageWidth - margin - metaWidth, yPosition);
            }
          } else {
            doc.text(subsectionTitle, margin, yPosition);
          }
          yPosition += 4;
        }
        // Handle bullet points
        else if (line.startsWith('- ') || line.startsWith('* ')) {
          const bulletText = stripMarkdown(line.substring(2));
          checkPageBreak(6);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          
          // Check for bold text in bullet
          if (bulletText.includes('**')) {
            addFormattedText(line.substring(2), 10, margin + 6, 5);
          } else {
            const bulletLines = doc.splitTextToSize(bulletText, maxWidth - 15);
            bulletLines.forEach((bulletLine: string, idx: number) => {
              checkPageBreak(5);
              if (idx === 0) {
                doc.text('•', margin + 2, yPosition);
                doc.text(bulletLine, margin + 8, yPosition);
              } else {
                doc.text(bulletLine, margin + 8, yPosition);
              }
              yPosition += 5;
            });
          }
          yPosition += 1;
        }
        // Handle regular text (contact info, descriptions, etc.)
        else {
          const cleanLine = stripMarkdown(line);
          
          // Check if it looks like contact info (has @, phone, or common separators)
          const hasContactInfo = /@|\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}|linkedin|github|\.com/i.test(cleanLine);
          const isDateRange = /^\d{4}|Present|Current|^\w+\s+\d{4}/i.test(cleanLine);
          const isLocation = /^[A-Z][a-z]+,\s*[A-Z]{2}/.test(cleanLine);
          
          if (hasContactInfo || (isDateRange && !isLocation)) {
            // Contact info or date - smaller font, might be on same line as name
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            checkPageBreak(5);
            addFormattedText(line, 9, margin, 4);
            yPosition += 2;
          } else if (isLocation) {
            // Location - right align if it's standalone
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            const textWidth = doc.getTextWidth(cleanLine);
            checkPageBreak(5);
            doc.text(cleanLine, pageWidth - margin - textWidth, yPosition);
            yPosition += 5;
          } else if (cleanLine.includes('**')) {
            // Has bold formatting
            checkPageBreak(6);
            addFormattedText(line, 10, margin, 5);
          } else if (cleanLine.trim()) {
            // Regular paragraph
            checkPageBreak(6);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            const wrappedLines = doc.splitTextToSize(cleanLine, maxWidth);
            wrappedLines.forEach((wrappedLine: string) => {
              checkPageBreak(5);
              doc.text(wrappedLine, margin, yPosition);
              yPosition += 5;
            });
            yPosition += 1;
          }
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