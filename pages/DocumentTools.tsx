import React, { useState, useRef } from 'react';
import { processDocumentText, fileToGenerativePart, analyzeImageContent, generatePresentation, Slide } from '../services/geminiService';
import { PROMPTS } from '../constants';
import { Loader2, FileText, CheckCircle, AlertTriangle, BookOpen, Camera, Download, HelpCircle, X, SwitchCamera, FileType, Presentation, Printer, Copy, ChevronLeft, ChevronRight, PenTool } from 'lucide-react';
import { FileUpload } from '../components/FileUpload';
import { FeedbackModal } from '../components/FeedbackModal';
import { DocCanvas } from '../components/DocCanvas';

type DocMode = 'SUMMARIZE' | 'PLAGIARISM' | 'REWRITE' | 'SOLVE' | 'PDF' | 'PPT';

export const DocumentTools: React.FC = () => {
  const [activeMode, setActiveMode] = useState<DocMode>('SUMMARIZE');
  const [inputText, setInputText] = useState('');
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [pptSlides, setPptSlides] = useState<Slide[] | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  
  // PDF Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  
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
    setPptSlides(null);

    try {
      // PPT GENERATION PATH
      if (activeMode === 'PPT') {
          const slides = await generatePresentation(PROMPTS.DOC_PPT_GEN, inputText);
          setPptSlides(slides);
          setLoading(false);
          return;
      }

      // TEXT/PDF/ANALYSIS PATH
      let prompt = "";
      switch (activeMode) {
        case 'SUMMARIZE': prompt = PROMPTS.DOC_SUMMARIZE; break;
        case 'PLAGIARISM': prompt = PROMPTS.DOC_PLAGIARISM; break;
        case 'REWRITE': prompt = PROMPTS.DOC_REWRITE; break;
        case 'SOLVE': prompt = "Analyze this document and answer the following question or solve the problem presented. If no specific question is asked, explain the core concepts. Q: "; break;
        case 'PDF': prompt = PROMPTS.DOC_PDF_GEN; break;
      }

      // If Solver mode, append the specific question if typed in the text box (for hybrid image+text queries)
      if (activeMode === 'SOLVE' && inputFile && inputText) {
          prompt += inputText;
      }

      let response = "";
      if (inputFile) {
        // Image analysis
        response = await analyzeImageContent(prompt, inputFile);
      } else {
        // Text/Prompt processing
        const contentToProcess = inputText; 
        if (activeMode === 'PDF') {
            // For PDF, inputText is the TOPIC
            response = await processDocumentText(prompt, contentToProcess);
        } else {
            // For others, inputText is the CONTENT to analyze
            response = await processDocumentText(prompt, contentToProcess);
        }
      }
      setResult(response);
      setTimeout(() => setShowFeedback(true), 3000);
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
        // Fallback standard print if not using the editor
        const w = window.open('', '_blank');
        if (w) {
            w.document.write(`
                <html>
                <head>
                    <title>AI Document Report</title>
                    <style>
                        body { font-family: 'Arial', sans-serif; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; color: #333; }
                        h1 { color: #2563eb; border-bottom: 2px solid #eee; padding-bottom: 10px; }
                        h2 { color: #1e40af; margin-top: 30px; }
                        p { margin-bottom: 15px; }
                        ul { padding-left: 20px; }
                        li { margin-bottom: 8px; }
                    </style>
                </head>
                <body>
                    ${result}
                    <script>window.print();</script>
                </body>
                </html>
            `);
            w.document.close();
        }
    }
  };

  const copySlide = () => {
      if(!pptSlides) return;
      const s = pptSlides[currentSlideIndex];
      const text = `${s.title}\n\n${s.content.join('\n')}\n\nNotes: ${s.speakerNotes}`;
      navigator.clipboard.writeText(text);
      alert("Slide content copied!");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 relative pb-12">
      {/* Editor Modal Overlay */}
      {isEditorOpen && result && (
          <DocCanvas initialHtml={result} onClose={() => setIsEditorOpen(false)} />
      )}

      <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} toolName={`Doc ${activeMode}`} />

      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Document Intelligence</h1>
        <p className="text-slate-400">Summarize, check plagiarism, create PDFs, and build presentations.</p>
      </div>

      {/* Mode Switcher */}
      <div className="flex flex-wrap justify-center gap-3">
        {[
          { id: 'SUMMARIZE', icon: <BookOpen size={16} />, label: 'Summarizer', color: 'purple' },
          { id: 'PDF', icon: <FileType size={16} />, label: 'PDF Maker', color: 'red' },
          { id: 'PPT', icon: <Presentation size={16} />, label: 'PPT Builder', color: 'orange' },
          { id: 'PLAGIARISM', icon: <AlertTriangle size={16} />, label: 'Plagiarism', color: 'indigo' },
          { id: 'REWRITE', icon: <FileText size={16} />, label: 'IEEE Rewrite', color: 'blue' },
          { id: 'SOLVE', icon: <HelpCircle size={16} />, label: 'Solver', color: 'green' }
        ].map(mode => (
          <button 
            key={mode.id}
            onClick={() => { setActiveMode(mode.id as DocMode); setResult(null); setPptSlides(null); }}
            className={`px-4 py-3 rounded-xl border flex items-center space-x-2 transition-all ${activeMode === mode.id ? `bg-${mode.color}-600 border-${mode.color}-400 text-white shadow-lg` : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'}`}
          >
            {mode.icon} <span className="font-bold text-sm">{mode.label}</span>
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Input */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <h3 className="font-semibold mb-4 text-sm uppercase text-slate-500">
                {activeMode === 'PPT' || activeMode === 'PDF' ? 'Configuration' : 'Source'}
            </h3>
            
            {/* Input Logic based on Mode */}
            {(activeMode === 'PPT' || activeMode === 'PDF') ? (
                <div className="space-y-4">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Topic / Title</label>
                        <input 
                            type="text" 
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none"
                            placeholder="e.g. The Future of AI in Healthcare"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                        />
                    </div>
                    <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-xl text-xs text-blue-200 flex gap-2">
                        <div className="mt-0.5"><CheckCircle size={14}/></div>
                        <div>
                            <strong>AI Generator Active:</strong> Enter a topic and the AI will research and write the {activeMode === 'PDF' ? 'full report' : 'slide content'} for you.
                        </div>
                    </div>
                </div>
            ) : (
                !isCameraOpen ? (
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
                )
            )}
          </div>

          <button 
            onClick={handleProcess}
            disabled={loading || (!inputText && !inputFile)}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all ${
              loading || (!inputText && !inputFile) ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-white text-slate-900 hover:bg-slate-200'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" /> : (activeMode === 'PDF' ? <Printer/> : activeMode === 'PPT' ? <Presentation/> : <CheckCircle />)}
            <span>
                {activeMode === 'SOLVE' ? 'Get Answer' : activeMode === 'PDF' ? 'Generate PDF Report' : activeMode === 'PPT' ? 'Build Slides' : 'Run Analysis'}
            </span>
          </button>
        </div>

        {/* Output */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative min-h-[400px] flex flex-col">
           <div className="flex justify-between items-center mb-4">
             <h3 className="font-semibold text-sm uppercase text-slate-500">Output</h3>
             
             {/* PDF Actions */}
             {result && activeMode === 'PDF' && (
                <div className="flex gap-2">
                    <button onClick={() => setIsEditorOpen(true)} className="text-xs flex items-center gap-1 bg-purple-600 hover:bg-purple-500 text-white font-bold px-3 py-2 rounded-lg transition-colors shadow-lg animate-pulse">
                        <PenTool size={14}/> Open Editor (Canvas Mode)
                    </button>
                    <button onClick={() => downloadResult('pdf')} className="text-xs flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-2 rounded-lg transition-colors">
                        <Printer size={14}/> Quick Print
                    </button>
               </div>
             )}
             
             {/* Text Actions */}
             {result && activeMode !== 'PDF' && activeMode !== 'PPT' && (
                <div className="flex gap-2">
                    <button onClick={() => downloadResult('txt')} className="text-xs flex items-center gap-1 text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded"><Download size={12}/> Notes</button>
                </div>
             )}
           </div>
           
           <div className="flex-1 overflow-y-auto max-h-[500px] custom-scrollbar">
             
             {/* PPT SLIDE PREVIEWER */}
             {pptSlides && (
                 <div className="space-y-4">
                     {/* Slide Display */}
                     <div className="aspect-video bg-white text-slate-900 p-8 rounded-xl shadow-2xl flex flex-col relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl select-none">{currentSlideIndex + 1}</div>
                         <div className="mb-6 border-b-4 border-orange-500 pb-2 w-fit">
                             <h2 className="text-2xl font-bold">{pptSlides[currentSlideIndex].title}</h2>
                         </div>
                         <ul className="list-disc pl-5 space-y-2 text-lg flex-1">
                             {pptSlides[currentSlideIndex].content.map((point, i) => (
                                 <li key={i}>{point}</li>
                             ))}
                         </ul>
                         <div className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-500 italic">
                             <strong>Speaker Notes:</strong> {pptSlides[currentSlideIndex].speakerNotes}
                         </div>
                     </div>

                     {/* Controls */}
                     <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                         <div className="flex gap-2">
                             <button 
                                disabled={currentSlideIndex === 0} 
                                onClick={() => setCurrentSlideIndex(i => i - 1)}
                                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg disabled:opacity-50"
                             >
                                 <ChevronLeft size={20} className="text-white"/>
                             </button>
                             <button 
                                disabled={currentSlideIndex === pptSlides.length - 1} 
                                onClick={() => setCurrentSlideIndex(i => i + 1)}
                                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg disabled:opacity-50"
                             >
                                 <ChevronRight size={20} className="text-white"/>
                             </button>
                         </div>
                         <span className="text-slate-400 text-sm font-mono">Slide {currentSlideIndex + 1} / {pptSlides.length}</span>
                         <button onClick={copySlide} className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors">
                             <Copy size={14}/> Copy Content
                         </button>
                     </div>
                 </div>
             )}

             {/* HTML RESULT (PDF Mode) */}
             {result && activeMode === 'PDF' && (
                 <div className="bg-white text-slate-900 p-8 rounded-xl shadow-inner min-h-[400px]">
                     <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: result }} />
                 </div>
             )}

             {/* STANDARD TEXT RESULT */}
             {result && activeMode !== 'PDF' && (
               <div className="prose prose-invert max-w-none text-sm">
                 <pre className="whitespace-pre-wrap font-sans text-slate-300 leading-relaxed">{result}</pre>
               </div>
             )}

             {/* EMPTY STATE */}
             {!result && !pptSlides && (
               <div className="flex flex-col items-center justify-center h-64 text-slate-600">
                 <div className="p-4 bg-slate-950 rounded-full mb-4">
                    {activeMode === 'PPT' ? <Presentation size={32} /> : activeMode === 'PDF' ? <Printer size={32} /> : <FileText size={32} />}
                 </div>
                 <p>
                    {activeMode === 'PPT' ? 'Slides will appear here' : activeMode === 'PDF' ? 'Document preview area' : 'Result will appear here'}
                 </p>
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};