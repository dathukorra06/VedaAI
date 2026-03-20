import React, { useRef } from 'react';
import { ArrowLeft, RefreshCw, Download } from 'lucide-react';
import { useStore } from '../store/store';

const SECTION_COLORS = ["#E84855", "#3A86FF", "#8338EC", "#FB5607", "#06D6A0"];
const DIFF_COLORS: any = { Easy: "#06D6A0", Moderate: "#FFB703", Challenging: "#E84855" };

export default function OutputView() {
  const { setView, currentAssignment, generatedPaper } = useStore();
  const printRef = useRef<HTMLDivElement>(null);

  if (!generatedPaper) return <div>No Paper Data</div>;

  const handleDownload = () => {
      // simple print
      window.print();
  };

  const handleRegenerate = () => {
    setView('create');
  };

  const paper = generatedPaper;

  return (
    <div className="flex-1 overflow-auto bg-[#f7f7fb] flex flex-col items-center py-10 print-bg-white">
      
      {/* Action Bar (Hidden when printing) */}
      <div className="w-full max-w-4xl bg-[#1a1a2e] text-white p-6 rounded-2xl mb-8 flex justify-between items-center shadow-xl print-hidden mx-4">
          <div>
              <button onClick={() => setView('list')} className="text-gray-400 hover:text-white mb-2 flex items-center text-sm">
                  <ArrowLeft size={16} className="mr-1" /> Back
              </button>
              <h2 className="text-xl font-playfair font-bold">✨ Question paper generated!</h2>
          </div>
          <div className="flex space-x-4">
              <button onClick={handleRegenerate} className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg flex items-center shadow-sm text-sm font-semibold transition-colors">
                  <RefreshCw size={16} className="mr-2" /> Regenerate
              </button>
              <button onClick={handleDownload} className="bg-white text-[#1a1a2e] hover:bg-gray-100 px-4 py-2 rounded-lg flex items-center shadow-sm text-sm font-semibold transition-transform hover:scale-105">
                  <Download size={16} className="mr-2" /> Download Document
              </button>
          </div>
      </div>

      {/* A4 Paper Container */}
      <div 
         ref={printRef}
         className="w-full max-w-4xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] print:shadow-none p-16 print:p-0"
         style={{ minHeight: '1122px' }}
      >
          {/* Header */}
          <div className="text-center font-playfair mb-8">
              <h1 className="text-2xl font-bold mb-1">{paper.schoolName.toUpperCase()}</h1>
              <h2 className="text-lg font-bold mb-1">Subject: {paper.subject}</h2>
              <h3 className="text-lg font-bold mb-4">Class: {paper.class}</h3>
              
              <div className="flex justify-between font-bold text-sm border-t border-b border-black py-2 mt-4 font-sans uppercase">
                  <div>Time Allowed: {paper.timeAllowed}</div>
                  <div>Maximum Marks: {paper.maxMarks}</div>
              </div>
          </div>

          <div className="italic text-sm text-center mb-6 font-serif">
              All questions are compulsory unless stated otherwise.
          </div>

          {/* Student Info */}
          <div className="flex flex-wrap gap-x-8 gap-y-4 mb-10 text-sm font-semibold font-sans">
              <div className="flex-1 min-w-[200px] flex items-end">
                  <span>Name:</span>
                  <div className="flex-1 border-b border-black ml-2 h-4"></div>
              </div>
              <div className="flex-1 min-w-[200px] flex items-end">
                  <span>Roll Number:</span>
                  <div className="flex-1 border-b border-black ml-2 h-4"></div>
              </div>
              <div className="flex-1 min-w-[200px] flex items-end">
                  <span>Section:</span>
                  <div className="flex-1 border-b border-black ml-2 h-4"></div>
              </div>
          </div>

          {/* Sections */}
          {(paper.sections || []).map((sec: any, idx: number) => {
              const color = SECTION_COLORS[idx % SECTION_COLORS.length];
              return (
                  <div key={idx} className="mb-10 page-break-inside-avoid">
                      {/* Section header with color accent */}
                      <div className="flex items-center mb-4">
                          <div className="w-1 h-8 rounded-full mr-3" style={{ backgroundColor: color }}></div>
                          <h4 className="font-bold text-xl font-playfair" style={{ color }}>{sec.title}</h4>
                          <span className="ml-3 text-xs font-semibold px-2 py-1 rounded-full text-white" style={{ backgroundColor: color }}>
                            {sec.questionType}
                          </span>
                      </div>
                      <div className="mb-4">
                          <div className="italic text-sm text-gray-500 font-serif">{sec.instruction}</div>
                      </div>

                      <div className="space-y-5 mt-4">
                          {(sec.questions || []).length === 0 ? (
                            <div className="text-red-400 italic text-sm">No questions in this section.</div>
                          ) : (
                            (sec.questions || []).map((q: any, qIndex: number) => (
                              <div key={qIndex} className="flex flex-col mb-4">
                                <div className="flex text-sm leading-relaxed font-sans">
                                    <div className="font-bold mr-3 text-gray-500 shrink-0">{q.id}.</div>
                                    <div className="flex-1 font-semibold text-[#1a1a2e] whitespace-pre-wrap">{q.text}</div>
                                    <div className="ml-4 flex items-center gap-2 shrink-0">
                                        <span
                                            className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border"
                                            style={{
                                              backgroundColor: `${DIFF_COLORS[q.difficulty] || '#ddd'}22`,
                                              color: DIFF_COLORS[q.difficulty] || '#555',
                                              borderColor: `${DIFF_COLORS[q.difficulty] || '#ddd'}66`,
                                            }}
                                        >
                                            {q.difficulty || 'N/A'}
                                        </span>
                                        <span className="font-bold text-gray-700">[{q.marks} {q.marks > 1 ? 'Marks' : 'Mark'}]</span>
                                    </div>
                                </div>
                                {q.options && q.options.length > 0 && (
                                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-3 ml-8">
                                    {q.options.map((opt: string, optIdx: number) => (
                                      <div key={optIdx} className="text-sm flex items-start">
                                        <span className="font-bold mr-2">{String.fromCharCode(65 + optIdx)}.</span>
                                        <span className="whitespace-pre-wrap">{opt}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                      </div>
                  </div>
              );
          })}
          
          <div className="font-bold text-center mb-10 text-sm pt-8 border-t border-gray-100 uppercase font-sans tracking-widest text-gray-400">
              End of Question Paper
          </div>

          <div className="page-break-before-always hidden print:block"></div>

          {/* Answer Key */}
          <div className="mt-16 pt-8 border-t-2 border-gray-200 print:mt-12">
              <h3 className="font-bold text-xl font-playfair mb-6 text-[#1a1a2e]">Answer Key:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-sm bg-gray-50 p-6 rounded-xl print:bg-white print:p-0">
                  {paper.answerKey.map((ans: any, idx: number) => (
                      <div key={idx} className="flex">
                          <div className="font-bold mr-3 font-mono">{ans.id}.</div>
                          <div className="text-gray-700 font-sans">{ans.answer}</div>
                      </div>
                  ))}
              </div>
          </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
            body * { visibility: hidden; }
            .print-bg-white * { visibility: hidden; }
            .print-hidden { display: none !important; }
            .page-break-inside-avoid { page-break-inside: avoid; }
            .page-break-before-always { page-break-before: always; }
            [class*="flex-1 overflow-auto"] > div:nth-child(2) {
                visibility: visible;
                position: absolute;
                left: 0;
                top: 0;
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                box-shadow: none !important;
                padding: 1cm !important;
            }
            [class*="flex-1 overflow-auto"] > div:nth-child(2) * {
                visibility: visible;
            }
        }
      `}} />
    </div>
  );
}
