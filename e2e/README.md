# E2E Tests Guide

## Overview

This directory contains end-to-end tests for TradeAutopsy using Playwright.

## Test Structure

```
e2e/
├── auth.spec.ts                    # Authentication flow tests
├── dashboard.spec.ts              # Dashboard tests
├── visual-regression/             # Visual regression tests
│   ├── dashboard.spec.ts
│   └── auth.spec.ts
├── user-journeys/                 # Complete user workflows
│   ├── complete-trade-workflow.spec.ts
│   ├── weekly-review.spec.ts
│   ├── goal-tracking.spec.ts
│   ├── journal-entry.spec.ts
│   └── import-workflow.spec.ts
├── performance/                   # Performance tests
│   ├── web-vitals.spec.ts
│   ├── api-performance.spec.ts
│   └── lighthouse.spec.ts
└── accessibility/                 # Accessibility tests
    └── keyboard-navigation.spec.ts
```

## Running Tests

### Run all E2E tests
```bash
npm run test:e2e
```

### Run specific test file
```bash
npx playwright test e2e/auth.spec.ts
```

### Run visual regression tests
```bash
npx playwright test e2e/visual-regression
```

### Run performance tests
```bash
npx playwright test e2e/performance
```

### Run with UI
```bash
npm run test:e2e:ui
```

### Run in debug mode
```bash
npm run test:e2e:debug
```

## Visual Regression Tests

Visual regression tests compare screenshots to detect visual changes.

### Update snapshots
```bash
npx playwright test --update-snapshots
```

### View visual comparison
```bash
npx playwright show-report
```

## Performance Tests

Performance tests measure:
- **Web Vitals**: LCP, FID, CLS, FCP, TTFB
- **API Response Times**: Endpoint performance
- **Lighthouse Metrics**: Performance scores

### Targets
- LCP: < 2.5s
- FID: < 100ms
- CLS: < 0.1
- FCP: < 1.8s
- TTFB: < 800ms

## User Journey Tests

User journey tests cover complete workflows:
1. **Complete Trade Workflow**: Create, view, edit, delete trade
2. **Weekly Review**: View analytics, export reports, filter data
3. **Goal Tracking**: Create, update, complete goals
4. **Journal Entry**: Create, add audio, edit entries
5. **Import Workflow**: Upload CSV, review, import trades

## Best Practices

1. **Use data-testid attributes** for reliable selectors
2. **Wait for networkidle** before assertions
3. **Handle authentication** properly in tests
4. **Clean up test data** after tests
5. **Use fixtures** for reusable test data
6. **Skip tests** that require external services if unavailable

## CI/CD Integration

E2E tests run automatically on:
- Pull requests
- Pushes to main branch
- Manual workflow triggers

See `.github/workflows/e2e-tests.yml` for configuration.

## Troubleshooting

### Tests timing out
- Increase `actionTimeout` in `playwright.config.ts`
- Check if dev server is running
- Verify network connectivity

### Visual regression failures
- Update snapshots if changes are intentional
- Check for dynamic content (timestamps, random IDs)
- Use `maxDiffPixels` to allow small differences

### Performance test failures
- Check network conditions
- Verify server performance
- Review bundle sizes

## Next Steps

1. Add more user journey tests
2. Expand visual regression coverage
3. Add more performance benchmarks
4. Integrate with monitoring tools

