import { NextResponse } from 'next/server';
import type { ChatRequest } from '@/types/chat';

const mockStreamResponses = [
  "**Deep learning** is just neural nets with *many* layers.",
  "AI bias comes from biased data — *garbage in, garbage out*.",
  "**Reinforcement learning** is how AI learns from trial and error.",
  "The first neural network, the *Perceptron*, was built in **1958**.",
  "An AI's `temperature` setting controls how *creative* its output is.",
];

export async function POST(request: Request): Promise<Response> {
  try {
    const body: ChatRequest = await request.json();
    
    if (!body.message || body.message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

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

    // Random delay before responding (0-3 seconds) to show typing indicator
    await new Promise(resolve => setTimeout(resolve, Math.random() * 3000));

    const encoder = new TextEncoder();
    const responseText = mockStreamResponses[Math.floor(Math.random() * mockStreamResponses.length)];

    const stream = new ReadableStream({
      async start(controller) {
        // Send response character by character to simulate streaming
        for (let i = 0; i < responseText.length; i++) {
          const chunk = responseText[i];
          controller.enqueue(encoder.encode(chunk));
          
          // Random delay between characters (20-80ms) for realistic typing effect
          await new Promise(resolve => 
            setTimeout(resolve, Math.random() * 60 + 20)
          );
        }
        
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Stream API error:', error);
    return NextResponse.json(
      { error: 'Invalid request format' },
      { status: 400 }
    );
  }
}
