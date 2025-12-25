# Install Testing Dependencies

## Quick Install

Run this command to install all testing dependencies:

```bash
npm install
```

## New Dependencies Added

The following dependencies have been added to `package.json`:

### Core Testing
- `vitest` - Fast test runner
- `@vitejs/plugin-react` - React support for Vitest
- `@vitest/coverage-v8` - Code coverage
- `@vitest/ui` - Test UI interface
- `jsdom` - DOM environment for tests

### Test Data Generation
- `@faker-js/faker` - Generate realistic test data

### Optional (for future use)
- `@lhci/cli` - Lighthouse CI (for performance tests)
- `k6` - Load testing (install separately: `brew install k6` or download from k6.io)

## Verify Installation

After installing, verify everything works:

```bash
# Run unit tests
npm run test:unit

# Run E2E tests
npm run test:e2e

# Check coverage
npm run test:coverage
```

## Next Steps

1. Install dependencies: `npm install`
2. Run initial tests: `npm run test:unit`
3. Review test examples in `__tests__/` directory
4. Start adding tests for your components and API routes

## Troubleshooting

If you encounter issues:

1. **Vitest not found:** Make sure you ran `npm install`
2. **Module resolution errors:** Check that path aliases in `vitest.config.ts` match your `tsconfig.json`
3. **React errors:** Ensure `@vitejs/plugin-react` is installed

