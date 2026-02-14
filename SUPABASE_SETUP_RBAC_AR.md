# إعداد Supabase RBAC + RLS (HELM Smart) — خطوة بخطوة

> الهدف: **Admin / Assistant / Accountant** بصلاحيات حقيقية + **RLS 100%** لعزل بيانات المكتب.

## 1) أنشئ مشروع Supabase
- Settings → API
- خذ:
  - `Project URL` -> `VITE_SUPABASE_URL`
  - `anon public key` -> `VITE_SUPABASE_ANON_KEY`

## 2) نفّذ SQL (مرة واحدة)
- SQL Editor → New query
- الصق ملف:
  - `supabase/migrations/001_helm_rbac_rls.sql`
- Run

## 3) Create Tenant (مرة واحدة)
بعد تنفيذ SQL، نفّذ في SQL Editor:
```sql
insert into public.tenants(name) values ('HELM Office') returning id;
```
انسخ `id` (tenant uuid).

## 4) أنشئ المستخدمين (Auth)
- Authentication → Users → Add user
- أنشئ:
  1) Admin (Email/Password)
  2) Assistant
  3) Accountant

> انسخ UUID لكل مستخدم.

## 5) اربط كل مستخدم بدور + tenant
نفّذ لكل مستخدم (غيّر القيم):
```sql
insert into public.profiles(id, tenant_id, role, display_name)
values ('<USER_UUID>', '<TENANT_UUID>', 'ADMIN', 'أحمد حلمي');
```
والأدوار المتاحة:
- `ADMIN`
- `ASSISTANT`
- `ACCOUNTANT`

## 6) ضع ENV في مشروعك
أنشئ `.env.local`:
```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```
ثم شغّل:
```powershell
npm install
npm run dev
```

## 7) التحقق
- سجّل الدخول **بالإيميل** (ليس username)
- ستلاحظ اختفاء أقسام غير مصرح بها تلقائيًا حسب الدور.

