# FitfulAI

A modern React application with Vite, featuring client authentication, AI-powered meal and workout planning, and advanced calendar management.

## Features

- **Modern React Stack**: Built with React 19 and Vite for lightning-fast development
- **Supabase Integration**: Authentication, database, and real-time features in one platform
- **AI-Powered Planning**: OpenAI integration for intelligent meal and workout suggestions
- **Advanced Calendar**: Drag-and-drop scheduling with conflict resolution
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **State Management**: Zustand for predictable and scalable state handling

## Tech Stack

- **Frontend**: React 19 with Vite
- **Database & Auth**: Supabase (PostgreSQL + Auth + Real-time)
- **State Management**: Zustand + TanStack Query
- **Styling**: Tailwind CSS + Radix UI
- **Calendar**: @dnd-kit/core + react-big-calendar
- **AI Integration**: OpenAI API with intelligent caching
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Linting**: ESLint

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- OpenAI API key

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd fitfulai
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```
Edit `.env` with your Supabase and OpenAI configurations:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

4. Start the development server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/             # React components
│   ├── ui/                # Base UI components (Radix-based)
│   ├── calendar/          # Calendar and scheduling components
│   ├── meals/             # Meal planning components
│   ├── workouts/          # Workout planning components
│   ├── grocery/           # Grocery list components
│   └── auth/              # Authentication components
├── lib/                   # Core utilities and configurations
│   ├── supabaseClient.js  # Supabase configuration
│   ├── openai.js          # OpenAI integration
│   ├── utils.js           # General utilities
│   └── cache.js           # AI response caching
├── stores/                # Zustand stores
│   ├── useAuthStore.js    # Authentication state
│   ├── useWorkoutStore.js # Workout planning state
│   ├── useMealStore.js    # Meal planning state
│   └── useUIStore.js      # UI state management
├── hooks/                 # Custom React hooks
├── data/                  # Static data and schemas
├── styles/                # Global styles and themes
└── types/                 # TypeScript definitions (if migrating)
```

## Key Features Implementation

### Authentication Flow
- Supabase Auth with multiple providers (email/password, magic links, Google, GitHub)
- Persistent sessions with automatic token refresh
- Protected routes with role-based access

### AI Integration
- Multi-layer caching system to minimize API costs
- Intelligent prompt engineering for optimal responses
- Rate limiting based on user subscription tier
- Fallback to templates when quotas are exceeded

### Calendar System
- Advanced drag-and-drop with @dnd-kit
- Cross-component item movement (meals, workouts)
- Conflict detection and resolution
- Mobile gesture support

### State Management
- Zustand stores for different feature domains
- TanStack Query for server state and caching
- Optimistic updates for better UX
- Real-time synchronization with Supabase

## Environment Setup

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# OpenAI Configuration
VITE_OPENAI_API_KEY=your_openai_api_key

# App Configuration
VITE_APP_URL=http://localhost:5173
```

## Development Workflow

1. **Feature Development**: Create feature branches for new functionality
2. **State Management**: Use Zustand stores for business logic, TanStack Query for server state
3. **Component Development**: Follow the established UI component patterns
4. **Testing**: Write tests for critical business logic (setup needed)
5. **Linting**: Run `npm run lint` before commits

## Deployment

The application is built for static deployment and can be hosted on:
- Vercel (recommended)
- Netlify
- GitHub Pages
- Any static hosting service

Build command: `npm run build`
Output directory: `dist`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run linting (`npm run lint`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

Private project - All rights reserved.