import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { FeedItem } from './FeedItem';
import { EmptyState } from './EmptyState';
import { DemoModeToggle } from './DemoModeToggle';
import { Loader2, RefreshCw, Inbox } from 'lucide-react';
import { api } from '../lib/api';

interface FeedProps {
  projectId: string;
}

export function Feed({ projectId }: FeedProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recent');
  const [refreshing, setRefreshing] = useState(false);

  const loadFeed = async () => {
    try {
      const feedItems = await api.getFeed(projectId, sortBy);
      setItems(feedItems);
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, [projectId, sortBy]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2>Feed</h2>
        <div className="flex items-center gap-2">
          <DemoModeToggle projectId={projectId} onUpdate={loadFeed} />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="engagement">Engagement</SelectItem>
              <SelectItem value="relevance">Relevance</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No items in your feed yet"
          description="We're monitoring your selected subreddits for relevant discussions. Check back soon!"
        />
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <FeedItem key={item.id} item={item} onUpdate={loadFeed} />
          ))}
        </div>
      )}
    </div>
  );
}
