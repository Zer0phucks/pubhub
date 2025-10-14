import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Loader2, Sparkles } from 'lucide-react';
import { api } from '../lib/api';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (project: any) => void;
  userTier: string;
}

export function CreateProjectModal({ open, onClose, onSuccess, userTier }: CreateProjectModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [icon, setIcon] = useState('');
  const [suggestedSubreddits, setSuggestedSubreddits] = useState<string[]>([]);
  const [selectedSubreddits, setSelectedSubreddits] = useState<string[]>([]);
  const [error, setError] = useState('');

  const subredditLimits: Record<string, number> = {
    free: 3,
    basic: 10,
    pro: Infinity,
  };

  const maxSubreddits = subredditLimits[userTier] || 3;

  const handleSuggestSubreddits = async () => {
    if (!description) {
      setError('Please provide an app description');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await api.suggestSubreddits(description, url);
      setSuggestedSubreddits(result.subreddits);
      setStep(2);
    } catch (err: any) {
      console.error('Error suggesting subreddits:', err);
      setError(err.message || 'Failed to suggest subreddits');
    } finally {
      setLoading(false);
    }
  };

  const toggleSubreddit = (subreddit: string) => {
    setSelectedSubreddits((prev) => {
      if (prev.includes(subreddit)) {
        return prev.filter((s) => s !== subreddit);
      } else if (prev.length < maxSubreddits) {
        return [...prev, subreddit];
      }
      return prev;
    });
  };

  const handleCreate = async () => {
    if (selectedSubreddits.length === 0) {
      setError('Please select at least one subreddit');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const project = await api.createProject({
        name,
        description,
        url,
        icon,
        subreddits: selectedSubreddits,
      });

      // Start historical scan for basic/pro tiers
      if (userTier !== 'free') {
        api.scanHistory(project.id, selectedSubreddits).catch(console.error);
      }

      onSuccess(project);
      handleClose();
    } catch (err: any) {
      console.error('Error creating project:', err);
      setError(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setName('');
    setDescription('');
    setUrl('');
    setIcon('');
    setSuggestedSubreddits([]);
    setSelectedSubreddits([]);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            {step === 1 ? 'Tell us about your app' : 'Select subreddits to monitor'}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Awesome App"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A productivity app that helps users..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">App URL (optional)</Label>
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://myapp.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon">Icon Emoji (optional)</Label>
              <Input
                id="icon"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="🚀"
                maxLength={2}
              />
            </div>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}
            <Button
              onClick={handleSuggestSubreddits}
              disabled={loading || !name || !description}
              className="w-full bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suggesting...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Suggest Subreddits
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Select up to {maxSubreddits === Infinity ? 'unlimited' : maxSubreddits} subreddits
                ({selectedSubreddits.length} selected)
              </p>
              <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {suggestedSubreddits.map((subreddit) => (
                  <div
                    key={subreddit}
                    className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedSubreddits.includes(subreddit)
                        ? 'border-teal-600 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleSubreddit(subreddit)}
                  >
                    <Checkbox
                      checked={selectedSubreddits.includes(subreddit)}
                      disabled={
                        !selectedSubreddits.includes(subreddit) &&
                        selectedSubreddits.length >= maxSubreddits
                      }
                    />
                    <span className="text-sm">r/{subreddit}</span>
                  </div>
                ))}
              </div>
            </div>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleCreate}
                disabled={loading || selectedSubreddits.length === 0}
                className="flex-1 bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Project'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
