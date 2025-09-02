# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is an AI-powered eBook generation SaaS platform built with Next.js 15, TypeScript, and AI APIs (OpenAI GPT-4 and Anthropic Claude). The platform allows users to generate complete eBooks by providing a topic and description, with AI automatically creating outlines and chapter content.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Architecture Overview

### Core Stack
- **Next.js 15** with App Router (src/app directory structure)
- **TypeScript** with strict mode enabled
- **Tailwind CSS v4** for styling
- **shadcn/ui** components in src/components/ui/
- **Supabase** for backend (authentication and database)

### Directory Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── generate-outline/   # POST: Generate book outline
│   │   ├── generate-chapter/   # POST: Generate chapter content
│   │   └── export/             # POST: Export to PDF/EPUB/DOCX
│   ├── demo/              # Free demo page
│   ├── create/            # Full ebook creation page
│   └── page.tsx           # Landing page
├── lib/                   # Core utilities
│   ├── ai/               # AI integrations
│   │   ├── openai.ts     # OpenAI GPT integration
│   │   └── anthropic.ts  # Claude integration
│   └── supabase/         # Supabase client setup
└── components/ui/         # shadcn/ui components
```

### Key Pages and Routes
- `/` - Landing page with pricing and features
- `/demo` - Free demo with limited features
- `/create` - Full ebook creation interface with advanced settings

## API Integration Pattern

### AI Services
The app supports multiple AI providers with fallback to demo data when API keys are not configured:

1. **OpenAI** (`OPENAI_API_KEY`): GPT-3.5 and GPT-4 models
2. **Anthropic** (`ANTHROPIC_API_KEY`): Claude Sonnet and Opus models

When API keys are missing, the app returns sample/demo content to allow testing without credentials.

### API Route Pattern
All API routes follow this pattern:
1. Check for required parameters
2. Verify API keys exist
3. If no API keys, return demo/sample data
4. Otherwise, call actual AI service
5. Handle errors gracefully with fallbacks

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
```

## State Management
- Client-side state using React hooks (useState)
- No global state management library currently
- Toast notifications via `sonner` library

## Important Implementation Details

### PDF Export
- Uses `jsPDF` for client-side PDF generation
- Current implementation creates simple PDFs with basic formatting
- EPUB and DOCX formats return 501 (not implemented) status

### Content Generation Flow
1. User inputs topic and description
2. `/api/generate-outline` creates book structure (title + chapters with key points)
3. User can generate each chapter individually or all at once via `/api/generate-chapter`
4. Content is editable in markdown format
5. Export functionality available for completed books

### Demo vs Full Version
- **Demo** (`/demo`): Hardcoded sample data, no API calls, limited to demonstration
- **Create** (`/create`): Full functionality with API integration, settings, and export features

## Korean Language Focus
The app is primarily designed for Korean users:
- Korean language in UI text
- Default language setting is 'ko'
- Pricing in KRW (₩)

## Development Notes

### Running Locally
The dev server automatically finds an available port if 3000 is occupied. Check the console output for the actual port.

### API Key Configuration
Without API keys, the app operates in demo mode with sample data. This allows full UI/UX testing without incurring API costs.