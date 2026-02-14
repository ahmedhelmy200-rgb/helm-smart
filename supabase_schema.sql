-- Helm Smart - Supabase minimal schema (KV Store)
-- الهدف: تشغيل Web App من أي مكان بدون إعادة كتابة كبيرة.
-- يخزن نفس مفاتيح localStorage (legalmaster_clients/cases/invoices/expenses/config/logs) داخل جدول واحد.

create table if not exists public.kv_store (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_kv_store_updated_at on public.kv_store;
create trigger trg_kv_store_updated_at
before update on public.kv_store
for each row execute procedure public.touch_updated_at();

-- مبدئيًا RLS مغلق لتقليل الخطوات.
-- لاحقًا: فعّل RLS واربطه بـ auth.uid() لكل مستخدم/مكتب.
