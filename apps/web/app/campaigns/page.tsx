import { CalendarClock, GitBranch, SendHorizonal } from 'lucide-react';
import { campaigns } from '@/lib/data';
import { DataTable, Field, PageTitle, StatusBadge, TextArea } from '@/components/ui';

export default function CampaignsPage() {
  return <div className="space-y-6">
    <PageTitle eyebrow="Campaigns" title="Build scheduled, rotating, personalized campaigns" description="Create drafts, schedule launches by timezone, choose SMTP pools, set daily caps, and automate multi-step follow-up sequences based on opens, clicks, and replies." action={<button className="btn-primary"><SendHorizonal size={16} /> Launch</button>} />
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="card p-6">
        <h3 className="mb-5 font-black">Campaign composer</h3>
        <div className="grid gap-4 md:grid-cols-2"><Field label="Campaign Name" placeholder="SaaS Founder Outreach" /><Field label="Subject Line" placeholder="Quick idea for {{company}}" /><Field label="SMTP Pool" placeholder="founders" /><Field label="Timezone" placeholder="Asia/Karachi" /></div>
        <div className="mt-4"><TextArea label="Email Body" placeholder={'Hi {{first_name}},\n\n{{if company}}I noticed {{company}} is growing...{{endif}}\n\nWould it be useful to discuss {{service}}?'} /></div>
        <div className="mt-5 flex flex-wrap gap-2"><button className="btn-secondary">HTML Email</button><button className="btn-secondary">Plain Text Email</button><button className="btn-primary">Save Draft</button></div>
      </div>
      <div className="space-y-4">
        {[{ icon: CalendarClock, title: 'Business-hour scheduling', body: 'Send now or later, respecting timezone, weekdays, and daily caps.' }, { icon: GitBranch, title: 'Follow-up sequences', body: 'Day 0 → Day 3 → Day 7 → Day 14 with conditions: not opened, opened, clicked, no reply.' }, { icon: SendHorizonal, title: 'SMTP rotation + failover', body: 'Pick healthy senders under limits; pause failed accounts and continue with the next account.' }].map(({ icon: Icon, title, body }) => <div key={title} className="card p-5"><Icon className="text-brand-600" /><h3 className="mt-3 font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{body}</p></div>)}
      </div>
    </div>
    <DataTable headers={['Campaign', 'Status', 'Sent', 'Open Rate', 'Reply Rate']} rows={campaigns.map((c) => [<span key="n" className="font-bold text-slate-950">{c.name}</span>, <StatusBadge key="s" status={c.status} />, c.sent, c.open, c.reply])} />
  </div>;
}
