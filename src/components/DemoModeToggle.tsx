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
      // Create some demo feed items
      const demoItems = [
        {
          type: 'post',
          subreddit: 'webdev',
          title: 'Looking for a better way to manage my app projects',
          content: 'I have been struggling to keep track of all my side projects. Does anyone have recommendations for project management tools?',
          author: 'dev_enthusiast',
          score: 42,
          num_comments: 15,
          url: 'https://reddit.com/r/webdev/demo1',
        },
        {
          type: 'post',
          subreddit: 'SaaS',
          title: 'What tools do you use for customer engagement?',
          content: 'I am building a SaaS product and looking for ways to engage with potential customers on Reddit. Any suggestions?',
          author: 'saas_founder',
          score: 28,
          num_comments: 8,
          url: 'https://reddit.com/r/SaaS/demo2',
        },
        {
          type: 'post',
          subreddit: 'startups',
          title: 'How do you find your first users?',
          content: 'Just launched my app and struggling to get traction. Where do you all find your early adopters?',
          author: 'first_time_founder',
          score: 67,
          num_comments: 23,
          url: 'https://reddit.com/r/startups/demo3',
        },
      ];

      // This would normally call the backend, but for demo purposes we'll simulate
      toast.success('Demo feed items would be added here. In a real implementation, this would populate your feed with sample Reddit posts.');
      
      setTimeout(() => {
        onUpdate();
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error adding demo data:', error);
      toast.error('Failed to add demo data');
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
