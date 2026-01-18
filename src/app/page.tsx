"use client";

import React from 'react';
import { useStore } from '@/store/useStore';
import Cockpit from '@/components/layout/Cockpit';
import LeftSidebar from '@/components/layout/LeftSidebar';
import RightSidebar from '@/components/layout/RightSidebar';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Home() {
  const { isLeftSidebarOpen, isRightSidebarOpen, toggleLeftSidebar, toggleRightSidebar } = useStore();

  return (
    <main className="flex h-screen w-full overflow-hidden font-sans relative">
      {/* Background Dot Pattern (Nothing Style) */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" 
           style={{backgroundImage: 'radial-gradient(#A8A49C 1.5px, transparent 1.5px)', backgroundSize: '32px 32px'}} />
      
      {/* LEFT SIDEBAR TRANSITION WRAPPER */}
      <div className={`relative z-10 h-full transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${isLeftSidebarOpen ? 'w-[22rem] opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}>
        <div className="w-[22rem] h-full"> 
           <LeftSidebar />
        </div>
      </div>

      {/* CENTER: THE COCKPIT */}
      <section className="flex-1 flex flex-col relative h-full min-w-0 z-10 p-2 sm:p-4 gap-4">
         
         {/* LEFT TOGGLE */}
         <button 
           onClick={toggleLeftSidebar}
           className="absolute left-0 top-1/2 -translate-y-1/2 z-20 py-10 pl-1 pr-2 bg-white/40 backdrop-blur-md border border-l-0 border-white/60 rounded-r-2xl text-clay-900 hover:bg-white/80 transition-all shadow-[4px_0_10px_-2px_rgba(0,0,0,0.05)] hover:shadow-[6px_0_15px_-2px_rgba(0,0,0,0.1)] group"
           title="Toggle Sidebar"
         >
           <div className="bg-clay-900/5 group-hover:bg-crimson/10 rounded-full p-0.5 transition-colors">
             {isLeftSidebarOpen ? <ChevronLeft size={16} className="text-clay-500 group-hover:text-crimson" /> : <ChevronRight size={16} className="text-clay-500 group-hover:text-crimson" />}
           </div>
         </button>

         <Cockpit />

         {/* RIGHT TOGGLE */}
         <button 
           onClick={toggleRightSidebar}
           className="absolute right-0 top-1/2 -translate-y-1/2 z-20 py-10 pr-1 pl-2 bg-white/40 backdrop-blur-md border border-r-0 border-white/60 rounded-l-2xl text-clay-900 hover:bg-white/80 transition-all shadow-[-4px_0_10px_-2px_rgba(0,0,0,0.05)] hover:shadow-[-6px_0_15px_-2px_rgba(0,0,0,0.1)] group"
           title="Toggle Sidebar"
         >
           <div className="bg-clay-900/5 group-hover:bg-crimson/10 rounded-full p-0.5 transition-colors">
              {isRightSidebarOpen ? <ChevronRight size={16} className="text-clay-500 group-hover:text-crimson" /> : <ChevronLeft size={16} className="text-clay-500 group-hover:text-crimson" />}
           </div>
         </button>

      </section>

      {/* RIGHT SIDEBAR TRANSITION WRAPPER */}
      <div className={`relative z-10 h-full transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${isRightSidebarOpen ? 'w-[22rem] opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}>
        <div className="w-[22rem] h-full">
           <RightSidebar />
        </div>
      </div>

    </main>
  );
}
