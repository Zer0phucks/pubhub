import { SidebarTrigger } from "./ui/sidebar";
import { Button } from "./ui/button";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  Bell, 
  Settings,
  PenSquare,
  Sparkles,
  Command as CommandIcon,
} from "lucide-react";
import { PlatformIcon } from "./PlatformIcon";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";

type View = "home" | "compose" | "inbox" | "calendar" | "analytics" | "library" | "notifications" | "settings";
type Platform = "all" | "twitter" | "instagram" | "linkedin" | "facebook" | "youtube" | "tiktok" | "pinterest" | "reddit" | "blog";
type InboxView = "all" | "unread" | "comments" | "messages";
type SettingsTab = "connections" | "automation" | "shortcuts" | "preferences" | "notifications";

interface AppHeaderProps {
  currentView: View;
  selectedPlatform: Platform;
  onPlatformChange: (platform: Platform) => void;
  onNavigate: (view: View, subView?: InboxView | SettingsTab) => void;
  onOpenSettings: () => void;
  onOpenCommandPalette: () => void;
  onOpenAIChat: () => void;
}

export function AppHeader({
  currentView,
  selectedPlatform,
  onPlatformChange,
  onNavigate,
  onOpenSettings,
  onOpenCommandPalette,
  onOpenAIChat,
}: AppHeaderProps) {
  const platforms: { id: Platform; label: string }[] = [
    { id: "all", label: "ALL" },
    { id: "twitter", label: "Twitter" },
    { id: "instagram", label: "Instagram" },
    { id: "linkedin", label: "LinkedIn" },
    { id: "facebook", label: "Facebook" },
    { id: "youtube", label: "YouTube" },
    { id: "tiktok", label: "TikTok" },
    { id: "pinterest", label: "Pinterest" },
    { id: "reddit", label: "Reddit" },
    { id: "blog", label: "Blog" },
  ];

  const getPageTitle = () => {
    switch (currentView) {
      case "home":
        return "Home";
      case "compose":
        return "Create Content";
      case "inbox":
        return "Unified Inbox";
      case "calendar":
        return "Content Calendar";
      case "analytics":
        return "Analytics";
      case "library":
        return "Media Library";
      case "settings":
        return "Settings";
      default:
        return "Home";
    }
  };

  const getBreadcrumbs = () => {
    if (currentView === "home" && selectedPlatform !== "all") {
      const platform = platforms.find(p => p.id === selectedPlatform);
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Home</span>
          <span>/</span>
          <span className="text-foreground">{platform?.label}</span>
        </div>
      );
    }
    return null;
  };

  // Only show platform tabs on views where filtering by platform makes sense
  const showPlatformSelector = currentView === "home" || currentView === "calendar" || currentView === "inbox" || currentView === "analytics" || currentView === "library";

  return (
    <header className="border-b border-border/50 bg-black/20 backdrop-blur-xl sticky top-0 z-10">
      {/* Top Row - Navigation and Actions */}
      <div className="px-4 md:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left Section */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <SidebarTrigger />
          
          {/* Page Title - Desktop shows title + breadcrumbs, Mobile shows just title */}
          <div className="min-w-0">
            <h1 className="truncate text-base md:text-xl">{getPageTitle()}</h1>
            <div className="hidden md:block">
              {getBreadcrumbs()}
            </div>
          </div>
        </div>

        {/* Center Section - AI Search */}
        <div className="flex items-center gap-3 flex-1 max-w-2xl">
          {/* Ask PubHub - AI Search */}
          <button
            onClick={onOpenAIChat}
            className="relative flex-1 max-w-md group"
          >
            <div className="flex items-center gap-2 h-9 px-3 rounded-lg border border-border/50 bg-card/50 hover:bg-card transition-colors text-left w-full">
              <Sparkles className="w-4 h-4 text-emerald-500 group-hover:text-emerald-400 transition-colors" />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors flex-1">
                Ask PubHub...
              </span>
              <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Create Post Button */}
          <Button
            onClick={() => onNavigate("compose")}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 hidden md:flex"
            size="sm"
          >
            <PenSquare className="w-4 h-4 mr-2" />
            Create Post
          </Button>

          {/* Command Palette Hint */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex hover:bg-emerald-500/10 h-9 w-9"
            onClick={onOpenCommandPalette}
          >
            <CommandIcon className="w-4 h-4" />
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hover:bg-emerald-500/10 h-9 w-9">
                <Bell className="w-4 h-4" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-2">
                <h4 className="mb-2">Notifications</h4>
                <div className="space-y-2">
                  <div className="p-2 rounded-lg hover:bg-accent cursor-pointer">
                    <p className="text-sm">New comment on your Instagram post</p>
                    <p className="text-xs text-muted-foreground">5 minutes ago</p>
                  </div>
                  <div className="p-2 rounded-lg hover:bg-accent cursor-pointer">
                    <p className="text-sm">Scheduled post published successfully</p>
                    <p className="text-xs text-muted-foreground">1 hour ago</p>
                  </div>
                  <div className="p-2 rounded-lg hover:bg-accent cursor-pointer">
                    <p className="text-sm">Twitter engagement increased by 23%</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="justify-center cursor-pointer"
                onClick={() => onNavigate("notifications")}
              >
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-2 py-1.5">
                <p className="text-sm">John Doe</p>
                <p className="text-xs text-muted-foreground">@johndoe</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onOpenSettings}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Platform Tabs Row */}
      {showPlatformSelector && (
        <div className="border-t border-border/30 px-4 md:px-6 overflow-x-auto">
          <Tabs value={selectedPlatform} onValueChange={onPlatformChange}>
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-0">
              {platforms.map((platform) => (
                <TabsTrigger
                  key={platform.id}
                  value={platform.id}
                  className="flex items-center gap-2 px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent rounded-none data-[state=active]:shadow-none whitespace-nowrap"
                >
                  {platform.id === "all" ? (
                    <span>{platform.label}</span>
                  ) : (
                    <>
                      <PlatformIcon platform={platform.id} size={18} className="w-[18px] h-[18px]" />
                      <span className="hidden sm:inline">{platform.label}</span>
                    </>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      )}
    </header>
  );
}
