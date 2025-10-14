import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { FeedItem } from './FeedItem';
import { EmptyState } from './EmptyState';
import { Loader2, RefreshCw, Inbox, Scan } from 'lucide-react';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Progress } from './ui/progress';
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
  const [scanProgress, setScanProgress] = useState(0);
  const [scanningSubreddit, setScanningSubreddit] = useState('');

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
    console.log('==================== SCAN NOW BUTTON CLICKED ====================');
    console.log('Project data:', project);
    console.log('Has subreddits?', project?.subreddits);
    console.log('Subreddit count:', project?.subreddits?.length);
    console.log('================================================================');

    if (!project || !project.subreddits || project.subreddits.length === 0) {
      console.error('❌ SCAN BLOCKED: No subreddits configured');
      toast.error('No subreddits configured', {
        description: 'Please add subreddits to your project settings first.',
      });
      return;
    }

    console.log('✅ Validation passed, starting scan...');
    setScanning(true);
    setScanProgress(0);

    // Declare interval variables outside try block for proper cleanup
    let progressInterval: NodeJS.Timeout | null = null;
    let subInterval: NodeJS.Timeout | null = null;

    try {
      const keywords = project.keywords || [];
      const keywordsText = keywords.length > 0
        ? keywords.slice(0, 5).join(', ') + (keywords.length > 5 ? '...' : '')
        : 'auto-generated keywords';

      console.log('==================== SCAN NOW STARTING ====================');
      console.log('Project ID:', projectId);
      console.log('Project Name:', project.name);
      console.log('Subreddits:', project.subreddits);
      console.log('Keywords:', project.keywords);
      console.log('=========================================================');

      const subredditCount = project.subreddits.length;
      const estimatedTimePerSubreddit = 3; // seconds
      const totalEstimatedTime = subredditCount * estimatedTimePerSubreddit;

      // Simulate progress since we don't have real-time updates from the API
      progressInterval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 95) return prev; // Cap at 95% until actual response
          return prev + (100 / (totalEstimatedTime * 10)); // Update every 100ms
        });
      }, 100);

      // Update current subreddit being scanned (simulated)
      let currentSubIndex = 0;
      const subIntervalTime = (totalEstimatedTime * 1000) / subredditCount;
      subInterval = setInterval(() => {
        if (currentSubIndex < subredditCount) {
          setScanningSubreddit(`r/${project.subreddits[currentSubIndex]}`);
          currentSubIndex++;
        }
      }, subIntervalTime);

      console.log('📡 Calling api.scanHistory with:', { projectId, subreddits: project.subreddits });
      const result = await api.scanHistory(projectId, project.subreddits);

      if (progressInterval) clearInterval(progressInterval);
      if (subInterval) clearInterval(subInterval);
      setScanProgress(100);

      console.log('==================== SCAN RESULT ====================');
      console.log('Result:', result);
      console.log('New items:', result.newItems);
      console.log('Total scanned:', result.scanned);
      console.log('Debug info:', result.debug);
      console.log('====================================================');

      if (result.newItems > 0) {
        toast.success(`Found ${result.newItems} new relevant post(s)!`, {
          description: `Scanned ${result.scanned} posts from last 24 hours`,
        });
        await loadFeed();
      } else {
        toast.info('No new relevant posts found', {
          description: `Scanned ${result.scanned || 0} posts from last 24 hours. Try adjusting your keywords in project settings.`,
        });
      }
    } catch (error: any) {
      console.error('==================== SCAN ERROR ====================');
      console.error('Error scanning subreddits:', error);
      console.error('===================================================');

      if (progressInterval) clearInterval(progressInterval);
      if (subInterval) clearInterval(subInterval);

      // Check if it's a Reddit auth error
      if (error.message?.includes('Reddit account not connected') || error.message?.includes('403')) {
        toast.error('Reddit Account Not Connected', {
          description: 'Please connect your Reddit account in Project Settings to scan subreddits.',
          duration: 5000,
        });
      } else {
        toast.error('Failed to scan subreddits', {
          description: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    } finally {
      setScanning(false);
      setScanProgress(0);
      setScanningSubreddit('');
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
      {scanning && (
        <div className="bg-white border border-teal-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-teal-900">Scanning Reddit...</h3>
              <p className="text-sm text-muted-foreground">
                {scanningSubreddit || 'Preparing scan...'}
                {scanProgress > 0 && scanProgress < 100 && (
                  <span className="ml-2">
                    • Est. {Math.ceil(((100 - scanProgress) / 100) * (project.subreddits.length * 3))}s remaining
                  </span>
                )}
              </p>
            </div>
            <span className="text-sm font-medium text-teal-600">{Math.round(scanProgress)}%</span>
          </div>
          <Progress value={scanProgress} className="h-2" />
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Feed</h2>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleScanNow}
                  disabled={scanning}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
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
              </TooltipTrigger>
              <TooltipContent>
                <p>Scan Reddit for new relevant posts in your subreddits</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
              ? 'Click "Scan Now" to find relevant discussions on Reddit.'
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
