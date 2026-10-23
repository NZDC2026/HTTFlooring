// Shared CSV utilities; no sample stores, exchange rates or prototype state.
export function csvText(rows: string[][]): string {
 // Prevent spreadsheet applications interpreting exported user text as formulas.
 return rows.map(row => row.map(v => `"${(/^[=+@\-\t\r]/.test(v) ? "'" + v : v).replaceAll('"', '""')}"`).join(',')).join('\r\n');
}
export function downloadFile(name: string, content: string, type = 'text/csv') { const url = URL.createObjectURL(new Blob([content], { type })); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 500); }
/** Handles quoted commas, escaped quotes and multiline CSV; rejects malformed quotes. */
export function parseCsv(text: string): string[][] {
 const rows: string[][] = []; let row: string[] = [], cell = '', quoted = false, closed = false;
 const pushCell = () => { row.push(cell); cell = ''; closed = false; };
 const pushRow = () => { pushCell(); if (row.some(v => v.trim())) rows.push(row); row = []; };
 for (let i = 0; i < text.length; i++) {
  const c = text[i];
  if (quoted) { if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else { quoted = false; closed = true; } } else cell += c; }
  else if (c === '"') { if (cell || closed) throw new Error('Malformed CSV quote.'); quoted = true; }
  else if (c === ',') pushCell();
  else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; pushRow(); }
  else { if (closed && c.trim()) throw new Error('Unexpected text after a quoted field.'); if (!closed) cell += c; }
 }
 if (quoted) throw new Error('An opened CSV quote was not closed.');
 if (cell || row.length || closed) pushRow();
 return rows;
}
