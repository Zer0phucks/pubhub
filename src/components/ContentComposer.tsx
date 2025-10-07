import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { PlatformIcon } from "./PlatformIcon";
import { TemplateLibrary, TEMPLATE_COUNT } from "./TemplateLibrary";
import { CreateTemplateDialog } from "./CreateTemplateDialog";
import { getCustomTemplates } from "../utils/customTemplates";
import { 
  Image, 
  Sparkles, 
  Send, 
  Clock,
  Paperclip,
  X,
  AlertCircle,
  CheckCircle2,
  FileEdit,
  LayoutTemplate,
  Save
} from "lucide-react";
import { PLATFORM_CONSTRAINTS, type Platform, type Attachment } from "../types";
import { toast } from "sonner@2.0.3";
import { TransformedContent } from "../utils/contentTransformer";

interface PlatformSelection {
  id: Platform;
  name: string;
  icon: React.ReactNode;
  enabled: boolean;
}

interface ContentComposerProps {
  transformedContent?: TransformedContent | null;
  onContentUsed?: () => void;
}

export function ContentComposer({ transformedContent = null, onContentUsed }: ContentComposerProps = {}) {
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [activeTab, setActiveTab] = useState<string>("compose");
  const [templateUsed, setTemplateUsed] = useState<string | null>(null);
  const [saveTemplateDialogOpen, setSaveTemplateDialogOpen] = useState(false);
  const [totalTemplateCount, setTotalTemplateCount] = useState(TEMPLATE_COUNT);
  const [currentTransformation, setCurrentTransformation] = useState<TransformedContent | null>(null);

  // Handle transformed content from Media Library
  useEffect(() => {
    if (transformedContent) {
      setContent(transformedContent.content);
      setCurrentTransformation(transformedContent);
      
      // Enable platforms based on transformation type
      setPlatforms(platforms.map(p => ({
        ...p,
        enabled: transformedContent.platforms.includes(p.id)
      })));

      // Show notification about source
      toast.info("Content Loaded", {
        description: `Transformed from "${transformedContent.sourceVideo.title}" (${transformedContent.sourceVideo.platform})`,
      });

      // Mark content as used
      if (onContentUsed) {
        onContentUsed();
      }
    }
  }, [transformedContent]);

  // Update template count when switching tabs to include custom templates
  useEffect(() => {
    if (activeTab === "templates") {
      const customCount = getCustomTemplates().length;
      setTotalTemplateCount(TEMPLATE_COUNT + customCount);
    }
  }, [activeTab]);
  const [platforms, setPlatforms] = useState<PlatformSelection[]>([
    { id: "twitter", name: "Twitter", icon: <PlatformIcon platform="twitter" />, enabled: true },
    { id: "instagram", name: "Instagram", icon: <PlatformIcon platform="instagram" />, enabled: true },
    { id: "linkedin", name: "LinkedIn", icon: <PlatformIcon platform="linkedin" />, enabled: true },
    { id: "facebook", name: "Facebook", icon: <PlatformIcon platform="facebook" />, enabled: false },
    { id: "youtube", name: "YouTube", icon: <PlatformIcon platform="youtube" />, enabled: false },
    { id: "tiktok", name: "TikTok", icon: <PlatformIcon platform="tiktok" />, enabled: false },
    { id: "pinterest", name: "Pinterest", icon: <PlatformIcon platform="pinterest" />, enabled: false },
    { id: "reddit", name: "Reddit", icon: <PlatformIcon platform="reddit" />, enabled: false },
    { id: "blog", name: "Blog", icon: <PlatformIcon platform="blog" />, enabled: false },
  ]);

  const togglePlatform = (id: Platform) => {
    setPlatforms(platforms.map(p => 
      p.id === id ? { ...p, enabled: !p.enabled } : p
    ));
  };

  const validateContent = (platform: Platform) => {
    const constraints = PLATFORM_CONSTRAINTS[platform];
    const contentLength = content.length;
    const imageCount = attachments.filter(a => a.type.startsWith('image/')).length;
    const videoCount = attachments.filter(a => a.type.startsWith('video/')).length;

    const issues: string[] = [];
    
    if (contentLength > constraints.maxLength) {
      issues.push(`Exceeds character limit (${contentLength}/${constraints.maxLength})`);
    }
    if (imageCount > constraints.maxImages) {
      issues.push(`Too many images (${imageCount}/${constraints.maxImages})`);
    }
    if (videoCount > constraints.maxVideos) {
      issues.push(`Too many videos (${videoCount}/${constraints.maxVideos})`);
    }

    return { isValid: issues.length === 0, issues };
  };

  const generateWithAI = () => {
    const suggestions = [
      "Just discovered an amazing productivity hack that's changed my workflow! 🚀 Who else struggles with time management?",
      "Behind the scenes look at how we create content that resonates. The secret? Authenticity always wins. 💡",
      "Hot take: The best content strategy is the one you can stick to consistently. Quality over quantity, every time. 🎯"
    ];
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    setContent(randomSuggestion);
  };

  const handleFileAttachment = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*,video/*,application/pdf,.doc,.docx,.txt';
    
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        const newAttachments = Array.from(files).map(file => ({
          name: file.name,
          size: file.size,
          type: file.type
        }));
        
        setAttachments([...attachments, ...newAttachments]);
      }
    };
    
    input.click();
  };

  const removeAttachment = (attachmentName: string) => {
    setAttachments(attachments.filter(a => a.name !== attachmentName));
  };

  const handleUseTemplate = (template: any) => {
    setContent(template.content);
    setTemplateUsed(template.title);
    
    // Enable platforms that the template is designed for
    setPlatforms(platforms.map(p => ({
      ...p,
      enabled: template.platforms.includes(p.id)
    })));

    // Switch to compose tab so user can edit
    setActiveTab("compose");

    toast.success("Template loaded!", {
      description: "Customize it to make it your own."
    });
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    // Clear template indicator if user starts editing significantly
    if (templateUsed && newContent.length > 0 && !newContent.includes(templateUsed.slice(0, 20))) {
      // User has modified the template significantly
      setTemplateUsed(null);
    }
  };

  const enabledPlatforms = platforms.filter(p => p.enabled);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-emerald-400 mb-2">Create Content</h2>
        <p className="text-muted-foreground">
          Compose from scratch or use a template to get started faster
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto">
          <TabsTrigger value="compose" className="gap-2">
            <FileEdit className="w-4 h-4" />
            Compose
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <LayoutTemplate className="w-4 h-4" />
            Templates
            <Badge variant="outline" className="ml-1 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
              {totalTemplateCount}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Transformed Content Banner */}
              {currentTransformation && (
                <Alert className="bg-blue-500/10 border-blue-500/30">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <AlertDescription className="text-blue-400">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div>
                          <span className="font-medium">Content transformed from video</span>
                        </div>
                        <div className="text-sm mt-1 flex items-center gap-2">
                          <PlatformIcon platform={currentTransformation.sourceVideo.platform as any} className="w-4 h-4" />
                          <span className="truncate">{currentTransformation.sourceVideo.title}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCurrentTransformation(null);
                          setContent("");
                          toast.success("Content cleared");
                        }}
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                      >
                        Clear
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <Card className="p-6">
                <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <Label>Your Content</Label>
                  {templateUsed && (
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">
                      <LayoutTemplate className="w-3 h-3 mr-1" />
                      {templateUsed}
                    </Badge>
                  )}
                </div>
                <Textarea
                  placeholder="What do you want to share with your audience?"
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className="mt-2 min-h-[200px] resize-none"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-muted-foreground">{content.length} characters</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={generateWithAI}
                    className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate with AI
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleFileAttachment}
                  className="hover:bg-emerald-500/5 hover:border-emerald-500/30"
                >
                  <Paperclip className="w-4 h-4 mr-2" />
                  Add Files
                </Button>
                <Button variant="outline" size="sm">
                  # Add Hashtags
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSaveTemplateDialogOpen(true)}
                  disabled={!content.trim()}
                  className="hover:bg-purple-500/10 hover:border-purple-500/30 ml-auto"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save as Template
                </Button>
              </div>

              {attachments.length > 0 && (
                <div className="space-y-2 pt-4 border-t">
                  <Label>Attachments</Label>
                  {attachments.map((attachment, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border border-border/50"
                    >
                      <Paperclip className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm flex-1 truncate">{attachment.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {(attachment.size / 1024).toFixed(1)}KB
                      </span>
                      <button
                        onClick={() => removeAttachment(attachment.name)}
                        className="p-1 hover:bg-destructive/10 rounded transition-colors"
                        title="Remove attachment"
                      >
                        <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4">Preview</h3>
            <div className="space-y-4">
              {enabledPlatforms.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">Select at least one platform to see preview</p>
                </div>
              ) : (
                enabledPlatforms.map(platform => {
                  const { isValid, issues } = validateContent(platform.id);
                  const constraints = PLATFORM_CONSTRAINTS[platform.id];
                  
                  return (
                    <div key={platform.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        {platform.icon}
                        <span>{platform.name}</span>
                      </div>
                      <div className="bg-muted/50 rounded p-3">
                        <p className="text-sm">
                          {content || "Your content will appear here..."}
                        </p>
                      </div>
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className={`${content.length > constraints.maxLength ? 'text-destructive' : 'text-muted-foreground'}`}>
                            {content.length} / {constraints.maxLength} characters
                          </span>
                          {isValid && content.length > 0 && (
                            <div className="flex items-center gap-1 text-emerald-400">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Valid</span>
                            </div>
                          )}
                        </div>
                        {!isValid && (
                          <Alert className="border-destructive/30 bg-destructive/5 py-2">
                            <AlertCircle className="h-4 w-4 text-destructive" />
                            <AlertDescription className="text-xs text-destructive">
                              {issues.join(", ")}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-4">Platforms</h3>
            <div className="space-y-3">
              {platforms.map(platform => (
                <div key={platform.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-2">
                    {platform.icon}
                    <span>{platform.name}</span>
                  </div>
                  <Switch
                    checked={platform.enabled}
                    onCheckedChange={() => togglePlatform(platform.id)}
                  />
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4">Publishing Options</h3>
            <div className="space-y-4">
              <div>
                <Label>Best Time to Post</Label>
                <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm">Today at 3:00 PM</p>
                  <p className="text-muted-foreground text-sm mt-1">Based on your audience activity</p>
                </div>
              </div>

              <div className="pt-4 border-t space-y-3">
                <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/20">
                  <Send className="w-4 h-4 mr-2" />
                  Publish Now
                </Button>
                <Button variant="outline" className="w-full border-purple-500/30 hover:bg-purple-500/10">
                  <Clock className="w-4 h-4 mr-2" />
                  Schedule for Later
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </TabsContent>

    <TabsContent value="templates" className="mt-6">
      <TemplateLibrary onUseTemplate={handleUseTemplate} />
    </TabsContent>
  </Tabs>

  {/* Save as Template Dialog */}
  <CreateTemplateDialog
    open={saveTemplateDialogOpen}
    onOpenChange={setSaveTemplateDialogOpen}
    onSave={(template) => {
      // Template is saved within the dialog via localStorage
      // Switch to templates tab to show the new template
      setActiveTab("templates");
    }}
    initialContent={content}
    initialPlatforms={platforms.filter(p => p.enabled).map(p => p.id)}
  />
</div>
  );
}
