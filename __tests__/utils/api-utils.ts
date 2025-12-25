/**
 * API Test Utilities
 * 
 * Utilities for testing API routes and endpoints
 */

import { NextRequest } from 'next/server'
import { vi } from 'vitest'

/**
 * Create a mock Next.js request
 */
export const createMockRequest = (
  method: string = 'GET',
  body?: any,
  headers: Record<string, string> = {},
) => {
  const url = 'http://localhost:3000/api/test'
  
  return new NextRequest(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
}

/**
 * Create a mock Next.js response
 */
export const createMockResponse = () => {
  return {
    json: vi.fn().mockReturnThis(),
    status: vi.fn().mockReturnThis(),
    headers: new Headers(),
  } as any
}

/**
 * Test API endpoint with authentication
 */
export const testAuthenticatedEndpoint = async (
  handler: (req: NextRequest) => Promise<Response>,
  method: string = 'GET',
  body?: any,
) => {
  const req = createMockRequest(method, body, {
    Cookie: 'workos-session=test-session',
  })
  
  return handler(req)
}

/**
 * Test API endpoint without authentication
 */
export const testUnauthenticatedEndpoint = async (
  handler: (req: NextRequest) => Promise<Response>,
  method: string = 'GET',
  body?: any,
) => {
  const req = createMockRequest(method, body)
  
  return handler(req)
}

/**
 * Assert API response status
 */
export const expectStatus = (response: Response, status: number) => {
  if (response.status !== status) {
    throw new Error(
      `Expected status ${status}, got ${response.status}`,
    )
  }
}

/**
 * Assert API response JSON
 */
export const expectJson = async <T,>(response: Response): Promise<T> => {
  const data = await response.json()
  return data as T
}

/**
 * Assert API response error
 */
export const expectError = async (
  response: Response,
  expectedError?: string,
) => {
  expectStatus(response, 400)
  const data = await expectJson<{ error: string }>(response)
  
  if (expectedError) {
    if (!data.error.includes(expectedError)) {
      throw new Error(
        `Expected error to include "${expectedError}", got "${data.error}"`,
      )
    }
  }
}

