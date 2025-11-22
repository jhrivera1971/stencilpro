import React from 'react';

export const StepGuide: React.FC = () => {
  return (
    <div className="py-6">
       <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-500">
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 0 1 .67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 1 1-.671-1.34l.041-.022ZM12 9a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
        </svg>
        Step by step to follow
       </h3>
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg">
            <div className="w-8 h-8 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center font-bold mb-3">1</div>
            <h4 className="text-zinc-200 font-medium mb-1">Upload Photo</h4>
            <p className="text-sm text-zinc-500">Select a clear photo of the subject you want to tattoo.</p>
         </div>
         <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg">
            <div className="w-8 h-8 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center font-bold mb-3">2</div>
            <h4 className="text-zinc-200 font-medium mb-1">Generate Stencil</h4>
            <p className="text-sm text-zinc-500">Our AI creates a clean, red-line stencil ready for thermal printing.</p>
         </div>
         <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg">
            <div className="w-8 h-8 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center font-bold mb-3">3</div>
            <h4 className="text-zinc-200 font-medium mb-1">Transfer & Print</h4>
            <p className="text-sm text-zinc-500">Download the PNG or copy directly to Procreate for final touches.</p>
         </div>
       </div>
    </div>
  );
};