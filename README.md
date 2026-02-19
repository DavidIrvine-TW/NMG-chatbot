# AI Chat Interface - Take Home Assignment

Welcome! This take-home assignment will help us understand your approach to building modern frontend applications.

## Time Expectation

**3-4 hours**

We respect your time. Please don't spend more than 4 hours on this assignment. We're more interested in seeing how you approach problems, structure code, and make trade-offs than in a perfect implementation.

## Overview

Build a chat interface for an AI communications platform using **React**, **Next.js**, and **TypeScript**. The mock API is already set up for you in this repository.

## What's Already Provided

- ✅ Next.js 16 project with TypeScript (includes stable Turbopack)
- ✅ React 19 with latest features
- ✅ Mock API endpoints (`/api/chat` and `/api/chat/stream`)
- ✅ TypeScript types for API requests/responses
- ✅ Basic project structure

## Requirements

### Core Features (Required)

1. **Chat Interface**
   - Message input field with send button
   - Display conversation history (user and assistant messages)
   - Clear visual distinction between user and assistant messages
   - Responsive design (works on mobile, tablet, and desktop)

2. **API Integration**
   - Send messages to `POST /api/chat`
   - Handle API responses and display assistant messages
   - Show loading state while waiting for response

3. **Error Handling**
   - Handle API errors gracefully (the mock API randomly returns errors ~10% of the time)
   - Display user-friendly error messages
   - Allow users to retry failed messages

5. **Accessibility**
   - Keyboard navigation support
   - Proper ARIA labels and semantic HTML
   - Focus management

### Bonus Features (Optional)

Choose one or more if you have time:

- **Streaming Support**: Implement streaming using `/api/chat/stream` endpoint
- **Multiple Conversations**: Allow users to create and switch between conversations
- **Message Timestamps**: Display when messages were sent
- **Markdown Support**: Render assistant messages with markdown formatting
- **Dark Mode**: Implement theme switching
- **Message Persistence**: Store conversation history in browser (localStorage or sessionStorage) and restore conversation when page is refreshed
- **Unit Tests**: Add tests using Jest or your preferred testing framework
- **Typing Indicator**: Show when the assistant is "typing"

## API Documentation

### POST `/api/chat`

Standard endpoint with simulated network delay.

**Request:**
```typescript
{
  message: string;
  conversationId?: string;
}
```

**Success Response (200):**
```typescript
{
  id: string;
  role: 'assistant';
  content: string;
  conversationId: string;
  timestamp: string;
}
```

**Error Response (400/503):**
```typescript
{
  error: string;
}
```

### POST `/api/chat/stream` (Bonus)

Streaming endpoint that returns text character by character.

**Request:** Same as above

**Response:** Text stream (Content-Type: text/plain)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## What We're Looking For

### Code Quality
- Clean, readable TypeScript code
- Proper component organization
- Type safety
- Sensible abstractions

### UX/UI
- Intuitive, polished interface
- Smooth interactions and transitions
- Responsive design
- Attention to detail

### Error Handling
- Graceful degradation
- User-friendly error messages
- Recovery mechanisms

### Performance
- Efficient re-renders
- Optimized state management
- Good loading states

### Accessibility
- Keyboard navigation
- Screen reader support
- Semantic HTML

## Submission

1. Complete the assignment (aim for 3-4 hours max)
2. Fill in the `SOLUTION.md` file explaining:
   - Your approach and key decisions
   - Trade-offs you made
   - What you would improve with more time
   - Any assumptions you made
3. Ensure the code runs with `npm install && npm run dev`
4. Share your repository with us (GitHub/GitLab/etc.)
   - Please don't raise any pull requests to the existing repo

## Questions?

If anything is unclear, please reach out. We're happy to clarify!

## Notes

- You can use any additional libraries you think are appropriate
- Feel free to modify the provided API responses if needed
- The mock API intentionally includes delays and errors to simulate real-world conditions
- There's no "perfect" solution - we want to see **your** approach


Good luck! 🚀
