export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number, base: number): string {
  if (base === 0) return '—';
  return ((value / base) * 100).toFixed(1) + '%';
}
