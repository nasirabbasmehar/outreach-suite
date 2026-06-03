import { Activity, Clock, MousePointerClick, Reply, ShieldCheck, TrendingUp } from 'lucide-react';
import { campaigns, stats } from '@/lib/data';
import { DataTable, PageTitle, StatCard, StatusBadge } from '@/components/ui';

export default function DashboardPage() {
  return <div className="space-y-6">
    <PageTitle eyebrow="Dashboard" title="Campaign performance at a glance" description="Monitor sending volume, deliverability, replies, SMTP health, and AI recommendations from one modern control center." />
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{stats.map((s) => <StatCard key={s.label} {...s} />)}</div>
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div>
        <div className="mb-4 flex items-center justify-between"><h3 className="text-xl font-black">Campaigns</h3><button className="btn-secondary">Export CSV</button></div>
        <DataTable headers={['Name', 'Status', 'Sent', 'Open', 'Reply']} rows={campaigns.map((c) => [<span className="font-bold text-slate-950" key="n">{c.name}</span>, <StatusBadge key="s" status={c.status} />, c.sent, c.open, c.reply])} />
      </div>
      <div className="card p-6">
        <h3 className="text-xl font-black">Live signal stream</h3>
        <div className="mt-5 space-y-4">
          {[
            [Reply, 'Reply received', 'Maya from BrightOps asked for pricing.'],
            [MousePointerClick, 'CTA clicked', 'CloudNova clicked the demo link.'],
            [ShieldCheck, 'SMTP recovered', 'smtp.northmail.co passed connection test.'],
            [Clock, 'Follow-up scheduled', '2,184 contacts enter Day 3 sequence.']
          ].map(([Icon, title, body], i) => <div key={String(title)} className="flex gap-3 rounded-2xl border border-slate-100 p-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-50 text-brand-600"><Icon size={18} /></span><div><p className="text-sm font-bold text-slate-950">{String(title)}</p><p className="text-sm text-slate-600">{String(body)}</p></div></div>)}
        </div>
      </div>
    </div>
    <div className="grid gap-6 md:grid-cols-3">
      {[['Rotation engine', 'Balances volume across healthy SMTP accounts while enforcing hourly and daily limits.', Activity], ['Deliverability guardrails', 'Spam trigger checks, unsubscribe headers, suppression lists, and bounce monitoring.', ShieldCheck], ['AI optimization', 'Generate personalized intros, subject tests, CTAs, and sequence variants.', TrendingUp]].map(([title, body, Icon]) => <div key={String(title)} className="card p-6"><Icon className="text-brand-600" size={24} /><h3 className="mt-4 font-black">{String(title)}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{String(body)}</p></div>)}
    </div>
  </div>;
}
