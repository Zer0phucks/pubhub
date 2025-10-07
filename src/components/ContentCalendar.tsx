import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Dialog, DialogContent } from "./ui/dialog";
import { PostEditor } from "./PostEditor";
import { CalendarMonthView } from "./calendar/CalendarMonthView";
import { CalendarWeekView } from "./calendar/CalendarWeekView";
import { CalendarDayDetail } from "./calendar/CalendarDayDetail";
import { ConfirmDialog } from "./ConfirmDialog";
import { toast } from "sonner@2.0.3";
import { 
  ChevronLeft, 
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  CalendarDays,
  CalendarRange,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { Platform, PlatformFilter, ScheduledPost } from "../types";

interface ContentCalendarProps {
  selectedPlatform?: PlatformFilter;
}

export function ContentCalendar({ selectedPlatform = "all" }: ContentCalendarProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [view, setView] = useState<"month" | "week">("month");
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([
    "twitter", "instagram", "linkedin", "facebook", "youtube", "tiktok", "pinterest", "reddit", "blog"
  ]);
  const [showAiPosts, setShowAiPosts] = useState<boolean>(true);
  const [editingPost, setEditingPost] = useState<ScheduledPost | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<ScheduledPost | null>(null);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([
    {
      id: "1",
      date: new Date(2025, 9, 6),
      time: "10:00 AM",
      platform: "twitter",
      content: "Excited to share our latest product update! 🚀",
      status: "scheduled",
      crossPostTo: ["linkedin", "facebook"]
    },
    {
      id: "2",
      date: new Date(2025, 9, 6),
      time: "2:00 PM",
      platform: "instagram",
      content: "Behind the scenes of our creative process",
      status: "scheduled",
      crossPostTo: ["facebook", "pinterest"]
    },
    {
      id: "3",
      date: new Date(2025, 9, 6),
      time: "4:00 PM",
      platform: "facebook",
      content: "Community update: New features coming soon!",
      status: "scheduled"
    },
    {
      id: "4",
      date: new Date(2025, 9, 7),
      time: "9:00 AM",
      platform: "linkedin",
      content: "5 tips for better content marketing",
      status: "scheduled"
    },
    {
      id: "5",
      date: new Date(2025, 9, 7),
      time: "3:00 PM",
      platform: "youtube",
      content: "New tutorial video: Getting Started Guide",
      status: "scheduled"
    },
    {
      id: "6",
      date: new Date(2025, 9, 8),
      time: "11:00 AM",
      platform: "twitter",
      content: "Join us for a live Q&A session today!",
      status: "scheduled"
    },
    {
      id: "7",
      date: new Date(2025, 9, 8),
      time: "1:00 PM",
      platform: "tiktok",
      content: "Quick tip of the day #contentcreator",
      status: "scheduled"
    },
    {
      id: "8",
      date: new Date(2025, 9, 10),
      time: "3:00 PM",
      platform: "instagram",
      content: "New blog post is live! Link in bio 📝",
      status: "draft"
    },
    {
      id: "9",
      date: new Date(2025, 9, 10),
      time: "5:00 PM",
      platform: "pinterest",
      content: "Design inspiration board updated",
      status: "scheduled"
    },
    {
      id: "10",
      date: new Date(2025, 9, 12),
      time: "10:00 AM",
      platform: "reddit",
      content: "AMA: Ask me anything about content creation",
      status: "scheduled"
    },
    {
      id: "11",
      date: new Date(2025, 9, 12),
      time: "2:00 PM",
      platform: "blog",
      content: "Long-form article: The Future of Content Marketing",
      status: "scheduled"
    },
    {
      id: "12",
      date: new Date(2025, 9, 15),
      time: "9:00 AM",
      platform: "linkedin",
      content: "Weekly industry insights and trends",
      status: "scheduled"
    }
  ]);

  const platforms: { value: Platform; label: string }[] = [
    { value: "twitter", label: "Twitter" },
    { value: "instagram", label: "Instagram" },
    { value: "linkedin", label: "LinkedIn" },
    { value: "facebook", label: "Facebook" },
    { value: "youtube", label: "YouTube" },
    { value: "tiktok", label: "TikTok" },
    { value: "pinterest", label: "Pinterest" },
    { value: "reddit", label: "Reddit" },
    { value: "blog", label: "Blog" },
  ];

  const generateAiPosts = () => {
    const platformsToUse: Platform[] = ["twitter", "instagram", "linkedin", "youtube", "tiktok", "blog"];
    
    const contentIdeas = {
      twitter: ["Tech Tips thread: 10 productivity hacks", "Quick update on industry trends", "Behind the scenes of our workflow"],
      instagram: ["Carousel: 5 design principles", "Reel: Day in the life", "Story highlights compilation"],
      linkedin: ["Article: Future of remote work", "Industry insights and analysis", "Professional development tips"],
      youtube: ["Tutorial: Complete beginner's guide", "How-to video: Advanced techniques", "Q&A session recording"],
      tiktok: ["Quick tip: 30-second productivity hack", "Trending challenge participation", "Educational short clip"],
      blog: ["Long-form: Comprehensive guide to content strategy", "In-depth analysis of market trends", "Step-by-step tutorial series"]
    };

    const times = ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM", "6:00 PM"];
    
    const newPosts: ScheduledPost[] = [];
    let idCounter = scheduledPosts.length + 1;

    // Generate posts for the next 10 days
    for (let dayOffset = 1; dayOffset <= 10; dayOffset++) {
      const date = new Date();
      date.setDate(date.getDate() + dayOffset);
      
      // Pick 2-3 random platforms for each day
      const numPosts = Math.floor(Math.random() * 2) + 2;
      const shuffledPlatforms = [...platformsToUse].sort(() => Math.random() - 0.5);
      
      for (let i = 0; i < numPosts; i++) {
        const platform = shuffledPlatforms[i];
        const contentOptions = contentIdeas[platform] || ["AI-generated content"];
        const content = contentOptions[Math.floor(Math.random() * contentOptions.length)];
        const time = times[Math.floor(Math.random() * times.length)];
        
        newPosts.push({
          id: `ai-${idCounter++}`,
          date: new Date(date),
          time,
          platform,
          content,
          status: "scheduled",
          isAiGenerated: true
        });
      }
    }

    setScheduledPosts([...scheduledPosts, ...newPosts]);
  };

  const removeAiPosts = () => {
    setScheduledPosts(scheduledPosts.filter(post => !post.isAiGenerated));
  };

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleEditPost = (post: ScheduledPost) => {
    setEditingPost(post);
    setIsEditDialogOpen(true);
  };

  const handleSavePost = (data: {
    content: string;
    platform: string;
    time: string;
    date: Date;
    attachments: { name: string; size: number; type: string }[];
    crossPostTo?: Platform[];
  }) => {
    if (editingPost) {
      setScheduledPosts(prev =>
        prev.map(post =>
          post.id === editingPost.id
            ? {
                ...post,
                content: data.content,
                platform: data.platform as Platform,
                time: data.time,
                date: data.date,
                attachments: data.attachments,
                crossPostTo: data.crossPostTo,
              }
            : post
        )
      );
      setIsEditDialogOpen(false);
      setEditingPost(null);
    }
  };

  const handleDeleteClick = (postId: string) => {
    const post = scheduledPosts.find(p => p.id === postId);
    if (post) {
      setPostToDelete(post);
      setDeleteConfirmOpen(true);
    }
  };

  const confirmDelete = () => {
    if (postToDelete) {
      setScheduledPosts(prev => prev.filter(post => post.id !== postToDelete.id));
      toast.success("Post deleted successfully");
    }
    setPostToDelete(null);
  };

  const handleCreatePost = (data: {
    content: string;
    platform: string;
    time: string;
    date: Date;
    attachments: { name: string; size: number; type: string }[];
    crossPostTo?: Platform[];
  }) => {
    const newPost: ScheduledPost = {
      id: `post-${Date.now()}`,
      content: data.content,
      platform: data.platform as Platform,
      time: data.time,
      date: data.date,
      status: "scheduled",
      attachments: data.attachments,
      crossPostTo: data.crossPostTo,
    };
    
    setScheduledPosts([...scheduledPosts, newPost]);
    setIsCreateDialogOpen(false);
  };

  const removeAttachment = (postId: string, attachmentName: string) => {
    setScheduledPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? { 
              ...post, 
              attachments: post.attachments?.filter(a => a.name !== attachmentName) 
            }
          : post
      )
    );
  };

  const filteredPosts = scheduledPosts.filter(post => {
    // Filter by the prop from parent (platform tabs)
    const propPlatformMatch = selectedPlatform === "all" || post.platform === selectedPlatform;
    // Filter by local platform checkboxes
    const localPlatformMatch = selectedPlatforms.includes(post.platform);
    // Filter by AI toggle
    const aiMatch = showAiPosts || !post.isAiGenerated;
    
    return propPlatformMatch && localPlatformMatch && aiMatch;
  });

  const postsForDate = (date: Date) => {
    return filteredPosts.filter(post => 
      post.date.toDateString() === date.toDateString()
    );
  };

  const previousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 1);
    setCurrentDate(newDate);
    setSelectedDate(newDate);
  };

  const nextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1);
    setCurrentDate(newDate);
    setSelectedDate(newDate);
  };

  const previousPeriod = () => {
    if (view === "month") {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() - 7);
      setCurrentDate(newDate);
    }
  };

  const nextPeriod = () => {
    if (view === "month") {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + 7);
      setCurrentDate(newDate);
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    return [startOfWeek];
  };

  const selectedDatePosts = selectedDate ? postsForDate(selectedDate) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end gap-2">
        <Button 
          onClick={generateAiPosts}
          className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-lg shadow-purple-500/20"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          AI Enhancement
        </Button>
        <Button 
          onClick={removeAiPosts}
          variant="outline"
          className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear AI Posts
        </Button>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Schedule Post
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-emerald-400">
                {view === "month" 
                  ? currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                  : `Week of ${getWeekDays(currentDate)[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                }
              </h3>
              <div className="flex gap-2">
                <div className="flex gap-1 mr-2 bg-muted/30 rounded-lg p-1">
                  <Button 
                    variant={view === "month" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setView("month")}
                    className={view === "month" ? "bg-emerald-500 hover:bg-emerald-600" : ""}
                  >
                    <CalendarDays className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant={view === "week" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setView("week")}
                    className={view === "week" ? "bg-emerald-500 hover:bg-emerald-600" : ""}
                  >
                    <CalendarRange className="w-4 h-4" />
                  </Button>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={previousPeriod}
                  className="hover:bg-emerald-500/10 hover:border-emerald-500/30"
                  title={view === "month" ? "Previous month" : "Previous week"}
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={previousDay}
                  className="hover:bg-emerald-500/10 hover:border-emerald-500/30"
                  title="Previous day"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={goToToday}
                  className="hover:bg-emerald-500/10 hover:border-emerald-500/30"
                >
                  Today
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={nextDay}
                  className="hover:bg-emerald-500/10 hover:border-emerald-500/30"
                  title="Next day"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={nextPeriod}
                  className="hover:bg-emerald-500/10 hover:border-emerald-500/30"
                  title={view === "month" ? "Next month" : "Next week"}
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {view === "month" ? (
              <CalendarMonthView
                currentDate={currentDate}
                selectedDate={selectedDate}
                postsForDate={postsForDate}
                onDateSelect={setSelectedDate}
              />
            ) : (
              <CalendarWeekView
                currentDate={currentDate}
                selectedDate={selectedDate}
                postsForDate={postsForDate}
                onDateSelect={setSelectedDate}
              />
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <CalendarDayDetail
            selectedDate={selectedDate}
            posts={selectedDatePosts}
            onEditPost={handleEditPost}
            onDeletePost={handleDeleteClick}
            onRemoveAttachment={removeAttachment}
          />

          <Card className="p-6">
            <h3 className="mb-4">Filters</h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="show-ai" 
                  checked={showAiPosts}
                  onCheckedChange={(checked) => setShowAiPosts(checked as boolean)}
                />
                <label
                  htmlFor="show-ai"
                  className="text-sm cursor-pointer select-none"
                >
                  Show AI-generated posts
                </label>
              </div>

              <div className="pt-2">
                <p className="text-sm mb-3 text-muted-foreground">Platforms</p>
                <div className="space-y-2">
                  {platforms.map((platform) => (
                    <div key={platform.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={platform.value}
                        checked={selectedPlatforms.includes(platform.value)}
                        onCheckedChange={() => togglePlatform(platform.value)}
                      />
                      <label
                        htmlFor={platform.value}
                        className="text-sm cursor-pointer select-none"
                      >
                        {platform.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Post Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {editingPost && (
            <PostEditor
              initialData={{
                content: editingPost.content,
                platform: editingPost.platform,
                time: editingPost.time,
                date: editingPost.date,
                attachments: editingPost.attachments || [],
                crossPostTo: editingPost.crossPostTo
              }}
              onSave={handleSavePost}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEditingPost(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Create Post Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <PostEditor
            initialData={{
              content: "",
              platform: "twitter",
              time: "9:00 AM",
              date: selectedDate || new Date(),
              attachments: []
            }}
            onSave={handleCreatePost}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete scheduled post?"
        description={
          postToDelete
            ? `Are you sure you want to delete this ${postToDelete.status} post for ${postToDelete.platform}? This action cannot be undone.`
            : "Are you sure you want to delete this post? This action cannot be undone."
        }
        confirmText="Delete"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </div>
  );
}
