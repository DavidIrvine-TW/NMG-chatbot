# Solution

## Approach

Hi,
I'd previously created a chatbot app to solve an internal business problem. That chatbot app utilized a HuggingFace AI model and was built with an Express backend with React on the front. The chatbot is actually in my portfolio as a widget and is trained on my resume and LinkedIn content. When I recieved the take home challenge I had the idea of utilizing the existing chatbot frontend which I already had, and instead concentrate my efforts on incorporating all the features as per the job brief. 

The chat UI is split into a handful of components — Sidebar, ChatWindow, ChatInput, MessageBubble, and ThemeToggle — each in its own folder. All the actual chat logic (sending messages, managing conversations, persisting to localStorage) is pulled out into a `useChat` hook so the page component stays thin.

## Decisions

- **Tailwind 4 + CSS custom properties** for theming. Light/dark mode is toggled via a `data-theme` attribute on the root element, and the theme choice is saved to localStorage.
- **`useChat` hook** holds all the state — conversations, messages, loading, errors, localStorage sync, retry logic. Keeps things in one place and easy to reason about.
- **Inline title editing** in the sidebar instead of `window.prompt()`. Small thing but it's a nicer experience.
- **react-markdown + remark-gfm** for rendering assistant responses. AI responses tend to include code blocks, lists, etc. so markdown support felt necessary.
- **Plain CSS files** with BEM-ish class names rather than CSS modules. Simpler to work with for this size of project. CSS modules would make more sense if this grew.

## Testing

46 tests across 6 suites using Jest and React Testing Library:

- `lib/api.ts` — covers `sendMessage` and `sendMessageStream` (success, errors, network failures, chunked reading)
- `ChatInput` — typing, Enter to send, Shift+Enter for newlines, disabled state, empty message prevention
- `MessageBubble` — user vs assistant rendering, error state with retry, timestamps
- `ChatWindow` — empty state with starter questions, message list, typing indicator, clear button
- `ThemeToggle` — toggling, localStorage persistence, aria labels
- `Sidebar` — new chat, selecting conversations, inline edit/delete, active state

Run with `npm test` or `npm run test:watch`.

## Trade-offs

- **localStorage for persistence** — the mock endpoints don't store anything server-side, so localStorage was the pragmatic choice. Obviously a real app would need a backend.
- **Everything is client-rendered** — the whole page is `'use client'`. Since all the state lives in localStorage and there's nothing to server-render meaningfully, this made sense here.
- **No `useChat` hook tests yet** — the hook has the most complex logic but testing custom hooks with async API calls and localStorage takes more setup. The individual components and API layer are covered though.

## What I'd do next

- E2E tests with Playwright
- Better accessibility — focus management when new messages arrive, live region announcements
- Message search
- Optimistic updates with rollback on error
- Conversation export

## Assumptions

- The two mock endpoints (`/api/chat` and `/api/chat/stream`) are the full API surface
- localStorage is fine for persistence in this context
- The 10% error rate from the mock is intentional — I handle it with a retry button
- 768px breakpoint for mobile/desktop is reasonable

## Time Spent

Around 3.5 hours.
