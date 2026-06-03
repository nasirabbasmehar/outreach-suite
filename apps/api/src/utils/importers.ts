import { parseString } from '@fast-csv/parse';
import xlsx from 'xlsx';

export async function parseCsv(buffer: Buffer): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    const rows: Record<string, string>[] = [];
    parseString(buffer.toString('utf8'), { headers: true, ignoreEmpty: true, trim: true })
      .on('error', reject)
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve(rows));
  });
}

export function parseJson(buffer: Buffer): Record<string, unknown>[] {
  const value = JSON.parse(buffer.toString('utf8'));
  if (!Array.isArray(value)) throw new Error('JSON import must be an array of objects');
  return value;
}

export function parseXlsx(buffer: Buffer): Record<string, unknown>[] {
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  return xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });
}

export async function parseTableByFilename(filename: string, buffer: Buffer) {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.csv')) return parseCsv(buffer);
  if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) return parseXlsx(buffer);
  if (lower.endsWith('.json')) return parseJson(buffer);
  throw new Error('Unsupported file type. Use CSV, XLSX, or JSON.');
}

export function parsePastedLeads(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  return lines.map((line) => {
    const parts = line.includes('\t') ? line.split('\t') : line.split(',');
    return { email: parts[0]?.trim(), name: parts[1]?.trim() ?? '', company: parts[2]?.trim() ?? '' };
  }).filter((row) => row.email);
}
