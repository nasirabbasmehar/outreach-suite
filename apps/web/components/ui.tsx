import clsx from 'clsx';
import { ArrowUpRight } from 'lucide-react';

export function PageTitle({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="label">{eyebrow}</p><h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{title}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p></div>{action}</div>;
}

export function StatCard({ label, value, trend }: { label: string; value: string; trend: string }) {
  return <div className="card p-5"><div className="flex items-start justify-between"><p className="text-sm font-semibold text-slate-500">{label}</p><span className="badge bg-emerald-50 text-emerald-700">{trend}</span></div><p className="mt-4 text-3xl font-black tracking-tight text-slate-950">{value}</p><div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-2/3 rounded-full bg-gradient-to-r from-brand-500 to-cyan-400" /></div></div>;
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = { Active: 'bg-emerald-50 text-emerald-700', Healthy: 'bg-emerald-50 text-emerald-700', Scheduled: 'bg-blue-50 text-blue-700', Warning: 'bg-amber-50 text-amber-700', Paused: 'bg-slate-100 text-slate-600', Draft: 'bg-purple-50 text-purple-700' };
  return <span className={clsx('badge', styles[status] ?? 'bg-slate-100 text-slate-600')}>{status}</span>;
}

export function DataTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return <div className="card overflow-hidden"><table className="w-full min-w-[760px] text-left"><thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-500"><tr>{headers.map((h) => <th key={h} className="px-5 py-4 font-bold">{h}</th>)}<th className="px-5 py-4" /></tr></thead><tbody className="divide-y divide-slate-100 text-sm">{rows.map((row, i) => <tr key={i} className="hover:bg-slate-50/70">{row.map((cell, j) => <td key={j} className="px-5 py-4 text-slate-700">{cell}</td>)}<td className="px-5 py-4 text-right"><button className="inline-flex items-center gap-1 text-sm font-bold text-brand-600">View <ArrowUpRight size={14} /></button></td></tr>)}</tbody></table></div>;
}

export function Field({ label, placeholder, type = 'text' }: { label: string; placeholder: string; type?: string }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">{label}</span><input type={type} placeholder={placeholder} className="input" /></label>;
}

export function TextArea({ label, placeholder, rows = 8 }: { label: string; placeholder: string; rows?: number }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">{label}</span><textarea rows={rows} placeholder={placeholder} className="input resize-none" /></label>;
}
