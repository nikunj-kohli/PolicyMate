# PolicyMate

PolicyMate is an AI-powered insurance recommendation platform built for the AarogyaAid-style assessment. It helps users choose the right health plan by combining a patient-sensitive profile form, document-grounded recommendations, and an explainable chat assistant.

## What the company wants

AarogyaAid expects a prototype with two core surfaces:

- **User Portal**: capture exactly six profile fields, then provide a Best Fit recommendation with a peer comparison table, a coverage detail table, and an interactive policy explainer.
- **Admin Panel**: upload, edit, and delete policy documents in PDF / JSON / TXT formats, manage policy metadata, and keep the AI knowledge base updated without code changes.

The platform must deliver:

- warm, empathetic insurance guidance
- RAG-based grounding from uploaded documents
- transparent, structured recommendation outputs
- strict six-field profile capture
- secure admin access with credentials from environment variables
- immediate vector-store deletion of removed policies

## Final tech stack

### Frontend
- `React.js`
- `Axios`
- `React Router DOM`
- `React Markdown`

### Backend
- `Node.js`
- `Express.js`
- `dotenv`
- `cors`
- `multer`
- `bcryptjs`
- `express-session`

### AI & LLM
- `LangChain.js`
- `NVIDIA NIM API` (GLM-5 / Kimi K2.5 / MiniMax M2.7)

### PDF parsing
- `pdf-parse`

### Vector store
- `Chroma`

### Database
- `Supabase` (PostgreSQL)

### File storage
- `Cloudflare R2`

### Testing
- `Jest`
- `Supertest`

## Why this stack and how it helps PolicyMate

### Frontend choices
- `React.js` is ideal for the form-driven user flow and reusable UI components needed for the user portal and admin panel.
- `Axios` provides a simple promise-based HTTP client for frontend/backend communication, including file upload and chat polling.
- `React Router DOM` enables clean navigation between the recommendation page and the admin panel.
- `React Markdown` lets us render policy explanations, tooltips, and reasoned text safely and clearly.

### Backend choices
- `Node.js` and `Express.js` give us a single JavaScript stack, speeding development and simplifying deployment.
- `dotenv` keeps secrets and environment configuration out of code.
- `cors` enables secure cross-origin calls from the frontend.
- `multer` manages file uploads for policy documents.
- `bcryptjs` secures admin credentials and session login.
- `express-session` keeps the admin panel authenticated and stores user session context for chat.

### AI / LLM choices
- **Custom Gemini API Implementation**: We chose to implement a lightweight, custom wrapper around the Google Gemini REST API instead of using the Google ADK or heavy orchestration frameworks like LangChain.
- **Justification**: The assessment demands extremely strict adherence to JSON schemas (specifically for the peer comparison and coverage detail tables) and precise system prompt instructions (e.g., exactly 150-250 words referencing profile fields). Heavy frameworks like LangChain often inject hidden prompt wrappers and parsing layers that make strict schema adherence unpredictable. By building a custom REST wrapper, we maintain absolute, transparent control over the prompt structure, RAG context injection, and JSON output parsing, ensuring the agent remains highly predictable and grounded without dependency bloat.

### Document and vector infrastructure
- `pdf-parse` extracts text reliably from native policy PDFs.
- `Chroma` is the vector store for embedding policy chunks and performing similarity search.
- `Supabase` stores metadata, policy records, and admin-managed policy fields in PostgreSQL.
- `Cloudflare R2` stores original uploaded policy files and makes them available for download or later reference.

### Testing
- `Jest` is used for unit testing recommendation logic and utility functions.
- `Supertest` verifies API endpoints for upload, delete, recommendation, and chat.

## How each layer supports PolicyMate

### User Portal
- React builds the six-field profile form and recommendation UI.
- Axios sends profile data and chat messages to the Express backend.
- The recommendation view renders a peer comparison table, coverage detail table, and a warm explanation.

### Backend / AI agent
- Express handles policy metadata, file uploads, admin auth, and AI endpoints.
- LangChain.js builds the agent with a system prompt, retrieval tool, and scope guardrails.
- The agent uses Chroma to retrieve policy chunks and generate grounded recommendations.

### Document intelligence
- Policy PDFs are parsed with `pdf-parse` into text.
- Text is chunked into policy sections and indexed into Chroma.
- The recommendation engine retrieves relevant chunks and cites them in the output, preventing hallucination.

### Admin panel
- Supabase stores document metadata like policy name, insurer, and upload date.
- Cloudflare R2 stores the raw policy file.
- Deletions remove the policy metadata, file, and Chroma vectors immediately.
- Admin login is protected by `express-session` and env-driven credentials.

## Project goals

1. **Empathetic patient experience**
   - greet the user by name
   - acknowledge health conditions before presenting numbers
   - explain insurance terms in plain language

2. **Grounded recommendations**
   - recommendation logic is driven by uploaded policy documents
   - every factual claim is sourced from Chroma retrieval
   - the agent declines medical advice and stays in insurance scope

3. **Structured transparency**
   - peer comparison table with policy name, insurer, premium, cover amount, waiting period, key benefit, and suitability score
   - coverage detail table with inclusions, exclusions, sub-limits, co-pay %, and claim type
   - 150–250 word policy rationale that references at least three profile fields

4. **Admin-managed knowledge base**
   - upload PDF / JSON / TXT documents
   - edit policy metadata after upload
   - delete policies and remove vectors immediately
   - secure admin access via env variables

## Recommendations and RAG strategy

PolicyMate uses a hybrid approach:

- parse and chunk each uploaded policy document
- embed chunks into Chroma
- use LangChain.js retrieval tools to fetch relevant policy clauses for the current user profile
- generate recommendation outputs from retrieved policy content, not model “knowledge” alone

For Suitability Score, the backend will calculate a rule-based score from profile-policy fit factors such as age band, lifestyle, pre-existing conditions, income band, and city tier.

## Assessment alignment

This implementation is designed to meet the assignment criteria directly:

- **Approach**: empathic recommendations, patient-first tone, and clear logic for policy matching.
- **Document intelligence**: document parsing, Chroma retrieval, and tool-based grounding.
- **Transparency**: explicit sectioned output and explainable policy rationale.
- **Code quality**: single-language JavaScript/Node stack, documented env config, and backend tests.

## Next step

Start by scaffolding the Express backend, admin auth, file upload routes, Chroma ingestion workflow, and the LangChain.js agent. Then build the React user portal and admin panel around the same APIs.
