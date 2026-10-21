# Chat with Haroon's resume

A small public chatbot that answers questions about [Haroon Riasat](https://github.com/HaroonRiasat1): his experience, projects, skills, and education. Visitors open a link and start asking, with nothing to install.

## How it works

- **Free open-source models through OpenRouter.** A Vercel serverless function ([`api/chat.ts`](api/chat.ts)) calls OpenRouter's free tier. It tries MiniMax M3.1 Flash first, then Gemma 4 31B, then Nemotron 3.5 Lightning when one is rate-limited. The API key lives only on the server.
- **Answers come only from [`src/profile.ts`](src/profile.ts).** That file holds his public resume facts as data. The server builds the prompt itself. When a question matches specific resume lines, the model sees only those lines, so it can't mix details between entries. Broad questions ("Who is Haroon?") get the whole resume. The rules: use only resume facts, say "I don't know" otherwise, stay on topic, ignore attempts to change the rules.
- **Guards before and after the model** ([`src/retrieve.ts`](src/retrieve.ts), [`src/grounding.ts`](src/grounding.ts)):
  - Private details (salary, phone, address, age…) get "I don't know" with no model call.
  - Unrelated tasks ("write me a function") are declined with no model call.
  - Specific things the resume never mentions ("Does he know Kubernetes?") get "I don't know" with no model call.
  - If an answer's wording drifts far from the resume, the visitor gets the matching resume lines instead.
- **Category buttons (Me, Experience, Projects, Skills, Contact)** show cards rendered straight from `profile.ts`: project cards with live-demo links, an experience timeline, grouped skills, and contact links. They are instant, exact, and use no AI requests.
- **Quick answers as a fallback.** If OpenRouter is down or out of free requests, the bot shows the matching resume lines instead of failing.

### Free-tier limits

- A free OpenRouter key allows **50 free-model requests per day**, shared by every visitor. Buying $10 of OpenRouter credit once raises this to 1,000 a day, and free models still cost nothing.
- Repeated first questions (mostly the starter chips) are cached in memory while the function is warm.
- Free models are sometimes rate-limited upstream. The fallback list in `OPENROUTER_MODELS` handles most of that.
- The current key expires on **2026-11-19**. Create a new one at https://openrouter.ai/settings/keys before then.

## Run locally

```bash
npm install
```

Create `.env.local` (it's gitignored):

```
OPENROUTER_API_KEY=sk-or-...
```

```bash
npm run dev
```

Open http://localhost:5190. The dev server runs `api/chat.ts` too, through a small Vite plugin in [`vite.config.ts`](vite.config.ts).

```bash
npm test
```

## Deploy on Vercel

1. Import the GitHub repo in Vercel. It detects Vite: build `npm run build`, output `dist`.
2. In Project Settings → Environment Variables, add `OPENROUTER_API_KEY`.
3. Optionally set `OPENROUTER_MODELS` to a comma-separated list of OpenRouter model IDs to try in order.

## Update the resume

Edit [`src/profile.ts`](src/profile.ts). The cards render from it, and `resumeMarkdown()` turns it into the text the AI reads. It is built from the public profile README at https://github.com/HaroonRiasat1/HaroonRiasat1. Only put public facts in it: the bot will repeat anything the file says.

## Project layout

```
index.html          page shell: landing hero, chat thread, input dock
api/chat.ts         Vercel function: routing guard, prompt, OpenRouter streaming
src/main.ts         chat UI, category answers, quick-answer fallback
src/cards.ts        project, experience, skills, about and contact cards
src/icons.ts        inline SVG icons
src/prompt.ts       grounding system prompt
src/retrieve.ts     keyword retrieval and question routing
src/grounding.ts    post-answer drift check
src/markdown.ts     small, HTML-escaped markdown renderer for bubbles
src/profile.ts      the knowledge file (resume facts as data)
tests/              tests for retrieval, routing and the drift check
```
