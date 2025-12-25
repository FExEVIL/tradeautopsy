/**
 * API Response Mocks
 * 
 * Pre-defined API response mocks for testing
 */

/**
 * Mock successful API response
 */
export const mockSuccessResponse = <T,>(data: T, status = 200) => {
  return Response.json(data, { status })
}

/**
 * Mock error API response
 */
export const mockErrorResponse = (message: string, status = 400) => {
  return Response.json({ error: message }, { status })
}

/**
 * Mock unauthorized response
 */
export const mockUnauthorizedResponse = () => {
  return Response.json({ error: 'Not authenticated' }, { status: 401 })
}

/**
 * Mock forbidden response
 */
export const mockForbiddenResponse = () => {
  return Response.json({ error: 'Forbidden' }, { status: 403 })
}

/**
 * Mock not found response
 */
export const mockNotFoundResponse = () => {
  return Response.json({ error: 'Not found' }, { status: 404 })
}

/**
 * Mock validation error response
 */
export const mockValidationErrorResponse = (errors: Record<string, string[]>) => {
  return Response.json(
    {
      error: 'Validation failed',
      errors,
    },
    { status: 422 },
  )
}

/**
 * Mock rate limit response
 */
export const mockRateLimitResponse = () => {
  return Response.json(
    { error: 'Rate limit exceeded' },
    {
      status: 429,
      headers: {
        'Retry-After': '60',
      },
    },
  )
}

