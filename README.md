# DischargeReady

DischargeReady turns a text-based hospital discharge report into a patient-friendly care plan. It extracts report text on the server, creates a structured summary with medicines, tasks, follow-ups, restrictions, and safety notes, and provides a report-grounded chat experience.

> **Medical notice:** This application is a report summarization and care-coordination aid. It is not a doctor and does not replace a healthcare professional, emergency services, or the original discharge instructions.

## What it does

- Upload a `.pdf` or `.txt` discharge report.
- Extract PDF text locally on the server with `pdf-parse` (PDF.js).
- Send **only extracted text**, never the PDF file itself, to the LLM through OpenRouter.
- Generate a structured, source-grounded care plan:
  - plain-language summary and reported diagnoses
  - medicine names, doses, instructions, and schedules
  - checkable daily actions
  - activity and diet restrictions
  - clinician, test, and imaging follow-ups
  - safety flags and questions to confirm with the care team
- Chat about the report in the selected language.
- Export medicine reminders as an Outlook-compatible `.ics` calendar file and medication history as CSV/PDF.
- Support English, Hinglish, major international languages, and a broad set of Indian languages.

## Tech stack

- [Next.js 16](https://nextjs.org/) with React 19 and TypeScript
- Tailwind CSS and shadcn-style UI components
- `pdf-parse` 2.4.5 / PDF.js for server-side text extraction
- [OpenRouter](https://openrouter.ai/) chat-completions API
- Model: `google/gemini-3.1-flash-lite`
- Lucide React icons

## Privacy and data flow

```text
PDF or text report
  → Next.js API route
  → local text extraction (for PDFs)
  → null-character cleanup, trimming, and size checks
  → extracted plain text sent to OpenRouter
  → structured care plan or report-chat answer
```

The application does not use OCR, PyMuPDF, or pdfplumber. It is intended for PDFs with selectable text. Scanned image-only reports need OCR support before they can be reliably processed.

The uploaded PDF is sent to the app server for local extraction, but it is not sent to the AI provider. Chat currently re-extracts the report text for each question and sends text—not the PDF—to the model.

## Requirements

- Node.js 20 or later
- Corepack (recommended, to use the project-pinned pnpm version)
- An OpenRouter API key with available credits

## Setup

1. Install dependencies:

   ```bash
   corepack pnpm install
   ```

2. Create `.env.local` in the project root:

   ```env
   OPENROUTER_API_KEY=sk-or-v1-your-key-here
   ```

   Use `.env.example` as the reference. Do not commit `.env.local` or expose the key in client-side code.

3. Start development mode:

   ```bash
   corepack pnpm dev
   ```

4. Open the local URL shown by Next.js, usually `http://localhost:3000`.

## Commands

| Command | Purpose |
| --- | --- |
| `corepack pnpm dev` | Start the development server. |
| `corepack pnpm build` | Create a production build. |
| `corepack pnpm start` | Run the production server after building. |
| `corepack pnpm exec tsc --noEmit` | Type-check without producing files. |

## API routes

### `POST /api/reports`

Accepts a `multipart/form-data` request with:

- `report`: a PDF or text file
- `language`: one of the options in `lib/language.ts`

Extracts and validates the report text, then returns structured report analysis.

### `POST /api/reports/chat`

Accepts:

- `report`: the uploaded PDF or text file
- `question`: a report-related question (maximum 1,500 characters)
- `history`: a bounded JSON conversation history
- `language`: the output language

The answer is instructed to use only the extracted report text and supplied chat context.

## Safety and grounding

The prompts and server-side normalization are designed to:

- avoid inventing clinical facts or treatment recommendations;
- preserve documented medicine doses, dates, measurements, and source references;
- keep appointments out of the daily checklist;
- turn each documented medicine into a checklist item while filtering vague, non-checkable reminders;
- surface missing parameters and report-documented urgent warnings; and
- instruct users to confirm uncertain or safety-sensitive information with their care team.

## Architecture note

The current implementation uses one LLM request for report analysis and one request per chat question. It does **not** currently implement a multi-agent workflow. A future multi-agent design could separate report parsing, care-plan generation, and evidence/safety review into bounded, schema-validated stages.

## Project layout

```text
app/
  api/reports/          Report analysis and chat route handlers
  page.tsx              Main interactive interface
components/
  report-chat.tsx       Report chat interface
lib/
  language.ts           Supported language configuration
  report-analysis.ts    Shared report-analysis types
  report-text.ts        Local PDF/text extraction and validation
```
