import { useState, useEffect } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "./components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./components/ui/collapsible";
import { 
  LayoutDashboard, 
  PenSquare, 
  Inbox, 
  Calendar, 
  Settings as SettingsIcon,
  ChevronDown,
  Mail,
  MessageSquare,
  MessageCircle,
  Video,
  Link2,
  Workflow,
  Keyboard,
  Bell,
  Palette,
  BarChart3,
} from "lucide-react";
import { Home } from "./components/Home";
import { ContentComposer } from "./components/ContentComposer";
import { UnifiedInbox } from "./components/UnifiedInbox";
import { ContentCalendar } from "./components/ContentCalendar";
import { Analytics } from "./components/Analytics";
import { Settings, SettingsTab } from "./components/Settings";
import { MediaLibrary } from "./components/MediaLibrary";
import { Notifications } from "./components/Notifications";
import { PubHubLogo } from "./components/PubHubLogo";
import { AppHeader } from "./components/AppHeader";
import { CommandPalette } from "./components/CommandPalette";
import { SettingsPanel } from "./components/SettingsPanel";
import { AIChatDialog } from "./components/AIChatDialog";
import { Toaster } from "./components/ui/sonner";
import { TransformedContent } from "./utils/contentTransformer";
import { useAuth } from "./contexts/AuthContext";
import { AuthPage } from "./components/Auth/AuthPage";
import { AuthCallback } from "./components/Auth/AuthCallback";
import { LandingPage } from "./components/LandingPage";

type View = "home" | "compose" | "inbox" | "calendar" | "analytics" | "library" | "notifications" | "settings";
type Platform = "all" | "twitter" | "instagram" | "linkedin" | "facebook" | "youtube" | "tiktok" | "pinterest" | "reddit" | "blog";
type InboxView = "all" | "unread" | "comments" | "messages";

export default function App() {
  const { user, loading } = useAuth();
  const [showAuthPage, setShowAuthPage] = useState(false);
  const [currentView, setCurrentView] = useState<View>("home");
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("all");
  const [inboxView, setInboxView] = useState<InboxView>("unread");
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("connections");
  const [inboxOpen, setInboxOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [aiChatOpen, setAIChatOpen] = useState(false);
  const [transformedContent, setTransformedContent] = useState<TransformedContent | null>(null);

  // Apply theme and set document title
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    document.title = 'PubHub - Creator Platform';
    
    // Add favicon
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/svg+xml';
    link.rel = 'icon';
    link.href = '/public/favicon.svg';
    document.head.appendChild(link);
  }, [theme]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for AI chat
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setAIChatOpen(true);
      }
      // Cmd/Ctrl + Shift + K for command palette
      if (e.key === "k" && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      // Cmd/Ctrl + , for settings panel
      if (e.key === "," && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSettingsPanelOpen(true);
      }
      // Cmd/Ctrl + N for new post
      if (e.key === "n" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCurrentView("compose");
      }
      // Cmd/Ctrl + H for home
      if (e.key === "h" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCurrentView("home");
      }
      // Cmd/Ctrl + I for inbox
      if (e.key === "i" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCurrentView("inbox");
      }
      // Cmd/Ctrl + C for calendar (unless copying)
      if (e.key === "c" && (e.metaKey || e.ctrlKey) && !e.shiftKey && e.target === document.body) {
        e.preventDefault();
        setCurrentView("calendar");
      }
      // Cmd/Ctrl + A for analytics
      if (e.key === "a" && (e.metaKey || e.ctrlKey) && e.target === document.body) {
        e.preventDefault();
        setCurrentView("analytics");
      }
      // Cmd/Ctrl + M for media library
      if (e.key === "m" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCurrentView("library");
      }
      // Cmd/Ctrl + B for notifications (Bell)
      if (e.key === "b" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCurrentView("notifications");
      }
      // Cmd/Ctrl + S for settings
      if (e.key === "s" && (e.metaKey || e.ctrlKey) && e.target === document.body) {
        e.preventDefault();
        setCurrentView("settings");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const menuItems = [
    { id: "home" as View, label: "Home", icon: LayoutDashboard },
    { id: "compose" as View, label: "Create", icon: PenSquare },
    { id: "inbox" as View, label: "Inbox", icon: Inbox },
    { id: "calendar" as View, label: "Calendar", icon: Calendar },
    { id: "analytics" as View, label: "Analytics", icon: BarChart3 },
    { id: "library" as View, label: "Media Library", icon: Video },
    { id: "settings" as View, label: "Settings", icon: SettingsIcon },
  ];

  const handleNavigate = (view: View, subView?: InboxView | SettingsTab) => {
    setCurrentView(view);
    if (view === "inbox") {
      setInboxOpen(true);
      if (subView && typeof subView === "string" && ["all", "unread", "comments", "messages"].includes(subView)) {
        setInboxView(subView as InboxView);
      }
    } else if (view === "settings") {
      setSettingsOpen(true);
      if (subView && typeof subView === "string") {
        setSettingsTab(subView as SettingsTab);
      }
    }
  };

  const handleInboxViewChange = (view: InboxView) => {
    setInboxView(view);
    setCurrentView("inbox");
  };

  const handleSettingsTabChange = (tab: SettingsTab) => {
    setSettingsTab(tab);
    setCurrentView("settings");
  };

  const handlePlatformChange = (platform: Platform) => {
    setSelectedPlatform(platform);
    // Platform selection works on home, compose, calendar, and inbox views
  };

  const handleContentTransformation = (content: TransformedContent) => {
    setTransformedContent(content);
    setCurrentView("compose");
  };

  const renderContent = () => {
    switch (currentView) {
      case "home":
        return <Home selectedPlatform={selectedPlatform} />;
      case "compose":
        return (
          <ContentComposer 
            transformedContent={transformedContent}
            onContentUsed={() => setTransformedContent(null)}
          />
        );
      case "inbox":
        return <UnifiedInbox inboxView={inboxView} selectedPlatform={selectedPlatform} />;
      case "calendar":
        return <ContentCalendar selectedPlatform={selectedPlatform} />;
      case "analytics":
        return <Analytics selectedPlatform={selectedPlatform} />;
      case "library":
        return (
          <MediaLibrary 
            selectedPlatform={selectedPlatform as any}
            onTransform={handleContentTransformation}
          />
        );
      case "notifications":
        return (
          <Notifications 
            onOpenSettings={() => {
              setCurrentView("settings");
              setSettingsTab("notifications");
              setSettingsOpen(true);
            }}
          />
        );
      case "settings":
        return <Settings initialTab={settingsTab} />;
      default:
        return <Home selectedPlatform={selectedPlatform} />;
    }
  };

  // Check if we're handling OAuth callback
  if (window.location.pathname === '/auth/callback') {
    return <AuthCallback />;
  }

  // Show auth page if not logged in
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <PubHubLogo className="h-16 w-auto mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (showAuthPage) {
      return <AuthPage onAuthenticated={() => window.location.reload()} />;
    }
    return <LandingPage onGetStarted={() => setShowAuthPage(true)} />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b border-sidebar-border p-4">
            <PubHubLogo className="h-10 w-auto" />
          </SidebarHeader>

          <SidebarContent className="p-4">
            <SidebarMenu>
              {menuItems.map((item) => {
                if (item.id === "inbox") {
                  return (
                    <Collapsible
                      key={item.id}
                      open={inboxOpen}
                      onOpenChange={setInboxOpen}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            onClick={() => handleNavigate(item.id)}
                            isActive={currentView === item.id}
                            className="w-full"
                          >
                            <item.icon className="w-4 h-4" />
                            <span>{item.label}</span>
                            <ChevronDown className="ml-auto w-4 h-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                asChild
                                isActive={currentView === "inbox" && inboxView === "all"}
                              >
                                <button onClick={() => handleInboxViewChange("all")}>
                                  <Inbox className="w-4 h-4" />
                                  <span>All</span>
                                </button>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                asChild
                                isActive={currentView === "inbox" && inboxView === "unread"}
                              >
                                <button onClick={() => handleInboxViewChange("unread")}>
                                  <Mail className="w-4 h-4" />
                                  <span>Unread</span>
                                </button>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                asChild
                                isActive={currentView === "inbox" && inboxView === "comments"}
                              >
                                <button onClick={() => handleInboxViewChange("comments")}>
                                  <MessageSquare className="w-4 h-4" />
                                  <span>Comments</span>
                                </button>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                asChild
                                isActive={currentView === "inbox" && inboxView === "messages"}
                              >
                                <button onClick={() => handleInboxViewChange("messages")}>
                                  <MessageCircle className="w-4 h-4" />
                                  <span>Messages</span>
                                </button>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                if (item.id === "settings") {
                  return (
                    <Collapsible
                      key={item.id}
                      open={settingsOpen}
                      onOpenChange={setSettingsOpen}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            onClick={() => handleNavigate(item.id)}
                            isActive={currentView === item.id}
                            className="w-full"
                          >
                            <item.icon className="w-4 h-4" />
                            <span>{item.label}</span>
                            <ChevronDown className="ml-auto w-4 h-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                asChild
                                isActive={currentView === "settings" && settingsTab === "connections"}
                              >
                                <button onClick={() => handleSettingsTabChange("connections")}>
                                  <Link2 className="w-4 h-4" />
                                  <span>Connections</span>
                                </button>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                asChild
                                isActive={currentView === "settings" && settingsTab === "automation"}
                              >
                                <button onClick={() => handleSettingsTabChange("automation")}>
                                  <Workflow className="w-4 h-4" />
                                  <span>Automation</span>
                                </button>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                asChild
                                isActive={currentView === "settings" && settingsTab === "shortcuts"}
                              >
                                <button onClick={() => handleSettingsTabChange("shortcuts")}>
                                  <Keyboard className="w-4 h-4" />
                                  <span>Shortcuts</span>
                                </button>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                asChild
                                isActive={currentView === "settings" && settingsTab === "preferences"}
                              >
                                <button onClick={() => handleSettingsTabChange("preferences")}>
                                  <Palette className="w-4 h-4" />
                                  <span>Preferences</span>
                                </button>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                asChild
                                isActive={currentView === "settings" && settingsTab === "notifications"}
                              >
                                <button onClick={() => handleSettingsTabChange("notifications")}>
                                  <Bell className="w-4 h-4" />
                                  <span>Notifications</span>
                                </button>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }
                
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => handleNavigate(item.id)}
                      isActive={currentView === item.id}
                      className="w-full"
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col min-w-0">
          <AppHeader
            currentView={currentView}
            selectedPlatform={selectedPlatform}
            onPlatformChange={handlePlatformChange}
            onNavigate={handleNavigate}
            onOpenSettings={() => setSettingsPanelOpen(true)}
            onOpenCommandPalette={() => setCommandPaletteOpen(true)}
            onOpenAIChat={() => setAIChatOpen(true)}
          />

          <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
            {renderContent()}
          </div>
        </main>

        {/* AI Chat Dialog */}
        <AIChatDialog
          open={aiChatOpen}
          onOpenChange={setAIChatOpen}
          currentView={currentView}
          selectedPlatform={selectedPlatform}
        />

        {/* Command Palette */}
        <CommandPalette
          open={commandPaletteOpen}
          onOpenChange={setCommandPaletteOpen}
          onNavigate={handleNavigate}
          onPlatformSelect={handlePlatformChange}
          onOpenSettings={() => setSettingsPanelOpen(true)}
        />

        {/* Settings Panel */}
        <SettingsPanel
          open={settingsPanelOpen}
          onOpenChange={setSettingsPanelOpen}
          theme={theme}
          onThemeChange={setTheme}
        />

        {/* Toast Notifications */}
        <Toaster />
      </div>
    </SidebarProvider>
  );
}
