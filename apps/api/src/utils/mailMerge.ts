type LeadLike = {
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  company?: string | null;
  website?: string | null;
  location?: string | null;
  jobTitle?: string | null;
  phone?: string | null;
  email?: string | null;
  customFields?: unknown;
};

export function leadVariables(lead: LeadLike): Record<string, string> {
  const custom = typeof lead.customFields === 'object' && lead.customFields !== null ? lead.customFields as Record<string, unknown> : {};
  const base: Record<string, unknown> = {
    name: lead.name,
    first_name: lead.firstName,
    last_name: lead.lastName,
    company: lead.company,
    website: lead.website,
    location: lead.location,
    job_title: lead.jobTitle,
    phone: lead.phone,
    email: lead.email,
    ...custom
  };
  return Object.fromEntries(Object.entries(base).map(([k, v]) => [k, v == null ? '' : String(v)]));
}

export function renderMailMerge(template: string, lead: LeadLike): string {
  const vars = leadVariables(lead);
  const conditionPattern = /{{\s*if\s+([a-zA-Z0-9_]+)\s*}}([\s\S]*?){{\s*endif\s*}}/g;
  let output = template.replace(conditionPattern, (_match, variable, content) => (vars[variable]?.trim() ? content : ''));
  output = output.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_match, variable) => vars[variable] ?? '');
  return output;
}

export function extractVariables(template: string): string[] {
  const variables = new Set<string>();
  for (const match of template.matchAll(/{{\s*(?:if\s+)?([a-zA-Z0-9_]+)\s*}}/g)) variables.add(match[1]);
  return [...variables];
}
