/**
 * CSV Auto-Detector
 * Intelligently detects CSV format and maps columns for any broker
 */

import Papa from 'papaparse'

// Ensure Papa is available (for server-side compatibility)
if (typeof Papa === 'undefined') {
  throw new Error('PapaParse (papaparse) module not found. Please install: npm install papaparse')
}

export interface CSVColumnMapping {
  date: string | null;
  symbol: string | null;
  quantity: string | null;
  price: string | null;
  trade_type: string | null;
  instrument_type: string | null;
  lot_size: string | null;
  segment: string | null;
}

export interface DetectedCSVFormat {
  mapping: CSVColumnMapping;
  confidence: number;
  broker: string;
  sampleData: any[];
}

/**
 * Detect CSV format and map columns automatically
 */
export function detectCSVFormat(csvContent: string): DetectedCSVFormat {
  // Ensure Papa is available
  if (typeof Papa === 'undefined' || !Papa || !Papa.parse) {
    throw new Error('PapaParse (papaparse) is not available. Please ensure papaparse is installed: npm install papaparse')
  }
  
  const parsed = Papa.parse(csvContent, { 
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim()
  });
  
  if (!parsed.data || parsed.data.length === 0) {
    throw new Error('CSV file is empty or invalid');
  }
  
  const headers = Object.keys(parsed.data[0] || {});
  const sampleRows = parsed.data.slice(0, 5).filter(row => row && Object.keys(row).length > 0);
  
  console.log('CSV Headers detected:', headers);
  console.log('Sample rows:', sampleRows.length);
  
  // Column name patterns for detection
  const columnPatterns = {
    date: [
      'date', 'trade_date', 'tradedate', 'order_execution_time', 'execution_time', 
      'timestamp', 'datetime', 'trade date', 'order date', 'time', 'executed_at',
      'order_time', 'fill_time', 'transaction_date', 'execution_date'
    ],
    symbol: [
      'symbol', 'tradingsymbol', 'trading_symbol', 'scrip', 'instrument', 
      'stock', 'ticker', 'instrument_name', 'scrip name', 'stock name', 
      'security', 'script', 'company', 'underlying', 'tradingsymbol'
    ],
    quantity: [
      'quantity', 'qty', 'volume', 'trade_qty', 'filled_quantity', 
      'filled_qty', 'executed_qty', 'order_qty', 'lot size', 'lots',
      'contracts', 'shares', 'units'
    ],
    price: [
      'price', 'trade_price', 'executed_price', 'avg_price', 'average_price', 
      'rate', 'ltp', 'last_traded_price', 'execution_price', 'fill price',
      'fill_price', 'trade rate', 'executed rate', 'order_price'
    ],
    trade_type: [
      'trade_type', 'tradetype', 'type', 'transaction_type', 'transaction', 
      'order_type', 'buy_sell', 'side', 'action', 'direction', 'b/s', 'buy/sell',
      'order_side', 'trade side', 'buy or sell'
    ],
    instrument_type: [
      'instrument_type', 'segment', 'product', 'series', 'exchange', 
      'market', 'category', 'asset_class', 'instrument', 'product_type'
    ],
    lot_size: [
      'lot_size', 'lotsize', 'lot', 'multiplier', 'contract_size', 
      'lot multiplier', 'contract multiplier'
    ],
    segment: [
      'segment', 'exchange', 'market', 'exchange_segment', 'segment_name',
      'market segment', 'trading segment'
    ],
  };
  
  const mapping: CSVColumnMapping = {
    date: null,
    symbol: null,
    quantity: null,
    price: null,
    trade_type: null,
    instrument_type: null,
    lot_size: null,
    segment: null,
  };
  
  let matchCount = 0;
  
  // Match headers to patterns
  for (const [field, patterns] of Object.entries(columnPatterns)) {
    for (const header of headers) {
      const headerLower = header.toLowerCase().trim().replace(/[_\s-]/g, '');
      const matched = patterns.some(pattern => {
        const patternLower = pattern.toLowerCase().replace(/[_\s-]/g, '');
        return headerLower.includes(patternLower) || patternLower.includes(headerLower);
      });
      
      if (matched) {
        mapping[field as keyof CSVColumnMapping] = header;
        matchCount++;
        break;
      }
    }
  }
  
  // Detect broker from headers or content
  let broker = 'unknown';
  const headersStr = headers.join(',').toLowerCase();
  const contentStr = csvContent.substring(0, 500).toLowerCase();
  
  if (headersStr.includes('zerodha') || headersStr.includes('kite') || contentStr.includes('zerodha')) {
    broker = 'zerodha';
  } else if (headersStr.includes('upstox') || contentStr.includes('upstox')) {
    broker = 'upstox';
  } else if (headersStr.includes('angel') || headersStr.includes('angelone') || contentStr.includes('angel')) {
    broker = 'angelone';
  } else if (headersStr.includes('groww') || contentStr.includes('groww')) {
    broker = 'groww';
  } else if (headersStr.includes('icici') || contentStr.includes('icici')) {
    broker = 'icici';
  } else if (headersStr.includes('hdfc') || contentStr.includes('hdfc')) {
    broker = 'hdfc';
  } else if (headersStr.includes('kotak') || contentStr.includes('kotak')) {
    broker = 'kotak';
  }
  
  // Calculate confidence based on required fields
  const requiredFields = ['date', 'symbol', 'quantity', 'price'];
  const requiredMatches = requiredFields.filter(f => mapping[f as keyof CSVColumnMapping]).length;
  const confidence = Math.round((requiredMatches / requiredFields.length) * 100);
  
  console.log('Detected mapping:', mapping);
  console.log('Confidence:', confidence + '%');
  console.log('Broker:', broker);
  
  return { 
    mapping, 
    confidence, 
    broker, 
    sampleData: sampleRows 
  };
}

/**
 * Parse CSV using detected mapping
 */
export function parseCSVWithMapping(csvContent: string, mapping: CSVColumnMapping): any[] {
  const parsed = Papa.parse(csvContent, { 
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim()
  });
  
  const rows = parsed.data as any[];
  const trades: any[] = [];
  
  for (const row of rows) {
    if (!row || Object.keys(row).length === 0) continue;
    
    // Extract values using mapping
    const tradeDate = mapping.date ? (row[mapping.date] || '').trim() : null;
    const symbol = mapping.symbol ? (row[mapping.symbol] || '').trim() : null;
    const quantityStr = mapping.quantity ? (row[mapping.quantity] || '0').toString().trim() : '0';
    const priceStr = mapping.price ? (row[mapping.price] || '0').toString().trim() : '0';
    const tradeTypeStr = mapping.trade_type ? (row[mapping.trade_type] || '').trim() : '';
    const instrumentTypeStr = mapping.instrument_type ? (row[mapping.instrument_type] || '').trim() : '';
    const lotSizeStr = mapping.lot_size ? (row[mapping.lot_size] || '1').toString().trim() : '1';
    const segmentStr = mapping.segment ? (row[mapping.segment] || '').trim() : '';
    
    // Parse numeric values
    const quantity = parseFloat(quantityStr.replace(/[^\d.-]/g, '')) || 0;
    const price = parseFloat(priceStr.replace(/[^\d.-]/g, '')) || 0;
    const lotSize = parseInt(lotSizeStr.replace(/[^\d]/g, '')) || 1;
    
    // Normalize trade type
    const tradeType = normalizeTradeType(tradeTypeStr);
    
    // Normalize instrument type
    const instrumentType = normalizeInstrumentType(instrumentTypeStr, segmentStr);
    
    // Normalize date format
    const normalizedDate = normalizeDate(tradeDate);
    
    // Validate required fields
    if (normalizedDate && symbol && quantity > 0 && price > 0) {
      trades.push({
        trade_date: normalizedDate,
        symbol: symbol.toUpperCase(),
        quantity: Math.abs(quantity),
        price: Math.abs(price),
        trade_type: tradeType,
        instrument_type: instrumentType,
        lot_size: lotSize,
        segment: segmentStr || 'NSE',
      });
    }
  }
  
  console.log(`Parsed ${trades.length} valid trades from CSV`);
  return trades;
}

/**
 * Normalize trade type to BUY or SELL
 */
function normalizeTradeType(value: string): 'BUY' | 'SELL' {
  if (!value) return 'BUY';
  
  const normalized = value.toUpperCase().trim();
  
  if (['BUY', 'B', 'BOUGHT', 'LONG', 'PURCHASE', 'PURCHASED'].includes(normalized)) {
    return 'BUY';
  }
  if (['SELL', 'S', 'SOLD', 'SHORT', 'SALE'].includes(normalized)) {
    return 'SELL';
  }
  
  // Default to BUY if unclear
  return 'BUY';
}

/**
 * Normalize instrument type
 */
function normalizeInstrumentType(value: string, segment: string): 'EQUITY' | 'FO' | 'OPTIONS' {
  const combined = (value + ' ' + segment).toUpperCase();
  
  if (combined.includes('FUT') || combined.includes('FUTURE')) {
    return 'FO';
  }
  if (combined.includes('OPT') || combined.includes('OPTION') || 
      combined.includes('CE') || combined.includes('PE') ||
      combined.includes('CALL') || combined.includes('PUT')) {
    return 'OPTIONS';
  }
  if (combined.includes('EQ') || combined.includes('EQUITY') || 
      combined.includes('CASH') || combined.includes('DELIVERY')) {
    return 'EQUITY';
  }
  
  // Default to EQUITY
  return 'EQUITY';
}

/**
 * Normalize date format to YYYY-MM-DD
 * Handles various date formats including DD-MM-YYYY, MM-DD-YYYY, YYYY-MM-DD, etc.
 */
function normalizeDate(dateStr: string): string | null {
  if (!dateStr) return null;
  
  // Remove time portion if present
  const dateOnly = dateStr.split(' ')[0].split('T')[0].trim();
  
  // Remove any non-numeric characters except separators
  const cleaned = dateOnly.replace(/[^\d\-\/]/g, '');
  
  // Try to parse various date formats
  // Format: DD-MM-YYYY or DD/MM/YYYY (common in India)
  const ddMMyyyy = cleaned.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
  if (ddMMyyyy) {
    const [, day, month, year] = ddMMyyyy;
    const d = parseInt(day);
    const m = parseInt(month);
    const y = parseInt(year);
    
    // Validate: day 1-31, month 1-12, year reasonable
    if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 2000 && y <= 2100) {
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
  }
  
  // Format: YYYY-MM-DD or YYYY/MM/DD (ISO format)
  const yyyyMMdd = cleaned.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/);
  if (yyyyMMdd) {
    const [, year, month, day] = yyyyMMdd;
    const y = parseInt(year);
    const m = parseInt(month);
    const d = parseInt(day);
    
    // Validate: year reasonable, month 1-12, day 1-31
    if (y >= 2000 && y <= 2100 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
  }
  
  // Format: MM-DD-YYYY or MM/DD/YYYY (US format)
  const mmDDyyyy = cleaned.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
  if (mmDDyyyy) {
    const [, month, day, year] = mmDDyyyy;
    const m = parseInt(month);
    const d = parseInt(day);
    const y = parseInt(year);
    
    // Validate: month 1-12, day 1-31, year reasonable
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 2000 && y <= 2100) {
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
  }
  
  // Format: DD-YYYY-MM (unusual but possible)
  const ddYYYYmm = cleaned.match(/^(\d{1,2})[-\/](\d{4})[-\/](\d{1,2})$/);
  if (ddYYYYmm) {
    const [, day, year, month] = ddYYYYmm;
    const d = parseInt(day);
    const y = parseInt(year);
    const m = parseInt(month);
    
    // Validate: day 1-31, year reasonable, month 1-12
    if (d >= 1 && d <= 31 && y >= 2000 && y <= 2100 && m >= 1 && m <= 12) {
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
  }
  
  // Format: YYYY-DD-MM (unusual)
  const yyyyDDmm = cleaned.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/);
  if (yyyyDDmm) {
    const [, year, day, month] = yyyyDDmm;
    const y = parseInt(year);
    const d = parseInt(day);
    const m = parseInt(month);
    
    // Validate: year reasonable, day 1-31, month 1-12
    if (y >= 2000 && y <= 2100 && d >= 1 && d <= 31 && m >= 1 && m <= 12) {
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
  }
  
  // Try Date.parse as fallback (handles many formats)
  try {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      const year = parsed.getFullYear();
      const month = parsed.getMonth() + 1;
      const day = parsed.getDate();
      
      // Validate parsed date is reasonable
      if (year >= 2000 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
    }
  } catch (e) {
    // Date.parse failed, continue to return null
  }
  
  // If all parsing attempts failed, log warning and return null
  console.warn(`[CSV Parser] Could not parse date: "${dateStr}" (cleaned: "${cleaned}")`);
  return null;
}
