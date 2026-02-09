import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AIConsultant from './components/AIConsultant';
import SmartDocumentAnalyzer from './components/SmartDocumentAnalyzer';
import CaseManagement from './components/CaseManagement';
import ClientManagement from './components/ClientManagement';
import Accounting from './components/Accounting';
import GlobalSearch from './components/GlobalSearch';
import ImportantLinks from './components/ImportantLinks';
import Settings from './components/Settings'; // New Component
import Login from './components/Login';
import { Analytics } from '@vercel/analytics/react';
import { isSupabaseEnabled } from './services/supabase';
import { kvGet, kvSet } from './services/cloudKv';
import { LegalCase, CaseStatus, CourtType, Client, Invoice, Expense, UserRole, SystemConfig, SystemLog } from './types';

// ... (Data Initialization constants remain same as previous file, omitted for brevity but assumed present)
// Re-declaring constants for completeness in this file context:
const INITIAL_CLIENTS: Client[] = [
  { id: "c_164a4d4bf193", name: "احمد ثروت", type: "Individual", email: "", phone: "", emiratesId: "", address: "", createdAt: "01/01/2025", totalCases: 0, tags: [], notes: "", profileImage: "https://placehold.co/400x400/0f172a/d4af37?text=ID+Img" },
  { id: "eid_784199298525710", name: "احمد حلمي", type: "Individual", email: "ahmedhelmy200@gmail.com", phone: "0544144149", emiratesId: "784199298525710", address: "", createdAt: "01/01/2025", totalCases: 0, tags: [], notes: "نوع الوكالة: وكالة خاصة بالقضايا | رقم الطلب: 563081 | تاريخ التقديم: 2025-10-27 | حالة الطلب: منجزة" },
  // ... (Assume other clients are here)
];
const INITIAL_CASES: LegalCase[] = [];
const INITIAL_EXPENSES: Expense[] = [];
const INITIAL_INVOICES: Invoice[] = [];

const INITIAL_CONFIG: SystemConfig = {
  officeName: 'أحمد حلمي',
  officeSlogan: 'للمحاماة والاستشارات القانونية',
  officePhone: '0544144149',
  officeEmail: 'ahmedhelmy200@gmail.com',
  officeAddress: 'العين - الإمارات العربية المتحدة',
  officeWebsite: 'helm.ae',
  primaryColor: '#0f172a',
  secondaryColor: '#d4af37',
  backgroundColor: '#f8fafc',
  fontFamily: 'Cairo',
  logo: null,
  stamp: null,
  services: [
    { id: 'srv1', name: 'استشارات قانونية', description: 'استشارة شفهية لمدة ساعة في المكتب', price: 1000 },
    { id: 'srv2', name: 'صياغة العقود', description: 'صياغة العقود التجارية والمدنية', price: 2500 }
  ],
  caseTypes: [
    { id: 'ct_personal', name: 'أحوال شخصية' },
    { id: 'ct_labor', name: 'عمالي' },
    { id: 'ct_civil', name: 'مدني' },
    { id: 'ct_commercial', name: 'تجاري' },
    { id: 'ct_criminal', name: 'جنائي' },
  ],
  invoiceTemplates: [
    { id: 'tpl_fees', title: 'دفعة أتعاب', content: 'دفعة من أتعاب المحاماة عن القضية رقم {caseNumber}' },
    { id: 'tpl_consult', title: 'استشارة قانونية', content: 'أتعاب استشارة قانونية بخصوص الموكل {clientName}' },
  ],
  smartTemplates: {
    whatsappInvoice:
      '*{officeName}*\n\nعزيزي/عزيزتي {clientName}\nنرفق لكم تفاصيل الفاتورة رقم: {invoiceNumber}\nالقيمة: {amount} د.إ\nالبيان: {description}\n\nيرجى التكرم بالسداد وشكرا لثقتكم.\n{officeName}',
    whatsappPaymentReminder:
      '*{officeName}*\n\nعزيزي/عزيزتي {clientName}\nنود تذكيركم بوجود مستحقات مالية بقيمة {due} د.إ.\nيرجى التواصل لتسوية المستحقات.\n\nمع التحية\n{officeName}',
    whatsappSessionReminder:
      '*{officeName}*\n\nعزيزي/عزيزتي {clientName}\nتذكير بموعد الجلسة القادمة.\nرقم القضية: {caseNumber}\nالمحكمة: {court}\nالتاريخ: {date}\n\nلأي استفسار يرجى التواصل.\n{officeName}',
    whatsappGeneral:
      '*{officeName}*\n\nمرحبا {clientName}\nنود الاطمئنان عليكم. هل لديكم أي استفسارات قانونية\n\n{officeName}',
    invoiceLineNote:
      'دفعة أتعاب عن القضية رقم: {caseNumber}',
    invoiceFooter:
      'يرجى إرسال نسخة من إيصال السداد/التحويل على واتساب المكتب.\n{officePhone} | {officeEmail} | {officeWebsite}',
    receiptFooter:
      'هذا السند محرر بواسطة نظام حلم الذكي لإدارة المكتب.\n{officePhone} | {officeEmail} | {officeWebsite}',
  },
  officeTemplates: [],
  invoiceFormatting: {
    prefix: 'INV-',
    suffix: '',
    nextSequence: 1001
  },
  features: {
    enableAI: true,
    enableAnalysis: true,
    enableWhatsApp: true
  }
};

const withSafeConfigDefaults = (saved: Partial<SystemConfig> | null): SystemConfig => {
  const merged: SystemConfig = saved ? ({ ...INITIAL_CONFIG, ...saved } as SystemConfig) : INITIAL_CONFIG;

  // Ensure non-empty, usable defaults even if user restored/cleared arrays
  if (!merged.caseTypes || merged.caseTypes.length === 0) merged.caseTypes = INITIAL_CONFIG.caseTypes;
  if (!merged.invoiceTemplates || merged.invoiceTemplates.length === 0) merged.invoiceTemplates = INITIAL_CONFIG.invoiceTemplates;
  if (!merged.smartTemplates) merged.smartTemplates = INITIAL_CONFIG.smartTemplates;

  return merged;
};

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loggedInClient, setLoggedInClient] = useState<Client | null>(null);

  // Admin Profile State
  const [adminProfile, setAdminProfile] = useState<{name: string, title: string} | null>(null);

  // Data State
  const [cases, setCases] = useState<LegalCase[]>(() => {
    const saved = localStorage.getItem('legalmaster_cases');
    return saved ? JSON.parse(saved) : INITIAL_CASES;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('legalmaster_clients');
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('legalmaster_invoices');
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('legalmaster_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [systemConfig, setSystemConfig] = useState<SystemConfig>(() => {
    const saved = localStorage.getItem('legalmaster_config');
    return withSafeConfigDefaults(saved ? JSON.parse(saved) : null);
  });

  // SYSTEM LOGS STATE
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>(() => {
    const savedLogs = localStorage.getItem('legalmaster_logs');
    return savedLogs ? JSON.parse(savedLogs) : [];
  });

  // Cloud Sync (Supabase KV)
  const [cloudEnabled, setCloudEnabled] = useState<boolean>(() => {
    return localStorage.getItem('legalmaster_cloud_enabled') === '1';
  });

  const [cloudStatus, setCloudStatus] = useState<{ lastPull?: string; lastPush?: string; lastError?: string }>({});
  const cloudReadyRef = useRef<boolean>(false);

  useEffect(() => {
    localStorage.setItem('legalmaster_cloud_enabled', cloudEnabled ? '1' : '0');
  }, [cloudEnabled]);

  // Persist Logic
  useEffect(() => localStorage.setItem('legalmaster_cases', JSON.stringify(cases)), [cases]);
  useEffect(() => localStorage.setItem('legalmaster_clients', JSON.stringify(clients)), [clients]);
  useEffect(() => localStorage.setItem('legalmaster_invoices', JSON.stringify(invoices)), [invoices]);
  useEffect(() => localStorage.setItem('legalmaster_expenses', JSON.stringify(expenses)), [expenses]);
  useEffect(() => localStorage.setItem('legalmaster_config', JSON.stringify(systemConfig)), [systemConfig]);
  useEffect(() => localStorage.setItem('legalmaster_logs', JSON.stringify(systemLogs)), [systemLogs]);

  /**
   * Data integrity guardrail:
   *  - Ensure every client has at least one case (so no invoice becomes "بدون قضية").
   *  - Ensure every invoice has a valid caseId/caseTitle linked to its client.
   *  - Dedupe expenses to avoid "تكرar المصاريف" when multiple imports happen.
   */
  useEffect(() => {
    // Build map of existing cases per client.
    const casesByClient = new Map<string, LegalCase[]>();
    for (const c of cases) {
      const arr = casesByClient.get(c.clientId) || [];
      arr.push(c);
      casesByClient.set(c.clientId, arr);
    }

    let casesChanged = false;
    let invoicesChanged = false;

    const newCases: LegalCase[] = [...cases];
    const defaultCaseIdByClient = new Map<string, LegalCase>();

    // Create default cases for clients that have none.
    clients.forEach((cl, idx) => {
      const existing = casesByClient.get(cl.id) || [];
      let chosen = existing[0];
      if (!chosen) {
        casesChanged = true;
        const num = String(idx + 1); // 1..N (editable later)
        chosen = {
          id: `auto_case_${cl.id}`,
          caseNumber: num,
          title: 'ملف افتراضي - متابعة مالية',
          clientId: cl.id,
          clientName: cl.name,
          opponentName: '',
          court: CourtType.DUBAI,
          status: CaseStatus.ACTIVE,
          nextHearingDate: '',
          assignedLawyer: '',
          createdAt: new Date().toISOString().split('T')[0],
          documents: [],
          totalFee: 0,
          paidAmount: 0,
        };
        newCases.unshift(chosen);
      }
      defaultCaseIdByClient.set(cl.id, chosen);
    });

    // Fix invoices missing or invalid case links.
    const validCaseIds = new Set(newCases.map(c => c.id));
    const newInvoices = invoices.map(inv => {
      if (!inv.clientId) return inv;
      const def = defaultCaseIdByClient.get(inv.clientId);
      if (!def) return inv;
      if (!inv.caseId || !validCaseIds.has(inv.caseId)) {
        invoicesChanged = true;
        return { ...inv, caseId: def.id, caseTitle: def.title, clientName: inv.clientName || def.clientName };
      }
      if (!inv.caseTitle) {
        const c = newCases.find(x => x.id === inv.caseId);
        if (c) {
          invoicesChanged = true;
          return { ...inv, caseTitle: c.title, clientName: inv.clientName || c.clientName };
        }
      }
      return inv;
    });

    if (casesChanged) setCases(newCases);
    if (invoicesChanged) setInvoices(newInvoices);

    // Dedupe expenses
    setExpenses(prev => {
      const seen = new Set<string>();
      const out: Expense[] = [];
      for (const e of prev) {
        const d = (e.date || '').slice(0, 10);
        const amt = Number(e.amount || 0).toFixed(2);
        const cat = (e.category || '').trim().toLowerCase();
        const desc = (e.description || '').trim().toLowerCase();
        const key = `${d}__${amt}__${cat}__${desc}`;
        if (!seen.has(key)) {
          seen.add(key);
          out.push(e);
        }
      }
      return out;
    });
  }, [clients, cases, invoices]);

  // Tab switching based on role
  useEffect(() => {
    if (userRole === UserRole.CLIENT) {
      setActiveTab('clients');
    } else if (userRole === UserRole.ADMIN) {
      setActiveTab('dashboard');
    }
  }, [userRole]);

  // Global Search shortcut (Ctrl/Cmd + K)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const key = (e.key || '').toLowerCase();
      if ((e.ctrlKey || e.metaKey) && key === 'k') {
        e.preventDefault();
        if (userRole !== UserRole.CLIENT) setActiveTab('search');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [userRole]);

  // LOGGER FUNCTION
  const logAction = (user: string, role: string, action: string) => {
    const newLog: SystemLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleString('en-AE'), // Use local time
      user,
      role,
      action
    };
    setSystemLogs(prev => [...prev, newLog]);
  };

  // LOGIN HANDLER
  const handleLogin = (role: UserRole, data?: any) => {
    setUserRole(role);
    if (role === UserRole.CLIENT) {
      setLoggedInClient(data);
      setAdminProfile(null);
      logAction(data.name, 'Client', 'Portal Login');
    } else if (role === UserRole.ADMIN) {
      setLoggedInClient(null);
      if (data && data.name) {
        setAdminProfile({ name: data.name, title: data.title || 'المدير العام' });
        logAction(data.name, data.title || 'Admin', 'System Login');
      } else {
        setAdminProfile({ name: 'المدير العام', title: 'إدارة المكتب' });
        logAction('Unknown Admin', 'Admin', 'System Login');
      }
    }
  };

  // LOGOUT HANDLER
  const handleLogout = () => {
    if(adminProfile) logAction(adminProfile.name, 'Admin', 'Logout');
    else if(loggedInClient) logAction(loggedInClient.name, 'Client', 'Logout');

    setUserRole(null);
    setLoggedInClient(null);
    setAdminProfile(null);
    setActiveTab('dashboard');
  };

  // Action Handlers
  const handleAddCase = (newCase: LegalCase) => setCases([newCase, ...cases]);
  const handleUpdateCase = (updatedCase: LegalCase) => setCases(cases.map(c => c.id === updatedCase.id ? updatedCase : c));
  const handleDeleteCase = (caseId: string) => {
      setCases(cases.filter(c => c.id !== caseId));
      if(adminProfile) logAction(adminProfile.name, 'Admin', `Deleted Case ID: ${caseId}`);
  };

  const handleAddClient = (newClient: Client) => setClients([newClient, ...clients]);
  const handleUpdateClient = (updatedClient: Client) => setClients(clients.map(c => c.id === updatedClient.id ? updatedClient : c));

  const handleDeleteClient = (clientId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الموكل سيتم حذف جميع القضايا والفواتير المرتبطة به.')) {
      setClients(clients.filter(c => c.id !== clientId));
      setCases(cases.filter(c => c.clientId !== clientId));
      setInvoices(invoices.filter(i => i.clientId !== clientId));
      if(adminProfile) logAction(adminProfile.name, 'Admin', `Deleted Client ID: ${clientId}`);
    }
  };

  const handleAddInvoice = (newInvoice: Invoice) => setInvoices([newInvoice, ...invoices]);
  const normalizeExpenseKey = (e: Expense) => {
    const d = (e.date || '').slice(0, 10);
    const amt = Number(e.amount || 0).toFixed(2);
    const cat = (e.category || '').trim().toLowerCase();
    const desc = (e.description || '').trim().toLowerCase();
    return `${d}__${amt}__${cat}__${desc}`;
  };

  const dedupeExpenses = (arr: Expense[]) => {
    const seen = new Set<string>();
    const out: Expense[] = [];
    for (const e of arr) {
      const key = normalizeExpenseKey(e);
      if (!seen.has(key)) {
        seen.add(key);
        out.push(e);
      }
    }
    return out;
  };

  const handleAddExpense = (newExp: Expense) => setExpenses(prev => dedupeExpenses([newExp, ...prev]));
  const handleUpdateExpense = (updated: Expense) => setExpenses(prev => dedupeExpenses(prev.map(e => e.id === updated.id ? updated : e)));
  const handleDeleteExpense = (expId: string) => setExpenses(prev => prev.filter(e => e.id !== expId));
  const handleUpdateInvoice = (updatedInvoice: Invoice) => setInvoices(invoices.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv));

  const handleBackup = () => {
    const backupData = {
      backupVersion: 1,
      appName: 'HelmSmart',
      timestamp: new Date().toISOString(),
      config: systemConfig,
      clients,
      cases,
      invoices,
      expenses,
      logs: systemLogs
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HelmSmart_Backup_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if(adminProfile) logAction(adminProfile.name, 'Admin', 'System Backup Downloaded');
  };

  const handleRestore = (data: any) => {
    // Restore is intentionally tolerant: it accepts both the new backup format
    // and older backups that might not contain all fields.
    try {
      const restoredConfig = data?.config ? withSafeConfigDefaults(data.config) : systemConfig;
      const restoredClients = Array.isArray(data?.clients) ? data.clients : clients;
      const restoredCases = Array.isArray(data?.cases) ? data.cases : cases;
      const restoredInvoices = Array.isArray(data?.invoices) ? data.invoices : invoices;
      const restoredExpenses = Array.isArray(data?.expenses) ? data.expenses : expenses;
      const restoredLogs = Array.isArray(data?.logs) ? data.logs : systemLogs;

      setSystemConfig(restoredConfig);
      setClients(restoredClients);
      setCases(restoredCases);
      setInvoices(restoredInvoices);
      setExpenses(restoredExpenses);
      setSystemLogs(restoredLogs);

      logAction(adminProfile?.name || 'Admin', 'Admin', 'System Backup Restored');
      alert('✅ تم استعادة النسخة الاحتياطية بنجاح.');
    } catch (e) {
      alert('تعذر استعادة النسخة. تأكد من صحة ملف JSON.');
    }
  };

  // Cloud Sync Actions
  const cloudPull = async () => {
    if (!cloudEnabled) return;
    if (!isSupabaseEnabled) {
      setCloudStatus({ lastError: 'Supabase not configured' });
      alert('Supabase غير معد. ضع VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY أولا.');
      return;
    }

    try {
      setCloudStatus(prev => ({ ...prev, lastError: undefined }));

      const [rClients, rCases, rInvoices, rExpenses, rConfig, rLogs] = await Promise.all([
        kvGet('clients'),
        kvGet('cases'),
        kvGet('invoices'),
        kvGet('expenses'),
        kvGet('config'),
        kvGet('logs')
      ]);

      if (rClients?.data) setClients(rClients.data as Client[]);
      if (rCases?.data) setCases(rCases.data as LegalCase[]);
      if (rInvoices?.data) setInvoices(rInvoices.data as Invoice[]);
      if (rExpenses?.data) setExpenses(rExpenses.data as Expense[]);
      if (rConfig?.data) setSystemConfig(withSafeConfigDefaults(rConfig.data as any));
      if (rLogs?.data) setSystemLogs(rLogs.data as SystemLog[]);

      cloudReadyRef.current = true;
      setCloudStatus(prev => ({ ...prev, lastPull: new Date().toISOString() }));
      logAction(adminProfile?.name || 'Admin', 'Admin', 'Cloud Pull');
    } catch (e: any) {
      const msg = e?.message || String(e);
      setCloudStatus(prev => ({ ...prev, lastError: msg }));
      alert('فشل تحميل البيانات من السحابة.\n' + msg);
    }
  };

  const cloudPush = async () => {
    if (!cloudEnabled) return;
    if (!isSupabaseEnabled) {
      setCloudStatus({ lastError: 'Supabase not configured' });
      alert('Supabase غير معد. ضع VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY أولا.');
      return;
    }

    try {
      setCloudStatus(prev => ({ ...prev, lastError: undefined }));

      await Promise.all([
        kvSet('clients', clients),
        kvSet('cases', cases),
        kvSet('invoices', invoices),
        kvSet('expenses', expenses),
        kvSet('config', systemConfig),
        kvSet('logs', systemLogs)
      ]);

      cloudReadyRef.current = true;
      setCloudStatus(prev => ({ ...prev, lastPush: new Date().toISOString() }));
      logAction(adminProfile?.name || 'Admin', 'Admin', 'Cloud Push');
    } catch (e: any) {
      const msg = e?.message || String(e);
      setCloudStatus(prev => ({ ...prev, lastError: msg }));
      alert('فشل رفع البيانات للسحابة.\n' + msg);
    }
  };

  // Auto cloud pull after admin login (one-time unless you Pull/Push manually)
  useEffect(() => {
    if (userRole !== UserRole.ADMIN) return;
    if (!cloudEnabled || !isSupabaseEnabled) return;
    if (cloudReadyRef.current) return;
    void cloudPull();
  }, [userRole, cloudEnabled, isSupabaseEnabled]);

  // Auto cloud push (debounced)
  useEffect(() => {
    if (!cloudEnabled || !isSupabaseEnabled) return;
    if (!cloudReadyRef.current) return;

    const t = window.setTimeout(() => {
      void cloudPush();
    }, 2000);

    return () => window.clearTimeout(t);
  }, [cloudEnabled, isSupabaseEnabled, clients, cases, invoices, expenses, systemConfig, systemLogs]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        if (userRole === UserRole.CLIENT) return <div className="text-center p-20 font-bold text-slate-500">غير مصرح بالدخول لهذه الصفحة</div>;
        return <Dashboard cases={cases} clients={clients} invoices={invoices} expenses={expenses} userRole={userRole} config={systemConfig} />;
      case 'search':
        if (userRole === UserRole.CLIENT) return <div className="text-center p-20 font-bold text-slate-500">غير مصرح بالدخول لهذه الصفحة</div>;
        return <GlobalSearch clients={clients} cases={cases} invoices={invoices} expenses={expenses} onNavigate={(tab, query) => {
          localStorage.setItem('legalmaster_nav_query', JSON.stringify({ tab, query }));
          setActiveTab(tab);
        }} />;

      case 'ai-consultant':
        return <AIConsultant />;
      case 'smart-analysis':
        return <SmartDocumentAnalyzer />;
      case 'accounting':
        if (userRole === UserRole.CLIENT) return <div className="text-center p-20 font-bold text-slate-500">غير مصرح بالدخول لهذه الصفحة</div>;
        return <Accounting
          invoices={invoices}
          cases={cases}
          expenses={expenses}
          onAddInvoice={handleAddInvoice}
          onUpdateInvoice={handleUpdateInvoice}
          onAddExpense={handleAddExpense}
          onUpdateExpense={handleUpdateExpense}
          onDeleteExpense={handleDeleteExpense}
          clients={clients}
          onUpdateClient={handleUpdateClient}
          config={systemConfig}
          onUpdateConfig={setSystemConfig}
        />;
      case 'links':
        return <ImportantLinks />;
      case 'settings':
        if (userRole !== UserRole.ADMIN) {
           return <div className="p-20 text-center font-bold text-red-500">غير مصرح بالدخول للإعدادات</div>;
        }
        return <Settings
          config={systemConfig}
          onUpdateConfig={(newConf) => {
             setSystemConfig(newConf);
             logAction(adminProfile?.name || 'Admin', 'Admin', 'Updated System Settings');
          }}
          onBackup={handleBackup}
          onRestore={handleRestore}
          logs={systemLogs}
          supabaseEnabled={isSupabaseEnabled}
          cloudEnabled={cloudEnabled}
          cloudStatus={cloudStatus}
          onToggleCloudEnabled={setCloudEnabled}
          onCloudPull={() => { void cloudPull(); }}
          onCloudPush={() => { void cloudPush(); }}
        />;
      case 'cases':
        if (userRole === UserRole.CLIENT) return <div className="text-center p-20 font-bold text-slate-500">غير مصرح بالدخول لهذه الصفحة</div>;
        return <CaseManagement
            cases={cases}
            clients={clients}
            onAddCase={handleAddCase}
            onUpdateCase={handleUpdateCase}
            onDeleteCase={handleDeleteCase} // Pass delete handler
            onAddClient={handleAddClient}
        />;
      case 'clients':
        if (userRole === UserRole.CLIENT && loggedInClient) {
           return <ClientManagement
             clients={clients}
             cases={cases}
             invoices={invoices}
             config={systemConfig}
             onAddClient={handleAddClient}
             onAddCase={handleAddCase}
             onUpdateClient={handleUpdateClient}
             onDeleteClient={() => {}}
             onAddInvoice={() => {}}
             viewOnlyClientId={loggedInClient.id}
           />;
        }
        return <ClientManagement
          clients={clients}
          cases={cases}
          invoices={invoices}
          config={systemConfig}
          onAddClient={handleAddClient}
          onAddCase={handleAddCase}
          onUpdateClient={handleUpdateClient}
          onDeleteClient={handleDeleteClient}
          onAddInvoice={handleAddInvoice}
        />;
      default: return <Dashboard cases={cases} clients={clients} invoices={invoices} expenses={expenses} userRole={userRole} config={systemConfig} />;
    }
  };

  return !userRole ? (
    <Login onLogin={handleLogin} clients={clients} config={systemConfig} />
  ) : (
    <div
      className="min-h-screen flex flex-col transition-all duration-500"
      style={{
        fontFamily: systemConfig.fontFamily || 'Cairo',
        backgroundColor: systemConfig.backgroundColor || '#f8fafc'
      }}
    >

      {/* Top Navigation Bar for Admin */}
      {userRole !== UserRole.CLIENT && (
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} config={systemConfig} onLogout={handleLogout} />
      )}

      {/* Client Portal Header */}
      {userRole === UserRole.CLIENT && (
        <header className="bg-[#0f172a] text-white p-6 shadow-xl border-b-4 border-[#d4af37]">
           <div className="max-w-screen-2xl mx-auto flex justify-between items-center">
              <div>
                 <h1 className="text-xl font-black text-[#d4af37]">بوابة الموكلين</h1>
                 <p className="text-xs text-slate-400">مكتب المستشار أحمد حلمي</p>
              </div>
              <button onClick={() => { if(confirm('تسجيل الخروج')) handleLogout(); }} className="text-sm bg-white/10 px-4 py-2 rounded-xl hover:bg-white/20">خروج</button>
           </div>
        </header>
      )}

      {/* Main Content Area */}
      <main
        className={`flex-1 w-full max-w-screen-2xl mx-auto overflow-x-hidden relative pb-10 transition-all duration-300 ${userRole !== UserRole.CLIENT ? 'pt-28' : ''}`}
      >
        {renderContent()}
      </main>

      {/* Admin Footer Info */}
      {userRole === UserRole.ADMIN && (
        <div className="fixed bottom-4 left-4 z-40 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-slate-100 text-[10px] font-bold text-slate-400 print:hidden">
           Logged in as: {adminProfile?.name} ({adminProfile?.title})
        </div>
      )}
      <Analytics />
    </div>
  );
};

export default App;
