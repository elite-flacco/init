# Testing Guide

This directory contains the testing setup and utilities for the Travel AI application.

## Test Structure

### Service Tests
- `src/services/__tests__/aiDestinationService.test.ts` - Comprehensive tests for AI destination recommendations
- `src/services/__tests__/aiTripPlanningService.test.ts` - Comprehensive tests for AI trip planning
- `src/services/__tests__/aiServices.integration.test.ts` - Integration tests for AI services
- `src/services/__tests__/basic.test.ts` - Basic functionality and import tests

### Component Tests
- `src/components/__tests__/AIDestinationRecommendationResults.test.tsx` - Tests for destination results component
- `src/components/__tests__/AITripPlanningPrompts.test.tsx` - Tests for trip planning prompts component

### Test Utilities
- `setup.ts` - Test environment configuration
- `mocks.ts` - Mock data and utility functions

## Running Tests

```bash
# Run all tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run specific test file
npx vitest src/services/__tests__/basic.test.ts
```

## Test Features

### Mock Data
The test suite includes comprehensive mock data for:
- Traveler types (YOLO, Adventure, Culture, Relaxation)
- Destinations (Paris, Tokyo, Bali, etc.)
- Trip preferences and configurations
- AI API responses (OpenAI and Anthropic formats)

### AI Service Testing
- **Mock Mode Testing**: All services work in mock mode by default
- **API Integration Testing**: Tests for OpenAI and Anthropic API calls
- **Error Handling**: Comprehensive error scenarios and fallback testing
- **Data Validation**: Ensures all responses have correct structure and types

### Component Testing
- **Loading States**: Tests for AI processing animations
- **Error States**: Tests for error handling and retry functionality
- **User Interactions**: Tests for button clicks and form submissions
- **AI Integration**: Tests for component-service integration

## Test Configuration

Tests are configured with:
- **Vitest** as the test runner
- **jsdom** environment for component testing
- **@testing-library/react** for component testing utilities
- **Global mocks** for fetch and React
- **TypeScript support** for type-safe testing

## Writing New Tests

When adding new tests:

1. **Import test utilities**:
   ```typescript
   import { describe, it, expect, beforeEach, vi } from 'vitest'
   import { mockTravelerTypes, mockDestinations, resetMocks } from '../../test/mocks'
   ```

2. **Reset mocks in beforeEach**:
   ```typescript
   beforeEach(() => {
     resetMocks()
   })
   ```

3. **Use mock data consistently**:
   ```typescript
   const request = {
     travelerType: mockTravelerTypes.culture,
     destination: mockDestinations.paris
   }
   ```

4. **Test both success and error scenarios**:
   ```typescript
   // Success case
   it('should handle successful API response', async () => {
     // Test implementation
   })

   // Error case  
   it('should handle API errors gracefully', async () => {
     // Test error scenarios
   })
   ```

## Best Practices

- **Use descriptive test names** that explain what is being tested
- **Test one thing per test** to keep tests focused and maintainable
- **Use beforeEach to reset state** between tests
- **Mock external dependencies** to ensure test reliability
- **Test edge cases** and error conditions
- **Verify data structures** and types in responses
- **Use async/await** for asynchronous operations

## Troubleshooting

### Common Issues

1. **Import errors**: Check file paths and ensure exports are correct
2. **Timeout errors**: Increase timeout for long-running AI operations
3. **Mock issues**: Ensure mocks are properly reset between tests
4. **Type errors**: Verify TypeScript types match expected interfaces

### Debug Tips

- Use `console.log` sparingly in tests
- Use Vitest UI (`npm run test:ui`) for better debugging experience
- Check mock data in `src/test/mocks.ts` if tests fail unexpectedly
- Verify environment variables are set correctly in `setup.ts`