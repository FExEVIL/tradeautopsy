export interface Trade {
  id: string;
  trade_id: string;
  order_id?: string;
  exchange_order_id?: string;
  tradingsymbol: string;
  exchange: string;
  instrument_token?: number;
  transaction_type: 'BUY' | 'SELL';
  product: 'MIS' | 'CNC' | 'NRML';
  order_type?: string;
  quantity: number;
  price: number;
  average_price?: number;
  exchange_timestamp?: string;
  order_timestamp?: string;
  trade_date: string | null;
  pnl?: number;
  status?: string;
  discipline_score?: number;
  setup_used?: string;
  mistakes?: string[];
  notes?: string;
  user_id?: string;
  created_at?: string;
  mood?: string;
}
