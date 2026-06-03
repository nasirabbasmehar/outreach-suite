import { Code2, LayoutTemplate, Type } from 'lucide-react';
import { Field, PageTitle, TextArea } from '@/components/ui';

export default function TemplatesPage() {
  return <div className="space-y-6">
    <PageTitle eyebrow="Templates" title="Reusable HTML and plain text email templates" description="Store proven cold emails, follow-ups, sales messages, outreach notes, and partnership templates with mail-merge variables and conditional content." />
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="card p-6"><h3 className="mb-5 font-black">New template</h3><div className="space-y-4"><Field label="Template Name" placeholder="Founder cold email" /><Field label="Subject" placeholder="Idea for {{company}}" /><TextArea label="Body" placeholder="Hi {{first_name}}, ..." /></div><button className="btn-primary mt-5">Save Template</button></div>
      <div className="grid gap-4 md:grid-cols-3">
        {[{ icon: LayoutTemplate, title: 'Drag builder', body: 'Create modular visual sections for HTML emails.' }, { icon: Code2, title: 'HTML source', body: 'Paste or edit clean responsive HTML.' }, { icon: Type, title: 'Plain text', body: 'Send lightweight text emails with variables.' }].map(({ icon: Icon, title, body }) => <div key={title} className="card p-6"><Icon className="text-brand-600" /><h3 className="mt-4 font-black">{title}</h3><p className="mt-2 text-sm text-slate-600">{body}</p></div>)}
      </div>
    </div>
    <div className="card p-6"><h3 className="font-black">Variable library</h3><div className="mt-4 flex flex-wrap gap-2">{['{{name}}','{{first_name}}','{{last_name}}','{{company}}','{{location}}','{{job_title}}','{{phone}}','{{email}}','{{website}}','{{industry}}','{{service}}','{{revenue}}','{{city}}'].map((v) => <span key={v} className="badge bg-slate-100 text-slate-700">{v}</span>)}</div><div className="mt-5 rounded-2xl bg-slate-950 p-4 font-mono text-sm text-slate-100">{'{{if company}}'}<br />Company: {'{{company}}'}<br />{'{{endif}}'}</div></div>
  </div>;
}
