
import React from 'react';
import { ICONS } from '../constants';
import { SystemConfig } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  config?: SystemConfig;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, config, onLogout }) => {
  // Config Defaults
  const primaryColor = config?.primaryColor || '#0f172a';
  const secondaryColor = config?.secondaryColor || '#d4af37';
  const fontFamily = config?.fontFamily || 'Cairo';
  const features = config?.features || { enableAI: true, enableAnalysis: true };

  // Define CSS variables for dynamic styling within Tailwind arbitrary values
  const dynamicStyles = {
    backgroundColor: primaryColor,
    '--primary': primaryColor,
    '--secondary': secondaryColor,
    fontFamily: fontFamily,
  } as React.CSSProperties;

  const menuItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: ICONS.Dashboard },
    { id: 'cases', label: 'القضايا', icon: ICONS.Cases },
    { id: 'clients', label: 'الموكلين', icon: ICONS.Clients },
    { id: 'accounting', label: 'المالية', icon: () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
  ];

  const toolsItems = [
    { id: 'search', label: 'بحث شامل', icon: () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    )},
    ...(features.enableAI ? [{ id: 'ai-consultant', label: 'المستشار الذكي', icon: ICONS.AI }] : []),
    ...(features.enableAnalysis ? [{ id: 'smart-analysis', label: 'تحليل مستندات', icon: ICONS.DocumentScanner }] : []),
    { id: 'links', label: 'روابط', icon: ICONS.Links },
    { id: 'settings', label: 'الإعدادات', icon: () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
      </svg>
    )},
  ];

  return (
    <nav 
      className="fixed top-0 left-0 right-0 h-24 flex items-center z-50 print:hidden shadow-2xl transition-all duration-300 border-b border-white/5"
      style={dynamicStyles}
    >
      <div className="w-full max-w-[1920px] mx-auto px-6 flex items-center justify-between h-full">
        
        {/* 1. BRANDING (Right) */}
        <div className="flex items-center gap-4 shrink-0 min-w-[200px]">
           <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/10 shadow-lg backdrop-blur-sm relative group cursor-help">
             {config?.logo ? (
                <img src={config.logo} alt="Logo" className="w-full h-full object-contain p-1" />
              ) : (
                <ICONS.Logo className="w-8 h-8" />
              )}
             {/* Tooltip */}
             <span className="absolute top-full mt-3 left-1/2 -translate-x-1/2 bg-[#1e293b] text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10 shadow-xl z-50" style={{ fontFamily }}>
               {config?.officeName || 'Legal System'}
             </span>
           </div>
           <div className="hidden lg:block">
              <h1 className="text-white font-black text-lg tracking-tight leading-none">{config?.officeName}</h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-0.5 w-4 bg-[var(--secondary)]"></div>
                <p className="text-[var(--secondary)] text-[10px] font-black uppercase tracking-[0.2em] opacity-90">LEGAL SYSTEM</p>
              </div>
           </div>
        </div>

        {/* 2. MAIN NAVIGATION (Center) */}
        <div className="flex-1 flex justify-center items-center h-full px-4 overflow-x-auto custom-scroll-hide">
           <div className="flex items-center gap-2 bg-black/20 p-1.5 rounded-2xl border border-white/5 backdrop-blur-sm">
             {menuItems.map((item) => (
                <button
                   key={item.id}
                   onClick={() => setActiveTab(item.id)}
                   className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden
                      ${activeTab === item.id 
                      ? 'bg-gradient-to-r from-[var(--secondary)] to-[var(--secondary)] text-[var(--primary)] shadow-lg font-black' 
                      : 'text-slate-300 hover:bg-white/5 hover:text-white font-bold'
                      }
                   `}
                >
                   <div className={`relative z-10 ${activeTab === item.id ? 'text-[var(--primary)]' : 'text-slate-400 group-hover:text-[var(--secondary)]'}`}>
                      <item.icon />
                   </div>
                   <span className="text-sm relative z-10 whitespace-nowrap">{item.label}</span>
                </button>
             ))}
           </div>
        </div>

        {/* 3. TOOLS & LOGOUT (Left) */}
        <div className="flex items-center gap-2 shrink-0 justify-end min-w-[200px]">
           <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
              {toolsItems.map((item) => (
                 <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`p-2.5 rounded-lg transition-all duration-300 relative group
                       ${activeTab === item.id 
                       ? 'bg-white/10 text-[var(--secondary)] shadow-inner' 
                       : 'text-slate-400 hover:bg-white/10 hover:text-[var(--secondary)]'
                       }
                    `}
                    title={item.label}
                 >
                    <item.icon />
                    {/* Tooltip */}
                    <span className="absolute top-full mt-3 left-1/2 -translate-x-1/2 bg-[#1e293b] text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10 shadow-xl z-50" style={{ fontFamily }}>
                      {item.label}
                    </span>
                 </button>
              ))}
           </div>
           
           <div className="w-px h-8 bg-white/10 mx-2"></div>

           <button
              onClick={() => {
                  if(confirm('هل أنت متأكد من تسجيل الخروج؟')) onLogout();
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all border border-transparent hover:border-red-500/20 group"
              title="تسجيل الخروج"
           >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
              <span className="hidden xl:inline text-xs font-bold">خروج</span>
           </button>
        </div>

      </div>
    </nav>
  );
};

export default Sidebar;
