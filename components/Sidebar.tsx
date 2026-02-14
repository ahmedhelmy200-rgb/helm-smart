import React, { useMemo, useState } from 'react';
import { ICONS } from '../constants';
import { SystemConfig, UserRole } from '../types';
import { hasPerm } from '../services/rbac';

type SidebarProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  config?: SystemConfig;
  userRole: UserRole | null;
  onLogout: () => void;
};

type Item = { id: string; label: string; icon: any; perm?: Parameters<typeof hasPerm>[1]; hide?: boolean };

export default function Sidebar({ activeTab, setActiveTab, config, userRole, onLogout }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const primary = config?.primaryColor || '#0f172a';
  const secondary = config?.secondaryColor || '#d4af37';
  const fontFamily = config?.fontFamily || 'Cairo';

  const features = config?.features || { enableAI: true, enableAnalysis: true, enableWhatsApp: true };

  const menu: Item[] = useMemo(() => {
    const base: Item[] = [
      { id: 'dashboard', label: 'الرئيسية', icon: ICONS.Dashboard, perm: 'view_dashboard' },
      { id: 'cases', label: 'القضايا', icon: ICONS.Cases, perm: 'manage_cases' },
      { id: 'clients', label: 'الموكلين', icon: ICONS.Clients, perm: 'manage_clients' },
      { id: 'accounting', label: 'المالية', icon: () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ), perm: 'manage_accounting' },
      { id: 'reminders', label: 'التذكيرات', icon: () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ), perm: 'manage_reminders' },
      { id: 'search', label: 'بحث شامل', icon: () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ), perm: 'view_dashboard' },
      ...(features.enableAI ? [{ id: 'ai-consultant', label: 'المستشار الذكي', icon: ICONS.AI, perm: 'view_ai' as const }] : []),
      ...(features.enableAnalysis ? [{ id: 'smart-analysis', label: 'تحليل مستندات', icon: ICONS.DocumentScanner, perm: 'manage_documents' as const }] : []),
      { id: 'links', label: 'روابط', icon: ICONS.Links, perm: 'view_dashboard' },
      { id: 'settings', label: 'الإعدادات', icon: () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ), perm: 'manage_settings' },
    ];
    return base.filter((i) => !i.hide).filter((i) => (i.perm ? hasPerm(userRole, i.perm) : true));
  }, [features.enableAI, features.enableAnalysis]);

  const styles: React.CSSProperties = {
    backgroundColor: primary,
    fontFamily,
    ['--primary' as any]: primary,
    ['--secondary' as any]: secondary,
  };

  const NavContent = (
    <div className="h-full flex flex-col" style={styles}>
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center overflow-hidden">
            {config?.logo ? (
              <img src={config.logo} alt="logo" className="w-full h-full object-contain p-1" />
            ) : (
              <ICONS.Logo className="w-8 h-8" />
            )}
          </div>
          <div className="min-w-0">
            <div className="text-white font-black truncate">{config?.officeName || 'HELM Smart'}</div>
            <div className="text-[10px] text-[var(--secondary)] font-black uppercase tracking-widest opacity-90">LEGAL SYSTEM</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {menu.map((item) => {
          const Active = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileOpen(false);
              }}
              className={
                `w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition border ` +
                (Active
                  ? 'bg-white/10 border-white/10 text-white'
                  : 'border-transparent text-slate-300 hover:bg-white/5 hover:text-white')
              }
            >
              <span className={Active ? 'text-[var(--secondary)]' : 'text-slate-400'}><Icon /></span>
              <span className="font-bold text-sm truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-3 border-t border-white/10">
        <button
          onClick={() => {
            if (confirm('هل أنت متأكد من تسجيل الخروج؟')) onLogout();
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-red-500/10 text-red-300 hover:bg-red-500/20 border border-red-500/20 font-black"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
          خروج
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 z-40 flex items-center justify-between px-4 border-b border-slate-200 bg-white/90 backdrop-blur print:hidden">
        <button onClick={() => setMobileOpen(true)} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200">
          <svg className="w-6 h-6 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <div className="text-slate-900 font-black truncate">{config?.officeName || 'HELM Smart'}</div>
        <div className="w-10" />
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed top-0 right-0 w-[280px] h-screen z-40 print:hidden" style={styles}>
        {NavContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 print:hidden">
          <div className="absolute inset-0 bg-slate-900/60" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 right-0 h-full w-[86vw] max-w-[320px] shadow-2xl">
            {NavContent}
          </div>
        </div>
      )}
    </>
  );
}
