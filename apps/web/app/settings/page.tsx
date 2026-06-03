import { KeyRound, LockKeyhole, ShieldCheck, Users } from 'lucide-react';
import { Field, PageTitle } from '@/components/ui';

export default function SettingsPage() {
  return <div className="space-y-6">
    <PageTitle eyebrow="Settings" title="Security, permissions, and integrations" description="Configure JWT-backed sessions, 2FA, role-based access, encrypted SMTP credentials, encrypted OpenAI API keys, and API rate limits." />
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="card p-6"><div className="mb-5 flex items-center gap-3"><KeyRound className="text-brand-600" /><h3 className="font-black">OpenAI API key</h3></div><Field label="API Key" placeholder="sk-..." type="password" /><button className="btn-primary mt-5">Encrypt & Save Key</button></div>
      <div className="card p-6"><div className="mb-5 flex items-center gap-3"><Users className="text-brand-600" /><h3 className="font-black">Invite team member</h3></div><div className="grid gap-4 md:grid-cols-2"><Field label="Email" placeholder="teammate@example.com" /><Field label="Role" placeholder="MANAGER or TEAM_MEMBER" /></div><button className="btn-primary mt-5">Invite</button></div>
    </div>
    <div className="grid gap-4 md:grid-cols-3">{[{ icon: ShieldCheck, title: 'Role-Based Access Control', body: 'Admin, Manager, and Team Member permissions for SMTP, campaigns, leads, and reporting.' }, { icon: LockKeyhole, title: '2FA Authentication', body: 'Schema and endpoints are ready for TOTP QR setup and verification.' }, { icon: KeyRound, title: 'Encrypted Secrets', body: 'SMTP passwords and user-supplied OpenAI keys are AES-256-GCM encrypted.' }].map(({ icon: Icon, title, body }) => <div key={title} className="card p-6"><Icon className="text-brand-600" /><h3 className="mt-4 font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{body}</p></div>)}</div>
  </div>;
}
