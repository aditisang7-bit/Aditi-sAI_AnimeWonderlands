import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Send, Mic, Camera, Image as ImageIcon, Loader2, Bot, User, X, Sparkles, AlertCircle, SwitchCamera } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { fileToGenerativePart } from '../services/geminiService';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string;
}

export const ChatPage: React.FC = () => {
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: "Hi! I'm your Wonder Assistant. I can help you find tools, generate ideas, or analyze images. Try typing, speaking, or snapping a photo!" }
  ]);
  const [inputText, setInputText] = useState(location.state?.initialQuery || '');
  const [inputImage, setInputImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Camera State
  const [showCamera, setShowCamera] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Refs for Strict Mode Handling
  const hasAutoExecuted = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Incoming Actions from Homepage
  useEffect(() => {
    // Only execute once (guards against React Strict Mode double-mount)
    if (location.state && !hasAutoExecuted.current) {
        hasAutoExecuted.current = true;
        
        const { autoSend, startVoice, startCamera: autoCam, initialQuery } = location.state;
        
        // Clear the state so refreshing doesn't re-trigger actions
        window.history.replaceState({}, '');

        // Auto Text Send
        if (autoSend && initialQuery) {
            handleSend(initialQuery);
        }

        // Auto Voice
        if (startVoice) {
            handleVoiceInput();
        }

        // Auto Camera
        if (autoCam) {
            startCamera();
        }
    }

    // Cleanup Camera on unmount
    return () => {
      stopCamera();
    };
  }, []);

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || inputText;
    if ((!textToSend.trim() && !inputImage) || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      image: inputImage ? URL.createObjectURL(inputImage) : undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const modelName = 'gemini-3-flash-preview';
      
      let promptParts: any[] = [{ text: userMsg.text || "Describe this image." }];
      
      if (inputImage) {
        const imagePart = await fileToGenerativePart(inputImage);
        promptParts = [imagePart, { text: userMsg.text || "Explain this image in detail." }];
      }

      const systemInstruction = "You are a helpful, friendly AI assistant for the 'Aditi's AI' platform. You can help users use tools like Ludo, Image Studio, and Document AI. If users ask to generate images, guide them to the Image Studio. Keep answers concise, formatting in Markdown when needed.";

      const response = await ai.models.generateContent({
        model: modelName,
        contents: { parts: promptParts },
        config: { systemInstruction }
      });

      const responseText = response.text || "I couldn't generate a response.";
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText
      }]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Sorry, I encountered an error connecting to the AI. Please try again."
      }]);
    } finally {
      setLoading(false);
      setInputImage(null);
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice input is not supported in this browser.");
      return;
    }
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.start();
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
    };
    recognition.onerror = (event: any) => {
      console.error("Speech Recognition Error", event);
    };
  };

  const startCamera = async (mode?: 'user' | 'environment') => {
    const targetMode = mode || facingMode;
    setShowCamera(true);
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
      console.error("Camera Error", err);
      setShowCamera(false);
      alert("Could not access camera. Please check permissions.");
    }
  };
  
  const toggleCamera = () => {
     const newMode = facingMode === 'environment' ? 'user' : 'environment';
     startCamera(newMode);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    canvas.toBlob(blob => {
      if (blob) {
        const file = new File([blob], "camera_capture.jpg", { type: 'image/jpeg' });
        setInputImage(file);
        stopCamera();
      }
    }, 'image/jpeg');
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-100px)] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden relative shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-900/40">
                 <Bot className="text-white" size={18} />
            </div>
            <div>
                <h2 className="font-bold text-white leading-none text-lg">Wonder Chat</h2>
                <p className="text-xs text-slate-400 font-medium">Assistant • Gemini 3 Flash</p>
            </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-green-400 px-3 py-1 bg-green-900/20 rounded-full border border-green-500/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span>ONLINE</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-md ${msg.role === 'user' ? 'bg-slate-700' : 'bg-purple-600'}`}>
                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                
                <div className={`rounded-2xl p-4 shadow-sm relative group ${msg.role === 'user' ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-tr-sm' : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700'}`}>
                    {msg.image && (
                        <div className="relative mb-3 rounded-lg overflow-hidden border border-white/10 group-hover:border-white/30 transition-colors">
                            <img src={msg.image} alt="Upload" className="w-full max-w-[240px] object-cover" />
                        </div>
                    )}
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
                </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-fade-in">
             <div className="bg-slate-800/80 p-3 px-5 rounded-2xl rounded-tl-sm flex items-center gap-3 border border-slate-700/50">
               <Loader2 className="animate-spin text-purple-400" size={16} />
               <span className="text-xs text-slate-400 font-medium">Thinking...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center animate-fade-in">
           <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
           
           <button onClick={stopCamera} className="absolute top-6 right-6 p-3 bg-black/50 rounded-full text-white z-50 hover:bg-black/70 transition-colors"><X size={24} /></button>
           
           {/* Camera Toggle Button */}
           <button onClick={toggleCamera} className="absolute top-6 left-6 p-3 bg-black/50 rounded-full text-white z-50 hover:bg-black/70 transition-colors"><SwitchCamera size={24} /></button>
           
           <div className="absolute bottom-10 w-full flex justify-center z-50">
               <button onClick={capturePhoto} className="w-20 h-20 bg-white rounded-full border-4 border-slate-300 shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:scale-110 active:scale-95 transition-all"></button>
           </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-slate-950 border-t border-slate-800">
        {inputImage && (
          <div className="flex items-center gap-2 mb-3 p-2 px-3 bg-slate-900 rounded-xl inline-flex border border-slate-800 shadow-sm animate-fade-in">
            <ImageIcon size={14} className="text-purple-400" />
            <span className="text-xs text-slate-300 font-medium">Image attached</span>
            <button onClick={() => setInputImage(null)} className="ml-2 p-1 hover:bg-slate-800 rounded-full text-slate-500 hover:text-red-400"><X size={12}/></button>
          </div>
        )}
        <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-2xl border border-slate-800 focus-within:border-purple-500/50 focus-within:bg-slate-900/80 transition-all shadow-inner">
           <button onClick={() => startCamera()} className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors" title="Use Camera">
             <Camera size={20} />
           </button>
           <button onClick={handleVoiceInput} className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors" title="Voice Input">
             <Mic size={20} />
           </button>
           <input 
             type="text" 
             value={inputText}
             onChange={(e) => setInputText(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && handleSend()}
             placeholder="Type a message..."
             className="flex-1 bg-transparent text-white px-2 py-2 focus:outline-none placeholder-slate-500 text-sm font-medium"
           />
           <button 
             onClick={() => handleSend()}
             disabled={(!inputText && !inputImage) || loading}
             className={`p-2.5 rounded-xl transition-all ${(!inputText && !inputImage) || loading ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-900/20 active:scale-95'}`}
           >
             <Send size={20} />
           </button>
        </div>
      </div>
    </div>
  );
};