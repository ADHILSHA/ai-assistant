import { SYSTEM_PROMPT, Message } from '@/app/lib/prompts';

describe('Prompts Module', () => {
  test('SYSTEM_PROMPT should be defined', () => {
    expect(SYSTEM_PROMPT).toBeDefined();
    expect(typeof SYSTEM_PROMPT).toBe('string');
    expect(SYSTEM_PROMPT.length).toBeGreaterThan(0);
  });

  test('SYSTEM_PROMPT should contain travel planning instructions', () => {
    expect(SYSTEM_PROMPT).toContain('Travel Planning');
    expect(SYSTEM_PROMPT).toContain('[TRAVEL_ITINERARY]');
  });

  test('SYSTEM_PROMPT should contain gift recommendation instructions', () => {
    expect(SYSTEM_PROMPT).toContain('Gift Recommendations');
  });

  test('Message interface should be exported', () => {
    // Create a sample message to verify the interface
    const userMessage: Message = {
      role: 'user',
      content: 'Test message'
    };
    
    const assistantMessage: Message = {
      role: 'assistant',
      content: 'Test response'
    };
    
    const systemMessage: Message = {
      role: 'system',
      content: 'Test system message'
    };
    
    expect(userMessage.role).toBe('user');
    expect(assistantMessage.role).toBe('assistant');
    expect(systemMessage.role).toBe('system');
  });
}); 