import { NextResponse } from 'next/server';
import type { ChatRequest, ChatResponse } from '@/types/chat';

const mockResponses = [
  "The **octopus** has three hearts and blue blood. Two pump blood to the gills, while the third pumps it to the rest of the body.",
  "Here are some fun facts about **flamingos**:\n\n- They're born with grey feathers\n- Their pink color comes from their diet\n- They can only eat with their heads *upside down*",
  "The **pangolin** is the world's most trafficked mammal. They're covered in keratin scales — the same protein in human fingernails.\n\n> Fun fact: when threatened, they curl into a ball that even lions can't pry open.",
  "The **axolotl** can regenerate almost any body part:\n\n1. Limbs\n2. Heart tissue\n3. Parts of their brain\n\nThey're sometimes called the *\"Mexican walking fish\"* but they're actually amphibians.",
  "**Capybaras** are the largest living rodents. They're incredibly social and get along with just about every animal.\n\nHere's a quick comparison:\n\n| Animal | Weight | Social? |\n|--------|--------|---------|\n| Capybara | ~60 kg | Very |\n| Guinea pig | ~1 kg | Somewhat |\n| Rat | ~0.5 kg | Moderate |",
  "The **narwhal** tusk is actually a tooth! It can grow up to `3 meters` long and contains millions of nerve endings.\n\nThey're sometimes called the *unicorns of the sea*.",
  "**Quokkas** are small marsupials known for their smile. They live almost exclusively on Rottnest Island in Australia.\n\n```\nQuokka facts:\n- Weight: 2.5-5 kg\n- Lifespan: ~10 years\n- Diet: herbivore\n```",
  "The **tardigrade** (water bear) is nearly indestructible. They can survive:\n\n- Temperatures from -272°C to 150°C\n- The vacuum of **outer space**\n- Pressures 6x deeper than the ocean\n- *Radiation* hundreds of times the lethal human dose",
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
