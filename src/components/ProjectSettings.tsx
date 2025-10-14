import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Loader2, Plus, X, Trash2 } from 'lucide-react';
import { api } from '../lib/api';

interface ProjectSettingsProps {
  project: any;
  userTier: string;
  onUpdate: () => void;
  onDelete: () => void;
}

export function ProjectSettings({ project, userTier, onUpdate, onDelete }: ProjectSettingsProps) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [url, setUrl] = useState(project.url || '');
  const [icon, setIcon] = useState(project.icon || '');
  const [persona, setPersona] = useState(project.persona);
  const [keywords, setKeywords] = useState<string[]>(project.keywords || []);
  const [newKeyword, setNewKeyword] = useState('');
  const [selectedSubreddits, setSelectedSubreddits] = useState<string[]>(project.subreddits);
  const [newSubreddit, setNewSubreddit] = useState('');
  const [validatingSubreddit, setValidatingSubreddit] = useState(false);
  const [subredditValidation, setSubredditValidation] = useState<any>(null);
  const [aiResponses, setAiResponses] = useState(project.settings?.aiResponses ?? true);
  const [notifications, setNotifications] = useState(
    project.settings?.notifications || { dms: true, comments: true, posts: true }
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const subredditLimits: Record<string, number> = {
    free: 3,
    basic: 10,
    pro: Infinity,
  };

  const keywordLimits: Record<string, number> = {
    free: 10,
    basic: 20,
    pro: 50,
  };

  const maxSubreddits = subredditLimits[userTier] || 3;
  const maxKeywords = keywordLimits[userTier] || 10;

  const handleValidateSubreddit = async () => {
    if (!newSubreddit) return;
    
    setValidatingSubreddit(true);
    setSubredditValidation(null);
    
    try {
      const result = await api.validateSubreddit(newSubreddit);
      setSubredditValidation(result);
    } catch (error) {
      setSubredditValidation({ valid: false, error: 'Failed to validate subreddit' });
    } finally {
      setValidatingSubreddit(false);
    }
  };

  const handleAddSubreddit = async () => {
    if (!newSubreddit || selectedSubreddits.includes(newSubreddit)) {
      return;
    }
    
    if (selectedSubreddits.length >= maxSubreddits) {
      alert(`You can only monitor up to ${maxSubreddits} subreddits on the ${userTier} tier`);
      return;
    }

    // Validate before adding
    setValidatingSubreddit(true);
    try {
      const result = await api.validateSubreddit(newSubreddit);
      if (result.valid) {
        setSelectedSubreddits([...selectedSubreddits, newSubreddit]);
        setNewSubreddit('');
        setSubredditValidation(null);
      } else {
        setSubredditValidation(result);
      }
    } catch (error) {
      setSubredditValidation({ valid: false, error: 'Failed to validate subreddit' });
    } finally {
      setValidatingSubreddit(false);
    }
  };

  const handleRemoveSubreddit = (subreddit: string) => {
    setSelectedSubreddits(selectedSubreddits.filter((s) => s !== subreddit));
  };

  const handleAddKeyword = () => {
    const trimmed = newKeyword.trim().toLowerCase();
    if (!trimmed || keywords.includes(trimmed)) {
      return;
    }

    if (keywords.length >= maxKeywords) {
      alert(`You can only have up to ${maxKeywords} keywords on the ${userTier} tier`);
      return;
    }

    setKeywords([...keywords, trimmed]);
    setNewKeyword('');
  };

  const handleRemoveKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateProject(project.id, {
        name,
        description,
        url,
        icon,
        persona,
        keywords,
        subreddits: selectedSubreddits,
        settings: {
          aiResponses,
          notifications,
        },
      });
      onUpdate();
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      await api.deleteProject(project.id);
      onDelete();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="mb-2">Project Settings</h2>
        <p className="text-muted-foreground">
          Manage your project configuration and preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">App URL</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="icon">Icon Emoji</Label>
            <Input
              id="icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              maxLength={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Search Keywords</CardTitle>
          <CardDescription>
            {keywords.length} of {maxKeywords} keywords • Used to find relevant posts on Reddit
            {userTier === 'free' && ' • Upgrade to Basic for 20 keywords or Pro for 50'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="Add keyword (e.g., productivity, automation)"
                onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
              />
              <Button
                onClick={handleAddKeyword}
                disabled={keywords.length >= maxKeywords}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {keywords.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Keywords will be auto-generated from your project description. Add custom keywords to refine your search.
              </p>
            ) : (
              keywords.map((keyword) => (
                <Badge
                  key={keyword}
                  variant="secondary"
                  className="px-3 py-1 flex items-center gap-2"
                >
                  {keyword}
                  <button
                    onClick={() => handleRemoveKeyword(keyword)}
                    className="hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Persona</CardTitle>
          <CardDescription>
            Customize how PubHub's AI responds on your behalf
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            rows={4}
            placeholder="You are a helpful and friendly app developer..."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monitored Subreddits</CardTitle>
          <CardDescription>
            {selectedSubreddits.length} of {maxSubreddits === Infinity ? 'unlimited' : maxSubreddits} subreddits selected
            {userTier === 'free' && ' • Upgrade to Basic for 10 subreddits or Pro for unlimited'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={newSubreddit}
                onChange={(e) => {
                  setNewSubreddit(e.target.value);
                  setSubredditValidation(null);
                }}
                placeholder="Enter subreddit name (without r/)"
                onKeyPress={(e) => e.key === 'Enter' && handleAddSubreddit()}
              />
              <Button
                onClick={handleAddSubreddit}
                disabled={selectedSubreddits.length >= maxSubreddits || validatingSubreddit}
              >
                {validatingSubreddit ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </div>
            {subredditValidation && (
              <div className={`text-sm p-2 rounded ${subredditValidation.valid ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {subredditValidation.valid ? (
                  <div>
                    <div className="font-medium">r/{subredditValidation.info.name}</div>
                    <div className="text-xs">{subredditValidation.info.subscribers.toLocaleString()} subscribers</div>
                  </div>
                ) : (
                  <div>{subredditValidation.error}</div>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedSubreddits.map((subreddit) => (
              <Badge
                key={subreddit}
                variant="secondary"
                className="px-3 py-1 flex items-center gap-2"
              >
                r/{subreddit}
                <button
                  onClick={() => handleRemoveSubreddit(subreddit)}
                  className="hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>AI Generated Responses</Label>
              <p className="text-sm text-muted-foreground">
                Automatically generate responses for new feed items
              </p>
            </div>
            <Switch checked={aiResponses} onCheckedChange={setAiResponses} />
          </div>
          <Separator />
          <div>
            <Label>Notifications</Label>
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="notify-dms" className="cursor-pointer">
                  Direct Messages
                </Label>
                <Switch
                  id="notify-dms"
                  checked={notifications.dms}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, dms: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="notify-comments" className="cursor-pointer">
                  Comments
                </Label>
                <Switch
                  id="notify-comments"
                  checked={notifications.comments}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, comments: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="notify-posts" className="cursor-pointer">
                  Posts
                </Label>
                <Switch
                  id="notify-posts"
                  checked={notifications.posts}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, posts: checked })
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>
            Permanently delete this project and all associated data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Project
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
