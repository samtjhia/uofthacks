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
    <main className="flex h-screen w-full bg-slate-950 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-foreground overflow-hidden font-sans">
      
      {/* LEFT SIDEBAR TRANSITION WRAPPER */}
      <div className={`h-full transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] overflow-hidden border-r border-white/5 ${isLeftSidebarOpen ? 'w-80 opacity-100' : 'w-0 opacity-0 border-none'}`}>
        <div className="w-80 h-full bg-slate-950/40 backdrop-blur-xl">
           <LeftSidebar />
        </div>
      </div>

      {/* CENTER: THE COCKPIT */}
      <section className="flex-1 flex flex-col relative h-full min-w-0">
         
         {/* LEFT TOGGLE */}
         <button 
           onClick={toggleLeftSidebar}
           className="absolute left-0 top-1/2 -translate-y-1/2 z-50 py-8 pl-1 pr-2 bg-slate-800/80 backdrop-blur-md border-y border-r border-white/5 rounded-r-3xl text-white hover:bg-slate-700 hover:pl-2 transition-all shadow-xl shadow-black/20"
           title="Toggle Sidebar"
         >
           {isLeftSidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
         </button>

         <Cockpit />

         {/* RIGHT TOGGLE */}
         <button 
           onClick={toggleRightSidebar}
           className="absolute right-0 top-1/2 -translate-y-1/2 z-50 py-8 pr-1 pl-2 bg-slate-800/80 backdrop-blur-md border-y border-l border-white/5 rounded-l-3xl text-white hover:bg-slate-700 hover:pr-2 transition-all shadow-xl shadow-black/20"
           title="Toggle Sidebar"
         >
           {isRightSidebarOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
         </button>

      </section>

      {/* RIGHT SIDEBAR TRANSITION WRAPPER */}
      <div className={`h-full transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] overflow-hidden border-l border-white/5 ${isRightSidebarOpen ? 'w-80 opacity-100' : 'w-0 opacity-0 border-none'}`}>
        <div className="w-80 h-full bg-slate-950/40 backdrop-blur-xl">
           <RightSidebar />
        </div>
      </div>

    </main>
  );
}
