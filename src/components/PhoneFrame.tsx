import React from 'react';

interface PhoneFrameProps {
  children: React.ReactNode;
}

export default function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center font-sans antialiased bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(249,115,22,0.08),rgba(255,255,255,0))]">
      {/* 
        Responsive Container:
        - On mobile (<md), it is 100% fullscreen with no borders or rounded corners, perfectly fitting real devices.
        - On desktop (>=md), it is constrained to max-w-[412px] and 92vh, featuring a premium thin bezel, elegant rounded-3xl corners, and a deep shadow.
      */}
      <div className="w-full h-screen md:h-[90vh] md:max-w-[412px] md:rounded-[40px] bg-slate-900 border-0 md:border-[8px] md:border-slate-800/80 md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden relative flex flex-col transition-all duration-300">
        
        {/* Main Content Screen */}
        <div className="flex-1 relative flex flex-col overflow-hidden">
          {children}
        </div>
        
      </div>
    </div>
  );
}
