import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient'; // تأكد من مسار الملف لديك

const App = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const { data: result, error: fetchError } = await supabase
        .from('your_table_name') // استبدل اسم الجدول هنا باسم جدولك في Supabase
        .select('*');

      if (fetchError) throw fetchError;
      setData(result || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '20px' }}>
      جاري التحميل...
    </div>
  );

  if (error) return (
    <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
      حدث خطأ: {error} <br />
      <button onClick={() => window.location.reload()} style={{ marginTop: '10px', padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}>
        إعادة المحاولة
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-blue-600">Smart Control</h1>
        </header>

        {/* حاوية الأزرار المتجاوبة */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* مثال للأزرار - يمكنك تكرارها حسب حاجتك */}
          <button className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all border-b-4 border-blue-500 active:scale-95 text-lg font-semibold">
            تشغيل الجهاز 1
          </button>
          
          <button className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all border-b-4 border-green-500 active:scale-95 text-lg font-semibold">
            إيقاف الجهاز 1
          </button>

          <button className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all border-b-4 border-red-500 active:scale-95 text-lg font-semibold">
            تحديث البيانات
          </button>
        </div>

        {/* عرض البيانات القادمة من Supabase */}
        <div className="mt-10 bg-white rounded-lg p-4 shadow overflow-x-auto">
          <h2 className="mb-4 font-bold border-b pb-2">حالة النظام</h2>
          <pre className="text-sm text-gray-700">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default App;
