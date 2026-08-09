# StudyPlot

StudyPlot is an AI-powered study workspace where students can upload PDFs, generate AI summaries, create flashcards, take quizzes, chat with documents, and save notes.

> **Phase 5 — AI-Powered Quiz Generator.** Phases 1–4 built the architecture, UI shell, PDF upload/document management, AI summaries, and AI flashcards. Phase 5 adds AI-generated multiple-choice quizzes with scoring, reusing the existing Gemini integration. Chat and authentication are still not implemented — those routes still return placeholder responses.

## Tech Stack

**Frontend:** React 19, Vite, Tailwind CSS, React Router DOM, Axios, Framer Motion, React Icons, react-markdown

**Backend:** Node.js, Express.js, dotenv, cors, Mongoose, Multer, pdf-parse, @google/generative-ai

**AI:** Google Gemini API (`gemini-1.5-flash`)

**Database:** MongoDB Atlas

**Deployment:** Netlify (frontend) · Render (backend)

## Folder Structure

```
studyplot/
├── client/                      # React + Vite frontend
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/          # Navbar, Sidebar, Footer, layout wrappers
│   │   │   └── shared/          # Button, Card, Hero, FeatureCard, etc.
│   │   ├── pages/
│   │   │   ├── Dashboard/
│   │   │   ├── Landing/
│   │   │   ├── Documents/
│   │   │   ├── DocumentDetails/
│   │   │   ├── Upload/
│   │   │   ├── Summary/
│   │   │   ├── SummaryDetail/
│   │   │   ├── Chat/
│   │   │   ├── Flashcards/
│   │   │   ├── FlashcardsDetail/
│   │   │   ├── Quiz/
│   │   │   ├── QuizDetail/
│   │   │   ├── Notes/
│   │   │   ├── Settings/
│   │   │   └── NotFound/
│   │   ├── hooks/
│   │   ├── services/            # Axios instance, documentService, uploadService, summaryService, flashcardService, quizService
│   │   ├── context/              # React context providers
│   │   ├── assets/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── package.json
│
├── server/                       # Express backend
│   ├── controllers/
│   ├── routes/
│   ├── models/                   # Document, Chat, Note, QuizResult, Flashcard, Quiz
│   ├── middleware/                # errorHandler, upload (multer)
│   ├── services/                 # pdfParser, geminiService, summaryService, flashcardService, quizService
│   ├── config/                   # db.js, config.js, uploadPaths.js
│   ├── uploads/                  # stored PDF files (gitignored, auto-created)
│   ├── utils/
│   └── server.js
│
├── .env.example
└── README.md
```

## Scripts

### Client (`/client`)

| Command           | Description                       |
| ------------------ | ---------------------------------- |
| `npm run dev`      | Start the Vite dev server           |
| `npm run build`    | Build for production                |
| `npm run preview`  | Preview the production build        |
| `npm run lint`     | Run ESLint                          |

### Server (`/server`)

| Command       | Description                              |
| -------------- | ----------------------------------------- |
| `npm run dev`  | Start the server with nodemon (auto-reload) |
| `npm start`    | Start the server with node                 |

## Environment Variables

Copy `.env.example` at the project root for reference, then create the following files:

**`client/.env`**
```
VITE_API_URL=http://localhost:5000/api
```

**`server/.env`**
```
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key
```

`MONGODB_URI` can be left blank to boot without a database connection (a warning is logged). `GEMINI_API_KEY` is required for AI summaries — without it, `POST /api/study/summary` returns a friendly "not configured" error instead of failing unexpectedly.

## Running Locally

**1. Backend**

```bash
cd server
npm install
npm run dev
```

The API will start on `http://localhost:5000`.

**2. Frontend**

```bash
cd client
npm install
npm run dev
```

The app will start on `http://localhost:5173`.

## Uploading PDFs

StudyPlot accepts PDF uploads from the **Upload** page (drag-and-drop or the "Choose file" button) or the Dashboard's Quick Upload action.

- **Supported file type:** `application/pdf` only. Any other file type is rejected with a friendly error before it reaches the server.
- **Maximum size:** 20MB per file.
- **What happens on upload:**
  1. The file is validated on the client (type + size) before it's sent.
  2. Multer stores the file on disk in `server/uploads/` with a unique, collision-proof filename (a timestamp + random hex string), so nothing is ever overwritten.
  3. `pdf-parse` extracts the full text, page count, and any available metadata.
  4. The extracted text and file metadata are saved to MongoDB via the `Document` model.
  5. If parsing or saving fails, the file is removed from disk so no orphaned uploads are left behind.
- **Storage:** Uploaded PDFs live in `server/uploads/` (auto-created on server start, gitignored). This is local disk storage — Phase 2 does not yet upload to cloud object storage.

## AI Summaries

The **Summary** page (`/summary`) lists your documents; selecting one opens `/summary/:id`, where you can generate an AI summary powered by Google Gemini.

**Setup**

1. Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey).
2. Add it to `server/.env`:
   ```
   GEMINI_API_KEY=your_gemini_api_key
   ```
3. The key is read on the server only (`process.env.GEMINI_API_KEY`) and is never sent to or exposed in the frontend.

**How it works**

1. The extracted text already saved in MongoDB during upload (Phase 2) is reused — no re-parsing happens.
2. If the text is large, it's automatically split into chunks. Each chunk gets a partial summary from Gemini first; the partial summaries are then combined and sent through a second, final prompt that produces the full structured summary. Short documents skip straight to the final prompt.
3. Gemini's Markdown response (Short Summary, Detailed Summary, Key Takeaways, Important Definitions, Important Facts, Exam Tips) is parsed into structured JSON and saved on the `Document` record.
4. The Summary page renders each section as its own card, with Markdown formatting (bold, paragraphs) preserved.

**Caching & regeneration**

- Once generated, a summary is cached on the document (`summary`, `summaryGeneratedAt`, `summaryVersion`). Revisiting a document's summary page shows the cached version instantly — no extra Gemini call.
- A **Regenerate Summary** button is available any time to overwrite the cached summary with a fresh one.

**Error handling**

Friendly messages are shown for: an empty/un-parsed document, a missing or invalid `GEMINI_API_KEY`, Gemini rate limits, request timeouts, network failures, and invalid or missing document IDs.

## AI Flashcards

The **Flashcards** page (`/flashcards`) lists your documents; selecting one opens `/flashcards/:id`, where you can generate a 15-card AI-powered study deck. This feature reuses the same `geminiService` built in Phase 3 — there's no second Gemini implementation.

**How it works**

1. The document's extracted text (already in MongoDB from upload) is sent to Gemini with a prompt requesting exactly 15 flashcards, each with a question, a concise answer, and a difficulty (`Easy`, `Medium`, or `Hard`), returned as JSON only.
2. The response is parsed defensively — stray markdown code fences or commentary around the JSON are stripped, and each card is validated before saving.
3. Each flashcard is stored as its own document in a dedicated `Flashcard` collection, linked to the source document by `documentId`.

**Studying**

- Cards flip between question (front) and answer (back) with a smooth 3D animation.
- **Previous** / **Next** buttons and a "Card X of Y" counter step through the deck.
- A difficulty filter (**All / Easy / Medium / Hard**) narrows the deck to a subset.
- **Shuffle Cards** randomizes the current deck order; **Restart Deck** resets it back to the original (filtered) order.

**Caching & regeneration**

- Once generated, flashcards are cached in MongoDB. Revisiting a document's flashcards page loads them instantly via `GET /api/study/flashcards/:documentId` — no extra Gemini call.
- **Regenerate Flashcards** replaces the cached deck with a freshly generated one (the old cards for that document are deleted first).

**Error handling**

Friendly messages are shown for: an empty/un-parsed document, a malformed AI response, Gemini rate limits/timeouts/network failures (via the shared error classification from Phase 3), database save failures, and invalid or missing document IDs.

## AI Quiz

The **Quiz** page (`/quiz`) lists your documents; selecting one opens `/quiz/:id`, where you can choose a difficulty and generate a 10-question multiple-choice quiz. This feature reuses the same `geminiService` built in Phase 3 — there's no second Gemini implementation.

**Difficulty levels**

Each document can have up to three independent quizzes, one per difficulty — **Easy**, **Medium**, and **Hard** — generated and cached separately. Switching difficulty on the Quiz page loads (or offers to generate) that difficulty's own cached quiz.

**How it works**

1. The document's extracted text (already in MongoDB from upload) is sent to Gemini with a prompt requesting exactly 10 multiple-choice questions at the selected difficulty, each with 4 options, a correct answer, a short explanation, and a difficulty label, returned as JSON only.
2. The response is parsed defensively — stray markdown fences are stripped, and any question missing an option, a correct answer, or where the correct answer doesn't match one of the 4 options, is discarded.
3. The quiz is stored as one `Quiz` document per `(documentId, difficulty)` pair.

**Taking the quiz**

- Questions are shown one at a time with **Previous** / **Next** navigation and a "Question X of Y" progress bar.
- The **Submit Quiz** button appears once every question has been answered on the final question.
- After submitting: a **Results** screen shows the final score, percentage, correct/incorrect counts, time taken, and a motivational message that scales with performance (90–100% "Excellent work!" down to below 50% "Spend more time reviewing before trying again.").
- Below the results, every question is available in **Review** mode — your selected answer and the correct answer are highlighted (green for correct, red for an incorrect selection), along with the explanation.
- From the results screen you can **Retake Quiz** (same questions), **Generate New Quiz** (regenerates at the same difficulty), **Generate Flashcards**, or **Return to Summary**.

**Caching, regeneration & scoring**

- Once generated, a quiz is cached per document+difficulty. Revisiting that difficulty loads it instantly — no extra Gemini call.
- **Regenerate Quiz** replaces the cached question set for that difficulty (score history is preserved).
- Every submitted attempt is saved to that quiz's `scoreHistory` via `POST /api/study/quiz/:documentId/score` — this endpoint isn't in the original three-route spec but was added to make the `scoreHistory` field the Quiz model requires actually persist attempts, rather than sitting unused.

**Error handling**

Friendly messages are shown for: an empty/un-parsed document, a malformed AI response, Gemini rate limits/timeouts/network failures (via the shared error classification from Phase 3), database save failures, and invalid or missing document IDs/difficulties.

## Documents

- **Documents page** (`/documents`) lists every uploaded PDF as a card showing its title, upload date, page count, file size, and a "Summarized" badge once an AI summary exists, with **Open** and **Delete** actions.
- **Document Details page** (`/documents/:id`) shows full metadata plus a scrollable preview of the extracted text, word/character counts (computed client-side), and a button to generate or view the document's AI summary.
- **Dashboard** (`/dashboard`) surfaces your most recent uploads, a running document count, and a quick-upload shortcut.
- Deleting a document removes both its database record and its file on disk.

## API Endpoints (Phase 5)

| Method | Route                        | Description                                              |
| ------ | ------------------------------ | ---------------------------------------------------------- |
| GET    | `/`                             | API root health check                                       |
| GET    | `/api/health`                   | Health check                                                 |
| POST   | `/api/upload`                   | Upload a PDF, parse it, and save it (`multipart/form-data`, field name `file`) |
| GET    | `/api/documents`                | List all uploaded documents                                  |
| GET    | `/api/documents/:id`            | Get a single document, including extracted text and any cached summary |
| DELETE | `/api/documents/:id`            | Delete a document's database record and its file on disk     |
| POST   | `/api/study/summary`            | Generate (or return the cached) AI summary for a document    |
| POST   | `/api/study/flashcards`         | Generate (or return the cached) AI flashcards for a document |
| GET    | `/api/study/flashcards/:documentId` | Get the cached flashcards for a document                 |
| DELETE | `/api/study/flashcards/:documentId` | Delete all flashcards for a document                      |
| POST   | `/api/study/quiz`               | Generate (or return the cached) AI quiz for a document + difficulty |
| GET    | `/api/study/quiz/:documentId`   | Get the cached quiz(zes) for a document (optionally `?difficulty=`) |
| DELETE | `/api/study/quiz/:documentId`   | Delete quiz(zes) for a document (optionally `?difficulty=`) |
| POST   | `/api/study/quiz/:documentId/score` | Record a completed attempt's score to `scoreHistory`      |
| POST   | `/api/study/chat`               | Placeholder — not implemented yet                            |
| POST   | `/api/notes`                    | Placeholder — not implemented yet                             |
| PUT    | `/api/notes/:id`                | Placeholder — not implemented yet                             |
| DELETE | `/api/notes/:id`                | Placeholder — not implemented yet                             |

**`POST /api/study/summary`**

Request body:
```json
{ "documentId": "64f...", "regenerate": false }
```

`regenerate` is optional and defaults to `false`. When `false` and a cached summary already exists, it's returned immediately without calling Gemini.

Response:
```json
{
  "success": true,
  "summary": {
    "shortSummary": "",
    "detailedSummary": "",
    "keyTakeaways": [],
    "definitions": [],
    "importantFacts": [],
    "examTips": []
  },
  "cached": false,
  "generatedAt": "2026-08-04T12:00:00.000Z",
  "version": 1
}
```

**`POST /api/study/flashcards`**

Request body:
```json
{ "documentId": "64f...", "regenerate": false }
```

`regenerate` is optional and defaults to `false`. When `false` and cached flashcards already exist for the document, they're returned immediately without calling Gemini.

Response:
```json
{
  "success": true,
  "cached": false,
  "count": 15,
  "flashcards": [
    { "id": "...", "documentId": "...", "question": "", "answer": "", "difficulty": "Medium", "createdAt": "...", "updatedAt": "..." }
  ]
}
```

**`GET /api/study/flashcards/:documentId`** returns the same `flashcards` array shape (empty if none have been generated yet).

**`DELETE /api/study/flashcards/:documentId`** removes all flashcards for that document and returns `{ "success": true, "deletedCount": 15 }`.

**`POST /api/study/quiz`**

Request body:
```json
{ "documentId": "64f...", "difficulty": "easy", "regenerate": false }
```

`difficulty` is required and case-insensitive (`easy`, `Medium`, `HARD` all work). `regenerate` is optional and defaults to `false`. When `false` and a cached quiz already exists for that document+difficulty, it's returned immediately without calling Gemini.

Response:
```json
{
  "success": true,
  "cached": false,
  "quiz": {
    "id": "...",
    "documentId": "...",
    "difficulty": "Easy",
    "questions": [
      {
        "question": "",
        "options": ["", "", "", ""],
        "correctAnswer": "",
        "explanation": "",
        "difficulty": "Easy"
      }
    ],
    "scoreHistory": [],
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**`GET /api/study/quiz/:documentId?difficulty=easy`** returns `{ "success": true, "found": true, "quiz": {...} }` for a single difficulty, or `null` for `quiz` if none has been generated yet. Omit `?difficulty=` to get `{ "success": true, "count": 2, "quizzes": [...] }` — every difficulty generated so far for that document.

**`DELETE /api/study/quiz/:documentId?difficulty=easy`** deletes just that difficulty's quiz; omit the query param to delete all of a document's quizzes.

**`POST /api/study/quiz/:documentId/score`**

Request body:
```json
{ "difficulty": "easy", "score": 8, "totalQuestions": 10, "timeTakenSeconds": 95 }
```

Appends an entry to that quiz's `scoreHistory` and returns `{ "success": true, "scoreHistory": [...] }`.

Every other route still returns:

```json
{ "success": true, "message": "Endpoint ready." }
```

## Deploying the Frontend to Netlify

1. Push the repository to GitHub.
2. In Netlify, create a new site from Git and select the repo.
3. Set the **base directory** to `client`.
4. Set the **build command** to `npm run build`.
5. Set the **publish directory** to `client/dist`.
6. Add the environment variable `VITE_API_URL` pointing to your deployed Render backend, e.g. `https://your-app.onrender.com/api`.
7. Deploy.

## Deploying the Backend to Render

1. Push the repository to GitHub.
2. In Render, create a new **Web Service** and select the repo.
3. Set the **root directory** to `server`.
4. Set the **build command** to `npm install`.
5. Set the **start command** to `npm start`.
6. Add environment variables: `PORT` (Render sets this automatically, but you can leave your own as a fallback), `MONGODB_URI`, `CLIENT_URL` (your Netlify URL), and `GEMINI_API_KEY`.
7. Deploy.

## Roadmap (Not in This Phase)

- Authentication
- Document chat
- Persisted notes with full CRUD logic
- Cloud file storage (currently local disk under `server/uploads/`)
