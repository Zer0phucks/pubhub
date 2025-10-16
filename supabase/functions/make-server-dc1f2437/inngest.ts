// Inngest client and function definitions for PubHub background jobs
import { Inngest, EventSchemas } from 'npm:inngest';

// Define event schemas for type safety
type Events = {
  'reddit/scan.requested': {
    data: {
      projectId: string;
      userId: string;
      subreddits: string[];
      tier: 'free' | 'basic' | 'pro';
    };
  };
  'reddit/monitor.scheduled': {
    data: {
      projectId: string;
      userId: string;
      subreddits: string[];
    };
  };
  'ai/response.generate': {
    data: {
      projectId: string;
      userId: string;
      feedItemId: string;
      postContent: string;
      persona: string;
    };
  };
  'project/keywords.generate': {
    data: {
      projectId: string;
      userId: string;
      description: string;
    };
  };
};

// Create Inngest client
export const inngest = new Inngest({
  id: 'pubhub',
  name: 'PubHub Background Jobs',
  schemas: new EventSchemas().fromRecord<Events>(),
  eventKey: Deno.env.get('INNGEST_EVENT_KEY'),
});

// Export event types for use in functions
export type { Events };
