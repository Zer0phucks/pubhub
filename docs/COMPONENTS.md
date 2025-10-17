# PubHub Component Documentation

Comprehensive documentation for React components in PubHub.

---

## Table of Contents

- [App Structure](#app-structure)
- [Core Components](#core-components)
- [Feed Components](#feed-components)
- [Project Components](#project-components)
- [Landing Page Components](#landing-page-components)
- [UI Components](#ui-components)

---

## App Structure

### App.tsx

Main application component handling authentication, routing, and state management.

**Location**: `src/App.tsx`

**Key Features**:
- Clerk authentication integration
- Dual authentication (Clerk JWT + Supabase anon key fallback)
- Theme management (light/dark/system)
- Project selection and switching
- View routing (feed/post/settings)

**Component Structure**:
```
App (ClerkProvider wrapper)
├── PublicSite (unauthenticated)
│   ├── LandingPage / PricingPage / DocsPage
│   ├── SignIn / SignUp
│   ├── LandingNav
│   └── LandingFooter
└── AppContent (authenticated)
    ├── Header
    │   ├── ProjectSelector
    │   └── ProfileMenu
    ├── Sidebar
    └── Main Content
        ├── Feed
        ├── CreatePost
        └── ProjectSettings
```

**State Management**:
```typescript
const [user, setUser] = useState<any>(null);           // User profile
const [projects, setProjects] = useState<any[]>([]);   // User's projects
const [currentProject, setCurrentProject] = useState<any>(null);
const [activeView, setActiveView] = useState<'feed' | 'post' | 'settings'>('feed');
const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
```

**Authentication Flow**:
1. Clerk provides user authentication
2. `setGetTokenFunction()` sets up dual auth (JWT → anon key fallback)
3. `loadUserData()` initializes profile and projects
4. Error handling with demo user fallback for graceful degradation

**Props**: None (root component)

**Usage**:
```typescript
// main.tsx
import App from './App';
ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
```

---

## Core Components

### Sidebar

Navigation sidebar with icon-based menu and collapse functionality.

**Location**: `src/components/Sidebar.tsx`

**Props**:
```typescript
interface SidebarProps {
  collapsed: boolean;               // Sidebar collapsed state
  onToggle: () => void;            // Toggle collapse handler
  activeView: 'feed' | 'post' | 'settings';
  onNavigate: (view: string) => void;
}
```

**Features**:
- Icon-based navigation
- Collapsible with smooth transitions
- Active view highlighting
- Responsive design

**Navigation Items**:
- `Feed` (Home): View relevant Reddit posts
- `Create Post`: Generate and post content
- `Settings` (Cog): Project configuration

**Usage**:
```typescript
<Sidebar
  collapsed={sidebarCollapsed}
  onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
  activeView={activeView}
  onNavigate={setActiveView}
/>
```

---

### ProfileMenu

User profile dropdown with theme switcher and account actions.

**Location**: `src/components/ProfileMenu.tsx`

**Props**:
```typescript
interface ProfileMenuProps {
  user: {
    name: string;
    email: string;
    tier: 'free' | 'basic' | 'pro';
  };
  theme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
  onSignOut: () => void;
}
```

**Features**:
- Avatar display with initials
- Tier badge integration
- Theme switcher (light/dark/system)
- Sign out action
- Dropdown menu with Radix UI

**Usage**:
```typescript
<ProfileMenu
  user={{ name: 'John', email: 'john@example.com', tier: 'free' }}
  theme={theme}
  onThemeChange={handleThemeChange}
  onSignOut={handleSignOut}
/>
```

---

### ProjectSelector

Dropdown for switching between projects with create option.

**Location**: `src/components/ProjectSelector.tsx`

**Props**:
```typescript
interface ProjectSelectorProps {
  projects: Project[];
  currentProject: Project | null;
  onSelectProject: (project: Project) => void;
  onCreateNew: () => void;
}

interface Project {
  id: string;
  name: string;
  icon?: string;
  description: string;
  subreddits: string[];
}
```

**Features**:
- Project switching
- Project icon display
- "Create New Project" button
- Subreddit count badge

**Usage**:
```typescript
<ProjectSelector
  projects={projects}
  currentProject={currentProject}
  onSelectProject={setCurrentProject}
  onCreateNew={() => setShowCreateProject(true)}
/>
```

---

## Feed Components

### Feed

Main feed component displaying relevant Reddit posts/comments.

**Location**: `src/components/Feed.tsx`

**Props**:
```typescript
interface FeedProps {
  projectId: string;
  project: Project;
}
```

**Key Features**:
- Reddit post/comment display
- Real-time scanning with progress indicator
- Sort options (recent/engagement/relevance)
- Empty state with setup guidance
- Scan history with background job integration

**State Management**:
```typescript
const [items, setItems] = useState<FeedItem[]>([]);
const [scanning, setScanning] = useState(false);
const [sortBy, setSortBy] = useState('recent');
const [progress, setProgress] = useState(0);
```

**Scan Flow**:
1. User clicks "Scan Now"
2. Triggers Inngest background job via API
3. Shows progress bar with estimated time
4. Polls `/feed/:projectId` every 5 seconds
5. Updates feed when new items appear
6. Shows toast notification with count

**Usage**:
```typescript
<Feed projectId={currentProject.id} project={currentProject} />
```

---

### FeedItem

Individual Reddit post/comment card with AI response generation.

**Location**: `src/components/FeedItem.tsx`

**Props**:
```typescript
interface FeedItemProps {
  item: FeedItem;
  project: Project;
  onUpdate: (itemId: string, updates: Partial<FeedItem>) => void;
}

interface FeedItem {
  id: string;
  type: 'post' | 'comment';
  subreddit: string;
  title: string;
  content: string;
  author: string;
  url: string;
  score: number;
  num_comments: number;
  relevance_score: number;
  created_at: string;
  ai_response?: string;
  status: 'pending' | 'approved' | 'posted' | 'ignored';
}
```

**Features**:
- Post/comment metadata display
- Relevance score visualization
- AI response generation (via Inngest)
- Response editing
- Status management (approve/ignore)
- Reddit link integration
- Copy to clipboard

**AI Response Generation**:
```typescript
const handleGenerateResponse = async () => {
  // Triggers background job
  await inngest.send({
    name: 'ai/response.generate',
    data: { projectId, feedItemId, postContent }
  });

  // Poll for response
  setInterval(() => checkForResponse(), 2000);
};
```

**Usage**:
```typescript
<FeedItem
  item={feedItem}
  project={project}
  onUpdate={handleFeedItemUpdate}
/>
```

---

### EmptyState

Empty state component for feed with setup guidance.

**Location**: `src/components/EmptyState.tsx`

**Props**:
```typescript
interface EmptyStateProps {
  onAddSubreddits: () => void;
  hasSubreddits: boolean;
}
```

**Features**:
- Visual guidance illustration
- Conditional messaging based on setup state
- Call-to-action buttons
- Responsive design

**States**:
- No subreddits: "Add subreddits to start scanning"
- Has subreddits but no results: "Click Scan Now to find posts"

**Usage**:
```typescript
<EmptyState
  onAddSubreddits={() => setActiveView('settings')}
  hasSubreddits={project.subreddits.length > 0}
/>
```

---

## Project Components

### CreateProjectModal

Modal for creating new projects with AI-powered setup.

**Location**: `src/components/CreateProjectModal.tsx`

**Props**:
```typescript
interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (project: Project) => void;
  userTier: 'free' | 'basic' | 'pro';
}
```

**Features**:
- Multi-step form (Name → Description → Subreddits)
- AI subreddit suggestions via Perplexity
- Keyword auto-generation
- Icon picker
- Tier-based project limits
- Progress indicator

**Form Flow**:
```
Step 1: Basic Info
├── Project name
├── Description
├── URL (optional)
└── Icon

Step 2: Subreddit Suggestions (AI-powered)
├── Loading state
├── Suggestion chips
├── Manual addition
└── Validation

Step 3: Confirmation
└── Create project
```

**AI Integration**:
```typescript
// Subreddit suggestions
const suggestions = await api.suggestSubreddits(description, url);

// Keyword generation (automatic on project creation)
// Happens in backend via OpenRouter
```

**Usage**:
```typescript
<CreateProjectModal
  open={showCreateProject}
  onClose={() => setShowCreateProject(false)}
  onSuccess={handleProjectCreated}
  userTier={user.tier}
/>
```

---

### ProjectSettings

Project configuration panel with subreddit and keyword management.

**Location**: `src/components/ProjectSettings.tsx`

**Props**:
```typescript
interface ProjectSettingsProps {
  project: Project;
  userTier: 'free' | 'basic' | 'pro';
  onUpdate: () => void;
  onDelete: () => void;
}
```

**Features**:
- Project info editing (name, description, URL)
- Subreddit management (add/remove with validation)
- Keyword management (view/edit AI-generated keywords)
- AI persona customization
- Reddit account connection status
- Project deletion with confirmation

**Sections**:
```
1. Basic Information
├── Name, Description, URL
└── Icon

2. Subreddit Configuration
├── Active subreddits list
├── Add subreddit input with validation
└── Subreddit info display (subscribers, description)

3. Keyword Management
├── AI-generated keywords
├── Edit keywords
└── Relevance scoring explanation

4. AI Persona
├── Response style customization
└── Example responses

5. Integrations
├── Reddit OAuth connection
└── Connection status

6. Danger Zone
└── Delete project
```

**Usage**:
```typescript
<ProjectSettings
  project={currentProject}
  userTier={user.tier}
  onUpdate={loadUserData}
  onDelete={handleProjectDeleted}
/>
```

---

### CreatePost

AI-powered Reddit post generator.

**Location**: `src/components/CreatePost.tsx`

**Props**:
```typescript
interface CreatePostProps {
  project: Project;
}
```

**Features**:
- Subreddit selection
- AI post generation with custom prompts
- Post idea suggestions (AI-powered)
- Post enhancement mode
- Preview and edit
- Copy to clipboard
- Direct Reddit posting (future feature)

**AI Features**:
```typescript
// Generate post ideas
const ideas = await api.suggestPosts(projectId);

// Generate post
const { post } = await api.generatePost(
  projectId,
  subreddit,
  userPrompt,
  enhance
);
```

**Usage**:
```typescript
<CreatePost project={currentProject} />
```

---

## Landing Page Components

### LandingPage

Main landing page for unauthenticated users.

**Location**: `src/pages/LandingPage.tsx`

**Props**:
```typescript
interface LandingPageProps {
  onGetStarted: () => void;
  onNavigate: (page: string) => void;
}
```

**Sections**:
- Hero with CTA
- Features showcase
- How it works
- Social proof
- Pricing preview
- FAQ
- Final CTA

---

### PricingPage

Pricing tiers and feature comparison.

**Location**: `src/pages/PricingPage.tsx`

**Pricing Tiers**:
```typescript
const tiers = {
  free: {
    price: 0,
    projects: 1,
    scanDays: 1,
    features: ['1 project', 'Last 1 day scanning', 'AI responses']
  },
  basic: {
    price: 19,
    projects: 5,
    scanDays: 30,
    features: ['5 projects', 'Last 30 days', 'Priority support']
  },
  pro: {
    price: 49,
    projects: 'unlimited',
    scanDays: 90,
    features: ['Unlimited', 'Last 90 days', '24/7 support']
  }
};
```

---

### LandingNav

Navigation bar for public pages.

**Location**: `src/components/LandingNav.tsx`

**Features**:
- Logo/branding
- Navigation links (Docs, Pricing, Terms, Privacy)
- Sign in button
- Mobile responsive

---

### LandingFooter

Footer for public pages.

**Location**: `src/components/LandingFooter.tsx`

**Sections**:
- Product links
- Resources
- Legal
- Social links
- Copyright

---

## UI Components

PubHub uses shadcn/ui components. Only 2 are actively used:

### Button

Pre-styled button component with variants.

**Location**: `src/components/ui/button.tsx`

**Variants**:
- `default`: Primary teal gradient
- `destructive`: Red for dangerous actions
- `outline`: Bordered button
- `secondary`: Gray background
- `ghost`: Transparent
- `link`: Text link style

**Usage**:
```typescript
<Button variant="default" size="lg">
  Get Started
</Button>
```

---

### Sonner (Toast)

Toast notification system using Sonner.

**Location**: `src/components/ui/sonner.tsx`

**Types**:
- `toast.success()`: Success notifications
- `toast.error()`: Error messages
- `toast.info()`: Information
- `toast.loading()`: Loading states

**Usage**:
```typescript
import { toast } from './components/ui/sonner';

// Success
toast.success('Scan complete!', {
  description: `Found ${count} relevant posts`
});

// Error
toast.error('Scan failed', {
  description: error.message
});

// Loading (with ID for updating)
const toastId = toast.loading('Scanning subreddits...');
toast.success('Complete!', { id: toastId });
```

---

## Component Development Guidelines

### State Management
- Use React hooks (`useState`, `useEffect`)
- Lift state to parent when shared across components
- Use context for deeply nested props (theme, user)

### API Integration
- Use `api.ts` client for all backend calls
- Handle loading states consistently
- Show user-friendly error messages
- Implement optimistic updates where appropriate

### Styling
- Use Tailwind CSS utility classes
- Follow gradient theme: `from-teal-600 via-emerald-600 to-cyan-600`
- Maintain responsive design (mobile-first)
- Use dark mode classes with `dark:` prefix

### Performance
- Lazy load heavy components
- Memoize expensive computations
- Use React.memo for pure components
- Implement virtual scrolling for large lists (feed)

### Accessibility
- Include ARIA labels for icon-only buttons
- Maintain keyboard navigation support
- Use semantic HTML elements
- Test with screen readers

### Testing
- Write unit tests for utility functions
- Component tests with React Testing Library
- Integration tests for user flows
- E2E tests for critical paths

---

## Common Patterns

### Loading States
```typescript
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  setLoading(true);
  try {
    await api.someAction();
  } catch (error) {
    toast.error('Action failed');
  } finally {
    setLoading(false);
  }
};

return (
  <Button disabled={loading}>
    {loading ? <Loader2 className="animate-spin" /> : 'Action'}
  </Button>
);
```

### Form Handling
```typescript
const [form, setForm] = useState({ name: '', email: '' });

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  await api.submit(form);
};

return (
  <form onSubmit={handleSubmit}>
    <input
      value={form.name}
      onChange={(e) => setForm({ ...form, name: e.target.value })}
    />
  </form>
);
```

### Error Boundaries
```typescript
<ErrorBoundary>
  <ComponentThatMightFail />
</ErrorBoundary>
```

---

**Last Updated**: 2025-10-15
**React Version**: 18.x
**Framework**: Vite + React + TypeScript
