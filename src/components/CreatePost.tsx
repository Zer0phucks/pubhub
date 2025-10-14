import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { api } from '../lib/api';

interface CreatePostProps {
  project: any;
}

export function CreatePost({ project }: CreatePostProps) {
  const [selectedSubreddit, setSelectedSubreddit] = useState('');
  const [prompt, setPrompt] = useState('');
  const [generatedPost, setGeneratedPost] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSuggestions();
  }, [project.id]);

  const loadSuggestions = async () => {
    try {
      const result = await api.suggestPosts(project.id);
      setSuggestions(result.suggestions);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const handleGenerate = async (enhance = false) => {
    if (!selectedSubreddit) {
      alert('Please select a subreddit');
      return;
    }

    setLoading(true);
    try {
      const result = await api.generatePost(
        project.id,
        selectedSubreddit,
        enhance ? generatedPost || prompt : prompt,
        enhance
      );
      setGeneratedPost(result.post);
    } catch (error) {
      console.error('Error generating post:', error);
      alert('Failed to generate post');
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    if (!generatedPost) {
      alert('Please generate a post first');
      return;
    }

    // In a real app, this would post to Reddit
    alert('Post created! (Demo mode - not actually posted to Reddit)');
    setGeneratedPost('');
    setPrompt('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="mb-2">Create Post</h2>
        <p className="text-muted-foreground">
          Let PubHub's AI help you create engaging posts for your selected subreddits.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Subreddit</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedSubreddit} onValueChange={setSelectedSubreddit}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a subreddit..." />
            </SelectTrigger>
            <SelectContent>
              {project.subreddits.map((subreddit: string) => (
                <SelectItem key={subreddit} value={subreddit}>
                  r/{subreddit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Suggestions from PubHub</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setPrompt(suggestion)}
                className="w-full text-left p-3 border rounded-lg hover:border-teal-600 hover:bg-teal-50 transition-colors"
              >
                <p className="text-sm">{suggestion}</p>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your Prompt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to post about, or select a suggestion above..."
            rows={4}
          />
          <Button
            onClick={() => handleGenerate(false)}
            disabled={loading || !prompt || !selectedSubreddit}
            className="w-full bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Post
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedPost && (
        <Card className="border-teal-200 bg-gradient-to-r from-teal-50 to-emerald-50">
          <CardHeader>
            <CardTitle>Generated Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={generatedPost}
              onChange={(e) => setGeneratedPost(e.target.value)}
              rows={8}
              className="bg-white"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleGenerate(true)}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enhancing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Enhance with AI
                  </>
                )}
              </Button>
              <Button
                onClick={handlePost}
                className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600"
              >
                <Send className="mr-2 h-4 w-4" />
                Post
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
