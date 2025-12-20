/**
 * Zod Validation Schemas
 * Complete validation with custom error messages and refinements
 */

import { z } from 'zod'

// ============================================
// TRADE SCHEMAS
// ============================================

export const createTradeSchema = z
  .object({
    trade_date: z.string().min(1, 'Trade date is required'),
    symbol: z.string().min(1, 'Symbol is required').transform((val) => val.toUpperCase().trim()),
    tradingsymbol: z.string().optional().transform((val) => val?.toUpperCase().trim()),
    side: z.enum(['LONG', 'SHORT'], {
      errorMap: () => ({ message: 'Side must be either LONG or SHORT' }),
    }),
    quantity: z
      .number({
        required_error: 'Quantity is required',
        invalid_type_error: 'Quantity must be a number',
      })
      .positive('Quantity must be positive')
      .int('Quantity must be an integer'),
    entry_price: z
      .number({
        required_error: 'Entry price is required',
        invalid_type_error: 'Entry price must be a number',
      })
      .positive('Entry price must be positive'),
    exit_price: z.number().positive('Exit price must be positive').optional(),
    entry_time: z.string().datetime('Invalid entry time format').optional().nullable(),
    exit_time: z.string().datetime('Invalid exit time format').optional().nullable(),
    strategy: z.string().optional().nullable(),
    setup: z.string().optional().nullable(),
    instrument_type: z.string().optional().nullable(),
    segment: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    tags: z.array(z.string()).optional().nullable(),
    emotion: z.string().optional().nullable(),
    rating: z.number().int().min(1).max(5).optional().nullable(),
    profile_id: z.string().uuid('Invalid profile ID').optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.exit_time && data.entry_time) {
        return new Date(data.exit_time) >= new Date(data.entry_time)
      }
      return true
    },
    {
      message: 'Exit time must be after entry time',
      path: ['exit_time'],
    }
  )
  .refine(
    (data) => {
      if (data.exit_price && data.entry_price) {
        // For LONG: exit_price should be >= entry_price for profit (or < for loss, both valid)
        // For SHORT: exit_price should be <= entry_price for profit (or > for loss, both valid)
        // Both are valid, so we just check they're positive
        return data.exit_price > 0 && data.entry_price > 0
      }
      return true
    },
    {
      message: 'Both entry and exit prices must be positive',
      path: ['exit_price'],
    }
  )

export const updateTradeSchema = z
  .object({
    trade_date: z.string().min(1, 'Trade date is required').optional(),
    symbol: z.string().min(1, 'Symbol is required').transform((val) => val.toUpperCase().trim()).optional(),
    tradingsymbol: z.string().optional().transform((val) => val?.toUpperCase().trim()),
    side: z.enum(['LONG', 'SHORT']).optional(),
    quantity: z.number().positive('Quantity must be positive').int('Quantity must be an integer').optional(),
    entry_price: z.number().positive('Entry price must be positive').optional(),
    exit_price: z.number().positive('Exit price must be positive').optional(),
    entry_time: z.string().datetime('Invalid entry time format').optional().nullable(),
    exit_time: z.string().datetime('Invalid exit time format').optional().nullable(),
    strategy: z.string().optional().nullable(),
    setup: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    tags: z.array(z.string()).optional().nullable(),
    emotion: z.string().optional().nullable(),
    rating: z.number().int().min(1).max(5).optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.exit_time && data.entry_time) {
        return new Date(data.exit_time) >= new Date(data.entry_time)
      }
      return true
    },
    {
      message: 'Exit time must be after entry time',
      path: ['exit_time'],
    }
  )

export const tradeFiltersSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  symbol: z.string().optional(),
  strategy: z.string().optional(),
  side: z.enum(['LONG', 'SHORT']).optional(),
  minPnl: z.number().optional(),
  maxPnl: z.number().optional(),
  tags: z.array(z.string()).optional(),
  emotion: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  profileId: z.string().uuid().optional().nullable(),
  page: z.number().int().min(0).default(0),
  pageSize: z.number().int().min(1).max(100).default(20),
})

// ============================================
// PROFILE SCHEMAS
// ============================================

export const createProfileSchema = z.object({
  name: z.string().min(1, 'Profile name is required').max(100, 'Profile name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional().nullable(),
  type: z.enum(['fno', 'equity', 'options', 'mutual_funds', 'crypto', 'custom'], {
    errorMap: () => ({ message: 'Invalid profile type' }),
  }),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color').optional(),
  icon: z.string().optional(),
  account_size: z.number().positive('Account size must be positive').optional().nullable(),
})

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  type: z.enum(['fno', 'equity', 'options', 'mutual_funds', 'crypto', 'custom']).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  icon: z.string().optional(),
  account_size: z.number().positive().optional().nullable(),
})

// ============================================
// GOAL SCHEMAS
// ============================================

export const createGoalSchema = z.object({
  goal_type: z.enum(['profit', 'win_rate', 'consistency', 'risk', 'behavioral'], {
    errorMap: () => ({ message: 'Invalid goal type' }),
  }),
  title: z.string().min(1, 'Goal title is required').max(200, 'Title must be less than 200 characters'),
  target_value: z
    .number({
      required_error: 'Target value is required',
      invalid_type_error: 'Target value must be a number',
    })
    .positive('Target value must be positive'),
  deadline: z.string().datetime('Invalid deadline format').optional().nullable(),
  profile_id: z.string().uuid('Invalid profile ID').optional().nullable(),
})

export const updateGoalSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  target_value: z.number().positive().optional(),
  deadline: z.string().datetime().optional().nullable(),
  completed: z.boolean().optional(),
})

// ============================================
// CHAT SCHEMAS
// ============================================

export const chatMessageSchema = z.object({
  content: z.string().min(1, 'Message content is required').max(5000, 'Message must be less than 5000 characters'),
  context_snapshot: z.record(z.any()).optional().nullable(),
  emotional_state: z.record(z.any()).optional().nullable(),
})

// ============================================
// PAGINATION SCHEMAS
// ============================================

export const paginationSchema = z.object({
  page: z.number().int().min(0).default(0),
  pageSize: z.number().int().min(1).max(100).default(20),
})

// ============================================
// DATE RANGE SCHEMAS
// ============================================

export const dateRangeSchema = z.object({
  start: z.string().datetime('Invalid start date format'),
  end: z.string().datetime('Invalid end date format'),
}).refine(
  (data) => {
    return new Date(data.end) >= new Date(data.start)
  },
  {
    message: 'End date must be after start date',
    path: ['end'],
  }
)

// ============================================
// CSV IMPORT SCHEMAS
// ============================================

export const csvImportSchema = z.object({
  file: z.instanceof(File, { message: 'File is required' }),
  profile_id: z.string().uuid('Invalid profile ID').optional().nullable(),
  skipDuplicates: z.boolean().default(true),
  dateFormat: z.string().optional(),
})

// ============================================
// BULK DELETE SCHEMAS
// ============================================

export const bulkDeleteSchema = z.object({
  tradeIds: z.array(z.string().uuid('Invalid trade ID')).min(1, 'At least one trade ID is required').max(100, 'Cannot delete more than 100 trades at once'),
  profile_id: z.string().uuid('Invalid profile ID').optional().nullable(),
})

// ============================================
// VALIDATION ERROR CLASS
// ============================================

export class ValidationError extends Error {
  constructor(
    public field: string,
    public message: string,
    public code: string = 'VALIDATION_ERROR'
  ) {
    super(message)
    this.name = 'ValidationError'
  }

  toJSON() {
    return {
      field: this.field,
      message: this.message,
      code: this.code,
    }
  }
}

// ============================================
// VALIDATION HELPERS
// ============================================

export function validateWithSchema<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      throw new ValidationError(
        firstError.path.join('.'),
        firstError.message,
        'VALIDATION_ERROR'
      )
    }
    throw error
  }
}

export function safeParseWithSchema<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  error?: ValidationError
} {
  try {
    const parsed = schema.parse(data)
    return { success: true, data: parsed }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return {
        success: false,
        error: new ValidationError(
          firstError.path.join('.'),
          firstError.message,
          'VALIDATION_ERROR'
        ),
      }
    }
    return {
      success: false,
      error: new ValidationError('unknown', 'Validation failed', 'VALIDATION_ERROR'),
    }
  }
}

// ============================================
// EXPORTS
// ============================================
// All schemas and utilities are already exported above
// No need to re-export
