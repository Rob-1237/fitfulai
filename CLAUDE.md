# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm run dev`
- **Build for production**: `npm run build`
- **Lint code**: `npm run lint`
- **Preview production build**: `npm run preview`

## Project Architecture

This is a React application built with Vite that integrates with Supabase as the backend service.

### Tech Stack
- **Frontend**: React 19.1.1 with JSX
- **Build Tool**: Vite 7.1.2 with HMR
- **Backend**: Supabase (database and authentication)
- **Linting**: ESLint with React Hooks and React Refresh plugins

### Project Structure
- `src/main.jsx` - Application entry point using React 19's createRoot
- `src/App.jsx` - Main application component with Supabase connection testing
- `src/lib/supabaseClient.js` - Supabase client configuration using environment variables
- `vite.config.js` - Vite configuration with React plugin
- `eslint.config.js` - ESLint configuration using flat config format

### Supabase Integration
The application uses Supabase as its backend service. The client is configured to use environment variables:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous public key

The main App component includes a connection test that attempts to query a test table to verify the Supabase connection.

### Environment Setup
Environment variables should be set in a `.env` file (not tracked in git) using the `VITE_` prefix for client-side access.

### Code Style Notes
- Uses modern React patterns with hooks (useState, useEffect)
- ESLint configured with React-specific rules and unused variable checking
- Uses ES modules throughout the codebase