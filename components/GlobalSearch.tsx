import React, { useMemo, useState } from "react";
import { Client, Expense, Invoice, LegalCase } from "../types";

type NavTarget = "clients" | "cases" | "accounting";

interface GlobalSearchProps {
  clients: Client[];
  cases: LegalCase[];
  invoices: Invoice[];
  expenses: Expense[];
  onNavigate: (tab: NavTarget, query: string) => void;
}

const norm = (v: string) => v.toLowerCase().trim();

const GlobalSearch: React.FC<GlobalSearchProps> = ({
  clients,
  cases,
  invoices,
  expenses,
  onNavigate,
}) => {
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const query = norm(q);
    if (!query) return { clients: [], cases: [], invoices: [], expenses: [] };

    const match = (val?: string) => !!val && norm(val).includes(query);

    const clientRes = clients
      .filter(
        (c) =>
          match(c.name) || match(c.phone) || match(c.emiratesId) || match(c.email)
      )
      .slice(0, 10);

    const caseRes = cases
      .filter(
        (c) =>
          match(c.caseNumber) ||
          match(c.title) ||
          match(c.clientName) ||
          match(c.opponentName) ||
          match(c.court) ||
          match(c.status)
      )
      .slice(0, 10);

    const invoiceRes = invoices
      .filter(
        (i) =>
          match(i.invoiceNumber) ||
          match(i.clientName) ||
          match(i.caseTitle) ||
          match(i.status) ||
          match(i.description)
      )
      .slice(0, 10);

    const expenseRes = expenses
      .filter(
        (e) => match(e.category) || match(e.description) || match(e.status)
      )
      .slice(0, 10);

    return { clients: clientRes, cases: caseRes, invoices: invoiceRes, expenses: expenseRes };
  }, [q, clients, cases, invoices, expenses]);

  const hasAny =
    results.clients.length ||
    results.cases.length ||
    results.invoices.length ||
    results.expenses.length;

  return (
    <div className="p-10 bg-[#f8fafc] min-h-[calc(100vh-6rem)]">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between gap-6 mb-10">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">
              البحث الشامل داخل النظام
            </h2>
            <p className="text-slate-500 font-bold mt-2">
              ابحث عن موكل، قضية، فاتورة، أو مصروف — بالاسم، الرقم، الهاتف، أو الحالة.
            </p>
          </div>
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
            اختصار: Ctrl + K
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-8">
          <div className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="اكتب كلمة البحث... (مثال: اسم موكل / رقم قضية / 05xxxxxxx)"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-base font-bold outline-none focus:ring-2 focus:ring-[#d4af37] transition-all"
              autoFocus
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-black">
              {q ? q.length : 0}
            </div>
          </div>

          <div className="mt-10 space-y-10">
            {!q && (
              <div className="text-center py-16 text-slate-400 font-bold">
                ابدأ بالكتابة لعرض النتائج.
              </div>
            )}

            {q && !hasAny && (
              <div className="text-center py-16 text-slate-400 font-bold">
                لا توجد نتائج مطابقة.
              </div>
            )}

            {results.clients.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-black text-slate-800">الموكلون</h3>
                  <button
                    onClick={() => onNavigate("clients", q)}
                    className="text-xs font-black text-[#0f172a] bg-[#d4af37] px-4 py-2 rounded-xl shadow hover:scale-[1.02] transition-all"
                  >
                    فتح صفحة الموكلين مع البحث
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.clients.map((c) => (
                    <div
                      key={c.id}
                      className="p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-black text-slate-900">{c.name}</div>
                          <div className="text-xs font-bold text-slate-500 mt-1">
                            {c.phone} • {c.emiratesId}
                          </div>
                        </div>
                        <button
                          onClick={() => onNavigate("clients", c.name)}
                          className="text-xs font-black text-slate-700 bg-white border border-slate-200 px-4 py-2 rounded-xl hover:border-[#d4af37] hover:text-[#0f172a] transition-all"
                        >
                          فتح
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {results.cases.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-black text-slate-800">القضايا</h3>
                  <button
                    onClick={() => onNavigate("cases", q)}
                    className="text-xs font-black text-[#0f172a] bg-[#d4af37] px-4 py-2 rounded-xl shadow hover:scale-[1.02] transition-all"
                  >
                    فتح صفحة القضايا مع البحث
                  </button>
                </div>
                <div className="space-y-3">
                  {results.cases.map((c) => (
                    <div
                      key={c.id}
                      className="p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="font-black text-slate-900">
                            {c.caseNumber} — {c.title}
                          </div>
                          <div className="text-xs font-bold text-slate-500 mt-1">
                            {c.clientName} • {c.court} • {c.status}
                          </div>
                        </div>
                        <button
                          onClick={() => onNavigate("cases", c.caseNumber)}
                          className="text-xs font-black text-slate-700 bg-white border border-slate-200 px-4 py-2 rounded-xl hover:border-[#d4af37] hover:text-[#0f172a] transition-all"
                        >
                          فتح
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {(results.invoices.length > 0 || results.expenses.length > 0) && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-black text-slate-800">المالية</h3>
                  <button
                    onClick={() => onNavigate("accounting", q)}
                    className="text-xs font-black text-[#0f172a] bg-[#d4af37] px-4 py-2 rounded-xl shadow hover:scale-[1.02] transition-all"
                  >
                    فتح صفحة المالية مع البحث
                  </button>
                </div>

                {results.invoices.length > 0 && (
                  <div className="mb-6">
                    <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                      الفواتير
                    </div>
                    <div className="space-y-3">
                      {results.invoices.map((i) => (
                        <div
                          key={i.id}
                          className="p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:shadow-md transition-all"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <div className="font-black text-slate-900">
                                {i.invoiceNumber} — {i.clientName}
                              </div>
                              <div className="text-xs font-bold text-slate-500 mt-1">
                                {i.caseTitle} • {i.status} • {i.amount} AED
                              </div>
                            </div>
                            <button
                              onClick={() => onNavigate("accounting", i.invoiceNumber)}
                              className="text-xs font-black text-slate-700 bg-white border border-slate-200 px-4 py-2 rounded-xl hover:border-[#d4af37] hover:text-[#0f172a] transition-all"
                            >
                              فتح
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.expenses.length > 0 && (
                  <div>
                    <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                      المصاريف
                    </div>
                    <div className="space-y-3">
                      {results.expenses.map((e) => (
                        <div
                          key={e.id}
                          className="p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:shadow-md transition-all"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <div className="font-black text-slate-900">
                                {e.category} — {e.amount} AED
                              </div>
                              <div className="text-xs font-bold text-slate-500 mt-1">
                                {e.status} • {e.date}
                              </div>
                            </div>
                            <button
                              onClick={() => onNavigate("accounting", e.category)}
                              className="text-xs font-black text-slate-700 bg-white border border-slate-200 px-4 py-2 rounded-xl hover:border-[#d4af37] hover:text-[#0f172a] transition-all"
                            >
                              فتح
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
