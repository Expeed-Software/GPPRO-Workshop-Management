import { apiClient } from '../api/client';

export interface ExportColumn {
  key: string;
  label: string;
}

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export function rowsToCsv(rows: any[], columns?: ExportColumn[]): string {
  const cols = columns && columns.length ? columns : Object.keys(rows[0] ?? {}).map((key) => ({ key, label: key }));
  const header = cols.map((c) => csvCell(c.label)).join(',');
  const body = rows.map((row) => cols.map((c) => csvCell(row[c.key])).join(',')).join('\n');
  return `${header}\n${body}`;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Converts the rows currently loaded in a table (optionally using the same
// column/label list the table renders) into a CSV file and triggers a browser download.
export function downloadCsv(filename: string, rows: any[], columns?: ExportColumn[]): void {
  if (!rows || rows.length === 0) {
    window.alert('No data to export. Apply filters and click Generate first.');
    return;
  }
  downloadBlob(new Blob([rowsToCsv(rows, columns)], { type: 'text/csv;charset=utf-8;' }), filename);
}

// For endpoints that already serve a real file (Content-Disposition: attachment).
// Fetches through the authenticated axios instance (so the Bearer token is attached)
// and saves the response as a blob — a plain `window.open(url)` can't send that header.
export async function downloadFileFromApi(url: string, filename: string, params?: any): Promise<void> {
  const res = await apiClient.get(url, { params, responseType: 'blob' });
  downloadBlob(res.data as Blob, filename);
}
