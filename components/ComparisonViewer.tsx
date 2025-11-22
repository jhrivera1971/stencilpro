
import React, { useState, useRef, useEffect } from 'react';

// --- Icons ---
const EraserIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M15.1655 4.60445C15.9378 3.80892 17.2117 3.78725 18.0099 4.55631L19.438 5.93251C20.2362 6.70157 20.2579 7.97026 19.4856 8.76578L9.74699 18.7967L4.62396 13.8604L15.1655 4.60445ZM12.5116 19.7209L8.16523 15.533L4.63255 19.1717C3.86025 19.9672 3.88199 21.2359 4.6802 22.005C5.4784 22.774 6.75229 22.7524 7.52459 21.9568L12.5116 19.7209Z" />
  </svg>
);

const PencilIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
  </svg>
);

const MoveIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2a.75.75 0 01.75.75v3.69l2.47-2.47a.75.75 0 111.06 1.06l-3.75 3.75a.75.75 0 01-1.06 0L7.72 5.03a.75.75 0 011.06-1.06l2.47 2.47V2.75A.75.75 0 0112 2zm-3.69 9.25H4.56l2.47-2.47a.75.75 0 10-1.06-1.06l-3.75 3.75a.75.75 0 000 1.06l3.75 3.75a.75.75 0 101.06-1.06l-2.47-2.47h3.75a.75.75 0 000-1.5zm11.13 0h-3.75l2.47-2.47a.75.75 0 10-1.06-1.06l-3.75 3.75a.75.75 0 000 1.06l3.75 3.75a.75.75 0 001.06-1.06l-2.47-2.47h3.75a.75.75 0 000-1.5zM12 22a.75.75 0 01-.75-.75v-3.69l-2.47 2.47a.75.75 0 11-1.06-1.06l3.75-3.75a.75.75 0 011.06 0l3.75 3.75a.75.75 0 11-1.06 1.06l-2.47-2.47v3.69A.75.75 0 0112 22z" />
  </svg>
);

const UndoIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
  </svg>
);

const RedoIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
  </svg>
);

const SplitIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M2 4h20v16H2V4zm2 2v12h7V6H4zm9 0v12h7V6h-7z" />
  </svg>
);

const OverlayIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
    <circle cx="12" cy="12" r="5" opacity="0.5" />
  </svg>
);

const SwapLayersIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3zM9 3L5 6.99h3V14h2V6.99h3L9 3z" />
  </svg>
);

const ArrowsUpDownIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
  </svg>
);

interface ComparisonViewerProps {
  originalImage: string;
  stencilImage: string;
  opacity: number;
  setOpacity: (val: number) => void;
  onStencilUpdate?: (newImage: string) => void;
  activeTool: 'pencil' | 'eraser' | 'pan' | null;
  zoom: number;
  setZoom: (val: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onToggleTool: (tool: 'pencil' | 'eraser' | 'pan') => void;
  generationCount: number;
  externalSelectedColor?: string;
  // Lifted State Props
  viewMode: 'overlay' | 'split';
  setViewMode: (mode: 'overlay' | 'split') => void;
  isStencilOnTop: boolean;
  setIsStencilOnTop: (isOnTop: boolean) => void;
}

const COLORS = [
  { hex: '#000000', name: 'Black' },
  { hex: '#7f1d1d', name: 'Red' }, // Matches App.tsx rojas (Red-900)
  { hex: '#1e3a8a', name: 'Blue' }, // Matches App.tsx azules (Blue-900)
  { hex: '#4c1d95', name: 'Violet' }, // Matches App.tsx violetas (Violet-900)
  { hex: '#14532d', name: 'Green' }, // Matches App.tsx verdes (Green-900)
];

export const ComparisonViewer: React.FC<ComparisonViewerProps> = ({
  originalImage,
  stencilImage,
  opacity,
  setOpacity,
  onStencilUpdate,
  activeTool,
  zoom,
  setZoom,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onToggleTool,
  generationCount,
  externalSelectedColor,
  viewMode,
  setViewMode,
  isStencilOnTop,
  setIsStencilOnTop
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  const [sliderPosition, setSliderPosition] = useState(50);
  const isDraggingSlider = useRef(false);
  
  // Tool Settings
  const [selectedColor, setSelectedColor] = useState('#7f1d1d');
  const [pencilSize, setPencilSize] = useState(3);
  const [pencilOpacity, setPencilOpacity] = useState(100);
  const [eraserSize, setEraserSize] = useState(12);

  // Panning refs
  const isPanning = useRef(false);
  const startPan = useRef({ x: 0, y: 0 });
  const startScroll = useRef({ left: 0, top: 0 });

  // Sync internal color with external prop if provided
  useEffect(() => {
      if (externalSelectedColor) {
          setSelectedColor(externalSelectedColor);
      }
  }, [externalSelectedColor]);

  // Reset to Split View and center slider when a new generation occurs
  useEffect(() => {
    if (generationCount > 0) {
      setViewMode('split');
      setSliderPosition(50);
      setIsStencilOnTop(false); // Reset layer order
    }
  }, [generationCount, setViewMode, setIsStencilOnTop]);

  // Initialize Canvas
  useEffect(() => {
    if (canvasRef.current && stencilImage) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.src = stencilImage;
      img.onload = () => {
        // Set canvas size to match the image's intrinsic resolution for high quality
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
      };
    }
  }, [stencilImage, viewMode, isStencilOnTop]); // Redraw when view or layer order changes

  // Drawing / Eraser Logic
  const getPoint = (e: React.PointerEvent<HTMLCanvasElement> | PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, pressure: 0.5, tiltX: 0, tiltY: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
      pressure: e.pressure || 0.5, // Default pressure if device doesn't support it
      tiltX: e.tiltX,
      tiltY: e.tiltY
    };
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Prevent drawing if panning or no tool selected
    if (!activeTool || activeTool === 'pan') return;
    
    isDrawing.current = true;
    (e.target as Element).setPointerCapture(e.pointerId);

    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      const { x, y } = getPoint(e);
      ctx.moveTo(x, y);
      draw(e); // Draw initial dot
    }
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !canvasRef.current || !activeTool) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // High-fidelity: Use coalesced events if available
    // This captures points that occurred between frames (120Hz+ on iPad Pro)
    const nativeEvent = e.nativeEvent;
    const events = nativeEvent.getCoalescedEvents ? nativeEvent.getCoalescedEvents() : [nativeEvent];

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (const event of events) {
        const { x, y, pressure, tiltX, tiltY } = getPoint(event);
        
        if (activeTool === 'eraser') {
            // Eraser settings
            ctx.globalCompositeOperation = 'destination-out';
            ctx.globalAlpha = 1.0; // Ensure full strength erasing
            const baseSize = eraserSize;
            const p = pressure === 0 && event.pointerType === 'mouse' ? 0.5 : pressure;
            ctx.lineWidth = Math.max(1, baseSize + (p * 20));
        } else if (activeTool === 'pencil') {
            // Pencil settings
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = selectedColor; // Use selected color
            ctx.globalAlpha = pencilOpacity / 100; // Apply opacity
            
            let lineWidth = pencilSize; 
            
            // Pressure influence (Apple Pencil reports 0 to 1)
            // Standardize pressure: if 0 (mouse), treat as 0.5
            const p = pressure === 0 && event.pointerType === 'mouse' ? 0.5 : pressure;
            
            // Dynamic size based on pressure (Power curve for natural feel)
            lineWidth = Math.max(0.5, lineWidth * Math.pow(p, 1.5) * 2.5);

            // Tilt influence (Simulate shading angle)
            // Broaden line if tilted > 20 degrees
            const tilt = Math.max(Math.abs(tiltX || 0), Math.abs(tiltY || 0));
            if (tilt > 20) {
                 lineWidth = lineWidth * (1 + (tilt / 90));
            }

            ctx.lineWidth = lineWidth;
        }

        ctx.lineTo(x, y);
        ctx.stroke();
        
        // Optimization: start a new sub-path for smoother pressure curves and per-segment styling
        ctx.beginPath();
        ctx.moveTo(x, y);
    }
  };

  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDrawing.current && canvasRef.current && onStencilUpdate) {
      isDrawing.current = false;
      (e.target as Element).releasePointerCapture(e.pointerId);

      // Reset global alpha just in case
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) ctx.globalAlpha = 1.0;

      // Save changes
      onStencilUpdate(canvasRef.current.toDataURL('image/png'));
    }
    isDrawing.current = false;
  };

  // --- PANNING LOGIC (Grab and Move) ---
  const handlePanDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activeTool !== 'pan' || !containerRef.current) return;
    
    isPanning.current = true;
    startPan.current = { x: e.clientX, y: e.clientY };
    startScroll.current = { 
      left: containerRef.current.scrollLeft, 
      top: containerRef.current.scrollTop 
    };
    
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    e.currentTarget.style.cursor = 'grabbing';
  };

  const handlePanMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPanning.current || !containerRef.current) return;
    
    const dx = e.clientX - startPan.current.x;
    const dy = e.clientY - startPan.current.y;
    
    containerRef.current.scrollLeft = startScroll.current.left - dx;
    containerRef.current.scrollTop = startScroll.current.top - dy;
  };

  const handlePanUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isPanning.current = false;
    if (activeTool === 'pan') {
        e.currentTarget.style.cursor = 'grab';
    }
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // --- SLIDER DRAG LOGIC ---
  const handleSliderDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingSlider.current = true;
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handleSliderMove = (e: React.PointerEvent) => {
    if (isDraggingSlider.current && containerRef.current) {
        e.preventDefault();
        e.stopPropagation();
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setSliderPosition(pos);
    }
  };

  const handleSliderUp = (e: React.PointerEvent) => {
    if (isDraggingSlider.current) {
        e.preventDefault();
        e.stopPropagation();
        isDraggingSlider.current = false;
        (e.target as Element).releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative">
      {/* Main Image Container with Pan support */}
      <div 
        ref={containerRef}
        className={`w-full h-full overflow-auto no-scrollbar relative bg-zinc-900/50 ${activeTool === 'pan' ? 'cursor-grab' : ''}`}
        onPointerDown={handlePanDown}
        onPointerMove={handlePanMove}
        onPointerUp={handlePanUp}
        onPointerLeave={handlePanUp}
      >
        <div 
            className="relative origin-top-left transition-transform duration-75 ease-out"
            style={{ 
                width: '100%', 
                height: '100%',
                transform: `scale(${zoom})`,
                transformOrigin: '0 0' 
            }}
        >
            {/* View Mode: Split */}
            {viewMode === 'split' && (
                <>
                    <div className="absolute inset-0">
                        {/* Background: Original Image */}
                        <img src={originalImage} alt="Original" className="w-full h-full object-contain select-none pointer-events-none" />
                    </div>
                    
                    {/* Foreground: Stencil (Clipped) */}
                    {/* Using clip-path to prevent image squishing */}
                    <div 
                        className="absolute inset-0 bg-white"
                        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                    >
                        <canvas 
                            ref={canvasRef}
                            className="w-full h-full object-contain select-none"
                            style={{ touchAction: 'none' }}
                            onPointerDown={startDrawing}
                            onPointerMove={draw}
                            onPointerUp={stopDrawing}
                        />
                    </div>
                    
                    {/* Labels */}
                    <div 
                        className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-xs font-medium pointer-events-none z-10"
                    >
                        Stencil
                    </div>
                    <div 
                        className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-xs font-medium pointer-events-none z-10"
                    >
                        Original
                    </div>

                    {/* Interactive Slider Handle */}
                    <div 
                        className="absolute top-0 bottom-0 w-1 bg-red-500 cursor-ew-resize z-30 hover:bg-red-400 transition-colors"
                        style={{ left: `${sliderPosition}%`, transform: `scaleX(${1/zoom})` }} 
                        onPointerDown={handleSliderDown}
                        onPointerMove={handleSliderMove}
                        onPointerUp={handleSliderUp}
                    >
                         <div 
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full border-2 border-red-500 shadow-lg flex items-center justify-center"
                            style={{ transform: `translate(-50%, -50%) scale(${1/zoom})` }}
                        >
                            <ArrowsUpDownIcon className="w-5 h-5 text-red-500 rotate-90" />
                        </div>
                    </div>
                </>
            )}

            {/* View Mode: Overlay */}
            {viewMode === 'overlay' && (
                <div className="relative w-full h-full">
                    {/* Layer 1 (Bottom) */}
                    <div className="absolute inset-0">
                        {isStencilOnTop ? (
                            <img src={originalImage} alt="Original" className="w-full h-full object-contain select-none pointer-events-none" />
                        ) : (
                             <div className="w-full h-full bg-white">
                                <canvas 
                                    ref={canvasRef}
                                    className="w-full h-full object-contain select-none"
                                    style={{ touchAction: 'none' }}
                                    onPointerDown={startDrawing}
                                    onPointerMove={draw}
                                    onPointerUp={stopDrawing}
                                />
                             </div>
                        )}
                    </div>

                    {/* Layer 2 (Top) */}
                    <div 
                        className="absolute inset-0 pointer-events-none"
                        style={{ opacity: opacity / 100 }}
                    >
                         {isStencilOnTop ? (
                             <div className="w-full h-full pointer-events-auto">
                                <canvas 
                                    ref={canvasRef}
                                    className="w-full h-full object-contain select-none"
                                    style={{ touchAction: 'none' }}
                                    onPointerDown={startDrawing}
                                    onPointerMove={draw}
                                    onPointerUp={stopDrawing}
                                />
                             </div>
                         ) : (
                             <img src={originalImage} alt="Original" className="w-full h-full object-contain select-none" />
                         )}
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Floating Controls (View Toggle, Opacity) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-zinc-900/90 px-6 py-3 rounded-full border border-zinc-800 shadow-xl backdrop-blur-md z-20">
         
         {/* View Toggle */}
         <div className="flex items-center bg-zinc-800 rounded-lg p-1 mr-2">
            <button 
                onClick={() => setViewMode('split')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'split' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'}`}
                title="Split View"
            >
                <SplitIcon className="w-5 h-5" />
            </button>
            <button 
                onClick={() => setViewMode('overlay')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'overlay' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'}`}
                title="Overlay View"
            >
                <OverlayIcon className="w-5 h-5" />
            </button>
         </div>

         {/* Swap Layers (Only for Overlay) */}
         {viewMode === 'overlay' && (
             <button 
                onClick={() => setIsStencilOnTop(!isStencilOnTop)}
                className="p-2 text-white hover:text-red-400 transition-colors mr-2"
                title="Swap Layers"
             >
                <SwapLayersIcon className="w-5 h-5" />
             </button>
         )}

         {/* Opacity Slider (Overlay Only) */}
         {viewMode === 'overlay' && (
             <>
                 <div className="w-px h-8 bg-zinc-700 mx-2"></div>
                 <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white w-6">Op</span>
                    <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={opacity} 
                        onChange={(e) => setOpacity(Number(e.target.value))}
                        className="w-24 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                    />
                 </div>
             </>
         )}
      </div>

      {/* Tool Bar (Vertical Right) */}
      <div className="absolute top-1/2 right-4 -translate-y-1/2 flex flex-col gap-2 bg-zinc-900/90 p-2 rounded-xl border border-zinc-800 shadow-xl backdrop-blur-md z-20">
         <button 
            onClick={() => onToggleTool('pencil')}
            className={`p-3 rounded-lg transition-all ${activeTool === 'pencil' ? 'bg-red-500 text-white' : 'text-white/60 hover:text-white hover:bg-zinc-800'}`}
            title="Pencil Tool"
         >
            <PencilIcon className="w-6 h-6" />
         </button>
         <button 
            onClick={() => onToggleTool('eraser')}
            className={`p-3 rounded-lg transition-all ${activeTool === 'eraser' ? 'bg-red-500 text-white' : 'text-white/60 hover:text-white hover:bg-zinc-800'}`}
            title="Eraser Tool"
         >
            <EraserIcon className="w-6 h-6" />
         </button>
         <button 
            onClick={() => onToggleTool('pan')}
            className={`p-3 rounded-lg transition-all ${activeTool === 'pan' ? 'bg-red-500 text-white' : 'text-white/60 hover:text-white hover:bg-zinc-800'}`}
            title="Pan Tool"
         >
            <MoveIcon className="w-6 h-6" />
         </button>
         
         <div className="h-px w-full bg-zinc-700 my-1"></div>

         <button 
            onClick={onUndo}
            disabled={!canUndo}
            className="p-3 rounded-lg text-white/60 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            title="Undo"
         >
            <UndoIcon className="w-6 h-6" />
         </button>
         <button 
            onClick={onRedo}
            disabled={!canRedo}
            className="p-3 rounded-lg text-white/60 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            title="Redo"
         >
            <RedoIcon className="w-6 h-6" />
         </button>

         {/* Zoom Slider (Added Here) */}
         <div className="h-px w-full bg-zinc-700 my-1"></div>
         <div className="flex flex-col items-center gap-1">
             <span className="text-[10px] font-bold text-white">ZM</span>
             <div className="h-24 relative flex items-center justify-center bg-zinc-800 rounded-full w-8 py-2">
                <input 
                    type="range" 
                    min="0" 
                    max="10" 
                    step="0.1"
                    value={zoom} 
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="appearance-none w-1 h-20 bg-zinc-600 rounded-full outline-none"
                    style={{ writingMode: 'vertical-lr', direction: 'rtl', WebkitAppearance: 'slider-vertical' } as any} 
                />
             </div>
         </div>
      </div>

      {/* Pencil Tool Options Panel */}
      {activeTool === 'pencil' && (
          <div className="absolute right-20 top-1/2 -translate-y-1/2 flex flex-col gap-4 bg-zinc-900/90 p-4 rounded-2xl border border-zinc-800 shadow-xl backdrop-blur-md animate-in slide-in-from-right-4 z-20">
            {/* Color Palette */}
            <div className="flex flex-col gap-2">
                {COLORS.map((color) => (
                    <button
                        key={color.hex}
                        onClick={() => setSelectedColor(color.hex)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === color.hex ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                    />
                ))}
            </div>

            <div className="h-px w-full bg-zinc-700 my-1"></div>

            {/* Sliders Container */}
            <div className="flex gap-4 justify-center">
                {/* Size Slider */}
                <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-white">Size</span>
                    <div className="h-32 relative flex items-center justify-center bg-zinc-800 rounded-full w-6 py-2">
                        <input 
                            type="range" 
                            min="1" 
                            max="20" 
                            value={pencilSize} 
                            onChange={(e) => setPencilSize(Number(e.target.value))}
                            className="appearance-none w-1 h-24 bg-zinc-600 rounded-full outline-none"
                            style={{ writingMode: 'vertical-lr', direction: 'rtl', WebkitAppearance: 'slider-vertical' } as any} 
                        />
                    </div>
                </div>

                {/* Opacity Slider */}
                <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-white">Opac</span>
                    <div className="h-32 relative flex items-center justify-center bg-zinc-800 rounded-full w-6 py-2">
                        <input 
                            type="range" 
                            min="1" 
                            max="100" 
                            value={pencilOpacity} 
                            onChange={(e) => setPencilOpacity(Number(e.target.value))}
                            className="appearance-none w-1 h-24 bg-zinc-600 rounded-full outline-none"
                            style={{ writingMode: 'vertical-lr', direction: 'rtl', WebkitAppearance: 'slider-vertical' } as any} 
                        />
                    </div>
                </div>
            </div>

            {/* Preview Dot */}
            <div className="flex items-center justify-center h-10 mt-1">
                <div 
                    className="rounded-full transition-all duration-200 shadow-sm shadow-white/10"
                    style={{
                        width: Math.max(4, pencilSize * 2),
                        height: Math.max(4, pencilSize * 2),
                        backgroundColor: selectedColor,
                        opacity: pencilOpacity / 100
                    }}
                />
            </div>
          </div>
      )}

      {/* Eraser Tool Options Panel */}
      {activeTool === 'eraser' && (
          <div className="absolute right-20 top-1/2 -translate-y-1/2 flex flex-col gap-4 bg-zinc-900/90 p-4 rounded-2xl border border-zinc-800 shadow-xl backdrop-blur-md animate-in slide-in-from-right-4 z-20">
            <div className="flex gap-4 justify-center">
                {/* Size Slider */}
                <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-white">Size</span>
                    <div className="h-32 relative flex items-center justify-center bg-zinc-800 rounded-full w-6 py-2">
                        <input 
                            type="range" 
                            min="3" 
                            max="50" 
                            value={eraserSize} 
                            onChange={(e) => setEraserSize(Number(e.target.value))}
                            className="appearance-none w-1 h-24 bg-zinc-600 rounded-full outline-none"
                            style={{ writingMode: 'vertical-lr', direction: 'rtl', WebkitAppearance: 'slider-vertical' } as any} 
                        />
                    </div>
                </div>
            </div>

            {/* Preview Dot */}
            <div className="flex items-center justify-center h-16 mt-1 w-16">
                <div 
                    className="rounded-full border-2 border-white/50 bg-white/10 backdrop-invert transition-all duration-200"
                    style={{
                        width: eraserSize,
                        height: eraserSize,
                    }}
                />
            </div>
          </div>
      )}
    </div>
  );
};
