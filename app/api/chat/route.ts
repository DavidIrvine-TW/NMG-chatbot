import { NextResponse } from 'next/server';
import type { ChatRequest, ChatResponse } from '@/types/chat';

// Random animal words as mock responses
const mockResponses = [
  "Octopus",
  "Flamingo",
  "Pangolin",
  "Axolotl",
  "Capybara",
  "Narwhal",
  "Quokka",
  "Tardigrade",
  "Chameleon",
  "Platypus",
];

// Simulate occasional typing delay
const getRandomDelay = () => Math.floor(Math.random() * 1000) + 500;

export async function POST(request: Request): Promise<Response> {
  try {
    const body: ChatRequest = await request.json();
    
    if (!body.message || body.message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, getRandomDelay()));

    // Simulate random server errors (10% chance)
    const errors = [
      { error: 'Bad request: message could not be processed.', status: 400 },
      { error: 'Service temporarily unavailable. Please try again.', status: 503 },
    ];
    if (Math.random() > 0.9) {
      const err = errors[Math.floor(Math.random() * errors.length)];
      return NextResponse.json(
        { error: `[${err.status}] ${err.error}` },
        { status: err.status }
      );
    }

    // Generate mock response
    const response: ChatResponse = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: 'assistant',
      content: mockResponses[Math.floor(Math.random() * mockResponses.length)],
      conversationId: body.conversationId || `conv_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Invalid request format' },
      { status: 400 }
    );
  }
}
