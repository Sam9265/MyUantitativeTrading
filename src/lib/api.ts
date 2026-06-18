import type { Stock, KLineData, Market } from '@/types';

const API_BASE = '/api/v1';

async function request<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export interface MarketListResponse {
  market: Market;
  total: number;
  page: number;
  page_size: number;
  stocks: Stock[];
}

export interface MarketListParams {
  market: Market;
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface KLineResponse {
  code: string;
  period: string;
  data: KLineData[];
}

export function getMarketList(params: MarketListParams): Promise<MarketListResponse> {
  const query = new URLSearchParams();
  query.set('market', params.market);
  query.set('page', String(params.page ?? 1));
  query.set('page_size', String(params.pageSize ?? 50));
  if (params.search) query.set('search', params.search);
  if (params.sortBy) query.set('sort_by', params.sortBy);
  if (params.sortOrder) query.set('sort_order', params.sortOrder);
  return request<MarketListResponse>(`${API_BASE}/market/list?${query.toString()}`);
}

export function getStockQuote(code: string): Promise<Stock> {
  return request<Stock>(`${API_BASE}/market/stock/${encodeURIComponent(code)}`);
}

export function getKLine(
  code: string,
  period: 'daily' | 'weekly' | 'monthly' = 'daily',
  days: number = 365
): Promise<KLineResponse> {
  const query = new URLSearchParams();
  query.set('period', period);
  query.set('days', String(days));
  return request<KLineResponse>(
    `${API_BASE}/market/stock/${encodeURIComponent(code)}/kline?${query.toString()}`
  );
}
