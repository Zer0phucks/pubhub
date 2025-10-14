import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { FeedItem } from './FeedItem';
import { EmptyState } from './EmptyState';
import { DemoModeToggle } from './DemoModeToggle';
import { Loader2, RefreshCw, Inbox, Scan } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';

interface FeedProps {
  projectId: string;
  project?: any;
}

export function Feed({ projectId, project }: FeedProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recent');
  const [refreshing, setRefreshing] = useState(false);
  const [scanning, setScanning] = useState(false);

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

  const handleScanNow = async () => {
    if (!project || !project.subreddits || project.subreddits.length === 0) {
      toast.error('No subreddits configured', {
        description: 'Please add subreddits to your project settings first.',
      });
      return;
    }

    setScanning(true);
    try {
      toast.info('Scanning Reddit...', {
        description: `Monitoring ${project.subreddits.length} subreddit(s) for new relevant posts.`,
      });

      const result = await api.monitorSubreddits(projectId, project.subreddits);

      if (result.newItems > 0) {
        toast.success(`Found ${result.newItems} new relevant post(s)!`);
        await loadFeed();
      } else {
        toast.info('No new relevant posts found', {
          description: 'We\'ll keep monitoring for you.',
        });
      }
    } catch (error) {
      console.error('Error scanning subreddits:', error);
      toast.error('Failed to scan subreddits', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setScanning(false);
    }
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
          <Button
            variant="default"
            size="sm"
            onClick={handleScanNow}
            disabled={scanning}
            className="bg-teal-600 hover:bg-teal-700"
          >
            {scanning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Scan className="h-4 w-4 mr-2" />
                Scan Now
              </>
            )}
          </Button>
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
          description={
            project && project.subreddits && project.subreddits.length > 0
              ? 'Click "Scan Now" to find relevant discussions, or add demo data to try it out!'
              : 'Add subreddits in your project settings, then click "Scan Now" to find relevant discussions.'
          }
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
