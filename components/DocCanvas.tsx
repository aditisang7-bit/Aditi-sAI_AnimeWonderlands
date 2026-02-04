import React, { useState, useEffect, useRef } from 'react';
import { 
  Move, Type, Image as ImageIcon, Bold, Italic, 
  AlignLeft, AlignCenter, AlignRight, Trash2, 
  Plus, Download, Printer, GripVertical, MousePointer2 
} from 'lucide-react';
import { DocBlock } from '../types';

interface DocCanvasProps {
  initialHtml: string;
  onClose: () => void;
}

// A4 Dimensions in Pixels (at 96 DPI approx)
const PAGE_WIDTH = 794;
const PAGE_HEIGHT = 1123;

export const DocCanvas: React.FC<DocCanvasProps> = ({ initialHtml, onClose }) => {
  const [blocks, setBlocks] = useState<DocBlock[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // --- PARSER: Convert AI HTML to Blocks ---
  useEffect(() => {
    if (!initialHtml) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(initialHtml, 'text/html');
    const elements = Array.from(doc.body.children);
    
    let currentY = 60; // Start with some padding
    const newBlocks: DocBlock[] = elements.map((el, index) => {
      const tagName = el.tagName.toLowerCase();
      let type: any = 'p';
      let fontSize = 14;
      let fontWeight = 'normal';
      
      if (tagName === 'h1') { type = 'h1'; fontSize = 28; fontWeight = '800'; }
      if (tagName === 'h2') { type = 'h2'; fontSize = 20; fontWeight = '700'; }
      if (tagName === 'li') { type = 'li'; fontSize = 14; }
      
      // Estimate height for next element placement (simple approximation)
      const estimatedHeight = tagName === 'h1' ? 60 : tagName === 'h2' ? 40 : 30;
      const y = currentY;
      currentY += estimatedHeight + (el.textContent?.length || 0) / 2; // rough spacing

      return {
        id: `block-${Date.now()}-${index}`,
        type,
        content: el.innerHTML,
        x: 60, // Left margin
        y: y,
        width: 650,
        style: {
          color: '#1e293b', // slate-800
          fontSize,
          fontWeight,
          fontStyle: 'normal',
          textAlign: 'left'
        }
      };
    });

    setBlocks(newBlocks);
  }, [initialHtml]);

  // --- INTERACTION HANDLERS ---

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent canvas click clearing selection
    setSelectedId(id);
    setIsDragging(true);
    
    const block = blocks.find(b => b.id === id);
    if (!block) return;

    // Calculate offset from mouse to block top-left
    // We need to account for the canvas scale if we add zoom later
    dragOffset.current = {
      x: e.clientX - block.x,
      y: e.clientY - block.y
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedId) return;
    
    // Calculate new position relative to canvas
    // Note: In a real app, use canvasRef.current.getBoundingClientRect() to normalize
    const newX = e.clientX - dragOffset.current.x;
    const newY = e.clientY - dragOffset.current.y;

    setBlocks(prev => prev.map(b => b.id === selectedId ? { ...b, x: newX, y: newY } : b));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updateBlockStyle = (key: keyof DocBlock['style'], value: any) => {
    if (!selectedId) return;
    setBlocks(prev => prev.map(b => 
      b.id === selectedId ? { ...b, style: { ...b.style, [key]: value } } : b
    ));
  };

  const updateContent = (id: string, newContent: string) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, content: newContent } : b));
  };

  const addNewBlock = (type: 'p' | 'h2') => {
    const newBlock: DocBlock = {
        id: `new-${Date.now()}`,
        type,
        content: type === 'h2' ? 'New Heading' : 'New Text Block',
        x: 100,
        y: 100, // Default drop pos
        width: 400,
        style: {
            color: '#000000',
            fontSize: type === 'h2' ? 20 : 14,
            fontWeight: type === 'h2' ? 'bold' : 'normal',
            fontStyle: 'normal',
            textAlign: 'left'
        }
    };
    setBlocks([...blocks, newBlock]);
    setSelectedId(newBlock.id);
  };

  const deleteBlock = () => {
      if(!selectedId) return;
      setBlocks(prev => prev.filter(b => b.id !== selectedId));
      setSelectedId(null);
  };

  const handlePrint = () => {
      // Create a temporary print stylesheet
      const style = document.createElement('style');
      style.innerHTML = `
        @media print {
          body * { visibility: hidden; }
          #doc-canvas-container, #doc-canvas-container * { visibility: visible; }
          #doc-canvas-container { 
            position: absolute; 
            left: 0; 
            top: 0; 
            margin: 0; 
            box-shadow: none; 
            border: none;
            overflow: visible !important;
          }
          /* Hide UI helpers during print */
          .doc-ui-helper { display: none !important; }
        }
      `;
      document.head.appendChild(style);
      window.print();
      document.head.removeChild(style);
  };

  const selectedBlock = blocks.find(b => b.id === selectedId);

  return (
    <div 
        className="fixed inset-0 z-50 bg-slate-100 dark:bg-slate-900 flex flex-col" 
        onMouseMove={handleMouseMove} 
        onMouseUp={handleMouseUp}
    >
        {/* HEADER TOOLBAR */}
        <div className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 shadow-sm z-50">
            <div className="flex items-center gap-4">
                <button onClick={onClose} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-bold">Close Editor</button>
                <div className="h-6 w-px bg-slate-300 dark:bg-slate-600"></div>
                <div className="flex gap-2">
                    <button onClick={() => addNewBlock('h2')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300" title="Add Heading"><Type size={18}/></button>
                    <button onClick={() => addNewBlock('p')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300" title="Add Text"><Plus size={18}/></button>
                </div>
            </div>

            {/* CONTEXTUAL TOOLBAR */}
            {selectedBlock ? (
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700 animate-fade-in">
                    <input 
                        type="color" 
                        value={selectedBlock.style.color}
                        onChange={(e) => updateBlockStyle('color', e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border-none bg-transparent"
                    />
                    <div className="h-6 w-px bg-slate-300 dark:bg-slate-600"></div>
                    <button onClick={() => updateBlockStyle('fontWeight', selectedBlock.style.fontWeight === 'bold' ? 'normal' : 'bold')} className={`p-1.5 rounded ${selectedBlock.style.fontWeight === 'bold' ? 'bg-purple-200 text-purple-700' : 'text-slate-500'}`}><Bold size={16}/></button>
                    <button onClick={() => updateBlockStyle('fontStyle', selectedBlock.style.fontStyle === 'italic' ? 'normal' : 'italic')} className={`p-1.5 rounded ${selectedBlock.style.fontStyle === 'italic' ? 'bg-purple-200 text-purple-700' : 'text-slate-500'}`}><Italic size={16}/></button>
                    <div className="h-6 w-px bg-slate-300 dark:bg-slate-600"></div>
                    <button onClick={() => updateBlockStyle('fontSize', selectedBlock.style.fontSize - 2)} className="p-1 text-slate-500 hover:text-purple-600 font-bold">-</button>
                    <span className="text-xs font-mono w-6 text-center text-slate-500">{selectedBlock.style.fontSize}</span>
                    <button onClick={() => updateBlockStyle('fontSize', selectedBlock.style.fontSize + 2)} className="p-1 text-slate-500 hover:text-purple-600 font-bold">+</button>
                    <div className="h-6 w-px bg-slate-300 dark:bg-slate-600"></div>
                    <button onClick={() => updateBlockStyle('textAlign', 'left')} className={`p-1.5 rounded ${selectedBlock.style.textAlign === 'left' ? 'bg-purple-200 text-purple-700' : 'text-slate-500'}`}><AlignLeft size={16}/></button>
                    <button onClick={() => updateBlockStyle('textAlign', 'center')} className={`p-1.5 rounded ${selectedBlock.style.textAlign === 'center' ? 'bg-purple-200 text-purple-700' : 'text-slate-500'}`}><AlignCenter size={16}/></button>
                    <button onClick={() => updateBlockStyle('textAlign', 'right')} className={`p-1.5 rounded ${selectedBlock.style.textAlign === 'right' ? 'bg-purple-200 text-purple-700' : 'text-slate-500'}`}><AlignRight size={16}/></button>
                    <div className="h-6 w-px bg-slate-300 dark:bg-slate-600"></div>
                    <button onClick={deleteBlock} className="p-1.5 text-red-500 hover:bg-red-100 rounded"><Trash2 size={16}/></button>
                </div>
            ) : (
                <div className="text-sm text-slate-400 flex items-center gap-2">
                    <MousePointer2 size={14}/> Select an element to edit
                </div>
            )}

            <div>
                <button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg">
                    <Download size={16}/> Save PDF
                </button>
            </div>
        </div>

        {/* WORKSPACE (GRAY BG) */}
        <div className="flex-1 overflow-auto bg-slate-200 dark:bg-slate-950 p-8 flex justify-center cursor-default" onClick={() => setSelectedId(null)}>
            
            {/* PAPER CANVAS (A4) */}
            <div 
                id="doc-canvas-container"
                ref={canvasRef}
                className="bg-white shadow-2xl relative transition-all duration-200"
                style={{ 
                    width: PAGE_WIDTH, 
                    height: PAGE_HEIGHT, 
                    minWidth: PAGE_WIDTH, 
                    minHeight: PAGE_HEIGHT,
                    transform: 'scale(1)', // Prepared for zoom
                    transformOrigin: 'top center'
                }}
            >
                {/* BLOCKS */}
                {blocks.map(block => (
                    <div
                        key={block.id}
                        className={`absolute group hover:outline hover:outline-1 hover:outline-purple-200 ${selectedId === block.id ? 'outline outline-2 outline-purple-500 z-10' : 'z-0'}`}
                        style={{
                            left: block.x,
                            top: block.y,
                            width: block.width ? block.width : 'auto',
                            cursor: isDragging && selectedId === block.id ? 'grabbing' : 'default'
                        }}
                        onMouseDown={(e) => handleMouseDown(e, block.id)}
                    >
                        {/* Drag Handle (Visible on Hover/Select) */}
                        <div 
                            className={`doc-ui-helper absolute -left-6 top-0 p-1 cursor-grab active:cursor-grabbing text-slate-300 hover:text-purple-500 ${selectedId === block.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                        >
                            <GripVertical size={16} />
                        </div>

                        {/* Editable Content */}
                        <div
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => updateContent(block.id, e.currentTarget.innerHTML)}
                            style={{
                                color: block.style.color,
                                fontSize: `${block.style.fontSize}px`,
                                fontWeight: block.style.fontWeight,
                                fontStyle: block.style.fontStyle,
                                textAlign: block.style.textAlign,
                                outline: 'none',
                                lineHeight: '1.5'
                            }}
                            dangerouslySetInnerHTML={{ __html: block.content }}
                        />
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};