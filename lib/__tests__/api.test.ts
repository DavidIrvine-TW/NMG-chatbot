import { sendMessage, sendMessageStream } from '@/lib/api';

let mockFetch: jest.Mock;

beforeEach(() => {
  mockFetch = jest.fn();
  global.fetch = mockFetch;
});

afterEach(() => {
  jest.restoreAllMocks();
});

// ── sendMessage ──────────────────────────────────────────────────────

describe('sendMessage', () => {
  it('returns data on success', async () => {
    const payload = {
      id: 'msg_1',
      role: 'assistant' as const,
      content: 'Hello!',
      conversationId: 'conv_1',
      timestamp: '2024-01-01T00:00:00Z',
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => payload,
    });

    const result = await sendMessage('Hi');
    expect(result).toEqual({ success: true, data: payload });
    expect(mockFetch).toHaveBeenCalledWith('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hi', conversationId: undefined }),
    });
  });

  it('passes conversationId when provided', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: '1', role: 'assistant', content: 'ok', conversationId: 'c1', timestamp: '' }),
    });

    await sendMessage('Hi', 'c1');
    expect(mockFetch).toHaveBeenCalledWith('/api/chat', expect.objectContaining({
      body: JSON.stringify({ message: 'Hi', conversationId: 'c1' }),
    }));
  });

  it('returns error on non-ok response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Rate limited' }),
    });

    const result = await sendMessage('Hi');
    expect(result).toEqual({ success: false, error: 'Rate limited' });
  });

  it('returns fallback error when server error has no message', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });

    const result = await sendMessage('Hi');
    expect(result).toEqual({ success: false, error: 'Something went wrong' });
  });

  it('returns connection error on network failure', async () => {
    mockFetch.mockRejectedValue(new TypeError('Failed to fetch'));

    const result = await sendMessage('Hi');
    expect(result).toEqual({ success: false, error: 'Unable to connect. Please try again.' });
  });
});

// ── sendMessageStream ────────────────────────────────────────────────

describe('sendMessageStream', () => {
  function toBytes(str: string): Uint8Array {
    const arr = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) arr[i] = str.charCodeAt(i);
    return arr;
  }

  function mockStreamResponse(chunks: string[]) {
    let idx = 0;
    const reader = {
      read: jest.fn().mockImplementation(() =>
        Promise.resolve(
          idx < chunks.length
            ? { done: false, value: toBytes(chunks[idx++]) }
            : { done: true, value: undefined }
        )
      ),
    };
    mockFetch.mockResolvedValue({
      ok: true,
      body: { getReader: () => reader },
    });
    return reader;
  }

  it('streams chunks and calls onChunk with accumulated content', async () => {
    mockStreamResponse(['Hello', ' world']);
    const onChunk = jest.fn();

    const result = await sendMessageStream('Hi', 'conv_1', onChunk);

    expect(onChunk).toHaveBeenCalledTimes(2);
    expect(onChunk).toHaveBeenNthCalledWith(1, 'Hello');
    expect(onChunk).toHaveBeenNthCalledWith(2, 'Hello world');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.content).toBe('Hello world');
      expect(result.data.conversationId).toBe('conv_1');
      expect(result.data.role).toBe('assistant');
    }
  });

  it('generates conversationId when none provided', async () => {
    mockStreamResponse(['ok']);
    const result = await sendMessageStream('Hi', undefined, jest.fn());

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.conversationId).toMatch(/^conv_/);
    }
  });

  it('returns error on non-ok response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Server error' }),
    });

    const result = await sendMessageStream('Hi', undefined, jest.fn());
    expect(result).toEqual({ success: false, error: 'Server error' });
  });

  it('returns error when body has no reader', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      body: null,
    });

    const result = await sendMessageStream('Hi', undefined, jest.fn());
    expect(result).toEqual({ success: false, error: 'Streaming not supported' });
  });

  it('returns connection error on network failure', async () => {
    mockFetch.mockRejectedValue(new TypeError('Failed to fetch'));

    const result = await sendMessageStream('Hi', undefined, jest.fn());
    expect(result).toEqual({ success: false, error: 'Unable to connect. Please try again.' });
  });
});
