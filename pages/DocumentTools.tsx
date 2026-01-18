import React, { useState } from 'react';
import { processDocumentText, fileToGenerativePart, analyzeImageContent } from '../services/geminiService';
import { PROMPTS } from '../constants';
import { Loader2, FileText, CheckCircle, AlertTriangle, BookOpen } from 'lucide-react';
import { FileUpload } from '../components/FileUpload';

type DocMode = 'SUMMARIZE' | 'PLAGIARISM' | 'REWRITE';

export const DocumentTools: React.FC = () => {
  const [activeMode, setActiveMode] = useState<DocMode>('SUMMARIZE');
  const [inputText, setInputText] = useState('');
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleProcess = async () => {
    if (!inputText && !inputFile) return;
    setLoading(true);
    setResult(null);

    try {
      let prompt = "";
      switch (activeMode) {
        case 'SUMMARIZE': prompt = PROMPTS.DOC_SUMMARIZE; break;
        case 'PLAGIARISM': prompt = PROMPTS.DOC_PLAGIARISM; break;
        case 'REWRITE': prompt = PROMPTS.DOC_REWRITE; break;
      }

      let response = "";
      if (inputFile) {
        // Treat as image scan or PDF content extraction via vision
        response = await analyzeImageContent(prompt, inputFile);
      } else {
        response = await processDocumentText(prompt, inputText);
      }
      setResult(response);
    } catch (e) {
      setResult("Error processing document. Please check API key or file format.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Document Intelligence (IEEE)</h1>
        <p className="text-slate-400">Summarize, check for plagiarism (AI detection), and rewrite for academic standards.</p>
      </div>

      {/* Mode Switcher */}
      <div className="flex justify-center space-x-4">
        <button 
          onClick={() => { setActiveMode('SUMMARIZE'); setResult(null); }}
          className={`px-6 py-3 rounded-xl border flex items-center space-x-2 transition-all ${activeMode === 'SUMMARIZE' ? 'bg-purple-600 border-purple-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
        >
          <BookOpen size={18} /> <span>Summarizer</span>
        </button>
        <button 
          onClick={() => { setActiveMode('PLAGIARISM'); setResult(null); }}
          className={`px-6 py-3 rounded-xl border flex items-center space-x-2 transition-all ${activeMode === 'PLAGIARISM' ? 'bg-orange-600 border-orange-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
        >
          <AlertTriangle size={18} /> <span>Plagiarism Check</span>
        </button>
        <button 
          onClick={() => { setActiveMode('REWRITE'); setResult(null); }}
          className={`px-6 py-3 rounded-xl border flex items-center space-x-2 transition-all ${activeMode === 'REWRITE' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
        >
          <FileText size={18} /> <span>IEEE Rewrite</span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Input */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <h3 className="font-semibold mb-4 text-sm uppercase text-slate-500">Source</h3>
            
            <div className="space-y-4">
              <FileUpload 
                accept="image/*, .pdf" // Note: Simple implementation handles images. PDFs would need vision.
                label="Upload Document Scan / Image" 
                onFileSelect={(f) => { setInputFile(f); setInputText(''); }}
              />
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-900 px-2 text-slate-500">Or paste text</span>
                </div>
              </div>

              <textarea 
                className="w-full h-40 bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm focus:border-purple-500 focus:outline-none transition-colors resize-none"
                placeholder="Paste abstract or paragraphs here..."
                value={inputText}
                onChange={(e) => { setInputText(e.target.value); setInputFile(null); }}
              />
            </div>
          </div>

          <button 
            onClick={handleProcess}
            disabled={loading || (!inputText && !inputFile)}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all ${
              loading || (!inputText && !inputFile) ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-white text-slate-900 hover:bg-slate-200'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" /> : <CheckCircle />}
            <span>Run Analysis</span>
          </button>
        </div>

        {/* Output */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative min-h-[400px]">
           <h3 className="font-semibold mb-4 text-sm uppercase text-slate-500">Output</h3>
           {result ? (
             <div className="prose prose-invert max-w-none text-sm">
               <pre className="whitespace-pre-wrap font-sans text-slate-300">{result}</pre>
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center h-64 text-slate-600">
               <FileText size={48} className="mb-4 opacity-20" />
               <p>Result will appear here</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
