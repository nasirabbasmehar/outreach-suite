export const stats = [
  { label: 'Emails Sent', value: '128,430', trend: '+18.4%' },
  { label: 'Delivery Rate', value: '97.2%', trend: '+2.1%' },
  { label: 'Open Rate', value: '48.6%', trend: '+7.8%' },
  { label: 'Reply Rate', value: '11.9%', trend: '+3.4%' }
];

export const campaigns = [
  { name: 'SaaS Founder Outreach', status: 'Active', sent: '18,230', open: '51.2%', reply: '12.4%' },
  { name: 'Partnership Q3', status: 'Scheduled', sent: '0', open: '—', reply: '—' },
  { name: 'Agency Follow-up', status: 'Paused', sent: '7,412', open: '44.7%', reply: '8.9%' }
];

export const smtpAccounts = [
  { sender: 'Alex Morgan <alex@northmail.co>', host: 'smtp.northmail.co', group: 'founders', health: 'Healthy', daily: '214 / 600' },
  { sender: 'Growth Team <growth@acme.io>', host: 'smtp.acme.io', group: 'default', health: 'Warning', daily: '480 / 500' },
  { sender: 'Partnerships <hello@partner.dev>', host: 'mail.partner.dev', group: 'partners', health: 'Paused', daily: '0 / 250' }
];

export const leads = [
  { name: 'John Carter', company: 'Acme Inc.', title: 'VP Sales', email: 'john@acme.com', vars: 'industry, revenue' },
  { name: 'Maya Chen', company: 'BrightOps', title: 'Founder', email: 'maya@brightops.io', vars: 'city, stack' },
  { name: 'Sam Patel', company: 'CloudNova', title: 'Growth Lead', email: 'sam@cloudnova.co', vars: 'service, team_size' }
];
