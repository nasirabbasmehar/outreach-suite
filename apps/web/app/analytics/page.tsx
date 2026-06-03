import { BarChart3, Download, Filter, PieChart, TrendingUp } from 'lucide-react';
import { PageTitle, StatCard } from '@/components/ui';

const metrics = [
  { label: 'Delivery Rate', value: '97.2%', trend: '+2.1%' },
  { label: 'Open Rate', value: '48.6%', trend: '+7.8%' },
  { label: 'Click Rate', value: '18.3%', trend: '+4.6%' },
  { label: 'Bounce Rate', value: '1.8%', trend: '-0.9%' }
];

export default function AnalyticsPage() {
  const bars = [82, 64, 73, 91, 58, 77, 88, 69, 94, 62, 84, 71];
  return <div className="space-y-6">
    <PageTitle eyebrow="Analytics" title="Track opens, clicks, replies, bounces, and SMTP performance" description="Filter by campaign, SMTP account, and date range. Export reports as CSV from the API, with extension points for XLSX and PDF." action={<button className="btn-primary"><Download size={16} /> Export</button>} />
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{metrics.map((m) => <StatCard key={m.label} {...m} />)}</div>
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="card p-6"><div className="flex items-center justify-between"><h3 className="font-black">Engagement trend</h3><button className="btn-secondary"><Filter size={16} /> Filter</button></div><div className="mt-8 flex h-72 items-end gap-3">{bars.map((h, i) => <div key={i} className="flex flex-1 flex-col items-center gap-2"><div className="w-full rounded-t-2xl bg-gradient-to-t from-brand-600 to-cyan-300" style={{ height: `${h}%` }} /><span className="text-xs font-bold text-slate-400">{i + 1}</span></div>)}</div></div>
      <div className="space-y-4">{[{ icon: BarChart3, title: 'Real-time tracking', body: 'Pixel opens and redirect clicks update events immediately.' }, { icon: PieChart, title: 'Performance filters', body: 'Campaign, SMTP account, and date range filters are exposed in /analytics/overview.' }, { icon: TrendingUp, title: 'SMTP metrics', body: 'Bounce and reply rate per sender help pause poor performers.' }].map(({ icon: Icon, title, body }) => <div key={title} className="card p-5"><Icon className="text-brand-600" /><h3 className="mt-3 font-black">{title}</h3><p className="mt-2 text-sm text-slate-600">{body}</p></div>)}</div>
    </div>
  </div>;
}
