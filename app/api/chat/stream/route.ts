import { NextResponse } from 'next/server';
import type { ChatRequest } from '@/types/chat';

const mockStreamResponses = [
  "**Wombats** produce cube-shaped poop! They use it to mark territory, and the shape stops it from rolling away.\n\nThey're also surprisingly fast — up to *40 km/h* in short bursts.",
  "Here are a few things about **jellyfish**:\n\n1. They have no brain, heart, or blood\n2. Some species are *immortal* (Turritopsis dohrnii)\n3. They've been around for over **500 million years**\n\nThat's older than dinosaurs.",
  "The **lyrebird** is one of nature's best mimics. They can imitate:\n\n- Chainsaws\n- Camera shutters\n- Car alarms\n- Other bird species\n\n> Their tail feathers resemble a lyre, which is how they got their name.",
  "The **armadillo** is the only mammal with a bony shell. The nine-banded armadillo always gives birth to *identical quadruplets*.\n\n```\nArmadillo armor:\n- Made of bony plates\n- Covered in keratin\n- Can't fully curl up (only one species can)\n```",
  "**Seahorses** are unique — the *male* carries and delivers the babies.\n\n| Feature | Detail |\n|---------|--------|\n| Species | ~46 known |\n| Size | 1.5 - 35 cm |\n| Speed | ~1.5 m/hr |\n\nThey're also monogamous and greet their partner every morning with a dance.",
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
