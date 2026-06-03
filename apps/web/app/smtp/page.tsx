import { Server, UploadCloud, Zap } from 'lucide-react';
import { smtpAccounts } from '@/lib/data';
import { DataTable, Field, PageTitle, StatusBadge } from '@/components/ui';

export default function SmtpPage() {
  return <div className="space-y-6">
    <PageTitle eyebrow="SMTP Accounts" title="Manage unlimited sender infrastructure" description="Add SMTP credentials, test connections, group accounts, rotate senders, enforce limits, and pause problematic inboxes automatically." action={<button className="btn-primary"><Zap size={16} /> Test all</button>} />
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="card p-6">
        <div className="mb-5 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-600"><Server /></span><div><h3 className="font-black">Add SMTP account</h3><p className="text-sm text-slate-500">SSL, TLS, STARTTLS, or none</p></div></div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="SMTP Host" placeholder="smtp.example.com" />
          <Field label="Port" placeholder="587" />
          <Field label="Username" placeholder="user@example.com" />
          <Field label="Password" placeholder="••••••••" type="password" />
          <Field label="Sender Name" placeholder="Alex Morgan" />
          <Field label="Sender Email" placeholder="alex@example.com" />
          <Field label="Daily Limit" placeholder="500" />
          <Field label="Hourly Limit" placeholder="50" />
        </div>
        <button className="btn-primary mt-5 w-full">Save SMTP Account</button>
      </div>
      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between"><div><h3 className="font-black">Bulk import</h3><p className="text-sm text-slate-500">CSV, XLSX, or JSON with SMTP Host, Port, Username, Password, Encryption, Sender, Limits.</p></div><UploadCloud className="text-brand-600" /></div>
        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center"><p className="font-bold">Drop import file here</p><p className="mt-1 text-sm text-slate-500">Backend endpoint: POST /smtp/import</p><button className="btn-secondary mt-4">Choose File</button></div>
      </div>
    </div>
    <DataTable headers={['Sender', 'Host', 'Group', 'Health', 'Daily Usage']} rows={smtpAccounts.map((s) => [<span key="sender" className="font-bold text-slate-950">{s.sender}</span>, s.host, s.group, <StatusBadge key="status" status={s.health} />, s.daily])} />
  </div>;
}
