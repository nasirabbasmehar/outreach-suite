import Link from 'next/link';
import { BarChart3, Bot, ContactRound, LayoutDashboard, Mail, MailPlus, Settings, Send, Server, Sparkles } from 'lucide-react';

const nav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/smtp', label: 'SMTP Accounts', icon: Server },
  { href: '/leads', label: 'Leads', icon: ContactRound },
  { href: '/campaigns', label: 'Campaigns', icon: Send },
  { href: '/templates', label: 'Templates', icon: Mail },
  { href: '/ai-writer', label: 'AI Writer', icon: Bot },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings }
];

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#eef6ff_0,#f8fafc_36%,#f8fafc_100%)]">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200/80 bg-white/80 p-5 backdrop-blur-xl lg:block">
        <Link href="/" className="mb-8 flex items-center gap-3 rounded-3xl bg-slate-950 p-3 text-white">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-500"><MailPlus size={22} /></span>
          <span>
            <span className="block text-lg font-black tracking-tight">Outreach Suite</span>
            <span className="text-xs text-slate-300">SMTP-first campaigns</span>
          </span>
        </Link>
        <nav className="space-y-1">
          {nav.map((item) => <Link key={item.href} href={item.href} className="group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-brand-50 hover:text-brand-700"><item.icon size={18} />{item.label}</Link>)}
        </nav>
        <div className="absolute bottom-5 left-5 right-5 rounded-3xl border border-brand-100 bg-brand-50 p-4">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-brand-600"><Sparkles size={18} /></div>
          <p className="text-sm font-bold text-slate-900">AI deliverability coach</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">Generate compliant copy, A/B tests, and spam-score recommendations.</p>
        </div>
      </aside>
      <main className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/75 px-5 py-4 backdrop-blur-xl md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="label">Bulk Email Outreach</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">High-performance campaign command center</h1>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn-secondary">Import</button>
              <button className="btn-primary">New Campaign</button>
            </div>
          </div>
        </header>
        <div className="p-5 md:p-8">{children}</div>
      </main>
    </div>
  );
}
