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
    <main className="flex h-screen w-full bg-black text-foreground overflow-hidden font-sans">
      
      {/* LEFT SIDEBAR TRANSITION WRAPPER */}
      <div className={`h-full transition-all duration-300 ease-in-out overflow-hidden border-r border-slate-800 ${isLeftSidebarOpen ? 'w-80 opacity-100' : 'w-0 opacity-0 border-none'}`}>
        <div className="w-80 h-full"> {/* Inner fixed width container to prevent content squishing */}
           <LeftSidebar />
        </div>
      </div>

      {/* CENTER: THE COCKPIT */}
      <section className="flex-1 flex flex-col relative h-full min-w-0 bg-slate-950">
         
         {/* LEFT TOGGLE */}
         <button 
           onClick={toggleLeftSidebar}
           className="absolute left-0 top-1/2 -translate-y-1/2 z-50 py-4 pl-1 pr-2 bg-slate-900/50 border-y border-r border-slate-700 rounded-r-xl hover:bg-neon-green hover:text-black transition-all text-slate-500 backdrop-blur-sm"
           title="Toggle Sidebar"
         >
           {isLeftSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
         </button>

         <Cockpit />

         {/* RIGHT TOGGLE */}
         <button 
           onClick={toggleRightSidebar}
           className="absolute right-0 top-1/2 -translate-y-1/2 z-50 py-4 pr-1 pl-2 bg-slate-900/50 border-y border-l border-slate-700 rounded-l-xl hover:bg-neon-green hover:text-black transition-all text-slate-500 backdrop-blur-sm"
           title="Toggle Sidebar"
         >
           {isRightSidebarOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
         </button>

      </section>

      {/* RIGHT SIDEBAR TRANSITION WRAPPER */}
      <div className={`h-full transition-all duration-300 ease-in-out overflow-hidden border-l border-slate-800 ${isRightSidebarOpen ? 'w-80 opacity-100' : 'w-0 opacity-0 border-none'}`}>
        <div className="w-80 h-full">
           <RightSidebar />
        </div>
      </div>

    </main>
  );
}
