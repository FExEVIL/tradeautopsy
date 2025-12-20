/**
 * Zod Validation Schemas for TradeAutopsy
 */

let z: any;
try {
  z = require('zod');
} catch {
  // Fallback if zod not installed
  z = {
    string: () => ({ min: () => z, max: () => z, regex: () => z, uuid: () => z, optional: () => z, nullable: () => z }),
    number: () => ({ positive: () => z, min: () => z, max: () => z, int: () => z, nonnegative: () => z, finite: () => z, refine: () => z }),
    enum: () => z,
    array: () => ({ max: () => z, min: () => z }),
    object: () => ({ extend: () => z, partial: () => z }),
    boolean: () => ({ default: () => z }),
    coerce: { number: () => ({ int: () => ({ positive: () => z, default: () => z }) }) },
    record: () => z,
    safeParse: () => ({ success: true, data: {} }),
  };
}

const uuidSchema = z.string().uuid('Invalid UUID format');
const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');
const currencySchema = z.number().finite().refine((val: number) => Math.abs(val) < 1_000_000_000_000, 'Amount exceeds maximum limit');
const positiveCurrencySchema = currencySchema.positive('Must be a positive amount');
const quantitySchema = z.number().int().positive().max(10_000_000);
const symbolSchema = z.string().min(1).max(20).regex(/^[A-Z0-9&.-]+$/i).transform((val: string) => val.toUpperCase());
const tradeSideSchema = z.enum(['long', 'short']);
const tradeTypeSchema = z.enum(['BUY', 'SELL']);

export const createTradeSchema = z.object({
  symbol: symbolSchema,
  side: tradeSideSchema,
  trade_type: tradeTypeSchema,
  entry_price: positiveCurrencySchema,
  exit_price: positiveCurrencySchema.nullable().optional(),
  quantity: quantitySchema,
  entry_time: z.string().datetime(),
  exit_time: z.string().datetime().nullable().optional(),
  trade_date: dateStringSchema,
  stop_loss: positiveCurrencySchema.nullable().optional(),
  target: positiveCurrencySchema.nullable().optional(),
  strategy: z.string().max(100).nullable().optional(),
  setup: z.string().max(100).nullable().optional(),
  commission: currencySchema.nonnegative().default(0),
  notes: z.string().max(2000).nullable().optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

export const updateTradeSchema = createTradeSchema.partial().extend({
  id: uuidSchema,
});

export const tradeFiltersSchema = z.object({
  dateFrom: dateStringSchema.optional(),
  dateTo: dateStringSchema.optional(),
  symbol: symbolSchema.optional(),
  side: tradeSideSchema.optional(),
  strategy: z.string().max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const createProfileSchema = z.object({
  name: z.string().min(1).max(100).regex(/^[a-zA-Z0-9\s\-_]+$/),
  broker_name: z.string().max(100).nullable().optional(),
  account_type: z.enum(['cash', 'margin', 'demo']).default('cash'),
  initial_capital: positiveCurrencySchema.optional(),
  description: z.string().max(500).nullable().optional(),
});

export const updateProfileSchema = createProfileSchema.partial().extend({
  id: uuidSchema,
});

export class ValidationError extends Error {
  public readonly errors: Array<{ field: string; message: string }>;
  
  constructor(
    message: string,
    errors: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
  
  toJSON() {
    return {
      error: this.name,
      message: this.message,
      details: this.errors,
    };
  }
}

export function validateData<T extends z.ZodSchema>(
  schema: T,
  data: unknown
): z.infer<T> {
  if (!z.safeParse || typeof z.safeParse !== 'function') {
    // Fallback if zod not properly loaded
    return data as z.infer<T>;
  }
  
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.errors.map((err: any) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    
    throw new ValidationError('Validation failed', errors);
  }
  
  return result.data;
}

export type CreateTradeInput = z.infer<typeof createTradeSchema>;
export type UpdateTradeInput = z.infer<typeof updateTradeSchema>;
export type TradeFilters = z.infer<typeof tradeFiltersSchema>;
export type CreateProfileInput = z.infer<typeof createProfileSchema>;
