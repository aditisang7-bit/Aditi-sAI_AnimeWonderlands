import React, { useState, useRef } from 'react';
import { processDocumentText, fileToGenerativePart, analyzeImageContent } from '../services/geminiService';
import { PROMPTS } from '../constants';
import { Loader2, FileText, CheckCircle, AlertTriangle, BookOpen, Camera, Download, HelpCircle, X, SwitchCamera } from 'lucide-react';
import { FileUpload } from '../components/FileUpload';

type DocMode = 'SUMMARIZE' | 'PLAGIARISM' | 'REWRITE' | 'SOLVE';

export const DocumentTools: React.FC = () => {
  const [activeMode, setActiveMode] = useState<DocMode>('SUMMARIZE');
  const [inputText, setInputText] = useState('');
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  
  // Camera
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async (mode?: 'user' | 'environment') => {
    const targetMode = mode || facingMode;
    setIsCameraOpen(true);
    try {
      if (streamRef.current) {
         streamRef.current.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: targetMode } });
      streamRef.current = stream;
      setFacingMode(targetMode);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch (err) {
      console.error(err);
      setIsCameraOpen(false);
    }
  };

  const toggleCamera = () => {
     const newMode = facingMode === 'environment' ? 'user' : 'environment';
     startCamera(newMode);
  };

  const captureImage = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    canvas.toBlob(blob => {
      if (blob) {
        const file = new File([blob], "doc_scan.jpg", { type: 'image/jpeg' });
        setInputFile(file);
        setInputText('');
        stopCamera();
      }
    }, 'image/jpeg');
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    setIsCameraOpen(false);
  };

  const handleProcess = async () => {
    if ((!inputText && !inputFile)) return;
    setLoading(true);
    setResult(null);

    try {
      let prompt = "";
      switch (activeMode) {
        case 'SUMMARIZE': prompt = PROMPTS.DOC_SUMMARIZE; break;
        case 'PLAGIARISM': prompt = PROMPTS.DOC_PLAGIARISM; break;
        case 'REWRITE': prompt = PROMPTS.DOC_REWRITE; break;
        case 'SOLVE': prompt = "Analyze this document and answer the following question or solve the problem presented. If no specific question is asked, explain the core concepts. Q: "; break;
      }

      // If Solver mode, append the specific question if typed in the text box (for hybrid image+text queries)
      if (activeMode === 'SOLVE' && inputFile && inputText) {
          prompt += inputText;
      }

      let response = "";
      if (inputFile) {
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

  const downloadResult = (format: 'txt' | 'pdf') => {
    if (!result) return;
    if (format === 'txt') {
        const blob = new Blob([result], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `doc-result-${Date.now()}.txt`;
        a.click();
    } else {
        // Simple print-to-pdf trigger
        const w = window.open('', '_blank');
        if (w) {
            w.document.write(`<pre style="font-family: monospace; white-space: pre-wrap;">${result}</pre>`);
            w.document.close();
            w.print();
        }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 relative">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Document Intelligence</h1>
        <p className="text-slate-400">Summarize, check for plagiarism, solve homework, and export.</p>
      </div>

      {/* Mode Switcher */}
      <div className="flex flex-wrap justify-center gap-4">
        {[
          { id: 'SUMMARIZE', icon: <BookOpen size={18} />, label: 'Summarizer', color: 'purple' },
          { id: 'PLAGIARISM', icon: <AlertTriangle size={18} />, label: 'Plagiarism', color: 'orange' },
          { id: 'REWRITE', icon: <FileText size={18} />, label: 'IEEE Rewrite', color: 'blue' },
          { id: 'SOLVE', icon: <HelpCircle size={18} />, label: 'Solver / Q&A', color: 'green' }
        ].map(mode => (
          <button 
            key={mode.id}
            onClick={() => { setActiveMode(mode.id as DocMode); setResult(null); }}
            className={`px-6 py-3 rounded-xl border flex items-center space-x-2 transition-all ${activeMode === mode.id ? `bg-${mode.color}-600 border-${mode.color}-400 text-white` : 'bg-slate-950 border-slate-800 text-slate-400'}`}
          >
            {mode.icon} <span>{mode.label}</span>
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Input */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <h3 className="font-semibold mb-4 text-sm uppercase text-slate-500">Source</h3>
            
            {!isCameraOpen ? (
              <div className="space-y-4">
                <button onClick={() => startCamera()} className="w-full py-3 bg-slate-950 border border-dashed border-slate-700 rounded-xl text-slate-400 hover:text-white hover:border-purple-500 flex items-center justify-center gap-2">
                   <Camera size={20} /> <span>Scan Document</span>
                </button>

                <div className="relative flex items-center py-1">
                   <div className="flex-grow border-t border-slate-800"></div>
                   <span className="flex-shrink-0 mx-4 text-slate-500 text-xs uppercase">Or Upload</span>
                   <div className="flex-grow border-t border-slate-800"></div>
                </div>

                <FileUpload 
                  accept="image/*, .pdf" 
                  label="Upload File" 
                  onFileSelect={(f) => { setInputFile(f); setInputText(''); }}
                />
                
                <textarea 
                  className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm focus:border-purple-500 focus:outline-none transition-colors resize-none"
                  placeholder={activeMode === 'SOLVE' ? "Type your question here..." : "Paste text here..."}
                  value={inputText}
                  onChange={(e) => { setInputText(e.target.value); if(!activeMode.includes('SOLVE')) setInputFile(null); }}
                />
              </div>
            ) : (
              <div className="relative bg-black rounded-xl overflow-hidden aspect-[3/4]">
                 <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                 
                 <button onClick={stopCamera} className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white"><X size={20}/></button>
                 {/* Toggle Button */}
                 <button onClick={toggleCamera} className="absolute top-2 left-2 p-2 bg-black/50 rounded-full text-white"><SwitchCamera size={20}/></button>

                 <button onClick={captureImage} className="absolute bottom-4 left-1/2 -translate-x-1/2 w-14 h-14 bg-white rounded-full border-4 border-slate-400"></button>
              </div>
            )}
          </div>

          <button 
            onClick={handleProcess}
            disabled={loading || (!inputText && !inputFile)}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all ${
              loading || (!inputText && !inputFile) ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-white text-slate-900 hover:bg-slate-200'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" /> : <CheckCircle />}
            <span>{activeMode === 'SOLVE' ? 'Get Answer' : 'Run Analysis'}</span>
          </button>
        </div>

        {/* Output */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative min-h-[400px] flex flex-col">
           <div className="flex justify-between items-center mb-4">
             <h3 className="font-semibold text-sm uppercase text-slate-500">Output</h3>
             {result && (
               <div className="flex gap-2">
                 <button onClick={() => downloadResult('txt')} className="text-xs flex items-center gap-1 text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded"><Download size={12}/> Notes</button>
                 <button onClick={() => downloadResult('pdf')} className="text-xs flex items-center gap-1 text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded"><Download size={12}/> PDF</button>
               </div>
             )}
           </div>
           
           <div className="flex-1 overflow-y-auto max-h-[500px]">
             {result ? (
               <div className="prose prose-invert max-w-none text-sm">
                 <pre className="whitespace-pre-wrap font-sans text-slate-300 leading-relaxed">{result}</pre>
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
    </div>
  );
};