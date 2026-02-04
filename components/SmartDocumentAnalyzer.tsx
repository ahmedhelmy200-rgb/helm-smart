
import React, { useState, useRef } from 'react';
import { analyzeDocument } from '../services/geminiService';
import { ICONS } from '../constants';

const SmartDocumentAnalyzer: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setAnalysisResult('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    setIsLoading(true);
    const defaultPrompt = "قم بتحليل هذا المستند القانوني بدقة. استخرج البيانات التالية: نوع المستند، الأطراف المعنية، التواريخ المهمة، المبالغ المالية (إن وجدت)، والملخص القانوني للمحتوى. نسق الإجابة بشكل نقاط واضحة.";
    const prompt = customPrompt || defaultPrompt;
    
    const result = await analyzeDocument(selectedImage, prompt);
    setAnalysisResult(result || 'لم يتم استخراج أي بيانات.');
    setIsLoading(false);
  };

  return (
    <div className="p-8 lg:p-12 animate-in fade-in duration-500 min-h-screen">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-[#0f172a] text-[#d4af37] rounded-2xl flex items-center justify-center shadow-lg">
          <ICONS.DocumentScanner className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-800">التحليل الذكي للمستندات</h2>
          <p className="text-slate-500 font-bold">استخراج البيانات وتحليل الوثائق القانونية باستخدام الذكاء الاصطناعي</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-6">
          <div 
            className="border-3 border-dashed border-slate-300 rounded-[2.5rem] p-10 text-center hover:border-[#d4af37] hover:bg-slate-50 transition-all cursor-pointer group relative min-h-[400px] flex flex-col items-center justify-center bg-white"
            onClick={() => fileInputRef.current?.click()}
          >
            {selectedImage ? (
              <div className="relative w-full h-full flex flex-col items-center">
                 <img src={selectedImage} alt="Uploaded Document" className="max-h-[350px] object-contain rounded-2xl shadow-lg mb-4" />
                 <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem] flex items-center justify-center">
                    <span className="text-white font-bold bg-black/50 px-4 py-2 rounded-xl">تغيير الصورة</span>
                 </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-[#d4af37]/10 transition-colors">
                  <svg className="w-10 h-10 text-slate-400 group-hover:text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-700">اضغط لرفع مستند أو صورة</h3>
                  <p className="text-sm text-slate-400 mt-1">يدعم JPG, PNG بجودة عالية</p>
                </div>
              </div>
            )}
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleImageUpload} 
            />
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
             <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">تعليمات التحليل (اختياري)</label>
             <div className="flex gap-2">
               <input 
                 type="text" 
                 placeholder="مثال: لخص النقاط الرئيسية، استخرج تاريخ العقد، ما هي الالتزامات المالية..." 
                 className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#d4af37] font-medium"
                 value={customPrompt}
                 onChange={(e) => setCustomPrompt(e.target.value)}
               />
               <button 
                 onClick={handleAnalyze}
                 disabled={!selectedImage || isLoading}
                 className={`px-8 py-3 rounded-xl font-black shadow-lg transition-all flex items-center gap-2 ${
                   !selectedImage || isLoading 
                   ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                   : 'bg-[#0f172a] text-[#d4af37] hover:scale-105'
                 }`}
               >
                 {isLoading ? (
                   <>
                     <div className="w-5 h-5 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
                     <span>جاري التحليل...</span>
                   </>
                 ) : (
                   <>
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                     <span>تحليل المستند</span>
                   </>
                 )}
               </button>
             </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col min-h-[500px]">
          <div className="bg-[#1e293b] p-6 text-white flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2">
              <svg className="w-5 h-5 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
              نتائج التحليل
            </h3>
            {analysisResult && (
               <button onClick={() => navigator.clipboard.writeText(analysisResult)} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors">نسخ النص</button>
            )}
          </div>
          
          <div className="flex-1 p-8 overflow-y-auto custom-scroll bg-slate-50/50">
            {analysisResult ? (
              <div className="prose prose-slate max-w-none prose-p:text-slate-700 prose-headings:text-slate-900 prose-strong:text-[#0f172a]">
                <div className="whitespace-pre-wrap leading-relaxed text-base font-medium">
                  {analysisResult}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                <ICONS.DocumentScanner className="w-16 h-16 mb-4 text-slate-300" />
                <p className="font-bold">نتائج التحليل ستظهر هنا</p>
                <p className="text-xs mt-2">يمكنك استخراج النصوص، تلخيص العقود، أو تدقيق المستندات</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartDocumentAnalyzer;
