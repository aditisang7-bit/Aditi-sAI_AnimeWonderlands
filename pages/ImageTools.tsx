import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FileUpload } from '../components/FileUpload';
import { generateImageTool, analyzeImageContent, detectImageCategory } from '../services/geminiService';
import { PROMPTS, IMAGE_STYLES, RESIZE_PRESETS, MOCKUP_TYPES, LOGO_STYLES, MOCKUP_PLATFORMS, MOCKUP_BACKGROUNDS } from '../constants';
import { AnalysisResult, ImageCategory, AppRoute } from '../types';
import { supabase } from '../services/supabaseClient';
import { 
  Loader2, Download, Wand2, RefreshCw, Smartphone, 
  ShoppingBag, Type, GraduationCap, Image as ImageIcon,
  Sliders, Move, Save, CheckCircle, Maximize, Crop, FileImage, Sparkles,
  Camera, Zap, HeartPulse, AlertTriangle, Utensils, FileText, Leaf, Search, ScanFace, Flame, User, Youtube, Grid, LayoutTemplate, Palette, Lock, Crown, X
} from 'lucide-react';

type TabMode = 'APPS' | 'GENERATE' | 'EDIT' | 'MOCKUP' | 'LOGO' | 'EDU';

// --- OLD TOOLS CONFIG ---
const QUICK_TOOLS = [
  { id: 'FUTURE_SELF', label: 'Future Self', icon: <User />, description: 'Visualize success', isGen: true },
  { id: 'THUMBNAIL', label: 'Viral Thumb', icon: <Youtube />, description: 'YouTube ready', isGen: true },
  { id: 'CAPTION', label: 'Captions', icon: <Type />, description: 'Social hooks', isGen: false },
  { id: 'ROAST', label: 'AI Roast', icon: <Flame />, description: 'Get roasted', isGen: false },
  { id: 'HEALTH_SCAN', label: 'Health Scan', icon: <HeartPulse />, description: 'Diet & Safety', isGen: false },
];

export const ImageTools: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TabMode>('APPS');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // === PLAN & USAGE STATE ===
  const [isPro, setIsPro] = useState(false);
  const [dailyUsage, setDailyUsage] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const DAILY_LIMIT = 5;

  // === SHARED STATE ===
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedText, setGeneratedText] = useState<string | null>(null);

  // === TAB 1: QUICK TOOLS (APPS) STATE ===
  const [appFile, setAppFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  const [appPrompt, setAppPrompt] = useState("");
  
  // Camera State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [flash, setFlash] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // === TAB 2: PRO GENERATOR STATE ===
  const [genPrompt, setGenPrompt] = useState("");
  const [refImage, setRefImage] = useState<File | null>(null);
  const [selectedStyle, setSelectedStyle] = useState(IMAGE_STYLES[0]);
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [transparentBg, setTransparentBg] = useState(false);

  // === TAB 3: EDITOR STATE ===
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const [resizeW, setResizeW] = useState(1080);
  const [resizeH, setResizeH] = useState(1080);
  const [format, setFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/jpeg');
  const [quality, setQuality] = useState(0.9);
  const [fileSizeEst, setFileSizeEst] = useState<string>('0 KB');

  // === TAB 4-6 STATE ===
  const [mockupType, setMockupType] = useState(MOCKUP_TYPES[0]);
  const [mockupPlatform, setMockupPlatform] = useState(MOCKUP_PLATFORMS[0]);
  const [mockupBg, setMockupBg] = useState(MOCKUP_BACKGROUNDS[0]);
  const [logoName, setLogoName] = useState("");
  const [logoStyle, setLogoStyle] = useState(LOGO_STYLES[0]);

  // === INIT: CHECK PLAN & USAGE & AUTO GENERATE ===
  useEffect(() => {
    checkPlanAndUsage();

    // Check for incoming auto-generation prompt from Landing Page
    if (location.state?.autoGenPrompt) {
        const prompt = location.state.autoGenPrompt;
        setGenPrompt(prompt);
        setActiveTab('GENERATE');
        
        // Clear state to avoid re-run on simple refresh (though useEffect [] guards it mostly)
        window.history.replaceState({}, '');

        // Trigger auto generation
        handleAutoGenerate(prompt);
    }
  }, []);

  const handleAutoGenerate = async (prompt: string) => {
    // Basic guard for usage
    // Note: checking 'dailyUsage' here might be stale due to closure, 
    // but checkPlanAndUsage will update it. For robustness, we'll assume valid for first try or check limit inside.
    
    setLoading(true);
    setGeneratedImage(null);
    setError(null);

    try {
        const fullPrompt = `${prompt}. Style: Anime/Digital Art. High Quality.`;
        const result = await generateImageTool('gemini-2.5-flash-image', fullPrompt, undefined);
        setGeneratedImage(result[0]);
        incrementUsage();
    } catch (e) {
        console.error(e);
        setError("Auto-generation failed. Please try again manually.");
    } finally {
        setLoading(false);
    }
  };

  const checkPlanAndUsage = async () => {
    // 1. Check if Guest
    const isGuest = localStorage.getItem('guest_mode') === 'true';
    const today = new Date().toISOString().split('T')[0];

    if (isGuest) {
        setUserId('guest');
        setIsPro(false);
        const key = `aw_usage_${today}_guest`;
        const usage = parseInt(localStorage.getItem(key) || '0');
        setDailyUsage(usage);
        return;
    }

    // 2. Check Supabase User
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      const { data: profile } = await supabase.from('profiles').select('is_pro').eq('id', user.id).single();
      if (profile?.is_pro) {
          setIsPro(true);
          return;
      }
      
      // Load Usage for Free Users
      const key = `aw_usage_${today}_${user.id}`;
      const usage = parseInt(localStorage.getItem(key) || '0');
      setDailyUsage(usage);
    }
  };

  const incrementUsage = () => {
    // We check `isPro` ref or state. Since we are in function, we use state.
    // NOTE: This might be slightly stale if called immediately after mount, 
    // but for the sake of UX flow we allow the first auto-gen.
    
    const today = new Date().toISOString().split('T')[0];
    const key = `aw_usage_${today}_${userId || 'guest'}`; 
    
    // Get fresh value from storage to be safe
    const current = parseInt(localStorage.getItem(key) || '0');
    const newCount = current + 1;
    localStorage.setItem(key, newCount.toString());
    setDailyUsage(newCount);
  };

  const checkLimit = () => {
    if (isPro) return true;
    if (dailyUsage >= DAILY_LIMIT) {
        setShowLimitModal(true);
        return false;
    }
    return true;
  };

  // ==========================================
  // HANDLERS: QUICK TOOLS (CAMERA & ANALYSIS)
  // ==========================================

  const handleAppFileUpload = async (file: File) => {
    if (isCameraActive) stopCamera();
    setAppFile(file);
    setIsAnalyzing(true);
    setAnalysis(null);
    setGeneratedImage(null);
    setGeneratedText(null);
    setSelectedToolId(null);

    try {
      const result = await detectImageCategory(file, PROMPTS.CLASSIFY_IMAGE);
      setAnalysis(result);
    } catch (e) {
      console.error(e);
      setAnalysis({ category: 'UNKNOWN', title: 'Analysis Failed', description: 'Could not auto-detect.', attributes: [] });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleQuickToolGenerate = async () => {
    if (!appFile || !selectedToolId) return;
    if (!checkLimit()) return;

    setLoading(true);
    setGeneratedImage(null);
    setGeneratedText(null);

    try {
      let finalPrompt = "";
      let isImageGen = false;

      switch (selectedToolId) {
        case 'FUTURE_SELF':
          finalPrompt = `${PROMPTS.AVATAR_BASE} ${appPrompt || "Successful, wealthy, confident future version."}`;
          isImageGen = true;
          break;
        case 'THUMBNAIL':
          finalPrompt = `${PROMPTS.THUMBNAIL_BASE} ${appPrompt || "Make it clickbaity and viral."}`;
          isImageGen = true;
          break;
        case 'CAPTION':
          finalPrompt = `${PROMPTS.CAPTION}. Context: ${appPrompt}`;
          break;
        case 'ROAST':
          finalPrompt = PROMPTS.ROAST_ME;
          break;
        case 'HEALTH_SCAN':
          finalPrompt = `${PROMPTS.HEALTH_SCAN}. User question: ${appPrompt}`;
          break;
      }

      if (isImageGen) {
        const images = await generateImageTool('gemini-2.5-flash-image', finalPrompt, appFile);
        setGeneratedImage(images[0]);
        incrementUsage();
      } else {
        const text = await analyzeImageContent(finalPrompt, appFile);
        setGeneratedText(text);
      }
    } catch (e) {
      setError("Tool execution failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- Camera Logic ---
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setIsCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch (err) { setError("Camera access denied."); }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    setIsCameraActive(false);
  };

  const captureImage = () => {
    if (!videoRef.current) return;
    setFlash(true);
    setTimeout(() => setFlash(false), 80);
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Assuming 'environment' mode usually doesn't need flip, unlike 'user' (selfie).
      // If mirrored, flip it: ctx.scale(-1, 1); ctx.translate(-canvas.width, 0);
      ctx.drawImage(videoRef.current, 0, 0);
      canvas.toBlob(blob => {
        if (blob) {
            const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
            // Important: Stop camera THEN process file
            stopCamera();
            handleAppFileUpload(file);
        }
      }, 'image/jpeg');
    }
  };

  // ==========================================
  // HANDLERS: PRO GENERATOR & OTHERS
  // ==========================================

  const handleProGenerate = async () => {
    if (!genPrompt && activeTab !== 'MOCKUP') return;
    if (!checkLimit()) return;

    setLoading(true);
    setGeneratedImage(null);

    try {
      let finalPrompt = "";
      
      switch (activeTab) {
        case 'GENERATE':
          finalPrompt = `${genPrompt}. Style: ${selectedStyle.prompt}. Aspect Ratio: ${aspectRatio}. ${transparentBg ? 'Isolated on a pure white background, easy to remove background.' : ''}`;
          break;
        case 'MOCKUP':
          finalPrompt = `${PROMPTS.MOCKUP_BASE} 
          Product: ${mockupType.prompt}. 
          Target Platform Context: ${mockupPlatform.prompt} 
          Background & Environment: ${mockupBg.prompt} 
          Design/Artwork to apply: ${genPrompt || "A modern artistic design"}. 
          Ensure the final image is perfectly composed for ${mockupPlatform.label}, high resolution, and production ready.`;
          break;
        case 'LOGO':
          finalPrompt = `${PROMPTS.LOGO_BASE} Brand: "${logoName}". Style: ${logoStyle.prompt}. Details: ${genPrompt}`;
          break;
        case 'EDU':
          // Enhanced Prompt logic for Spelling
          finalPrompt = `${PROMPTS.EDU_DIAGRAM} ${genPrompt}. Clean, labeled, educational diagram. IMPORTANT: Double check spelling of all labels.`;
          break;
      }

      const result = await generateImageTool('gemini-2.5-flash-image', finalPrompt, refImage || undefined);
      setGeneratedImage(result[0]);
      incrementUsage();
    } catch (e) {
      setError("Generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSmartPrompt = async () => {
    if(!genPrompt) return;
    setLoading(true);
    try {
       const improved = await analyzeImageContent(PROMPTS.SMART_ENHANCE + genPrompt, refImage || new File([""], "empty.txt"));
       setGenPrompt(improved.replace(/^"|"$/g, ''));
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  // ==========================================
  // HANDLERS: EDITOR & DOWNLOAD
  // ==========================================
  useEffect(() => {
    if (activeTab === 'EDIT' && editImage) processImage();
  }, [editImage, resizeW, resizeH, format, quality, activeTab]);

  const processImage = () => {
    if (!editImage) return;
    const img = new Image();
    img.src = URL.createObjectURL(editImage);
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = resizeW;
        canvas.height = resizeH;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.fillStyle = '#FFFFFF';
        if (format === 'image/jpeg') ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, resizeW, resizeH);
        const dataUrl = canvas.toDataURL(format, quality);
        setEditPreview(dataUrl);
        const head = 'data:' + format + ';base64,';
        const size = Math.round((dataUrl.length - head.length) * 3 / 4);
        setFileSizeEst((size / 1024).toFixed(1) + ' KB');
    };
  };

  const handleDownload = (imageUrl: string) => {
    if (isPro) {
      // Direct Download for Pro
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `aditi-studio-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Watermark Download for Free
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Draw Image
        ctx.drawImage(img, 0, 0);

        // Draw Watermark
        ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(20, img.height - 80, 420, 60);
        
        ctx.globalAlpha = 1.0;
        ctx.font = "bold 24px sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.fillText("Anime Wonderlands+ • Free Version", 40, img.height - 42);
        ctx.restore();

        const watermarkedUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = watermarkedUrl;
        link.download = `aditi-studio-free-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
    }
  };

  // --- RENDER HELPERS ---
  const getCategoryIcon = (cat: ImageCategory) => {
    switch (cat) {
      case 'FOOD': return <Utensils className="text-orange-400" />;
      case 'DOCUMENT': return <FileText className="text-blue-400" />;
      case 'PLANT': return <Leaf className="text-green-400" />;
      case 'ANIMAL': return <Search className="text-yellow-400" />;
      case 'FACE': return <ScanFace className="text-purple-400" />;
      default: return <Wand2 className="text-slate-400" />;
    }
  };

  const renderTabButton = (mode: TabMode, icon: React.ReactNode, label: string) => (
    <button
      onClick={() => setActiveTab(mode)}
      className={`flex items-center space-x-2 px-4 py-3 rounded-t-xl border-b-2 transition-all whitespace-nowrap ${
        activeTab === mode 
          ? 'border-purple-500 text-white bg-slate-900' 
          : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/50'
      }`}
    >
      {icon}
      <span className="font-bold text-sm hidden md:inline">{label}</span>
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-8 relative">
      
      {/* LIMIT MODAL */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-sm text-center shadow-2xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-50"><Lock className="text-slate-600" size={100} /></div>
              <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-400">
                <Crown size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Limit Reached</h2>
                <p className="text-slate-400 text-sm">You've hit the daily limit of {DAILY_LIMIT} generations for the Free/Guest plan.</p>
              </div>
              <div className="space-y-3">
                <Link to={AppRoute.PRICING} className="block w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:scale-105 transition-transform">
                  Upgrade to Unlimited
                </Link>
                <button onClick={() => setShowLimitModal(false)} className="block w-full py-3 text-slate-400 hover:text-white text-sm font-bold">
                  Close & Wait till Tomorrow
                </button>
              </div>
           </div>
        </div>
      )}

      {/* HEADER */}
      <div className="text-center space-y-2 flex flex-col items-center">
        <h1 className="text-4xl font-black text-white tracking-tight">
          Image Studio <span className="text-purple-500">PRO</span>
        </h1>
        <p className="text-slate-400">Analysis, Generation, Editing, and Branding in one suite.</p>
        
        {/* USAGE INDICATOR */}
        <div className={`mt-2 px-4 py-1.5 rounded-full border text-xs font-bold flex items-center gap-2 ${isPro ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50 text-yellow-200' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>
          {isPro ? (
            <>
              <Crown size={12} fill="currentColor" />
              <span>UNLIMITED ACCESS</span>
            </>
          ) : (
            <>
              <Zap size={12} className={dailyUsage >= DAILY_LIMIT ? "text-red-400" : "text-green-400"} />
              <span>{Math.max(0, DAILY_LIMIT - dailyUsage)} free generations remaining today</span>
            </>
          )}
        </div>
      </div>

      {/* TABS */}
      <div className="flex overflow-x-auto border-b border-slate-800 space-x-1 scrollbar-hide">
        {renderTabButton('APPS', <Grid size={18} />, 'Quick Tools')}
        {renderTabButton('GENERATE', <Wand2 size={18} />, 'Pro Generator')}
        {renderTabButton('EDIT', <Crop size={18} />, 'Editor')}
        {renderTabButton('MOCKUP', <ShoppingBag size={18} />, 'Mockups')}
        {renderTabButton('LOGO', <Maximize size={18} />, 'Branding')}
        {renderTabButton('EDU', <GraduationCap size={18} />, 'Education')}
      </div>

      <div className="grid lg:grid-cols-12 gap-8 animate-fade-in">
        
        {/* === LEFT COLUMN: CONTROLS === */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* --- TAB 1: QUICK TOOLS (CAMERA & APPS) --- */}
          {activeTab === 'APPS' && (
            <div className="space-y-6">
               {/* 1A. UPLOAD / CAMERA */}
               {!appFile && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                    {!isCameraActive ? (
                      <>
                        <FileUpload accept="image/*" onFileSelect={handleAppFileUpload} label="Upload Image to Start" />
                        <div className="relative flex items-center py-2">
                           <div className="flex-grow border-t border-slate-800"></div>
                           <span className="flex-shrink-0 mx-4 text-slate-500 text-xs uppercase">Or</span>
                           <div className="flex-grow border-t border-slate-800"></div>
                        </div>
                        
                        {/* CAMERA TRIGGER BUTTON */}
                        <button onClick={startCamera} className="w-full py-4 bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/50 hover:bg-blue-900/60 rounded-xl flex flex-col items-center justify-center text-blue-200 hover:text-white transition-all shadow-lg">
                          <Camera size={28} className="mb-2" />
                          <span className="font-bold">Take Photo & Analyze</span>
                        </button>
                      </>
                    ) : (
                      <div className="relative overflow-hidden rounded-xl bg-black aspect-video group">
                         <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                         <div className={`absolute inset-0 bg-white transition-opacity duration-300 ${flash ? 'opacity-100' : 'opacity-0'} pointer-events-none`}></div>
                         <button onClick={stopCamera} className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white"><X size={20}/></button>
                         <button onClick={captureImage} className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full border-4 border-slate-300 hover:scale-110 transition-transform"></button>
                      </div>
                    )}
                  </div>
               )}

               {/* 1B. ANALYSIS & TOOLS */}
               {appFile && (
                 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 animate-fade-in">
                    <div className="flex items-start gap-4 p-4 bg-slate-950 rounded-xl border border-slate-800">
                       <img src={URL.createObjectURL(appFile)} alt="Source" className="w-20 h-20 object-cover rounded-lg" />
                       <div className="flex-1 min-w-0">
                          {isAnalyzing ? (
                             <div className="flex items-center gap-2 text-purple-400 text-sm animate-pulse"><Loader2 size={14} className="animate-spin" /> Analyzing...</div>
                          ) : (
                             <>
                               <h3 className="font-bold text-white truncate">{analysis?.title || "Image Detected"}</h3>
                               <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                 {getCategoryIcon(analysis?.category || 'UNKNOWN')}
                                 <span>{analysis?.category}</span>
                               </div>
                               <button onClick={() => setAppFile(null)} className="text-xs text-red-400 mt-2 hover:underline">Change Image</button>
                             </>
                          )}
                       </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Select Intelligence Tool</label>
                      <div className="grid grid-cols-2 gap-3">
                         {QUICK_TOOLS.map(t => (
                           <button 
                             key={t.id}
                             onClick={() => { setSelectedToolId(t.id); setGeneratedImage(null); setGeneratedText(null); }}
                             className={`p-3 rounded-xl border text-left transition-all ${selectedToolId === t.id ? 'bg-purple-900/20 border-purple-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                           >
                             <div className="mb-2 text-purple-400">{t.icon}</div>
                             <div className="font-bold text-sm">{t.label}</div>
                           </button>
                         ))}
                      </div>
                    </div>

                    {selectedToolId && (
                      <div className="animate-fade-in">
                        <textarea 
                          value={appPrompt}
                          onChange={(e) => setAppPrompt(e.target.value)}
                          placeholder={selectedToolId === 'HEALTH_SCAN' ? "Ask about calories, ingredients..." : "Add specific context..."}
                          className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm focus:border-purple-500 focus:outline-none mb-4"
                        />
                        <button 
                          onClick={handleQuickToolGenerate}
                          disabled={loading}
                          className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                        >
                          {loading ? <Loader2 className="animate-spin" /> : <Zap />}
                          <span>Execute Tool</span>
                        </button>
                      </div>
                    )}
                 </div>
               )}
            </div>
          )}

          {/* --- TAB 2: PRO GENERATOR --- */}
          {activeTab === 'GENERATE' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
               <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Prompt</label>
                  <textarea 
                    value={genPrompt}
                    onChange={(e) => setGenPrompt(e.target.value)}
                    placeholder="A cyberpunk samurai cat in neon rain..."
                    className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:border-purple-500 focus:outline-none resize-none text-sm"
                  />
                  <button onClick={handleSmartPrompt} className="mt-2 text-xs text-purple-400 flex items-center space-x-1 hover:text-purple-300">
                    <Sparkles size={12} /> <span>Smart Enhance</span>
                  </button>
               </div>
               
               <div>
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Reference (Img2Img)</label>
                 <FileUpload accept="image/*" onFileSelect={setRefImage} label="Upload structure reference" />
               </div>

               <div>
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Style</label>
                 <div className="grid grid-cols-2 gap-2">
                   {IMAGE_STYLES.map(s => (
                     <button key={s.id} onClick={() => setSelectedStyle(s)} className={`p-2 rounded-lg text-xs font-bold border transition-all ${selectedStyle.id === s.id ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
                       {s.label}
                     </button>
                   ))}
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-white">
                    <option value="1:1">1:1 (Square)</option>
                    <option value="16:9">16:9 (Wide)</option>
                    <option value="9:16">9:16 (Story)</option>
                  </select>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={transparentBg} onChange={(e) => setTransparentBg(e.target.checked)} className="rounded bg-slate-800 border-slate-600" />
                    <span className="text-sm text-slate-400">Transparent</span>
                  </div>
               </div>
               
               <button onClick={handleProGenerate} disabled={loading || !genPrompt} className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold rounded-xl flex items-center justify-center gap-2">
                 {loading ? <Loader2 className="animate-spin" /> : <Wand2 />} <span>Generate Art</span>
               </button>
            </div>
          )}

          {/* --- TAB 3: EDITOR --- */}
          {activeTab === 'EDIT' && (
             <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                <FileUpload accept="image/*" onFileSelect={setEditImage} label="Upload to Resize" />
                {editImage && (
                  <>
                    <div className="flex flex-wrap gap-2">
                        {RESIZE_PRESETS.map((p, i) => (
                          <button key={i} onClick={() => { setResizeW(p.w); setResizeH(p.h); }} className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-full text-xs text-slate-300 hover:bg-slate-800">
                            {p.label}
                          </button>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="number" value={resizeW} onChange={(e) => setResizeW(Number(e.target.value))} className="bg-slate-950 border border-slate-800 p-2 rounded text-white" />
                      <input type="number" value={resizeH} onChange={(e) => setResizeH(Number(e.target.value))} className="bg-slate-950 border border-slate-800 p-2 rounded text-white" />
                    </div>
                    <select value={format} onChange={(e) => setFormat(e.target.value as any)} className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-white text-sm">
                        <option value="image/jpeg">JPG</option>
                        <option value="image/png">PNG</option>
                        <option value="image/webp">WEBP</option>
                    </select>
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Quality: {Math.round(quality * 100)}%</span>
                      <span className="text-green-400">{fileSizeEst}</span>
                    </div>
                    <input type="range" min="0.1" max="1.0" step="0.05" value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full h-2 bg-slate-800 rounded-lg accent-purple-500" />
                  </>
                )}
             </div>
          )}

          {/* --- TAB 4: MOCKUPS (ENHANCED) --- */}
          {activeTab === 'MOCKUP' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
               
               {/* 1. Product Selector */}
               <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">1. Select Product</label>
                  <div className="grid grid-cols-2 gap-2">
                    {MOCKUP_TYPES.map(m => (
                       <button key={m.id} onClick={() => setMockupType(m)} className={`p-3 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 ${mockupType.id === m.id ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
                          <ShoppingBag size={14} /> {m.label}
                       </button>
                    ))}
                  </div>
               </div>

               {/* 2. Platform Selector */}
               <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">2. Target Platform</label>
                  <div className="grid grid-cols-2 gap-2">
                    {MOCKUP_PLATFORMS.map(p => (
                       <button key={p.id} onClick={() => setMockupPlatform(p)} className={`p-3 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 ${mockupPlatform.id === p.id ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
                          <LayoutTemplate size={14} /> {p.label}
                       </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Aspect Ratio: {mockupPlatform.ratio} (Ready for {mockupPlatform.label})</p>
               </div>

               {/* 3. Context/Background Selector */}
               <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">3. Background Vibe</label>
                  <div className="grid grid-cols-2 gap-2">
                    {MOCKUP_BACKGROUNDS.map(b => (
                       <button key={b.id} onClick={() => setMockupBg(b)} className={`p-2 rounded-lg text-xs font-bold border transition-all ${mockupBg.id === b.id ? 'bg-slate-800 border-slate-600 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
                          {b.label}
                       </button>
                    ))}
                  </div>
               </div>

               {/* 4. Design Input */}
               <FileUpload accept="image/*" onFileSelect={setRefImage} label="Upload Design (Logo/Art)" />
               <button onClick={handleProGenerate} disabled={loading || !refImage} className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl flex items-center justify-center gap-2">
                 {loading ? <Loader2 className="animate-spin" /> : <ShoppingBag />} <span>Generate Ready-to-Use Mockup</span>
               </button>
            </div>
          )}

          {/* --- TAB 5: LOGO --- */}
          {activeTab === 'LOGO' && (
             <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                <input type="text" value={logoName} onChange={(e) => setLogoName(e.target.value)} placeholder="Brand Name" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white" />
                <div className="flex flex-wrap gap-2">
                     {LOGO_STYLES.map(s => (
                       <button key={s.id} onClick={() => setLogoStyle(s)} className={`px-3 py-2 rounded-full border text-xs font-bold ${logoStyle.id === s.id ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
                         {s.label}
                       </button>
                     ))}
                </div>
                <textarea value={genPrompt} onChange={(e) => setGenPrompt(e.target.value)} placeholder="Industry/Description (e.g. Coffee shop)" className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm" />
                <button onClick={handleProGenerate} disabled={loading || !logoName} className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="animate-spin" /> : <Maximize />} <span>Create Logo</span>
                </button>
             </div>
          )}

          {/* --- TAB 6: EDU --- */}
          {activeTab === 'EDU' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                 <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl flex gap-3 text-blue-200">
                    <GraduationCap size={24} className="shrink-0" />
                    <p className="text-sm">Generate clear educational diagrams.</p>
                 </div>
                 <textarea value={genPrompt} onChange={(e) => setGenPrompt(e.target.value)} placeholder="Topic (e.g. The Water Cycle)" className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm" />
                 <button onClick={handleProGenerate} disabled={loading || !genPrompt} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2">
                   {loading ? <Loader2 className="animate-spin" /> : <GraduationCap />} <span>Generate Diagram</span>
                 </button>
              </div>
          )}

        </div>

        {/* === RIGHT COLUMN: OUTPUT === */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 min-h-[500px] flex flex-col relative overflow-hidden">
           <h3 className="font-bold text-white uppercase tracking-widest text-sm flex items-center gap-2 mb-4">
              <ImageIcon size={16} className="text-purple-500" /> Result Canvas
           </h3>
           
           <div className="flex-1 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-950 rounded-xl border border-dashed border-slate-800 flex items-center justify-center overflow-hidden relative">
              {/* Image Result */}
              {(generatedImage || editPreview) && (
                <div className="relative w-full h-full flex items-center justify-center">
                    <img src={activeTab === 'EDIT' ? (editPreview!) : generatedImage!} alt="Result" className="object-contain max-h-[600px] animate-fade-in relative z-10" />
                    
                    {/* Visual Watermark Overlay for Free Users */}
                    {!isPro && (
                        <div className="absolute bottom-4 z-20 px-4 py-2 bg-black/50 backdrop-blur-sm rounded-lg border border-white/10 text-white text-xs font-bold pointer-events-none">
                            Anime Wonderlands+ • Free Version
                        </div>
                    )}
                </div>
              )}
              
              {/* Text Result (for Analysis/Roast) */}
              {generatedText && !generatedImage && (
                 <div className="p-6 w-full h-full overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-sans text-slate-300 text-sm leading-relaxed">{generatedText}</pre>
                 </div>
              )}

              {/* Empty State */}
              {!generatedImage && !editPreview && !generatedText && !loading && (
                 <div className="text-center text-slate-600 p-8">
                    <Wand2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p>Select a tool and action to see results here.</p>
                 </div>
              )}
              
              {/* Loading */}
              {loading && (
                 <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-30">
                    <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
                    <p className="text-white font-bold animate-pulse">Processing...</p>
                 </div>
              )}
           </div>

           {/* Actions */}
           {(generatedImage || editPreview) && (
             <div className="mt-4 flex justify-end">
                <button 
                 onClick={() => handleDownload(activeTab === 'EDIT' ? editPreview! : generatedImage!)} 
                 className="bg-white text-slate-900 px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-slate-200 transition-colors"
               >
                 <Download size={16} /> 
                 {isPro ? 'Download HD' : 'Download (Watermarked)'}
               </button>
             </div>
           )}
        </div>

      </div>
    </div>
  );
};