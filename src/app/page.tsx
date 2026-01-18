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
    <main className="flex h-screen w-full bg-clay-100 bg-dot-pattern text-clay-900 overflow-hidden font-sans p-3 gap-3">
      
      {/* LEFT SIDEBAR TRANSITION WRAPPER */}
      <div className={`h-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isLeftSidebarOpen ? 'w-[320px] opacity-100 translate-x-0' : 'w-0 opacity-0 -translate-x-10'}`}>
        <div className="w-[320px] h-full rounded-[2.5rem] overflow-hidden shadow-2xl shadow-clay-400/20 glass-panel border border-white/60">
           <LeftSidebar />
        </div>
      </div>

      {/* CENTER: THE COCKPIT */}
      <section className="flex-1 flex flex-col relative h-full min-w-0 rounded-[2.5rem] bg-white/40 shadow-xl shadow-clay-400/10 border border-white/60 backdrop-blur-3xl overflow-hidden">
         
         {/* LEFT TOGGLE (Floating) */}
         <button 
           onClick={toggleLeftSidebar}
           className={`absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/80 backdrop-blur-xl border border-white shadow-lg text-clay-900 hover:scale-110 transition-all ${isLeftSidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
           title="Toggle Sidebar"
         >
           <ChevronRight className="w-5 h-5 opacity-60" />
         </button>

         {/* RIGHT TOGGLE (Floating) */}
         <button 
           onClick={toggleRightSidebar}
           className={`absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/80 backdrop-blur-xl border border-white shadow-lg text-clay-900 hover:scale-110 transition-all ${isRightSidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
           title="Toggle Sidebar"
         >
           <ChevronLeft className="w-5 h-5 opacity-60" />
         </button>

         <Cockpit />

      </section>

      {/* RIGHT SIDEBAR TRANSITION WRAPPER */}
      <div className={`h-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isRightSidebarOpen ? 'w-[360px] opacity-100 translate-x-0' : 'w-0 opacity-0 translate-x-10'}`}>
        <div className="w-[360px] h-full rounded-[2.5rem] overflow-hidden shadow-2xl shadow-clay-400/20 glass-panel border border-white/60">
           <RightSidebar />
        </div>
      </div>

    </main>
  );
}
