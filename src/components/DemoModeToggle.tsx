import { useState } from 'react';
import { Button } from './ui/button';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { api } from '../lib/api';

interface DemoModeToggleProps {
  projectId: string;
  onUpdate: () => void;
}

export function DemoModeToggle({ projectId, onUpdate }: DemoModeToggleProps) {
  const [loading, setLoading] = useState(false);

  const addDemoData = async () => {
    setLoading(true);
    try {
      // Add demo feed items by creating them directly via API
      const demoItems = [
        {
          id: crypto.randomUUID(),
          projectId,
          type: 'post',
          subreddit: 'webdev',
          title: 'Looking for a better way to manage my app projects',
          content: 'I have been struggling to keep track of all my side projects. Does anyone have recommendations for project management tools?',
          author: 'dev_enthusiast',
          score: 42,
          num_comments: 15,
          url: 'https://reddit.com/r/webdev/demo1',
          reddit_id: 'demo_' + Date.now() + '_1',
          relevance_score: 75,
          created_at: new Date().toISOString(),
          ai_response: null,
          status: 'pending',
        },
        {
          id: crypto.randomUUID(),
          projectId,
          type: 'post',
          subreddit: 'SaaS',
          title: 'What tools do you use for customer engagement?',
          content: 'I am building a SaaS product and looking for ways to engage with potential customers on Reddit. Any suggestions?',
          author: 'saas_founder',
          score: 28,
          num_comments: 8,
          url: 'https://reddit.com/r/SaaS/demo2',
          reddit_id: 'demo_' + Date.now() + '_2',
          relevance_score: 85,
          created_at: new Date().toISOString(),
          ai_response: null,
          status: 'pending',
        },
        {
          id: crypto.randomUUID(),
          projectId,
          type: 'post',
          subreddit: 'startups',
          title: 'How do you find your first users?',
          content: 'Just launched my app and struggling to get traction. Where do you all find your early adopters?',
          author: 'first_time_founder',
          score: 67,
          num_comments: 23,
          url: 'https://reddit.com/r/startups/demo3',
          reddit_id: 'demo_' + Date.now() + '_3',
          relevance_score: 90,
          created_at: new Date().toISOString(),
          ai_response: null,
          status: 'pending',
        },
      ];

      // Create feed items via API
      for (const item of demoItems) {
        await api.updateFeedItem(projectId, item.id, item);
      }

      toast.success('Added 3 demo feed items! These simulate Reddit posts that match your project.');
      onUpdate();
    } catch (error) {
      console.error('Error adding demo data:', error);
      toast.error('Failed to add demo data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={addDemoData}
      disabled={loading}
      className="border-teal-300 text-teal-700 hover:bg-teal-50"
    >
      <Sparkles className="h-4 w-4 mr-2" />
      {loading ? 'Adding...' : 'Add Demo Data'}
    </Button>
  );
}
