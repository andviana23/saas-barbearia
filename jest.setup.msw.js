// Setup for HTTP-dependent tests that require MSW
import { server } from './tests/mocks/server';

// Establish API mocking before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
afterEach(() => {
  server.resetHandlers();
});

// Clean up after the tests are finished
afterAll(() => {
  server.close();
});

// Enhanced error handling for MSW
server.events.on('request:start', ({ request }) => {
  console.log('MSW intercepted:', request.method, request.url);
});

server.events.on('request:match', ({ request }) => {
  console.log('MSW matched:', request.method, request.url);
});

server.events.on('request:unhandled', ({ request }) => {
  console.warn('MSW unhandled request:', request.method, request.url);
});
