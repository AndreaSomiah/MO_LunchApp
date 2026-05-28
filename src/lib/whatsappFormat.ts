import type { Order } from '@/types/order';
import type { InventoryItem, InventoryRequest } from '@/types/inventory';
import type { AppSettings } from '@/types/settings';
import type { SupplyOrder } from '@/types/supplyOrder';
import { formatCurrency } from './formatCurrency';

const DIVIDER = '\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501';

const formatLongDate = (date: Date): string =>
  date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

const formatIsoDate = (iso: string): string => {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

const formatCutoff = (cutoffTime: string | undefined): string => {
  if (!cutoffTime) return '';
  const [hh, mm] = cutoffTime.split(':');
  const h = Number(hh);
  if (!Number.isFinite(h)) return cutoffTime;
  const period = h >= 12 ? 'PM' : 'AM';
  const display = ((h + 11) % 12) + 1;
  return `${display}:${mm} ${period}`;
};

export const formatLunchOrdersForWhatsApp = (
  orders: Order[],
  settings: AppSettings | null | undefined,
  date: Date = new Date()
): string => {
  const active = orders.filter((o) => o.status !== 'cancelled');
  const tallies = new Map<string, number>();
  let grandTotal = 0;
  const uniqueUsers = new Set<string>();

  for (const order of active) {
    uniqueUsers.add(order.userId);
    grandTotal += Number(order.totalAmount) || 0;
    for (const item of order.items) {
      const name = item.menuItem?.name ?? 'Item';
      tallies.set(name, (tallies.get(name) ?? 0) + item.quantity);
    }
  }

  const sorted = Array.from(tallies.entries()).sort((a, b) => b[1] - a[1]);
  const summaryLines = sorted.length
    ? sorted.map(([name, qty]) => `- ${name} \u00d7 ${qty}`).join('\n')
    : '- (no items)';

  const cutoff = formatCutoff(settings?.cutoffTime);
  const cutoffLine = cutoff ? `\u23f0 Orders closed at ${cutoff}\n` : '';

  return [
    `\ud83c\udf7d\ufe0f *ORRA LUNCH ORDER \u2014 ${formatLongDate(date)}*`,
    DIVIDER,
    '',
    '\ud83d\udccb *ORDER SUMMARY*',
    summaryLines,
    '',
    `\ud83d\udc65 *${uniqueUsers.size} ${uniqueUsers.size === 1 ? 'person' : 'people'} ordered*`,
    `\ud83d\udcb0 *Total: ${formatCurrency(grandTotal, settings)}*`,
    '',
    `${cutoffLine}_Powered by Orra_`,
  ].join('\n');
};

export const formatInventoryForWhatsApp = (
  lowStockItems: InventoryItem[],
  pendingRequests: InventoryRequest[],
  date: Date = new Date()
): string => {
  const dateStr = formatLongDate(date);

  const lowStockBlock = lowStockItems.length
    ? lowStockItems
        .map((i) => `- ${i.name} \u2014 ${i.stockLevel} left (min: ${i.threshold})`)
        .join('\n')
    : '\u2705 All items above threshold';

  const requestsBlock = pendingRequests.length
    ? pendingRequests
        .map((r) => `- ${r.itemName} \u00d7 ${r.quantityNeeded} \u2014 ${r.requestedByName ?? 'Unknown'}`)
        .join('\n')
    : '\u2705 No pending requests';

  return [
    `\ud83d\udce6 *ORRA INVENTORY UPDATE \u2014 ${dateStr}*`,
    DIVIDER,
    '',
    `\ud83d\udd34 *LOW STOCK ALERTS (${lowStockItems.length})*`,
    lowStockBlock,
    '',
    `\ud83d\udfe1 *PENDING REQUESTS (${pendingRequests.length})*`,
    requestsBlock,
    '',
    '_Powered by Orra_',
  ].join('\n');
};

export const formatSupplyOrderForWhatsApp = (order: SupplyOrder): string => {
  const dateStr = formatIsoDate(order.eventDate);
  const itemsBlock = order.items.length
    ? order.items
        .map((i) => `- ${i.name} \u00d7 ${i.quantity}${i.unit ? ` ${i.unit}` : ''}`)
        .join('\n')
    : '- (no items)';

  const notesLine = order.notes?.trim() ? `\ud83d\udcdd *Notes:* ${order.notes.trim()}\n\n` : '';

  if (order.type === 'daily') {
    return [
      `\ud83d\udccb *DAILY ORDER \u2014 ${dateStr}*`,
      DIVIDER,
      '',
      '\ud83d\uded2 *ITEMS*',
      itemsBlock,
      '',
      `${notesLine}_Orra \u2014 Workplace Ordering_`,
    ].join('\n');
  }

  const headerLines: string[] = [
    `\ud83d\udcc5 ${dateStr}${order.eventTime ? ` at ${order.eventTime}` : ''}`,
  ];
  if (order.venue) headerLines.push(`\ud83d\udccd ${order.venue}`);
  if (order.guestCount) headerLines.push(`\ud83d\udc65 Approx. ${order.guestCount} guests`);

  return [
    `\ud83c\udf89 *EVENT ORDER \u2014 ${order.title}*`,
    DIVIDER,
    headerLines.join('\n'),
    '',
    '\ud83d\uded2 *ITEMS NEEDED*',
    itemsBlock,
    '',
    `${notesLine}_Orra \u2014 Workplace Ordering_`,
  ].join('\n');
};
