import React, { useState, useEffect } from 'react';
import { Star, RefreshCw, Crown, User, Volume2, VolumeX, Sun, Moon, Sparkles, ShieldCheck, Video, Users, Bot, MonitorSmartphone, Coins, Play, ChevronRight, Trophy, X, Hammer, Dices } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { GAME_CONFIG } from '../constants';
import { GameMode, GameState, PlayerColor, LudoPawn } from '../types';

// --- CONFIGURATION ---

const PLAYERS = ['RED', 'GREEN', 'BLUE', 'YELLOW'] as const;

// Top-Tier Mobile Game Style Palette
const COLORS = {
  RED: { 
    main: '#ef4444',
    bg: 'bg-red-500',
    headGradient: 'from-red-300 to-red-600',
    bodyGradient: 'from-red-500 to-red-800',
    baseGradient: 'from-red-50 to-red-100',
    glow: 'shadow-[0_0_15px_rgba(239,68,68,0.6)]'
  },
  GREEN: { 
    main: '#22c55e',
    bg: 'bg-green-500',
    headGradient: 'from-green-300 to-green-600',
    bodyGradient: 'from-green-500 to-green-800',
    baseGradient: 'from-green-50 to-green-100',
    glow: 'shadow-[0_0_15px_rgba(34,197,94,0.6)]'
  },
  BLUE: { 
    main: '#3b82f6',
    bg: 'bg-blue-500',
    headGradient: 'from-blue-300 to-blue-600',
    bodyGradient: 'from-blue-500 to-blue-800',
    baseGradient: 'from-blue-50 to-blue-100',
    glow: 'shadow-[0_0_15px_rgba(59,130,246,0.6)]'
  },
  YELLOW: { 
    main: '#eab308',
    bg: 'bg-yellow-400',
    headGradient: 'from-yellow-200 to-yellow-500',
    bodyGradient: 'from-yellow-400 to-yellow-700',
    baseGradient: 'from-yellow-50 to-yellow-100',
    glow: 'shadow-[0_0_15px_rgba(234,179,8,0.6)]'
  },
};

// --- AUDIO ENGINE ---
const playSound = (type: 'roll' | 'move' | 'kill' | 'win' | 'tap') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'roll') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.15);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.15);
      osc.start(t);
      osc.stop(t + 0.15);
    } else if (type === 'move') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.exponentialRampToValueAtTime(800, t + 0.05);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
      osc.start(t);
      osc.stop(t + 0.05);
    } else if (type === 'kill') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(100, t + 0.3);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.3);
      osc.start(t);
      osc.stop(t + 0.3);
    } else if (type === 'win') {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.frequency.value = f;
        g.gain.setValueAtTime(0.1, t + i*0.1);
        g.gain.exponentialRampToValueAtTime(0.001, t + i*0.1 + 0.3);
        o.start(t + i*0.1);
        o.stop(t + i*0.1 + 0.4);
      });
    } else if (type === 'tap') {
      osc.frequency.setValueAtTime(800, t);
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      osc.start(t);
      osc.stop(t + 0.05);
    }
  } catch (e) {
    console.error("Audio play failed", e);
  }
};


// --- BOARD COORDINATES & LOGIC ---
const STAR_SPOTS = [
  { x: 2, y: 8 }, { x: 6, y: 2 }, { x: 8, y: 12 }, { x: 12, y: 6 }, // General Safe
  { x: 1, y: 6 }, { x: 8, y: 1 }, { x: 6, y: 13 }, { x: 13, y: 8 }  // Starting Safe
];

const START_POSITIONS: Record<PlayerColor, number> = {
  RED: 0, GREEN: 13, BLUE: 26, YELLOW: 39
};

const MAIN_PATH_COORDS = [
  // Red Leg (Starts at 1,6)
  {x: 1, y: 6}, {x: 2, y: 6}, {x: 3, y: 6}, {x: 4, y: 6}, {x: 5, y: 6}, 
  {x: 6, y: 5}, {x: 6, y: 4}, {x: 6, y: 3}, {x: 6, y: 2}, {x: 6, y: 1}, {x: 6, y: 0},
  {x: 7, y: 0}, {x: 8, y: 0},
  // Green Leg
  {x: 8, y: 1}, {x: 8, y: 2}, {x: 8, y: 3}, {x: 8, y: 4}, {x: 8, y: 5},
  {x: 9, y: 6}, {x: 10, y: 6}, {x: 11, y: 6}, {x: 12, y: 6}, {x: 13, y: 6}, {x: 14, y: 6},
  {x: 14, y: 7}, {x: 14, y: 8},
  // Blue Leg
  {x: 13, y: 8}, {x: 12, y: 8}, {x: 11, y: 8}, {x: 10, y: 8}, {x: 9, y: 8},
  {x: 8, y: 9}, {x: 8, y: 10}, {x: 8, y: 11}, {x: 8, y: 12}, {x: 8, y: 13}, {x: 8, y: 14},
  {x: 7, y: 14}, {x: 6, y: 14},
  // Yellow Leg
  {x: 6, y: 13}, {x: 6, y: 12}, {x: 6, y: 11}, {x: 6, y: 10}, {x: 6, y: 9},
  {x: 5, y: 8}, {x: 4, y: 8}, {x: 3, y: 8}, {x: 2, y: 8}, {x: 1, y: 8}, {x: 0, y: 8},
  {x: 0, y: 7}, {x: 0, y: 6}
];

const HOME_COLUMNS: Record<PlayerColor, {x: number, y: number}[]> = {
  RED:    [{x: 1, y: 7}, {x: 2, y: 7}, {x: 3, y: 7}, {x: 4, y: 7}, {x: 5, y: 7}],
  GREEN:  [{x: 7, y: 1}, {x: 7, y: 2}, {x: 7, y: 3}, {x: 7, y: 4}, {x: 7, y: 5}],
  BLUE:   [{x: 13, y: 7}, {x: 12, y: 7}, {x: 11, y: 7}, {x: 10, y: 7}, {x: 9, y: 7}],
  YELLOW: [{x: 7, y: 13}, {x: 7, y: 12}, {x: 7, y: 11}, {x: 7, y: 10}, {x: 7, y: 9}]
};


// --- BOARD COMPONENT ---
const LudoBoardRender = () => {
    // Generate 15x15 grid
    const cells = [];
    
    // Board is now a premium asset-like background
    const theme = { 
        cellBg: 'bg-slate-100/90', 
        cellBorder: 'border-slate-300/50' 
    };

    for (let y = 0; y < 15; y++) {
        for (let x = 0; x < 15; x++) {
            let content = null;
            let bgColor = theme.cellBg;
            let isPath = false;

            // --- 1. BASES (6x6 Corners) ---
            if (x < 6 && y < 6) { 
                if (x === 0 && y === 0) content = <BaseHome color="RED" />;
                else content = null; 
                bgColor = 'transparent'; 
            }
            else if (x > 8 && y < 6) { 
                if (x === 9 && y === 0) content = <BaseHome color="GREEN" />;
                else content = null;
                bgColor = 'transparent';
            }
            else if (x < 6 && y > 8) { 
                if (x === 0 && y === 9) content = <BaseHome color="YELLOW" />;
                else content = null;
                bgColor = 'transparent';
            }
            else if (x > 8 && y > 8) { 
                if (x === 9 && y === 9) content = <BaseHome color="BLUE" />;
                else content = null;
                bgColor = 'transparent';
            }
            
            // --- 2. CENTER TRIANGLE (3x3 Middle) ---
            else if (x > 5 && x < 9 && y > 5 && y < 9) {
                 if (x === 6 && y === 6) content = <CenterHome />;
                 else content = null; 
                 bgColor = 'transparent';
            }
            
            // --- 3. TRACKS & HOME RUNS ---
            else {
                isPath = true;
                // Determine if colored home run
                if (y === 7 && x > 0 && x < 6) bgColor = COLORS.RED.bg; 
                else if (x === 7 && y > 0 && y < 6) bgColor = COLORS.GREEN.bg;
                else if (x === 7 && y > 8 && y < 14) bgColor = COLORS.YELLOW.bg;
                else if (y === 7 && x > 8 && x < 14) bgColor = COLORS.BLUE.bg;

                // Start Spots (Colored)
                if (x === 1 && y === 6) bgColor = COLORS.RED.bg;
                if (x === 8 && y === 1) bgColor = COLORS.GREEN.bg;
                if (x === 6 && y === 13) bgColor = COLORS.YELLOW.bg;
                if (x === 13 && y === 8) bgColor = COLORS.BLUE.bg;

                // Render Stars
                const isStar = STAR_SPOTS.some(s => s.x === x && s.y === y);
                if (isStar) {
                    content = <Star className="text-white drop-shadow-md w-[80%] h-[80%]" fill="currentColor" strokeWidth={1} />;
                    if(bgColor === theme.cellBg) {
                        content = <Star className="text-slate-400 w-[80%] h-[80%]" fill="currentColor" strokeWidth={1} />;
                    }
                }
                
                // Render Arrows
                if (bgColor === theme.cellBg) {
                    // Check if adjacent to home run entrance to draw arrow
                    if (x===0 && y===7) content = <div className="text-slate-400 font-black text-[8px] opacity-60 tracking-widest">START</div>;
                }
            }

            if (content !== undefined) {
                 if (content === null) continue;
                 
                 // Render Bases/Center with rowSpan/colSpan
                 if (content.type === BaseHome) {
                     cells.push(<div key={`${x}-${y}`} className="col-span-6 row-span-6 z-0 relative p-1">{content}</div>);
                 } else if (content.type === CenterHome) {
                     cells.push(<div key={`${x}-${y}`} className="col-span-3 row-span-3 relative z-0 shadow-inner">{content}</div>);
                 } else {
                     cells.push(
                         <div 
                             key={`${x}-${y}`} 
                             className={`relative w-full h-full border-[0.5px] border-black/5 flex items-center justify-center ${bgColor} ${isPath && bgColor === theme.cellBg ? 'shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]' : 'shadow-sm'}`}
                         >
                             {content}
                             {/* Arrow Decor for Home Entrances */}
                             {x===1 && y===7 && <ChevronRight className="text-white w-full h-full p-1 opacity-90 drop-shadow-sm" />}
                             {x===7 && y===1 && <ChevronRight className="text-white w-full h-full p-1 opacity-90 drop-shadow-sm rotate-90" />}
                             {x===13 && y===7 && <ChevronRight className="text-white w-full h-full p-1 opacity-90 drop-shadow-sm rotate-180" />}
                             {x===7 && y===13 && <ChevronRight className="text-white w-full h-full p-1 opacity-90 drop-shadow-sm -rotate-90" />}
                         </div>
                     );
                 }
            }
        }
    }

    return (
        <div className="w-full h-full grid grid-cols-15 grid-rows-15 bg-white shadow-2xl overflow-hidden rounded-xl border-8 border-slate-900 relative">
             {/* Background Texture for the whole board if needed, currently sticking to clean vector style */}
             {cells}
        </div>
    );
};

// Premium Glass-morphism Base
const BaseHome = ({ color }: { color: PlayerColor }) => (
    <div className={`w-full h-full bg-gradient-to-br ${COLORS[color].baseGradient} rounded-3xl border-4 border-${color === 'YELLOW' ? 'yellow-400' : color.toLowerCase() + '-500'} shadow-inner p-[15%] relative overflow-hidden`}>
        <div className="w-full h-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg flex flex-wrap p-[10%] content-center justify-center gap-[15%] border border-white/50">
             {[1,2,3,4].map(i => (
                 <div key={i} className={`
                    w-[35%] h-[35%] rounded-full bg-gradient-to-br ${COLORS[color].baseGradient}
                    shadow-[inset_0_2px_5px_rgba(0,0,0,0.1)] 
                    border border-slate-200
                 `}></div>
             ))}
        </div>
        {/* Decorative Corner Icon */}
        <div className="absolute top-2 right-2 opacity-20">
            <Crown size={24} className={`text-${color === 'YELLOW' ? 'yellow-600' : color.toLowerCase() + '-600'}`} fill="currentColor" />
        </div>
    </div>
);

const CenterHome = () => (
    <div className="w-full h-full relative overflow-hidden bg-white shadow-inner">
        {/* Triangles using conic gradient for sharpness */}
        <div className="absolute inset-0" style={{
            background: `conic-gradient(
                ${COLORS.GREEN.main} 0deg 90deg, 
                ${COLORS.RED.main} 90deg 180deg, 
                ${COLORS.BLUE.main} 180deg 270deg, 
                ${COLORS.YELLOW.main} 270deg 360deg
            )`,
            transform: 'rotate(45deg) scale(1.5)'
        }}/>
        
        {/* Victory Trophy */}
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/10 backdrop-blur-[1px] m-4 rounded-full border-4 border-white/20 shadow-xl">
             <Trophy className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] w-2/3 h-2/3" fill="currentColor" strokeWidth={1} />
        </div>
    </div>
);

// --- MODALS (Unchanged logic, just visual tweaks) ---
const ComingSoonModal = ({ onClose, title }: { onClose: () => void, title: string }) => (
    <div className="fixed inset-0 z-[100] bg-black/80 flex flex-col items-center justify-center p-6 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-sm text-center space-y-6 shadow-2xl relative">
         <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={24} /></button>
         <div className="w-20 h-20 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-purple-500/30 transform -rotate-6">
            <Hammer size={40} className="text-white" />
         </div>
         <div>
             <h2 className="text-2xl font-black text-white mb-2">{title}</h2>
             <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-bold uppercase tracking-widest text-xl mb-4">Coming Soon</h3>
             <p className="text-slate-400 text-sm">We are currently building the ultimate {title.toLowerCase()} experience.</p>
         </div>
         <button onClick={onClose} className="w-full py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors">Play Local Mode Instead</button>
      </div>
    </div>
);

const AdModal = ({ onClose, type }: { onClose: () => void, type: 'INTERSTITIAL' | 'REWARDED' }) => {
  const [timer, setTimer] = useState(type === 'REWARDED' ? 5 : 3);
  useEffect(() => {
    const int = setInterval(() => setTimer(t => t > 0 ? t - 1 : 0), 1000);
    return () => clearInterval(int);
  }, []);

  const updateWallet = async (amount: number) => {
      const isGuest = localStorage.getItem('isGuest') === 'true';
      if(isGuest) {
         const c = parseInt(localStorage.getItem('guest_coins') || '500');
         localStorage.setItem('guest_coins', (c+amount).toString());
         window.dispatchEvent(new Event('coin_update'));
         return;
      }
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: profile } = await supabase.from('profiles').select('coins').eq('id', user.id).single();
            await supabase.from('profiles').update({ coins: (profile?.coins || 0) + amount }).eq('id', user.id);
            window.dispatchEvent(new Event('coin_update'));
        }
      } catch (err) { console.error(err); }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-6 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-sm text-center space-y-4 shadow-2xl animate-fade-in relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1 bg-slate-200">
             <div className="h-full bg-purple-600 transition-all duration-1000 ease-linear" style={{ width: `${(timer/5)*100}%` }}></div>
         </div>
         <h2 className="text-2xl font-black text-slate-900 mt-2">{type === 'REWARDED' ? 'WATCH TO EARN' : 'AD BREAK'}</h2>
         <div className="w-full h-40 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-bold border-2 border-dashed border-slate-300 relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-10 text-6xl">📺</div>
            AD SPACE SIMULATION
         </div>
         <p className="text-slate-500 text-sm">{type === 'REWARDED' ? 'Watch this video to earn 100 coins!' : 'Game will resume shortly...'}</p>
         <button disabled={timer > 0} onClick={() => { if(type === 'REWARDED') updateWallet(100); onClose(); }} className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl disabled:opacity-50 transition-colors">
           {timer > 0 ? `Wait ${timer}s` : (type === 'REWARDED' ? 'Claim Reward' : 'Close Ad')}
         </button>
      </div>
    </div>
  );
};

const WinModal = ({ winner, prize, onHome }: { winner: PlayerColor, prize: number, onHome: () => void }) => (
  <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
    <div className="bg-gradient-to-br from-yellow-400 to-orange-600 p-[3px] rounded-[24px] w-full max-w-sm animate-bounce shadow-2xl shadow-orange-500/50">
       <div className="bg-[#1a1b26] rounded-[21px] p-8 text-center space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <Crown size={80} className="text-yellow-400 mx-auto drop-shadow-[0_0_25px_rgba(250,204,21,0.6)] animate-pulse" fill="currentColor" />
          <div>
            <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">{winner} WINS!</h2>
            <div className="inline-block px-4 py-1 bg-yellow-500/20 rounded-full border border-yellow-500/50">
                <p className="text-yellow-300 font-bold flex items-center gap-2"><Sparkles size={14} /> +{prize} Coins</p>
            </div>
          </div>
          <button onClick={onHome} className="w-full py-4 bg-white text-slate-900 font-black rounded-xl hover:scale-105 transition-transform shadow-lg">COLLECT & EXIT</button>
       </div>
    </div>
  </div>
);


export const LudoPage: React.FC = () => {
  const [pawns, setPawns] = useState<LudoPawn[]>([]);
  const [turnIndex, setTurnIndex] = useState(0);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [canRoll, setCanRoll] = useState(true);
  const [message, setMessage] = useState("Tap Dice to Start");
  const [winners, setWinners] = useState<PlayerColor[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false); 
  const [view, setView] = useState<GameState>('MENU');
  const [mode, setMode] = useState<GameMode>('LOCAL');
  const [entryFee, setEntryFee] = useState(500);
  const [showAd, setShowAd] = useState<'INTERSTITIAL' | 'REWARDED' | null>(null);
  const [comingSoonMode, setComingSoonMode] = useState<string | null>(null);

  const currentPlayer = PLAYERS[turnIndex];
  const appBg = isDarkMode ? 'bg-[#1a1b2e]' : 'bg-slate-100';

  useEffect(() => {
    const lastClaim = localStorage.getItem('ludo_daily');
    const today = new Date().toDateString();
    if (lastClaim !== today) { localStorage.setItem('ludo_daily', today); }
  }, []);

  const initGame = () => {
    const initialPawns: LudoPawn[] = [];
    PLAYERS.forEach((color, i) => {
      for (let j = 0; j < 4; j++) {
        initialPawns.push({ id: i * 4 + j, color, state: 'HOME', position: -1 });
      }
    });
    setPawns(initialPawns);
    setTurnIndex(0);
    setDiceValue(null);
    setCanRoll(true);
    setWinners([]);
    setView('PLAYING');
    setIsAnimating(false);
  };

  const handleSound = (type: 'roll' | 'move' | 'kill' | 'win' | 'tap') => { if (soundEnabled) playSound(type); };

  const nextTurn = () => {
    setDiceValue(null);
    setCanRoll(true);
    setIsAnimating(false);
    setMessage("Roll Dice");
    setTurnIndex(prev => (prev + 1) % 4);
  };

  const rollDice = () => {
    if (!canRoll || isAnimating) return;
    handleSound('tap');
    setIsRolling(true);
    setCanRoll(false);
    setMessage("Rolling...");
    
    let rollCount = 0;
    const rollInterval = setInterval(() => {
      handleSound('roll');
      rollCount++;
      if (rollCount > 8) {
        clearInterval(rollInterval);
        const val = Math.ceil(Math.random() * 6);
        setDiceValue(val);
        setIsRolling(false);
        checkMoves(val);
      }
    }, 80);
  };

  const checkMoves = (roll: number) => {
    const myPawns = pawns.filter(p => p.color === currentPlayer);
    const validPawns = myPawns.filter(p => isValidMove(p, roll));
    if (validPawns.length === 0) {
      setMessage("No moves available");
      setTimeout(nextTurn, 1000);
    } else {
      if (roll === 6) setMessage("🔥 Roll 6! Unlock or Move!");
      else setMessage("Select a pawn");
    }
  };

  const isValidMove = (p: LudoPawn, roll: number) => {
    if (p.state === 'FINISHED') return false;
    if (p.state === 'HOME') return roll === 6;
    if (p.position + roll > 56) return false;
    return true;
  };

  const handlePawnClick = async (pawn: LudoPawn) => {
    if (isRolling || canRoll || !diceValue || pawn.color !== currentPlayer || isAnimating) return;
    if (!isValidMove(pawn, diceValue)) return;

    setIsAnimating(true);
    let currentPawns = [...pawns];
    const pawnIdx = currentPawns.findIndex(p => p.id === pawn.id);
    let extraTurn = false;

    if (currentPawns[pawnIdx].state === 'HOME') {
        handleSound('move');
        currentPawns[pawnIdx].state = 'TRACK';
        currentPawns[pawnIdx].position = 0;
        setPawns([...currentPawns]);
        extraTurn = true;
        await new Promise(r => setTimeout(r, 400));
    } else {
        const oldPos = currentPawns[pawnIdx].position;
        const newPos = oldPos + diceValue;
        for (let i = 1; i <= diceValue; i++) {
           handleSound('move');
           currentPawns[pawnIdx].position = oldPos + i;
           setPawns([...currentPawns]);
           await new Promise(r => setTimeout(r, 200));
        }
        if (newPos < 51) {
            const globalPos = (newPos + START_POSITIONS[pawn.color]) % 52;
            const isSafe = STAR_SPOTS.some(s => {
                const coord = MAIN_PATH_COORDS[globalPos];
                return s.x === coord.x && s.y === coord.y;
            });
            if (!isSafe) {
                const opponents = currentPawns.filter(op => 
                    op.color !== pawn.color && op.state === 'TRACK' && op.position < 51 &&
                    (op.position + START_POSITIONS[op.color]) % 52 === globalPos
                );
                if (opponents.length > 0) {
                    handleSound('kill');
                    opponents.forEach(op => { op.state = 'HOME'; op.position = -1; });
                    extraTurn = true;
                    setMessage("KILL! Extra Turn!");
                }
            }
        }
        if (newPos === 56) {
            handleSound('win');
            currentPawns[pawnIdx].state = 'FINISHED';
            extraTurn = true;
            const playerPawns = currentPawns.filter(p => p.color === pawn.color);
            if (playerPawns.every(p => p.state === 'FINISHED')) {
                setWinners(prev => [...prev, pawn.color]);
                setView('GAMEOVER');
                return;
            }
        }
    }
    setPawns([...currentPawns]);
    if (extraTurn) {
        setDiceValue(null);
        setCanRoll(true);
        setIsAnimating(false);
        setMessage("Extra Turn! Roll Again");
    } else {
        nextTurn();
    }
  };

  const getPawnStyle = (pawn: LudoPawn) => {
    let x = 0, y = 0;
    if (pawn.state === 'HOME') {
        const localIdx = pawn.id % 4;
        const offsetX = localIdx % 2 === 0 ? 1.5 : 3.5;
        const offsetY = localIdx < 2 ? 1.5 : 3.5;
        if (pawn.color === 'RED') { x = offsetX; y = offsetY; }
        if (pawn.color === 'GREEN') { x = 9 + offsetX; y = offsetY; }
        if (pawn.color === 'YELLOW') { x = offsetX; y = 9 + offsetY; }
        if (pawn.color === 'BLUE') { x = 9 + offsetX; y = 9 + offsetY; }
    } else if (pawn.state === 'FINISHED') { x = 7; y = 7; } 
    else {
        if (pawn.position < 51) {
            const globalIdx = (pawn.position + START_POSITIONS[pawn.color]) % 52;
            const coord = MAIN_PATH_COORDS[globalIdx];
            x = coord.x; y = coord.y;
        } else {
            const homeIdx = pawn.position - 51;
            if (homeIdx < 5) {
                const coord = HOME_COLUMNS[pawn.color][homeIdx];
                x = coord.x; y = coord.y;
            } else { x = 7; y = 7; }
        }
    }
    return {
        left: `${(x / 15) * 100}%`,
        top: `${(y / 15) * 100}%`,
        width: `${(1/15)*100}%`,
        height: `${(1/15)*100}%`,
        zIndex: pawn.id + 10
    };
  };

  return (
    <div className={`min-h-screen ${appBg} text-slate-900 transition-colors`}>
      {showAd && <AdModal type={showAd} onClose={() => setShowAd(null)} />}
      {comingSoonMode && <ComingSoonModal title={comingSoonMode} onClose={() => setComingSoonMode(null)} />}
      {view === 'GAMEOVER' && winners.length > 0 && <WinModal winner={winners[0]} prize={entryFee * 2} onHome={() => setView('MENU')} />}

      <div className={`p-4 flex items-center justify-between shadow-md relative z-10 ${isDarkMode ? 'bg-[#1a1b2e] text-white border-b border-slate-800' : 'bg-white'}`}>
         <div className="flex items-center gap-2">
             <button onClick={() => setView('MENU')} className="p-2 hover:bg-slate-700/20 rounded-lg"><ChevronRight className="rotate-180" /></button>
             <h1 className="font-black text-xl tracking-tight">LUDO LEGENDS</h1>
         </div>
         <div className="flex items-center gap-3">
             <div className="px-3 py-1 bg-yellow-400 rounded-full font-bold text-slate-900 flex items-center gap-1 shadow-sm text-sm cursor-pointer" onClick={() => setShowAd('REWARDED')}>
                 <Coins size={14} /> <span>+ Free</span>
             </div>
             <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2 rounded-full hover:bg-slate-700/20">
                 {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
             </button>
             <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-slate-700/20">
                 {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
             </button>
         </div>
      </div>

      {view === 'MENU' ? (
        <div className="max-w-md mx-auto p-6 space-y-6">
           <div className="aspect-square bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl flex items-center justify-center shadow-2xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
               <Crown className="w-32 h-32 text-white/90 drop-shadow-2xl group-hover:scale-110 transition-transform duration-500" />
               <div className="absolute bottom-4 text-white font-black text-2xl tracking-widest">RANKED SEASON</div>
           </div>
           <div className="space-y-3">
               <h3 className={`font-bold uppercase tracking-wider text-xs mb-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Select Game Mode</h3>
               <button onClick={() => { setMode('ONLINE'); setComingSoonMode("Online Multiplayer"); }} className={`w-full p-4 rounded-xl border-2 flex items-center justify-between group transition-all ${isDarkMode ? 'bg-slate-900 border-slate-700 hover:border-purple-500 text-white' : 'bg-white border-slate-200 hover:border-purple-500'}`}>
                   <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500"><Users /></div>
                       <div className="text-left"><div className="font-bold text-lg">Online Match</div><div className="text-xs opacity-60">Play with friends worldwide</div></div>
                   </div>
                   <div className="px-3 py-1 bg-purple-500 text-white text-xs font-bold rounded-full">HOT</div>
               </button>
               <button onClick={() => { setMode('COMPUTER'); initGame(); }} className={`w-full p-4 rounded-xl border-2 flex items-center justify-between group transition-all ${isDarkMode ? 'bg-slate-900 border-slate-700 hover:border-blue-500 text-white' : 'bg-white border-slate-200 hover:border-blue-500'}`}>
                   <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500"><Bot /></div>
                       <div className="text-left"><div className="font-bold text-lg">Vs Computer</div><div className="text-xs opacity-60">Offline practice mode</div></div>
                   </div>
               </button>
               <button onClick={() => { setMode('LOCAL'); initGame(); }} className={`w-full p-4 rounded-xl border-2 flex items-center justify-between group transition-all ${isDarkMode ? 'bg-slate-900 border-slate-700 hover:border-green-500 text-white' : 'bg-white border-slate-200 hover:border-green-500'}`}>
                   <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-500"><MonitorSmartphone /></div>
                       <div className="text-left"><div className="font-bold text-lg">Pass & Play</div><div className="text-xs opacity-60">2-4 Players on this device</div></div>
                   </div>
               </button>
           </div>
        </div>
      ) : (
        <div className="max-w-xl mx-auto p-4 flex flex-col h-[calc(100vh-80px)]">
           <div className="flex justify-between items-center mb-4">
              <div className={`flex items-center gap-2 p-2 rounded-lg ${turnIndex === 0 ? 'bg-red-500 text-white shadow-lg scale-105' : 'opacity-60'} transition-all`}>
                  <div className="w-8 h-8 bg-red-700 rounded-full flex items-center justify-center border-2 border-white"><User size={16}/></div>
                  <span className={`font-bold text-sm ${turnIndex === 0 ? '' : (isDarkMode ? 'text-white' : 'text-slate-900')}`}>Red</span>
              </div>
              <div className={`flex items-center gap-2 p-2 rounded-lg ${turnIndex === 1 ? 'bg-green-500 text-white shadow-lg scale-105' : 'opacity-60'} transition-all`}>
                  <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center border-2 border-white"><User size={16}/></div>
                  <span className={`font-bold text-sm ${turnIndex === 1 ? '' : (isDarkMode ? 'text-white' : 'text-slate-900')}`}>Green</span>
              </div>
           </div>

           <div className="relative aspect-square w-full">
              <LudoBoardRender />
              {pawns.map(pawn => {
                  const style = getPawnStyle(pawn);
                  const isTurn = pawn.color === currentPlayer;
                  const canMove = isTurn && diceValue !== null && isValidMove(pawn, diceValue);
                  return (
                      <div key={pawn.id} onClick={() => handlePawnClick(pawn)} className="absolute flex items-center justify-center transition-all duration-300 ease-out z-20" style={style}>
                         {/* High-Fidelity 3D Pawn */}
                         <div className={`
                             w-[70%] h-[90%] -mt-[20%] cursor-pointer transition-transform
                             ${canMove ? 'animate-bounce drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]' : 'drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)]'}
                         `}>
                            {/* Pawn Shadow Base */}
                            <div className="absolute bottom-0 left-[10%] w-[80%] h-[15%] bg-black/40 rounded-[50%] blur-[2px]"></div>
                            {/* Pawn Body */}
                            <div className={`absolute bottom-[10%] left-[10%] w-[80%] h-[60%] bg-gradient-to-b ${COLORS[pawn.color].bodyGradient} rounded-b-[40%] rounded-t-[50%] shadow-inner`}></div>
                            {/* Pawn Head */}
                            <div className={`absolute top-0 left-0 w-full h-[50%] bg-gradient-to-br ${COLORS[pawn.color].headGradient} rounded-full shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.2)] flex items-center justify-center`}>
                                {/* Reflection */}
                                <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] bg-white/50 rounded-full blur-[0.5px]"></div>
                            </div>
                         </div>
                      </div>
                  );
              })}
           </div>

           <div className="flex justify-between items-center mt-4 mb-4">
              <div className={`flex items-center gap-2 p-2 rounded-lg ${turnIndex === 3 ? 'bg-yellow-500 text-white shadow-lg scale-105' : 'opacity-60'} transition-all`}>
                  <div className="w-8 h-8 bg-yellow-700 rounded-full flex items-center justify-center border-2 border-white"><User size={16}/></div>
                  <span className={`font-bold text-sm ${turnIndex === 3 ? '' : (isDarkMode ? 'text-white' : 'text-slate-900')}`}>Yellow</span>
              </div>
              <div className={`flex items-center gap-2 p-2 rounded-lg ${turnIndex === 2 ? 'bg-blue-500 text-white shadow-lg scale-105' : 'opacity-60'} transition-all`}>
                  <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center border-2 border-white"><User size={16}/></div>
                  <span className={`font-bold text-sm ${turnIndex === 2 ? '' : (isDarkMode ? 'text-white' : 'text-slate-900')}`}>Blue</span>
              </div>
           </div>

           <div className={`flex-1 rounded-2xl flex items-center justify-between p-6 shadow-lg border ${isDarkMode ? 'bg-[#25263a] border-slate-700' : 'bg-white border-slate-200'}`}>
               <div className="text-left">
                   <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Current Turn</div>
                   <div className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'} drop-shadow-sm`} style={{ color: COLORS[currentPlayer].main }}>
                       {currentPlayer}
                   </div>
                   <div className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{message}</div>
               </div>
               
               {/* 3D Realistic Dice */}
               <div 
                 onClick={rollDice}
                 className={`
                    w-20 h-20 bg-white rounded-[16px] shadow-[0_8px_0_#d1d5db,0_15px_20px_rgba(0,0,0,0.2)]
                    flex items-center justify-center cursor-pointer 
                    transition-all duration-150 active:shadow-none active:translate-y-[8px] border border-slate-100
                    ${isRolling ? 'animate-spin' : canRoll ? 'hover:-translate-y-1 hover:shadow-[0_10px_0_#d1d5db,0_20px_25px_rgba(0,0,0,0.2)]' : 'opacity-90'}
                 `}
               >
                   {diceValue ? (
                       <div className="grid grid-cols-3 grid-rows-3 gap-1 p-3 w-full h-full">
                            {[...Array(9)].map((_, i) => {
                                const show = 
                                  (diceValue % 2 !== 0 && i === 4) || // Center dot for odd numbers
                                  (diceValue > 1 && (i === 0 || i === 8)) || // Corners for > 1
                                  (diceValue > 3 && (i === 2 || i === 6)) || // Corners for > 3
                                  (diceValue === 6 && (i === 3 || i === 5)); // Sides for 6
                                return <div key={i} className={`w-3 h-3 rounded-full bg-slate-900 shadow-inner ${show ? 'opacity-100' : 'opacity-0'}`}></div>;
                            })}
                       </div>
                   ) : (
                       <Dices className="text-slate-300 w-10 h-10" />
                   )}
               </div>
           </div>
        </div>
      )}
    </div>
  );
};