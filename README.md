# HELM Smart — Web + Cloud + PWA (بديل Electron)

هذه نسخة **Web/PWA** من نظام إدارة مكتب HELM:
- ✅ يعمل على **أي جهاز** (Windows / Mac / Mobile) عبر المتصفح.
- ✅ **PWA**: يمكن تثبيته كتطبيق على الهاتف/الكمبيوتر.
- ✅ جاهز للنشر على **Vercel**.
- ✅ **مزامنة سحابية** اختيارية عبر **Supabase** (Pull/Push + Auto Sync).
- ✅ البحث الشامل داخل النظام (**Ctrl + K**).

---

## تشغيل محليًا

1) تثبيت الحزم:
```bash
npm install
```

2) إعداد المتغيرات في `.env.local`:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY` (خاص بالذكاء الاصطناعي — للسيرفر فقط)

3) تشغيل:
```bash
npm run dev
```

> ملاحظة: وظائف الذكاء الاصطناعي تعمل عبر **Vercel Serverless** تحت `/api/*`، لذلك محليًا قد يظهر تنبيه بأن الخدمة غير متاحة (هذا طبيعي). لاختبارها محليًا استخدم `vercel dev`.

---

## نشر على Vercel

- ارفع المشروع على GitHub.
- اربط المستودع بـ Vercel.
- أضف في Vercel (Environment Variables):
  - `GEMINI_API_KEY`
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

`vercel.json` موجود لتفادي مشاكل الـ SPA Refresh.

---

## إعداد Supabase (Cloud Sync)

### 1) إنشاء جدول التخزين
نفّذ في **SQL Editor** داخل Supabase:
```sql
create table if not exists public.helm_kv (
  key text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.helm_kv;
create trigger set_updated_at
before update on public.helm_kv
for each row execute procedure public.touch_updated_at();
```

### 2) الأمان (مهم)
- هذه النسخة **لا تحتوي تسجيل دخول Supabase Auth** بعد.
- إذا فعّلت **RLS** بدون سياسات مناسبة، ستفشل القراءة/الكتابة.

للاستخدام الشخصي السريع (غير مُوصى به للإنتاج): اترك RLS **غير مفعّل**.

للإنتاج: فعّل Supabase Auth + RLS وسياسات مقيدة (سنضيف ذلك كترقية لاحقة).

---

## البحث الشامل
- افتح البحث الشامل: **Ctrl + K**
- يمكنك الانتقال من نتائج البحث لصفحات الموكلين/القضايا/المالية وسيتم تعبئة مربع البحث تلقائيًا.

---

## ملاحظات تقنية سريعة
- مزامنة السحابة **اختيارية** وتُفعّل من: الإعدادات → البيانات والنسخ → المزامنة السحابية.
- أول مرة: استخدم **Pull** لتحميل بيانات السحابة (أو Push لرفع البيانات الحالية).
