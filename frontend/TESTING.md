# Testing Documentation

This document describes the testing setup and conventions for CRMFlow.

## Testing Stack

- **Unit Tests**: Vitest + React Testing Library
- **E2E Tests**: Playwright
- **CI/CD**: GitHub Actions

## Running Tests

### Unit Tests

```bash
# Run all unit tests
npm run test:unit

# Run tests in watch mode
npm run test:unit:watch

# Run tests with UI
npm run test:unit:ui

# Run tests with coverage
npm run test:unit:coverage
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI
npm run test:e2e:ui

# Debug tests
npm run test:e2e:debug
```

### All Tests

```bash
# Run unit tests + E2E tests
npm run test:all

# Run type check + unit tests + lint (CI command)
npm test
```

## Test Structure

```
frontend/
├── src/
│   ├── **/*.test.ts       # Unit tests next to source files
│   ├── **/*.spec.ts       # Component tests
│   └── test/
│       └── setup.ts       # Test setup and global mocks
├── e2e/
│   ├── smoke.spec.ts      # Smoke tests for critical paths
│   └── *.spec.ts          # E2E test suites
├── vitest.config.ts       # Vitest configuration
└── playwright.config.ts   # Playwright configuration
```

## Writing Tests

### Unit Tests

Unit tests should be co-located with the code they test:

```typescript
// src/lib/myModule.test.ts
import { describe, it, expect } from 'vitest'
import { myFunction } from './myModule'

describe('myFunction', () => {
  it('should do something', () => {
    expect(myFunction()).toBe('expected')
  })
})
```

### Component Tests

```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import MyComponent from './MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### E2E Tests

```typescript
import { test, expect } from '@playwright/test'

test('user can complete workflow', async ({ page }) => {
  await page.goto('/studio')

  // Test user interaction
  await page.click('button[name="run"]')

  await expect(page.locator('.logs')).toBeVisible()
})
```

## Test Coverage

We aim for:
- **Unit Tests**: Core business logic (executors, services, utilities)
- **Integration Tests**: Component interactions
- **E2E Tests**: Critical user paths and smoke tests

### Priority Areas

1. **Flow Executor** - Core execution engine
2. **Mock Services** - All integration mocks
3. **Node Executors** - Individual node logic
4. **Critical UI Paths** - Settings, Voice Lab, Run Console

## Continuous Integration

GitHub Actions runs on all PRs and pushes to main branches:

1. **Type Check** - Ensures type safety
2. **Lint** - Code quality checks
3. **Unit Tests** - All Vitest tests
4. **E2E Tests** - Playwright smoke tests
5. **Build** - Verifies production build

### CI Configuration

See `.github/workflows/ci.yml` for the full CI pipeline.

## Mocking

### Global Mocks

Configured in `src/test/setup.ts`:
- localStorage
- window.matchMedia
- Audio API
- AudioContext

### Test-Specific Mocks

Use Vitest's `vi.mock()` for module-level mocks:

```typescript
import { vi } from 'vitest'

vi.mock('./myModule', () => ({
  myFunction: vi.fn(() => 'mocked')
}))
```

## Best Practices

1. **Arrange-Act-Assert** - Structure tests clearly
2. **Descriptive Names** - Test names should describe behavior
3. **Isolated Tests** - Each test should be independent
4. **Fast Tests** - Unit tests should be fast
5. **Realistic E2E** - E2E tests should simulate real user behavior
6. **Coverage Goals** - Aim for >80% on critical paths

## Debugging Tests

### Vitest

```bash
# Run specific test file
npx vitest run path/to/test.test.ts

# Run tests matching pattern
npx vitest run -t "FlowExecutor"

# Run with UI for debugging
npm run test:unit:ui
```

### Playwright

```bash
# Run with headed browser
npx playwright test --headed

# Run with debugger
npm run test:e2e:debug

# Run specific test
npx playwright test smoke.spec.ts
```

## Common Issues

### Test Timeout

Increase timeout for slow tests:

```typescript
it('slow test', async () => {
  // ...
}, { timeout: 10000 })
```

### Flaky E2E Tests

Use waitFor and proper selectors:

```typescript
await page.waitForSelector('[data-testid="result"]')
await expect(page.locator('.status')).toHaveText('success')
```

### Mock Not Working

Ensure mocks are set up before imports:

```typescript
vi.mock('./module')
import { Component } from './Component'
```

## Future Improvements

- [ ] Visual regression testing
- [ ] Performance testing
- [ ] Load testing for executor
- [ ] Component visual testing (Storybook)
- [ ] API contract testing
