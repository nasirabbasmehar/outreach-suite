import { ClipboardPaste, FileSpreadsheet, Sheet } from 'lucide-react';
import { leads } from '@/lib/data';
import { DataTable, Field, PageTitle } from '@/components/ui';

export default function LeadsPage() {
  return <div className="space-y-6">
    <PageTitle eyebrow="Leads" title="Import contacts with unlimited custom variables" description="Upload CSV/XLSX, connect public Google Sheets, or paste emails. Standard and custom fields become mail-merge variables like {{company}}, {{industry}}, and {{city}}." />
    <div className="grid gap-4 md:grid-cols-3">
      {[['CSV / XLSX import', 'Map columns into standard and custom fields.', FileSpreadsheet], ['Google Sheets', 'Import from a public sheet export URL.', Sheet], ['Copy / Paste', 'Paste email, name, company lines quickly.', ClipboardPaste]].map(([title, body, Icon]) => <div key={String(title)} className="card p-6"><Icon className="text-brand-600" /><h3 className="mt-4 font-black">{String(title)}</h3><p className="mt-2 text-sm text-slate-600">{String(body)}</p></div>)}
    </div>
    <div className="card p-6"><h3 className="mb-4 font-black">Create lead</h3><div className="grid gap-4 md:grid-cols-4"><Field label="Email" placeholder="john@acme.com" /><Field label="Name" placeholder="John Carter" /><Field label="Company" placeholder="Acme Inc." /><Field label="Custom field" placeholder="industry=SaaS" /></div><button className="btn-primary mt-5">Save Lead</button></div>
    <DataTable headers={['Name', 'Company', 'Job Title', 'Email', 'Custom Variables']} rows={leads.map((l) => [<span key="name" className="font-bold text-slate-950">{l.name}</span>, l.company, l.title, l.email, l.vars])} />
  </div>;
}
