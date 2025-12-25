/**
 * Load Test: Normal Load Scenario
 * 
 * Simulates normal user traffic patterns
 */

import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  stages: [
    { duration: '2m', target: 50 }, // Ramp up to 50 users
    { duration: '5m', target: 50 }, // Stay at 50 users
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s
    http_req_failed: ['rate<0.01'], // Less than 1% of requests should fail
  },
}

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000'

export default function () {
  // Test homepage
  const homeResponse = http.get(`${BASE_URL}/`)
  check(homeResponse, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage loads in < 2s': (r) => r.timings.duration < 2000,
  })

  sleep(1)

  // Test login page
  const loginResponse = http.get(`${BASE_URL}/login`)
  check(loginResponse, {
    'login page status is 200': (r) => r.status === 200,
  })

  sleep(1)

  // Test API endpoint
  const apiResponse = http.get(`${BASE_URL}/api/health`)
  check(apiResponse, {
    'API status is 200': (r) => r.status === 200,
    'API response time < 500ms': (r) => r.timings.duration < 500,
  })

  sleep(2)
}

