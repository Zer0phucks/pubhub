// Inngest background functions for PubHub
import { inngest } from './inngest.ts';
import * as kv from './kv_store.tsx';
import * as reddit from './reddit.tsx';
import * as openai from './openai.tsx';
import * as openrouter from './openrouter.tsx';

// ============================================================================
// REDDIT SCAN FUNCTION
// ============================================================================

export const scanRedditSubreddits = inngest.createFunction(
  {
    id: 'reddit-scan-subreddits',
    name: 'Scan Reddit Subreddits for Relevant Posts',
    retries: 2,
    rateLimit: {
      limit: 10, // Max 10 scans per window
      period: '1h', // Per hour window
      key: 'event.data.userId', // Rate limit per user
    },
  },
  { event: 'reddit/scan.requested' },
  async ({ event, step }) => {
    const { projectId, userId, subreddits, tier } = event.data;

    // Step 1: Load project data
    const project = await step.run('load-project', async () => {
      console.log(`[Inngest][Scan] Loading project ${projectId} for user ${userId}`);
      const proj = await kv.get(`project:${userId}:${projectId}`);
      if (!proj) {
        throw new Error(`Project not found: ${projectId}`);
      }
      return proj;
    });

    // Step 2: Get user Reddit tokens
    const userTokens = await step.run('get-reddit-tokens', async () => {
      const profile = await kv.get(`user:${userId}`);
      if (!profile?.reddit) {
        throw new Error('Reddit account not connected');
      }
      return profile.reddit;
    });

    // Step 3: Ensure valid access token
    const accessToken = await step.run('validate-token', async () => {
      const token = await reddit.getUserToken(userTokens);

      // If token was refreshed, update profile
      if (token !== userTokens.access_token) {
        const newTokens = await reddit.refreshUserToken(userTokens.refresh_token);
        const profile = await kv.get(`user:${userId}`);
        profile.reddit = {
          ...userTokens,
          access_token: newTokens.access_token,
          expires_at: newTokens.expires_at,
        };
        await kv.set(`user:${userId}`, profile);
        console.log('[Inngest][Scan] Refreshed user Reddit token');
        return newTokens.access_token;
      }

      return token;
    });

    // Step 4: Determine scan window based on tier
    // TEMPORARY: Set all tiers to 90 days for testing (until Clerk subscriptions are setup)
    const scanDays = 90; // tier === 'pro' ? 90 : tier === 'basic' ? 30 : 1;
    const cutoffDate = Date.now() - (scanDays * 24 * 60 * 60 * 1000);
    const keywords = project.keywords?.length > 0 ? project.keywords : reddit.extractKeywords(project.description);

    console.log(`[Inngest][Scan] Starting scan: ${scanDays} days (TESTING MODE - all tiers get Pro access), ${keywords.length} keywords`);

    // Step 5: Scan each subreddit in parallel
    const feedItems = await step.run('scan-subreddits', async () => {
      const allItems: any[] = [];
      let totalScanned = 0;
      let matchedPosts = 0;

      // Parallelize subreddit scanning for better performance
      const scanPromises = subreddits.map(async (subreddit) => {
        try {
          console.log(`[Inngest][Scan] Fetching posts from r/${subreddit}`);
          const { posts } = await reddit.getSubredditPostsWithUserToken(accessToken, subreddit, 100);

          const subredditItems: any[] = [];

          for (const postData of posts) {
            const postDate = postData.created_utc * 1000;
            totalScanned++;

            // Filter by date
            if (postDate < cutoffDate) continue;

            // Check relevance
            const text = `${postData.title} ${postData.selftext}`;
            const relevanceScore = reddit.calculateRelevanceScore(text, keywords);

            if (relevanceScore > 0 || reddit.isRelevant(text, keywords)) {
              matchedPosts++;

              // Fetch relevant comments for this post
              const relevantComments: any[] = [];
              try {
                console.log(`[Inngest][Scan] Fetching comments for post ${postData.id}`);
                const comments = await reddit.getPostComments(subreddit, postData.id);

                // Filter comments by relevance
                for (const comment of comments) {
                  const commentText = comment.body || '';
                  const commentScore = reddit.calculateRelevanceScore(commentText, keywords);

                  if (commentScore > 0 || reddit.isRelevant(commentText, keywords)) {
                    relevantComments.push({
                      id: comment.id,
                      author: comment.author,
                      body: comment.body,
                      score: comment.score,
                      created_utc: comment.created_utc,
                      permalink: comment.permalink,
                      relevance_score: commentScore,
                    });
                  }
                }

                console.log(`[Inngest][Scan] Found ${relevantComments.length} relevant comments for post ${postData.id}`);
              } catch (error) {
                console.error(`[Inngest][Scan] Error fetching comments for post ${postData.id}:`, error);
                // Continue without comments if fetch fails
              }

              const itemId = crypto.randomUUID();
              const feedItem = {
                id: itemId,
                projectId,
                type: 'post',
                subreddit,
                title: postData.title,
                content: postData.selftext || '',
                author: postData.author,
                url: `https://reddit.com${postData.permalink}`,
                reddit_id: postData.id,
                score: postData.score,
                num_comments: postData.num_comments,
                relevance_score: relevanceScore,
                created_at: reddit.formatRedditTimestamp(postData.created_utc),
                comments: relevantComments, // Nested comments array
                ai_response: null,
                status: 'pending',
              };

              await kv.set(`feed:${projectId}:${itemId}`, feedItem);
              subredditItems.push(feedItem);
            }
          }

          console.log(`[Inngest][Scan] r/${subreddit}: ${subredditItems.length} relevant posts found`);
          return subredditItems;
        } catch (error) {
          console.error(`[Inngest][Scan] Error scanning r/${subreddit}:`, error);
          return [];
        }
      });

      const results = await Promise.all(scanPromises);
      results.forEach(items => allItems.push(...items));

      console.log(`[Inngest][Scan] Complete: ${matchedPosts} matches from ${totalScanned} posts`);
      return { items: allItems, totalScanned, matchedPosts };
    });

    return {
      success: true,
      scanned: feedItems.totalScanned,
      newItems: feedItems.items.length,
      keywords: keywords.length,
    };
  }
);

// ============================================================================
// SCHEDULED MONITORING FUNCTION
// ============================================================================

export const monitorSubreddits = inngest.createFunction(
  {
    id: 'reddit-monitor-subreddits',
    name: 'Monitor Subreddits for New Posts (Scheduled)',
    retries: 1,
  },
  { cron: '*/15 * * * *' }, // Run every 15 minutes
  async ({ step }) => {
    // Step 1: Get all active projects
    const activeProjects = await step.run('find-active-projects', async () => {
      console.log('[Inngest][Monitor] Finding active projects');

      // Get all user profiles
      const allKeys = await kv.list('user:');
      const projects: any[] = [];

      for (const key of allKeys) {
        const userId = key.replace('user:', '');
        const userProjects = await kv.getByPrefix(`project:${userId}:`);
        projects.push(...userProjects.map(p => ({ ...p, userId })));
      }

      console.log(`[Inngest][Monitor] Found ${projects.length} projects`);
      return projects;
    });

    // Step 2: Monitor each project
    const results = await step.run('monitor-projects', async () => {
      const monitorResults: any[] = [];

      for (const project of activeProjects) {
        try {
          // Skip projects without subreddits
          if (!project.subreddits || project.subreddits.length === 0) continue;

          // Get user profile for Reddit tokens
          const profile = await kv.get(`user:${project.userId}`);
          if (!profile?.reddit) continue;

          // Get valid access token
          const accessToken = await reddit.getUserToken(profile.reddit);

          // Get last scan timestamp
          const lastScanKey = `last_scan:${project.id}`;
          const lastScan = await kv.get(lastScanKey) || { timestamp: Date.now() - 3600000 };

          const keywords = project.keywords?.length > 0 ? project.keywords : reddit.extractKeywords(project.description);
          const newItems: any[] = [];

          // Scan each subreddit for new posts
          for (const subreddit of project.subreddits) {
            const { posts } = await reddit.getSubredditPostsWithUserToken(accessToken, subreddit, 25);

            for (const postData of posts) {
              const postDate = postData.created_utc * 1000;

              // Only process new posts since last scan
              if (postDate <= lastScan.timestamp) continue;

              const text = `${postData.title} ${postData.selftext}`;
              const relevanceScore = reddit.calculateRelevanceScore(text, keywords);

              if (relevanceScore > 0 || reddit.isRelevant(text, keywords)) {
                // Check if already exists
                const existingItems = await kv.getByPrefix(`feed:${project.id}:`);
                const exists = existingItems.some(item => item.reddit_id === postData.id);

                if (!exists) {
                  const itemId = crypto.randomUUID();
                  const feedItem = {
                    id: itemId,
                    projectId: project.id,
                    type: 'post',
                    subreddit,
                    title: postData.title,
                    content: postData.selftext || '',
                    author: postData.author,
                    url: `https://reddit.com${postData.permalink}`,
                    reddit_id: postData.id,
                    score: postData.score,
                    num_comments: postData.num_comments,
                    relevance_score: relevanceScore,
                    created_at: reddit.formatRedditTimestamp(postData.created_utc),
                    ai_response: null,
                    status: 'pending',
                  };

                  await kv.set(`feed:${project.id}:${itemId}`, feedItem);
                  newItems.push(feedItem);
                }
              }
            }
          }

          // Update last scan timestamp
          await kv.set(lastScanKey, { timestamp: Date.now() });

          if (newItems.length > 0) {
            console.log(`[Inngest][Monitor] Project ${project.id}: ${newItems.length} new items`);
            monitorResults.push({ projectId: project.id, newItems: newItems.length });
          }
        } catch (error) {
          console.error(`[Inngest][Monitor] Error monitoring project ${project.id}:`, error);
        }
      }

      return monitorResults;
    });

    return {
      success: true,
      projectsMonitored: activeProjects.length,
      projectsWithNewItems: results.length,
      results,
    };
  }
);

// ============================================================================
// AI RESPONSE GENERATION FUNCTION
// ============================================================================

export const generateAIResponse = inngest.createFunction(
  {
    id: 'ai-generate-response',
    name: 'Generate AI Response for Reddit Post',
    retries: 2,
    rateLimit: {
      limit: 50, // Max 50 AI responses per window
      period: '1h', // Per hour window
      key: 'event.data.userId', // Rate limit per user
    },
  },
  { event: 'ai/response.generate' },
  async ({ event, step }) => {
    const { projectId, userId, feedItemId, postContent, persona } = event.data;

    // Step 1: Load project details
    const project = await step.run('load-project', async () => {
      const proj = await kv.get(`project:${userId}:${projectId}`);
      if (!proj) throw new Error('Project not found');
      return proj;
    });

    // Step 2: Generate AI response
    const aiResponse = await step.run('generate-response', async () => {
      const systemPrompt = persona || project.persona;
      const prompt = `The user posted: "${postContent}"\n\nGenerate a helpful, engaging response about ${project.name}: ${project.description}. Keep it conversational and under 200 words.`;

      console.log('[Inngest][AI] Generating response with Azure OpenAI');
      const response = await openai.callAzureOpenAI([
        { role: 'user', content: prompt }
      ], systemPrompt);

      return response;
    });

    // Step 3: Save response to feed item
    await step.run('save-response', async () => {
      const feedItem = await kv.get(`feed:${projectId}:${feedItemId}`);
      if (feedItem) {
        feedItem.ai_response = aiResponse;
        feedItem.ai_generated_at = new Date().toISOString();
        await kv.set(`feed:${projectId}:${feedItemId}`, feedItem);
        console.log(`[Inngest][AI] Response saved to feed item ${feedItemId}`);
      }
    });

    return {
      success: true,
      feedItemId,
      responseLength: aiResponse.length,
    };
  }
);

// ============================================================================
// KEYWORD GENERATION FUNCTION
// ============================================================================

export const generateProjectKeywords = inngest.createFunction(
  {
    id: 'project-generate-keywords',
    name: 'Generate Keywords for Project',
    retries: 1,
  },
  { event: 'project/keywords.generate' },
  async ({ event, step }) => {
    const { projectId, userId, description } = event.data;

    // Step 1: Generate keywords using AI
    const keywords = await step.run('ai-extract-keywords', async () => {
      console.log('[Inngest][Keywords] Generating keywords for project', projectId);

      const keywordPrompt = `Analyze this app description and extract 5-10 key terms that would help identify relevant Reddit posts. Focus on:
- Core features and functionality
- Target audience needs
- Problem being solved
- Industry/category terms
- User intent keywords

App description: "${description}"

Return ONLY a JSON array of lowercase keywords without explanations. Example: ["productivity", "automation", "developers", "workflow", "efficiency"]`;

      try {
        const keywordResponse = await openrouter.callOpenRouter([
          { role: 'user', content: keywordPrompt }
        ], 'You are a keyword extraction expert. Return only valid JSON.', { model: 'perplexity/sonar' });

        const extractedKeywords = openrouter.safeJSONParse(keywordResponse, []);

        if (!Array.isArray(extractedKeywords) || extractedKeywords.length === 0) {
          console.log('[Inngest][Keywords] AI extraction failed, using fallback');
          return reddit.extractKeywords(description);
        }

        console.log('[Inngest][Keywords] AI generated keywords:', extractedKeywords);
        return extractedKeywords;
      } catch (error) {
        console.error('[Inngest][Keywords] Error:', error);
        return reddit.extractKeywords(description);
      }
    });

    // Step 2: Update project with keywords
    await step.run('save-keywords', async () => {
      const project = await kv.get(`project:${userId}:${projectId}`);
      if (project) {
        project.keywords = keywords;
        await kv.set(`project:${userId}:${projectId}`, project);
        console.log(`[Inngest][Keywords] Saved ${keywords.length} keywords to project ${projectId}`);
      }
    });

    return {
      success: true,
      keywords,
      count: keywords.length,
    };
  }
);

// Export all functions as array
export const functions = [
  scanRedditSubreddits,
  monitorSubreddits,
  generateAIResponse,
  generateProjectKeywords,
];
