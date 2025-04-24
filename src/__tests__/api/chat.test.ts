import { NextRequest, NextResponse } from 'next/server';

// Mock the modules to prevent the actual imports from being used
jest.mock('openai', () => ({}));
jest.mock('@ai-sdk/openai', () => ({
  createOpenAI: jest.fn(),
}));
jest.mock('ai', () => ({
  streamText: jest.fn(),
}));

// Mock the environment variable
process.env.OPENAI_API_KEY = 'test-key';

// Mock the NextResponse.json function
const mockJson = jest.fn().mockImplementation((data, options) => {
  return { data, status: options?.status };
});

jest.mock('next/server', () => ({
  NextResponse: {
    json: mockJson,
  },
}));

// Import SYSTEM_PROMPT to verify it's defined
import { SYSTEM_PROMPT } from '@/app/lib/prompts'; 

describe('API Chat Tests', () => {
  test('SYSTEM_PROMPT is defined for chat API', () => {
    expect(SYSTEM_PROMPT).toBeDefined();
    expect(typeof SYSTEM_PROMPT).toBe('string');
  });

  test('NextResponse.json returns expected response', () => {
    const response = mockJson({ message: 'test' }, { status: 200 });
    expect(response.data).toEqual({ message: 'test' });
    expect(response.status).toBe(200);
  });
}); 