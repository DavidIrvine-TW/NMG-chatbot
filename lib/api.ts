import type { ChatResponse, ErrorResponse, SendMessageResult } from '@/types/chat';

export async function sendMessage(
  message: string,
  conversationId?: string
): Promise<SendMessageResult> {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, conversationId }),
    });

    if (!res.ok) {
      const err: ErrorResponse = await res.json();
      return { success: false, error: err.error || 'Something went wrong' };
    }

    const data: ChatResponse = await res.json();
    return { success: true, data };
  } catch {
    return { success: false, error: 'Unable to connect. Please try again.' };
  }
}

export async function sendMessageStream(
  message: string,
  conversationId: string | undefined,
  onChunk: (text: string) => void
): Promise<SendMessageResult> {
  try {
    const res = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, conversationId }),
    });

    if (!res.ok) {
      const err: ErrorResponse = await res.json();
      return { success: false, error: err.error || 'Something went wrong' };
    }

    const reader = res.body?.getReader();
    if (!reader) {
      return { success: false, error: 'Streaming not supported' };
    }

    const decoder = new TextDecoder();
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      fullContent += chunk;
      onChunk(fullContent);
    }

    const data: ChatResponse = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: 'assistant',
      content: fullContent,
      conversationId: conversationId || `conv_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    return { success: true, data };
  } catch {
    return { success: false, error: 'Unable to connect. Please try again.' };
  }
}
