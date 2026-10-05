# Carks Study

A study website that turns questions into structured answers, notes, flashcards, and revision plans with AI assistance.

## Overview

Carks is an academic study app designed for students and learners who want to:

- generate exam-style answers from a prompt
- analyze uploaded documents and extract questions
- chat with an AI study tutor
- save and organize notes
- create active recall flashcards
- manage study planning, habits, and reflections

The app uses React on the frontend and a TypeScript/Express server on the backend, with Gemini-powered academic generation features.

## Tech Stack

- Frontend: React 19 + Vite + TypeScript
- Styling: CSS and Tailwind
- Backend: Express + TypeScript
- AI: Google Gemini via `@google/genai`
- Document parsing: `mammoth` for DOCX files
- PDF generation support via `jspdf`

## Project Structure

- `src/` — frontend React app
- `src/App.tsx` — main application shell and tab-based UI
- `src/components/` — app screens and reusable UI sections
- `src/utils/` — local storage helpers and utilities
- `server.ts` — Express API server and AI integration layer
- `index.html` — Vite entry HTML
- `.env.example` — example environment configuration
- `package.json` — scripts and dependencies

## Features

- Exam answer generation with marks and examiner-style guidance
- Academic document analysis for PDFs, DOCX, and text files
- Study assistant chat in multiple modes
- Notes creation and library management
- Flashcard generation and review workflow
- Study planner with tasks, habits, and reflection tracking
- User profile/progress tracking and local persistence
- Print/PDF export for notes and answers

## Getting Started

### 1. Install dependencies

```bash
npm install
```

Or with Bun:

```bash
bun install
```

### 2. Set up environment variables

Copy the example environment file and add your Gemini API key:

```bash
cp .env.example .env
```

Then update `.env` with your values:

```env
GEMINI_API_KEY="your_google_gemini_api_key"
APP_URL="http://localhost:3000"
```

### 3. Run the app

```bash
npm run dev
```

The app will start with the Express server and Vite middleware in development mode.

## Available Scripts

```bash
npm run dev     # start development server
npm run build   # build frontend assets
npm run start   # start production server with tsx
npm run preview # preview production build
npm run lint    # TypeScript type-check
npm run clean   # remove build artifacts
```

## Notes

- The app expects a valid `GEMINI_API_KEY` for AI-backed features.
- Some flows include a fallback academic generator if the AI service is unavailable or rate-limited.
- Local browser storage is used for saved notes, flashcards, study tasks, and user progress.

## License

This project does not include a license file yet. If you plan to publish or share this repository publicly, you may want to add an appropriate open-source license.

## Repository Summary

This repository is a TypeScript-based AI study platform focused on turning learning material into exam-ready answers and revision assets.
