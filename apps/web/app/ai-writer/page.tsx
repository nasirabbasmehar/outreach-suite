'use client';

import { useState } from 'react';
import { Bot, Sparkles, Wand2 } from 'lucide-react';
import { Field, PageTitle, TextArea } from '@/components/ui';
import { API_URL } from '@/lib/api';

export default function AiWriterPage() {
  const [output, setOutput] = useState('AI output will appear here. Connect an OpenAI key in Settings or POST /ai/key, then generate copy.');
  const [loading, setLoading] = useState(false);
  async function demoGenerate() {
    setLoading(true);
    setOutput('Sample output\n\nSubject A: Quick idea for {{company}}\nSubject B: Reducing manual outreach work\n\nHi {{first_name}},\n\nI noticed {{company}} is investing in growth. We help teams personalize outbound emails while protecting deliverability through SMTP rotation, suppression lists, and analytics.\n\nWorth a quick look next week?\n\nBest,\n{{sender_name}}');
    setTimeout(() => setLoading(false), 500);
  }
  return <div className="space-y-6">
    <PageTitle eyebrow="AI Writer" title="Generate, personalize, rewrite, and spam-check emails" description="Bring your own OpenAI API key. Generate cold emails, follow-ups, subject lines, personal intros, spam-score recommendations, and A/B testing variants." action={<button onClick={demoGenerate} className="btn-primary"><Sparkles size={16} /> {loading ? 'Generating…' : 'Generate Sample'}</button>} />
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="card p-6"><div className="mb-5 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-600"><Bot /></span><div><h3 className="font-black">Prompt inputs</h3><p className="text-sm text-slate-500">API endpoint: {API_URL}/ai/generate</p></div></div><div className="space-y-4"><Field label="Offer" placeholder="AI-powered outreach platform" /><Field label="Target Audience" placeholder="B2B SaaS founders" /><Field label="Tone" placeholder="Professional and friendly" /><Field label="Goal" placeholder="Book a discovery call" /><TextArea label="Existing Draft" placeholder="Paste email to rewrite or spam-check" rows={6} /></div><button onClick={demoGenerate} className="btn-primary mt-5 w-full"><Wand2 size={16} /> Generate</button></div>
      <div className="card p-6"><h3 className="font-black">Output</h3><pre className="mt-4 min-h-[460px] whitespace-pre-wrap rounded-3xl bg-slate-950 p-5 text-sm leading-6 text-slate-100">{output}</pre></div>
    </div>
    <div className="grid gap-4 md:grid-cols-5">{['Cold Emails','Follow-Ups','Subject Lines','Spam Score','A/B Tests'].map((item) => <div key={item} className="card p-5 text-center font-bold">{item}</div>)}</div>
  </div>;
}
