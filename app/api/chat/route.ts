import { NextResponse } from 'next/server';
import type { ChatRequest, ChatResponse } from '@/types/chat';

const mockResponses = [
  "**GPT-3** has *175 billion* parameters — it cost `$4.6M` to train.",
  "AI models learn patterns, not facts. That's why they **hallucinate**.",
  "The term *\"artificial intelligence\"* was coined in **1956** at Dartmouth.",
  "A **transformer** uses *self-attention* to process tokens in parallel.",
  "AI can beat humans at chess and Go but still struggles with **common sense**.",
  "The **Turing test** was proposed in 1950. No AI has *officially* passed it.",
  "**Reinforcement learning** is how AI learns from trial and error.",
  "Most AI today is *narrow* — great at **one task**, bad at everything else.",
];

// Random delay before responding (0-3 seconds) to show typing indicator
const getRandomDelay = () => Math.floor(Math.random() * 3000);

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

    // Simulate random server errors (25% chance)
    const errors = [
      { error: 'Bad request: message could not be processed.', status: 400 },
      { error: 'Service temporarily unavailable. Please try again.', status: 503 },
    ];
    if (Math.random() > 0.75) {
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
