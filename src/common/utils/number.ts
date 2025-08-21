export function parseRuNumber(input?: string | number | null): number | null {
  if (input === null || input === undefined) return null;
  if (typeof input === 'number') return input;
  const s = String(input).trim();
  if (!s) return null;
  const cleaned = s.replace(/\s+/g, '').replace(',', '.');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}
