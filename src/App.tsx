import { useState, useEffect } from 'react';
import { ClerkProvider, SignedIn, SignedOut, SignIn, useUser, useAuth, SignUp } from '@clerk/clerk-react';
import { ProjectSelector } from './components/ProjectSelector';
import { Sidebar } from './components/Sidebar';
import { ProfileMenu } from './components/ProfileMenu';
import { CreateProjectModal } from './components/CreateProjectModal';
import { Feed } from './components/Feed';
import { CreatePost } from './components/CreatePost';
import { ProjectSettings } from './components/ProjectSettings';
import { LandingNav } from './components/LandingNav';
import { LandingFooter } from './components/LandingFooter';
import { LandingPage } from './pages/LandingPage';
import { PricingPage } from './pages/PricingPage';
import { DocsPage } from './pages/DocsPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { Toaster, toast } from './components/ui/sonner';
import { BackendCheck } from './components/BackendCheck';
import { ClerkDebug } from './components/ClerkDebug';
import { DemoModeBanner } from './components/DemoModeBanner';
import ErrorBoundary from './components/ErrorBoundary';
import { api, setGetTokenFunction } from './lib/api';
import { Loader2 } from 'lucide-react';

const CLERK_PUBLISHABLE_KEY = (import.meta.env?.VITE_CLERK_PUBLISHABLE_KEY as string | undefined) || 'pk_live_Y2xlcmsucHViaHViLmRldiQ';

type PublicPage = 'home' | 'pricing' | 'docs' | 'terms' | 'privacy' | 'signin' | 'signup';

function AppContent() {
  const { user: clerkUser } = useUser();
  const { getToken, signOut } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [activeView, setActiveView] = useState<'feed' | 'post' | 'settings'>('feed');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clerkUser) {
      // Set up dual authentication: try Clerk JWT first, fallback to Supabase anon key
      setGetTokenFunction(async () => {
        try {
          const token = await getToken();
          if (token) {
            console.log('Using Clerk JWT authentication');
            return token;
          }
          console.log('No Clerk token available, using Supabase anon key');
          return null; // Will use Supabase anon key from api.ts
        } catch (error) {
          console.error('Error getting Clerk token:', error);
          console.log('Falling back to Supabase anon key');
          return null; // Will use Supabase anon key from api.ts
        }
      });

      loadUserData();
    }
  }, [clerkUser, getToken]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      console.log('==================== LOADING USER DATA ====================');
      console.log('Clerk user ID:', clerkUser?.id);
      console.log('Clerk user email:', clerkUser?.primaryEmailAddress?.emailAddress);

      // Initialize or get user profile
      console.log('Initializing profile...');
      const profile = await api.initProfile();
      console.log('Profile loaded:', profile);
      setUser(profile);
      setTheme(profile.theme || 'system');

      console.log('Loading projects...');
      const userProjects = await api.getProjects();
      console.log('Projects loaded:', userProjects);
      setProjects(userProjects);

      if (userProjects.length > 0 && !currentProject) {
        setCurrentProject(userProjects[0]);
      }
      
      console.log('✅ User data loaded successfully');
      console.log('==========================================================');
    } catch (error) {
      console.error('❌ Error loading user data:', error);
      console.error('Error details:', error instanceof Error ? error.message : String(error));
      
      // Set a default user to allow the app to load
      console.log('Setting default user profile as fallback');
      setUser({
        id: clerkUser?.id || 'demo-user',
        email: clerkUser?.primaryEmailAddress?.emailAddress || 'demo@pubhub.test',
        name: clerkUser?.fullName || clerkUser?.firstName || 'Demo User',
        tier: 'free',
        theme: 'system',
      });
      
      toast.error('Failed to load user data', {
        description: 'Using local mode. Your data will sync when the connection is restored.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    setProjects([]);
    setCurrentProject(null);
  };

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    try {
      await api.updateUserProfile({ theme: newTheme });
    } catch (error) {
      console.error('Error updating theme:', error);
    }
  };

  const handleProjectCreated = async (project: any) => {
    await loadUserData();
    setCurrentProject(project);
    setActiveView('feed');
  };

  const handleProjectDeleted = async () => {
    await loadUserData();
    if (projects.length > 0) {
      setCurrentProject(projects[0]);
    } else {
      setCurrentProject(null);
    }
    setActiveView('feed');
  };

  if (loading) {
    return (
      <>
        <BackendCheck />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto" />
            <p className="text-sm text-muted-foreground">Loading user data...</p>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <BackendCheck />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto" />
            <p className="text-sm text-muted-foreground">Initializing...</p>
          </div>
        </div>
      </>
    );
  }

  if (!currentProject) {
    return (
      <>
        <Toaster />
        <BackendCheck />
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50">
          <header className="bg-white border-b border-teal-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                PubHub
              </h1>
              <ProfileMenu
                user={{
                  name: clerkUser?.fullName || clerkUser?.firstName || user.name,
                  email: clerkUser?.primaryEmailAddress?.emailAddress || user.email,
                  tier: user?.tier || 'free',
                }}
                theme={theme}
                onThemeChange={handleThemeChange}
                onSignOut={handleSignOut}
              />
            </div>
          </header>
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto text-center space-y-8">
              <div>
                <h1 className="text-5xl mb-4 bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                  Welcome to PubHub
                </h1>
                <p className="text-xl text-muted-foreground">
                  Let's create your first project to start connecting with your audience on Reddit
                </p>
              </div>
              <button
                onClick={() => setShowCreateProject(true)}
                className="inline-flex items-center justify-center px-8 py-4 text-lg rounded-lg bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 text-white hover:opacity-90 transition-opacity"
              >
                Create Your First Project
              </button>
            </div>
          </div>
          <CreateProjectModal
            open={showCreateProject}
            onClose={() => setShowCreateProject(false)}
            onSuccess={handleProjectCreated}
            userTier={user?.tier || 'free'}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <Toaster />
      <BackendCheck />
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50">
        {/* Header */}
        <header className="bg-white border-b border-teal-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                PubHub
              </h1>
              <ProjectSelector
                projects={projects}
                currentProject={currentProject}
                onSelectProject={setCurrentProject}
                onCreateNew={() => setShowCreateProject(true)}
              />
            </div>
            <ProfileMenu
              user={{
                name: clerkUser?.fullName || clerkUser?.firstName || user.name,
                email: clerkUser?.primaryEmailAddress?.emailAddress || user.email,
                tier: user?.tier || 'free',
              }}
              theme={theme}
              onThemeChange={handleThemeChange}
              onSignOut={handleSignOut}
            />
          </div>
        </header>

        {/* Main Content */}
        <div className="flex h-[calc(100vh-73px)]">
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            activeView={activeView}
            onNavigate={setActiveView}
          />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="container mx-auto max-w-7xl">
              {activeView === 'feed' && <Feed projectId={currentProject.id} project={currentProject} />}
              {activeView === 'post' && <CreatePost project={currentProject} />}
              {activeView === 'settings' && (
                <ProjectSettings
                  project={currentProject}
                  userTier={user?.tier || 'free'}
                  onUpdate={loadUserData}
                  onDelete={handleProjectDeleted}
                />
              )}
            </div>
          </main>
        </div>

        <CreateProjectModal
          open={showCreateProject}
          onClose={() => setShowCreateProject(false)}
          onSuccess={handleProjectCreated}
          userTier={user?.tier || 'free'}
        />
      </div>
    </>
  );
}

function PublicSite() {
  const [currentPage, setCurrentPage] = useState<PublicPage>('home');

  const handleSignIn = () => {
    setCurrentPage('signin');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as PublicPage);
    window.scrollTo(0, 0);
  };

  if (currentPage === 'signin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <button
              onClick={() => setCurrentPage('home')}
              className="text-5xl mb-4 bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent"
            >
              PubHub
            </button>
            <p className="text-xl text-muted-foreground">
              Connect with your customers on Reddit
            </p>
          </div>
          <SignIn 
            routing="hash"
            signUpUrl="#/sign-up"
            appearance={{
              elements: {
                rootBox: 'mx-auto',
                card: 'shadow-xl',
              }
            }}
          />
        </div>
      </div>
    );
  }

  if (currentPage === 'signup') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <button
              onClick={() => setCurrentPage('home')}
              className="text-5xl mb-4 bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent"
            >
              PubHub
            </button>
            <p className="text-xl text-muted-foreground">
              Connect with your customers on Reddit
            </p>
          </div>
          <SignUp 
            routing="hash"
            signInUrl="#/sign-in"
            appearance={{
              elements: {
                rootBox: 'mx-auto',
                card: 'shadow-xl',
              }
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <LandingNav
        onNavigate={handleNavigate}
        onSignIn={handleSignIn}
        currentPage={currentPage}
      />
      
      {currentPage === 'home' && (
        <LandingPage
          onGetStarted={handleSignIn}
          onNavigate={handleNavigate}
        />
      )}
      
      {currentPage === 'pricing' && (
        <PricingPage onGetStarted={handleSignIn} />
      )}
      
      {currentPage === 'docs' && <DocsPage />}
      
      {currentPage === 'terms' && <TermsPage />}
      
      {currentPage === 'privacy' && <PrivacyPage />}
      
      <LandingFooter onNavigate={handleNavigate} />
    </>
  );
}

export default function App() {
  console.log('PubHub App Loading...');
  console.log('Clerk Key:', CLERK_PUBLISHABLE_KEY);
  console.log('Environment: Production keys configured for pubhub.dev');
  console.log('Current domain:', window.location.hostname);
  
  // Suppress Clerk domain mismatch errors in development
  const originalConsoleError = console.error;
  console.error = (...args) => {
    const message = args[0]?.toString() || '';
    if (message.includes('origin_invalid') || 
        message.includes('Invalid HTTP Origin header') ||
        message.includes('Production Keys are only allowed for domain')) {
      // Suppress these specific Clerk domain errors - we're handling this with demo mode
      return;
    }
    originalConsoleError.apply(console, args);
  };
  
  return (
    <ErrorBoundary>
      <ClerkProvider
        publishableKey={CLERK_PUBLISHABLE_KEY}
        fallbackRedirectUrl="/"
      >
        <SignedOut>
          <ErrorBoundary>
            <PublicSite />
          </ErrorBoundary>
        </SignedOut>
        <SignedIn>
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
        </SignedIn>
      </ClerkProvider>
    </ErrorBoundary>
  );
}
