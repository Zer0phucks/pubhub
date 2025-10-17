import { useState } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { MessageSquare, ThumbsUp, ExternalLink, Sparkles, Send, Edit2, X, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../lib/api';

interface Comment {
  id: string;
  author: string;
  body: string;
  score: number;
  created_utc: number;
  permalink: string;
  relevance_score: number;
}

interface FeedItemProps {
  item: {
    id: string;
    projectId: string;
    type: string;
    subreddit: string;
    title?: string;
    content: string;
    author: string;
    url: string;
    score: number;
    num_comments: number;
    created_at: string;
    ai_response: string | null;
    comments?: Comment[];
  };
  onUpdate: () => void;
}

export function FeedItem({ item, onUpdate }: FeedItemProps) {
  const [showResponse, setShowResponse] = useState(!!item.ai_response);
  const [response, setResponse] = useState(item.ai_response || '');
  const [editing, setEditing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const handleGenerateResponse = async () => {
    setGenerating(true);
    try {
      const result = await api.generateResponse(
        item.projectId,
        item.id,
        `${item.title || ''} ${item.content}`
      );
      setResponse(result.response);
      setShowResponse(true);
      setEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error generating response:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleSend = async () => {
    setSending(true);
    try {
      // In a real app, this would post to Reddit
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert('Response sent! (Demo mode - not actually posted to Reddit)');
      setShowResponse(false);
    } catch (error) {
      console.error('Error sending response:', error);
    } finally {
      setSending(false);
    }
  };

  const handleDiscard = () => {
    setResponse('');
    setShowResponse(false);
    setEditing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-gradient-to-r from-teal-50 to-emerald-50">
                r/{item.subreddit}
              </Badge>
              <span className="text-sm text-muted-foreground">
                u/{item.author} • {formatDate(item.created_at)}
              </span>
            </div>
            {item.title && <h3 className="mb-2">{item.title}</h3>}
            <p className="text-sm text-muted-foreground line-clamp-3">{item.content}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <ThumbsUp className="h-4 w-4" />
            <span>{item.score}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span>{item.num_comments}</span>
          </div>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-teal-600"
          >
            <ExternalLink className="h-4 w-4" />
            <span>View on Reddit</span>
          </a>
        </div>

        {!showResponse && !generating && (
          <Button
            onClick={handleGenerateResponse}
            className="w-full bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600"
            size="sm"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Generate AI Response
          </Button>
        )}

        {generating && (
          <div className="flex items-center justify-center p-4 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-lg">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span className="text-sm">Generating response...</span>
          </div>
        )}

        {showResponse && (
          <div className="space-y-3 p-4 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm">AI Generated Response</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditing(!editing)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDiscard}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {editing ? (
              <Textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={6}
                className="bg-white"
              />
            ) : (
              <p className="text-sm whitespace-pre-wrap">{response}</p>
            )}
            <div className="flex gap-2">
              {editing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(false)}
                  className="flex-1"
                >
                  Done Editing
                </Button>
              )}
              <Button
                onClick={handleSend}
                disabled={sending}
                className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600"
                size="sm"
              >
                {sending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Response
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {item.comments && item.comments.length > 0 && (
          <div className="border-t pt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="w-full justify-between"
            >
              <span className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                {item.comments.length} Relevant Comment{item.comments.length !== 1 ? 's' : ''}
              </span>
              {showComments ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            {showComments && (
              <div className="mt-3 space-y-3">
                {item.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="pl-4 border-l-2 border-teal-200 space-y-2 p-3 bg-slate-50 rounded-r-lg"
                  >
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium">u/{comment.author}</span>
                      <span>•</span>
                      <span>{formatDate(new Date(comment.created_utc * 1000).toISOString())}</span>
                      <div className="flex items-center gap-1 ml-auto">
                        <ThumbsUp className="h-3 w-3" />
                        <span>{comment.score}</span>
                      </div>
                    </div>
                    <p className="text-sm">{comment.body}</p>
                    <a
                      href={`https://reddit.com${comment.permalink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-teal-600 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View on Reddit
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
