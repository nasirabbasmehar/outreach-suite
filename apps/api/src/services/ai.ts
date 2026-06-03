import { decryptSecret } from '../lib/crypto.js';

export type AiMode = 'cold_email' | 'follow_up' | 'sales' | 'partnership' | 'subject_lines' | 'personalization' | 'spam_score' | 'rewrite' | 'ab_test';

type AiInput = {
  mode: AiMode;
  apiKeyEncrypted: string;
  offer?: string;
  targetAudience?: string;
  tone?: string;
  goal?: string;
  email?: string;
  name?: string;
  company?: string;
  jobTitle?: string;
  website?: string;
};

export async function runAi(input: AiInput) {
  const apiKey = decryptSecret(input.apiKeyEncrypted);
  const prompt = buildPrompt(input);
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      input: [
        { role: 'system', content: 'You are an expert compliant B2B email outreach copywriter. Avoid deceptive claims, spammy wording, fake urgency, and missing unsubscribe language. Return concise structured markdown.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    })
  });
  if (!response.ok) throw new Error(`OpenAI error: ${response.status} ${await response.text()}`);
  const json = await response.json() as { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> };
  return json.output_text ?? json.output?.flatMap((o) => o.content ?? []).map((c) => c.text).filter(Boolean).join('\n') ?? '';
}

function buildPrompt(input: AiInput) {
  const base = `Offer: ${input.offer ?? ''}\nTarget audience: ${input.targetAudience ?? ''}\nTone: ${input.tone ?? 'professional'}\nGoal: ${input.goal ?? ''}\nEmail draft: ${input.email ?? ''}\nLead: ${input.name ?? ''}, ${input.jobTitle ?? ''}, ${input.company ?? ''}, ${input.website ?? ''}`;
  switch (input.mode) {
    case 'subject_lines': return `${base}\nGenerate 12 subject lines: 4 curiosity-based, 4 benefit-based, 2 question-based, 2 personalized. Keep under 55 characters where possible.`;
    case 'personalization': return `${base}\nGenerate 5 short personalized opening lines using only provided lead facts. Do not fabricate.`;
    case 'spam_score': return `${base}\nAnalyze deliverability risk. Return spam score 0-100, trigger words, HTML/plaintext advice, authentication advice, and rewrites.`;
    case 'rewrite': return `${base}\nRewrite the email in the requested tone. Make it concise, human, and compliant.`;
    case 'ab_test': return `${base}\nCreate A/B variants for subject, intro, CTA, and value proposition. Include testing hypothesis.`;
    case 'follow_up': return `${base}\nWrite 3 follow-up emails for a sequence at day 3, 7, and 14.`;
    default: return `${base}\nGenerate 3 cold outreach email variants with subject line, body, and CTA. Include mail-merge variables where useful.`;
  }
}
