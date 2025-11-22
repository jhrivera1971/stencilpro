
import React, { useState, useRef, useEffect } from 'react';
import { generateStencil } from './services/geminiService';
import { ComparisonViewer } from './components/ComparisonViewer';
import { RecentWork } from './components/RecentWork';
import { StencilWork } from './types';

// --- Assets ---
const StencilLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <style>
      {`
        @keyframes paperFeed {
          0% { transform: translateY(0); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(25px); opacity: 0; }
        }
        @keyframes lightBlink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        .sheet { animation: paperFeed 2s linear infinite; }
        .status-light { animation: lightBlink 1s ease-in-out infinite; }
      `}
    </style>
    
    {/* Input Paper (White Sheet) - Behind Machine */}
    <path className="sheet" d="M30 10 H70 V50 H30 Z" fill="currentColor" fillOpacity="0.2" />

    {/* Thermal Copier Body */}
    <rect x="10" y="35" width="80" height="30" rx="4" fill="currentColor" fillOpacity="1" />
    
    {/* Top Slot Detail */}
    <rect x="15" y="35" width="70" height="4" fill="black" fillOpacity="0.3" />
    
    {/* Output Slot/Shadow */}
    <rect x="15" y="60" width="70" height="2" fill="black" fillOpacity="0.5" />

    {/* Output Paper (Stencil Sheet) - In front of machine */}
    <g className="sheet" style={{ animationDelay: '0.5s' }}>
        <path d="M35 55 H65 V85 H35 Z" fill="currentColor" fillOpacity="0.5" />
        {/* Stencil Lines on output paper */}
        <path d="M40 65 H60" stroke="black" strokeWidth="1" strokeOpacity="0.6" />
        <path d="M40 70 H55" stroke="black" strokeWidth="1" strokeOpacity="0.6" />
        <path d="M40 75 H58" stroke="black" strokeWidth="1" strokeOpacity="0.6" />
    </g>

    {/* Machine Details / Buttons */}
    <circle cx="80" cy="45" r="2" fill="#22c55e" className="status-light" /> {/* Power Light */}
    <circle cx="75" cy="45" r="2" fill="#ef4444" /> {/* Error/Heat Light */}
    <rect x="15" y="48" width="40" height="10" rx="1" fill="black" fillOpacity="0.2" /> {/* Control Panel Area */}
  </svg>
);

// --- Helper for color mapping ---
const getHexColor = (color: string) => {
  switch (color) {
    case 'rojas': return '#7f1d1d'; // Very Dark Red (Red-900)
    case 'azules': return '#1e3a8a'; // Very Dark Blue (Blue-900)
    case 'violetas': return '#4c1d95'; // Very Dark Violet (Violet-900)
    case 'verdes': return '#14532d'; // Very Dark Green (Green-900)
    case 'negras': default: return '#000000';
  }
};

// --- Helper for recoloring/transparency ---
const recolorStencil = (imageSrc: string, colorHex: string, transparent: boolean): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error("No context"));
                return;
            }
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            let tr = 0, tg = 0, tb = 0;
            if (colorHex.length === 7) {
                tr = parseInt(colorHex.slice(1, 3), 16);
                tg = parseInt(colorHex.slice(3, 5), 16);
                tb = parseInt(colorHex.slice(5, 7), 16);
            }

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const a = data[i + 3];

                if (transparent) {
                    // Preserve transparency logic
                    if (a < 10) {
                         data[i] = tr; data[i+1] = tg; data[i+2] = tb; data[i+3] = 0;
                    } else {
                        // Preserve alpha, just change RGB
                        data[i] = tr;
                        data[i+1] = tg;
                        data[i+2] = tb;
                        // data[i+3] stays as is
                    }
                } else {
                    // Opaque logic
                    if (a < 10) {
                        // If fully transparent, make it white (since we are in opaque mode)
                        data[i] = 255; data[i+1] = 255; data[i+2] = 255; data[i+3] = 255;
                    } else {
                        // Extract density using Min Channel (assuming white background)
                        // This works robustly for any colored line on white background, avoiding fade when swapping colors.
                        const minChan = Math.min(r, g, b);
                        const colorDensity = (255 - minChan) / 255;
                        const alphaFactor = a / 255;
                        const density = colorDensity * alphaFactor;
                        
                        // Apply target color based on density
                        data[i] = tr * density + 255 * (1 - density);
                        data[i+1] = tg * density + 255 * (1 - density);
                        data[i+2] = tb * density + 255 * (1 - density);
                        data[i+3] = 255;
                    }
                }
            }
            
            ctx.putImageData(imageData, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = (err) => reject(err);
        img.src = imageSrc;
    });
};

// --- Main Component ---
export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [stencil, setStencil] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [additionalPrompt, setAdditionalPrompt] = useState('');
  const [opacity, setOpacity] = useState(50);
  const [zoom, setZoom] = useState(1);
  const [activeTool, setActiveTool] = useState<'pencil' | 'eraser' | 'pan' | null>(null);
  const [recentWorks, setRecentWorks] = useState<StencilWork[]>([]);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  
  const previewRef = useRef<HTMLDivElement>(null);
  const generateSectionRef = useRef<HTMLDivElement>(null);

  // Settings
  const [selectedColorStyle, setSelectedColorStyle] = useState('negras');
  const [generationCount, setGenerationCount] = useState(0);

  // Lifted View State
  const [viewMode, setViewMode] = useState<'overlay' | 'split'>('split');
  const [isStencilOnTop, setIsStencilOnTop] = useState(false);

  // Load recent works
  useEffect(() => {
    const saved = localStorage.getItem('stencil_works');
    if (saved) {
      try {
        setRecentWorks(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load recent works", e);
      }
    }
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
           handleRedo();
        } else {
           handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoStack, redoStack]);

  const handleFile = (selectedFile: File) => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File size exceeds 10MB limit.");
        return;
      }
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      setStencil(null);
      setError(null);
      setUndoStack([]);
      setRedoStack([]);
      
      // Scroll to Generate Button Section
      setTimeout(() => {
        generateSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } else {
      setError("Please upload a valid image file (JPG, PNG, WebP).");
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFile(e.dataTransfer.files[0]);
        e.dataTransfer.clearData();
    }
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleColorSelect = async (styleId: string) => {
    setSelectedColorStyle(styleId);
    if (stencil) {
        try {
             const newColorHex = getHexColor(styleId);
             const recolored = await recolorStencil(stencil, newColorHex, false);
             handleStencilUpdate(recolored);
        } catch (e) {
            console.error("Failed to recolor", e);
        }
    }
  };

  // Scroll Helper
  const scrollToPreview = () => {
    setTimeout(() => {
        if (previewRef.current) {
            const element = previewRef.current;
            const elementRect = element.getBoundingClientRect();
            // Calculate absolute position relative to document
            const absoluteElementTop = elementRect.top + window.scrollY;
            
            const viewportHeight = window.innerHeight;
            const elementHeight = element.offsetHeight;
            
            // Center logic: Scroll to where the element center matches viewport center
            const centerScrollPosition = absoluteElementTop + (elementHeight / 2) - (viewportHeight / 2);
            
            window.scrollTo({
                top: centerScrollPosition, 
                behavior: "smooth"
            });
        }
    }, 100);
  };

  const handleGenerate = async () => {
    if (!file || !previewUrl) return;
    
    setLoading(true);
    setError(null);
    setStencil(null);
    
    // Scroll to preview area
    scrollToPreview();

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        try {
          // Generate base stencil
          let generatedStencil = await generateStencil(base64String, additionalPrompt, selectedColorStyle);
          
          setStencil(generatedStencil);
          setUndoStack([generatedStencil]);
          setRedoStack([]);
          setGenerationCount(prev => prev + 1);

          // Save to recent
          const newWork: StencilWork = {
            id: Date.now().toString(),
            originalImage: previewUrl,
            stencilImage: generatedStencil,
            createdAt: Date.now(),
            style: selectedColorStyle
          };
          const updatedWorks = [newWork, ...recentWorks].slice(0, 50);
          setRecentWorks(updatedWorks);
          localStorage.setItem('stencil_works', JSON.stringify(updatedWorks));

        } catch (err) {
          setError("Failed to generate stencil. Please check your API key and try again.");
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Error processing file.");
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setStencil(null);
    setUndoStack([]);
    setRedoStack([]);
    setError(null);
    setAdditionalPrompt('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStencilUpdate = (newImage: string) => {
    setUndoStack(prev => [...prev, newImage]);
    setStencil(newImage);
    setRedoStack([]); // Clear redo on new action
  };

  const handleUndo = () => {
    if (undoStack.length > 1) {
      const current = undoStack[undoStack.length - 1];
      const previous = undoStack[undoStack.length - 2];
      setRedoStack(prev => [current, ...prev]);
      setUndoStack(prev => prev.slice(0, -1));
      setStencil(previous);
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const next = redoStack[0];
      setRedoStack(prev => prev.slice(1));
      setUndoStack(prev => [...prev, next]);
      setStencil(next);
    }
  };

  const handleDownload = () => {
    if (!stencil) return;
    const link = document.createElement('a');
    link.href = stencil;
    link.download = `stencil-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const STENCIL_COLORS = [
    { id: 'negras', name: 'Black', color: 'from-zinc-800 to-black' },
    { id: 'rojas', name: 'Very Dark Red', color: 'from-red-900 to-black' },
    { id: 'azules', name: 'Very Dark Blue', color: 'from-blue-900 to-black' },
    { id: 'violetas', name: 'Very Dark Violet', color: 'from-violet-900 to-black' },
    { id: 'verdes', name: 'Very Dark Green', color: 'from-green-900 to-black' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-red-500/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
              <StencilLogo className="h-24 w-auto text-white" />
              <div className="flex flex-col items-baseline">
                  <div className="flex items-baseline gap-3">
                    <h1 className="text-4xl font-bold text-white tracking-tight">
                        Easy <span className="font-cursive text-5xl text-red-500 mx-3">Stencil</span> Pro
                    </h1>
                    <span className="text-lg text-white font-light opacity-80">by J-Art</span>
                  </div>
              </div>
          </div>
          <span className="text-xs text-white opacity-60 self-start pt-2">powered by AI</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Configuration */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Upload Section */}
            <div 
                className={`relative bg-zinc-900 rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center p-8 text-center group ${file ? 'border-red-500 bg-zinc-900/80' : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900/80'}`}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
                 {/* Badge 1 */}
                 <div className="absolute top-5 left-5 w-8 h-8 rounded-full border-2 border-red-500 flex items-center justify-center">
                     <span className="text-white font-bold">1</span>
                 </div>

                 <div className="mb-4 p-4 bg-zinc-800 rounded-full text-white group-hover:scale-110 transition-transform duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                    </svg>
                 </div>
                 <h3 className="text-lg font-semibold text-white mb-2">Upload Your Image</h3>
                 <p className="text-white text-sm mb-6 max-w-[200px]">Drag and drop your image here, or click to browse</p>
                 
                 <input 
                   type="file" 
                   id="file-upload"
                   accept="image/*" 
                   onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                   className="hidden"
                 />
                 <label 
                   htmlFor="file-upload"
                   className="cursor-pointer bg-white text-zinc-900 font-bold py-3 px-8 rounded-full hover:bg-zinc-200 transition-colors w-full max-w-[240px]"
                 >
                   Choose File
                 </label>
                 <p className="mt-4 text-xs text-white opacity-50">Supports JPG, PNG, GIF up to 10MB</p>
            </div>

            {/* Configuration Panel */}
            <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 relative">
              {/* Badge 2 */}
              <div className="absolute top-5 left-5 w-8 h-8 rounded-full border-2 border-red-500 flex items-center justify-center bg-zinc-900 z-10">
                  <span className="text-white font-bold">2</span>
              </div>

              <h3 className="text-lg font-semibold text-white mb-4 pl-10">Configuration</h3>
              
              {/* Color Selection */}
              <div className="mb-6 bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-medium text-white">Stencil Line Color</label>
                    <p className="text-white text-xs opacity-70">Pick the line color.</p>
                </div>
                <div className="flex items-center justify-center gap-4">
                  {STENCIL_COLORS.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => handleColorSelect(style.id)}
                      className={`group relative w-12 h-12 rounded-full bg-gradient-to-br ${style.color} shadow-lg transition-all duration-300 hover:scale-110 hover:-translate-y-1 ${selectedColorStyle === style.id ? 'ring-4 ring-offset-2 ring-offset-zinc-900 ring-white scale-110' : 'opacity-80 hover:opacity-100'}`}
                      title={style.name}
                    >
                        {selectedColorStyle === style.id && (
                            <span className="absolute inset-0 flex items-center justify-center text-white animate-in fade-in zoom-in duration-200">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 drop-shadow-md">
                                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                                </svg>
                            </span>
                        )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div className="mb-6">
                 <div className="flex items-center gap-3 mb-2">
                    {/* Badge 3 */}
                    <div className="w-8 h-8 rounded-full border-2 border-red-500 flex items-center justify-center shrink-0">
                        <span className="text-white font-bold">3</span>
                    </div>
                    <label className="text-sm font-medium text-white">Specific Instructions (Optional)</label>
                 </div>
                 <textarea 
                    value={additionalPrompt}
                    onChange={(e) => setAdditionalPrompt(e.target.value)}
                    placeholder="e.g., Thicker lines on hair, ignore background..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white placeholder-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all h-24 resize-none"
                 />
              </div>

              {/* Generate Button */}
              <div className="space-y-4" ref={generateSectionRef}>
                 <p className="text-white text-sm text-center">Try again for better result</p>
                 <div className="flex items-center gap-3">
                    {/* Badge 4 */}
                    <div className="w-8 h-8 rounded-full border-2 border-red-500 flex items-center justify-center shrink-0">
                        <span className="text-white font-bold">4</span>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={!file || loading}
                        className="flex-1 bg-white text-black font-bold py-3 px-6 rounded-lg hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/10"
                    >
                        {loading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            <span>Generating...</span>
                        </>
                        ) : (
                        <>
                            <span>Generate Stencil</span>
                            <StencilLogo className="w-6 h-6 text-black" />
                        </>
                        )}
                    </button>
                 </div>

                 <div className="flex justify-center">
                    <button 
                        onClick={handleReset}
                        className="text-white font-bold hover:text-zinc-300 transition-colors text-sm uppercase tracking-wide"
                    >
                        Reset
                    </button>
                 </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}
            </div>
            
          </div>

          {/* Right Column: Preview & Results */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Image Preview Area */}
            <div 
                ref={previewRef}
                className="w-full aspect-[17/23] relative bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 shadow-2xl flex flex-col items-center justify-center"
            >
               {loading ? (
                   <div className="flex flex-col items-center gap-4 z-10">
                       <div className="w-16 h-16 rounded-full border-4 border-zinc-800 border-t-red-500 animate-spin shadow-[0_0_20px_rgba(239,68,68,0.5)]" />
                       <p className="text-white font-bold text-lg animate-pulse">Analyzing and Loading...</p>
                   </div>
               ) : stencil ? (
                 <ComparisonViewer 
                    originalImage={previewUrl!}
                    stencilImage={stencil}
                    opacity={opacity}
                    setOpacity={setOpacity}
                    onStencilUpdate={handleStencilUpdate}
                    activeTool={activeTool}
                    zoom={zoom}
                    setZoom={setZoom}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    canUndo={undoStack.length > 1}
                    canRedo={redoStack.length > 0}
                    onToggleTool={(t) => setActiveTool(activeTool === t ? null : t)}
                    generationCount={generationCount}
                    externalSelectedColor={getHexColor(selectedColorStyle)}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    isStencilOnTop={isStencilOnTop}
                    setIsStencilOnTop={setIsStencilOnTop}
                 />
               ) : previewUrl ? (
                 <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain opacity-50 blur-sm scale-95 transition-all duration-700" />
               ) : (
                 <div className="text-center p-8">
                    <StencilLogo className="w-24 h-24 text-zinc-800 mx-auto mb-4 opacity-50" />
                    <p className="text-white text-lg font-medium">Ready to generate</p>
                    <p className="text-white opacity-50 text-sm mt-2">Upload an image to get started</p>
                 </div>
               )}
            </div>

            {/* Download Section */}
            {stencil && (
                <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 animate-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-xl font-bold text-white mb-4">Download</h3>
                    <button 
                        onClick={handleDownload}
                        className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 mb-4"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M12 12.75l3.75-3.75m-3.75 3.75-3.75-3.75m3.75 3.75V3" />
                        </svg>
                        Download PNG
                    </button>
                    
                    <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                        <p className="text-white/80 font-medium mb-1">To edit the stencil in Procreate:</p>
                        <p className="text-white/60 text-sm">Press and hold the stencil image above and select "Copy", then paste it directly into Procreate to edit it</p>
                    </div>
                </div>
            )}

            {/* Recent Work */}
            <RecentWork works={recentWorks} onSelect={(work) => {
                setPreviewUrl(work.originalImage);
                setStencil(work.stencilImage);
                setUndoStack([work.stencilImage]);
                setRedoStack([]);
                if (work.style) setSelectedColorStyle(work.style);
                // Scroll to preview center
                scrollToPreview();
            }} />

          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-4 py-8 flex justify-end">
          <p className="text-white font-medium">© 2025 Easy Stencil Pro by JRS Art</p>
      </footer>
    </div>
  );
}
