import { useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { PlatformIcon } from "./PlatformIcon";
import { 
  Sparkles, 
  Eye, 
  MessageSquare, 
  ThumbsUp, 
  Calendar,
  Filter,
  Search,
  ArrowRight,
  FileText,
  Twitter,
  Linkedin,
  Mail,
  Download,
  Zap
} from "lucide-react";
import { Input } from "./ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { TransformVideoDialog } from "./TransformVideoDialog";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { TransformedContent } from "../utils/contentTransformer";
import { matchAutomationRules, getTransformationLabel } from "../utils/automationRules";

type VideoPlatform = "all" | "youtube" | "tiktok";
type VideoStatus = "new" | "processed" | "scheduled";

interface Video {
  id: string;
  platform: "youtube" | "tiktok";
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  views: number;
  likes: number;
  comments: number;
  duration: string;
  status: VideoStatus;
  hasTranscript?: boolean;
}

const mockVideos: Video[] = [
  {
    id: "1",
    platform: "youtube",
    title: "10 Tips for Productivity in 2025",
    description: "Discover the best productivity hacks that actually work. From time-blocking to the Pomodoro technique, learn how to maximize your output.",
    thumbnail: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&q=80",
    publishedAt: "2025-10-05",
    views: 12500,
    likes: 892,
    comments: 156,
    duration: "12:34",
    status: "new",
    hasTranscript: true,
  },
  {
    id: "2",
    platform: "tiktok",
    title: "Quick Morning Routine",
    description: "My 5-minute morning routine that changed my life! #morningroutine #productivity",
    thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
    publishedAt: "2025-10-06",
    views: 45200,
    likes: 3400,
    comments: 267,
    duration: "0:58",
    status: "new",
  },
  {
    id: "3",
    platform: "youtube",
    title: "Behind the Scenes: Content Creation Setup",
    description: "A full tour of my content creation studio including camera gear, lighting setup, and audio equipment recommendations.",
    thumbnail: "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=800&q=80",
    publishedAt: "2025-10-03",
    views: 8900,
    likes: 654,
    comments: 89,
    duration: "18:45",
    status: "processed",
    hasTranscript: true,
  },
  {
    id: "4",
    platform: "tiktok",
    title: "3 Apps I Use Daily",
    description: "These apps save me hours every week! Link in bio 👆 #productivity #appreview #techtools",
    thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80",
    publishedAt: "2025-10-04",
    views: 28900,
    likes: 2100,
    comments: 134,
    duration: "0:45",
    status: "processed",
  },
  {
    id: "5",
    platform: "youtube",
    title: "Q&A: Your Questions Answered",
    description: "Answering your most asked questions about content creation, building an audience, and monetization strategies.",
    thumbnail: "https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=800&q=80",
    publishedAt: "2025-10-01",
    views: 15600,
    likes: 1200,
    comments: 345,
    duration: "25:12",
    status: "processed",
    hasTranscript: true,
  },
  {
    id: "6",
    platform: "tiktok",
    title: "Desk Setup Tour 2025",
    description: "Minimal desk setup for maximum productivity ✨ #desksetup #workspace #minimalism",
    thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80",
    publishedAt: "2025-10-07",
    views: 67800,
    likes: 5200,
    comments: 423,
    duration: "1:15",
    status: "new",
  },
];

interface MediaLibraryProps {
  selectedPlatform?: VideoPlatform;
  onTransform?: (content: TransformedContent) => void;
}

export function MediaLibrary({ selectedPlatform = "all", onTransform }: MediaLibraryProps) {
  const [platform, setPlatform] = useState<VideoPlatform>(selectedPlatform);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "views" | "engagement">("recent");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [transformDialogOpen, setTransformDialogOpen] = useState(false);

  const filteredVideos = mockVideos.filter((video) => {
    const matchesPlatform = platform === "all" || video.platform === platform;
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPlatform && matchesSearch;
  });

  const sortedVideos = [...filteredVideos].sort((a, b) => {
    switch (sortBy) {
      case "views":
        return b.views - a.views;
      case "engagement":
        return (b.likes + b.comments) - (a.likes + a.comments);
      case "recent":
      default:
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    }
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const handleTransform = (video: Video) => {
    setSelectedVideo(video);
    setTransformDialogOpen(true);
  };

  const getStatusColor = (status: VideoStatus) => {
    switch (status) {
      case "new":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "processed":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "scheduled":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const stats = {
    total: mockVideos.length,
    youtube: mockVideos.filter(v => v.platform === "youtube").length,
    tiktok: mockVideos.filter(v => v.platform === "tiktok").length,
    new: mockVideos.filter(v => v.status === "new").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Media Library</h1>
        <p className="text-muted-foreground mt-2">
          Import and transform your video content from YouTube and TikTok
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Videos</p>
                <p className="mt-1">{stats.total}</p>
              </div>
              <Download className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">YouTube</p>
                <p className="mt-1">{stats.youtube}</p>
              </div>
              <PlatformIcon platform="youtube" className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">TikTok</p>
                <p className="mt-1">{stats.tiktok}</p>
              </div>
              <PlatformIcon platform="tiktok" className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">New</p>
                <p className="mt-1">{stats.new}</p>
              </div>
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={platform} onValueChange={(value) => setPlatform(value as VideoPlatform)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="views">Most Views</SelectItem>
                <SelectItem value="engagement">Most Engagement</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedVideos.map((video) => {
          const matchingRules = matchAutomationRules({
            platform: video.platform,
            duration: video.duration,
            title: video.title,
            description: video.description,
          });

          return (
          <Card key={video.id} className="group overflow-hidden hover:border-primary/50 transition-all">
            <CardHeader className="p-0">
              <div className="relative aspect-video overflow-hidden bg-muted">
                <ImageWithFallback
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-3 left-3 flex gap-2 flex-wrap max-w-[calc(100%-4rem)]">
                  <Badge className={getStatusColor(video.status)}>
                    {video.status === "new" && "New"}
                    {video.status === "processed" && "Processed"}
                    {video.status === "scheduled" && "Scheduled"}
                  </Badge>
                  {video.hasTranscript && (
                    <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                      <FileText className="w-3 h-3 mr-1" />
                      Transcript
                    </Badge>
                  )}
                  {matchingRules.length > 0 && (
                    <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                      <Zap className="w-3 h-3 mr-1" />
                      Auto
                    </Badge>
                  )}
                </div>
                <div className="absolute top-3 right-3">
                  <PlatformIcon platform={video.platform} className="w-6 h-6" />
                </div>
                <div className="absolute bottom-3 right-3">
                  <Badge variant="secondary" className="bg-black/80 backdrop-blur-sm">
                    {video.duration}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div>
                <h3 className="line-clamp-2 group-hover:text-primary transition-colors">
                  {video.title}
                </h3>
                <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                  {video.description}
                </p>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{formatNumber(video.views)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{formatNumber(video.likes)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>{formatNumber(video.comments)}</span>
                </div>
              </div>

              {/* Automation Info */}
              {matchingRules.length > 0 && (
                <div className="text-xs text-yellow-400 bg-yellow-500/5 border border-yellow-500/20 rounded p-2">
                  <div className="flex items-center gap-1 mb-1">
                    <Zap className="w-3 h-3" />
                    <span className="font-medium">Will auto-transform to:</span>
                  </div>
                  <div className="space-y-1">
                    {matchingRules.map((rule, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-yellow-300">
                          {getTransformationLabel(rule.transformation)}
                        </span>
                        {rule.transformationInstructions && (
                          <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/30">
                            Custom
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(video.publishedAt)}</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleTransform(video)}
                  className="gap-1"
                >
                  <Sparkles className="w-4 h-4" />
                  Transform
                </Button>
              </div>
            </CardContent>
          </Card>
          );
        })}
      </div>

      {sortedVideos.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Download className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3>No videos found</h3>
            <p className="text-muted-foreground mt-2">
              Try adjusting your filters or search query
            </p>
          </CardContent>
        </Card>
      )}

      {/* Transform Dialog */}
      <TransformVideoDialog
        open={transformDialogOpen}
        onOpenChange={setTransformDialogOpen}
        video={selectedVideo}
        onTransform={onTransform}
      />
    </div>
  );
}
