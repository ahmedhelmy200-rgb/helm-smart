import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CaseDocument, SystemConfig } from '../types';

type Props = {
  config: SystemConfig;
  onUpdateConfig: (next: SystemConfig) => void;
};

const TOKENS = [
  '{officeName}', '{officePhone}', '{officeEmail}', '{officeAddress}', '{officeWebsite}',
  '{clientName}', '{clientPhone}', '{clientEmail}', '{emiratesId}',
  '{caseNumber}', '{caseTitle}', '{opponentName}', '{court}', '{nextHearingDate}',
  '{date}', '{amount}', '{invoiceNumber}'
];

function nowDate() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function safeTemplates(input: any): CaseDocument[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter(Boolean)
    .map((t: any, index: number) => ({
      id: String(t.id || `tpl_${index}_${Math.random().toString(36).slice(2, 8)}`),
      name: String(t.name || t.title || 'نموذج بدون عنوان'),
      type: t.type || 'template',
      mimeType: t.mimeType || 'text/plain',
      category: t.category || 'template',
      uploadDate: t.uploadDate || t.updatedAt || t.createdAt || nowDate(),
      content: typeof t.content === 'string' ? t.content : '',
      ...t,
    }));
}

const TemplatesCenter: React.FC<Props> = ({ config, onUpdateConfig }) => {
  const templates = useMemo(() => safeTemplates(config.officeTemplates), [config.officeTemplates]);
  const [selectedId, setSelectedId] = useState<string>(() => templates[0]?.id || '');
  const selected = templates.find(t => t.id === selectedId) || null;

  const [draftName, setDraftName] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [saveState, setSaveState] = useState<'idle' | 'dirty' | 'saving' | 'saved'>('idle');
  const saveTimerRef = useRef<number | null>(null);
  const lastSelectedIdRef = useRef<string>('');

  useEffect(() => {
    if (selectedId && templates.some(t => t.id === selectedId)) return;
    setSelectedId(templates[0]?.id || '');
  }, [templates, selectedId]);

  useEffect(() => {
    if (!selected) {
      setDraftName('');
      setDraftContent('');
      lastSelectedIdRef.current = '';
      setSaveState('idle');
      return;
    }

    if (lastSelectedIdRef.current !== selected.id) {
      lastSelectedIdRef.current = selected.id;
      setDraftName(selected.name || '');
      setDraftContent(selected.content || '');
      setSaveState('idle');
    }
  }, [selected?.id]);

  useEffect(() => () => {
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
  }, []);

  const updateTemplates = (next: CaseDocument[]) => {
    onUpdateConfig({ ...config, officeTemplates: next });
  };

  const saveSelected = (name = draftName, content = draftContent, immediate = false) => {
    if (!selected) return;
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);

    const doSave = () => {
      setSaveState('saving');
      const next = templates.map(t => t.id === selected.id
        ? { ...t, name: name || 'نموذج بدون عنوان', content: content || '', uploadDate: nowDate() }
        : t
      );
      updateTemplates(next);
      window.setTimeout(() => setSaveState('saved'), 80);
    };

    if (immediate) {
      doSave();
      return;
    }

    setSaveState('dirty');
    saveTimerRef.current = window.setTimeout(doSave, 650);
  };

  const addNew = () => {
    if (selected && saveState === 'dirty') saveSelected(draftName, draftContent, true);

    const id = `tpl_${Math.random().toString(36).slice(2, 10)}`;
    const t: CaseDocument = {
      id,
      name: 'نموذج جديد',
      type: 'template',
      mimeType: 'text/plain',
      category: 'template',
      uploadDate: nowDate(),
      content: 'اكتب هنا نص النموذج...'
    };
    updateTemplates([t, ...templates]);
    setSelectedId(id);
    setDraftName(t.name);
    setDraftContent(t.content || '');
    setSaveState('saved');
  };

  const remove = (id: string) => {
    if (!confirm('حذف هذا النموذج؟')) return;
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    const next = templates.filter(t => t.id !== id);
    updateTemplates(next);
    setSelectedId(next[0]?.id || '');
    setSaveState('idle');
  };

  const duplicateSelected = () => {
    if (!selected) return;
    if (saveState === 'dirty') saveSelected(draftName, draftContent, true);
    const id = `tpl_${Math.random().toString(36).slice(2, 10)}`;
    const copy: CaseDocument = {
      ...selected,
      id,
      name: `${draftName || selected.name} - نسخة`,
      content: draftContent,
      uploadDate: nowDate(),
    };
    updateTemplates([copy, ...templates]);
    setSelectedId(id);
    setDraftName(copy.name);
    setDraftContent(copy.content || '');
    setSaveState('saved');
  };

  const selectTemplate = (id: string) => {
    if (selected && saveState === 'dirty') saveSelected(draftName, draftContent, true);
    setSelectedId(id);
  };

  const insertToken = (token: string) => {
    const next = `${draftContent || ''}${draftContent ? ' ' : ''}${token}`;
    setDraftContent(next);
    saveSelected(draftName, next);
  };

  return (
    <div className="p-4 md:p-8 lg:p-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800">مكتبة النماذج</h2>
          <p className="text-xs text-slate-500 font-bold mt-1">نماذج جاهزة قابلة للتعديل، مع حفظ مؤجل لمنع تهنيج البرنامج أثناء الكتابة.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {selected && (
            <button onClick={() => saveSelected(draftName, draftContent, true)} className="px-5 py-3 rounded-2xl font-black bg-emerald-600 text-white shadow-lg">
              حفظ الآن
            </button>
          )}
          <button onClick={addNew} className="px-5 py-3 rounded-2xl font-black text-white shadow-lg" style={{ backgroundColor: config.primaryColor }}>+ إضافة نموذج</button>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-500">
        الحالة: {saveState === 'dirty' ? 'توجد تعديلات جارٍ حفظها تلقائياً…' : saveState === 'saving' ? 'جارٍ الحفظ…' : saveState === 'saved' ? 'تم الحفظ' : 'جاهز'}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="font-black text-slate-700">النماذج</div>
            <div className="text-[10px] font-bold text-slate-400">{templates.length}</div>
          </div>
          <div className="p-2 max-h-[64vh] overflow-auto">
            {templates.map(t => (
              <button
                key={t.id}
                onClick={() => selectTemplate(t.id)}
                className={`w-full text-right px-4 py-3 rounded-2xl mb-2 border transition ${selectedId === t.id ? 'bg-slate-50 border-slate-200' : 'border-transparent hover:bg-slate-50'}`}
              >
                <div className="font-black text-slate-800 text-sm truncate">{t.name}</div>
                <div className="text-[10px] text-slate-400 font-bold mt-1">آخر تعديل: {t.uploadDate || '-'}</div>
              </button>
            ))}
            {templates.length === 0 && (
              <div className="text-center text-slate-400 font-bold py-10">لا توجد نماذج.</div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div className="text-sm font-black text-slate-800">تحرير النموذج</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {TOKENS.map(token => (
                  <button
                    key={token}
                    type="button"
                    onClick={() => insertToken(token)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-black text-slate-500 hover:bg-slate-100"
                  >
                    {token}
                  </button>
                ))}
              </div>
            </div>
            {selected && (
              <div className="flex gap-2">
                <button onClick={duplicateSelected} className="px-4 py-2 rounded-xl font-black bg-slate-50 text-slate-700 border border-slate-100">نسخ</button>
                <button onClick={() => remove(selected.id)} className="px-4 py-2 rounded-xl font-black bg-red-50 text-red-700 border border-red-100">حذف</button>
              </div>
            )}
          </div>

          {!selected && (
            <div className="p-8 text-center text-slate-400 font-bold">اختر نموذجاً من القائمة أو اضغط إضافة نموذج.</div>
          )}

          {selected && (
            <div className="p-5 md:p-6 space-y-4">
              <div>
                <label className="text-xs font-black text-slate-600">عنوان النموذج</label>
                <input
                  className="w-full mt-2 bg-white border border-slate-200 rounded-2xl px-5 py-3 font-bold text-slate-800 outline-none focus:border-[#d4af37]"
                  value={draftName}
                  onChange={(e) => {
                    setDraftName(e.target.value);
                    saveSelected(e.target.value, draftContent);
                  }}
                  onBlur={() => saveSelected(draftName, draftContent, true)}
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-600">النص</label>
                <textarea
                  className="w-full mt-2 bg-white border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-800 outline-none focus:border-[#d4af37] min-h-[46vh] leading-8 resize-y"
                  value={draftContent}
                  onChange={(e) => {
                    setDraftContent(e.target.value);
                    saveSelected(draftName, e.target.value);
                  }}
                  onBlur={() => saveSelected(draftName, draftContent, true)}
                  spellCheck={false}
                />
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-[11px] text-slate-500 font-bold leading-6">
                تم تعديل آلية الحفظ حتى لا يتم حفظ كامل إعدادات النظام مع كل حرف. الحفظ الآن مؤجل تلقائياً ويمكنك الضغط على "حفظ الآن" عند الانتهاء.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplatesCenter;
