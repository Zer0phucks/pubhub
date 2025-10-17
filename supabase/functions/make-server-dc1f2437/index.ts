import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { serve } from 'npm:inngest/hono';
import * as kv from './kv_store.tsx';
import * as reddit from './reddit.tsx';
import * as openai from './openai.tsx';
import * as openrouter from './openrouter.tsx';
import { inngest } from './inngest.ts';
import { functions } from './inngest-functions.ts';
import { verifyClerkToken, decodeJWTPayload } from './jwt.ts';

const app = new Hono();

// Configure CORS with environment-specific origins
const allowedOrigins = Deno.env.get('ALLOWED_ORIGINS')?.split(',') || [
  'https://pubhub.dev',
  'https://www.pubhub.dev',
  'http://localhost:3000',
  'http://localhost:5173',
];

// Security mode: 'strict' requires verified JWT, 'dev' allows demo user fallback
const SECURITY_MODE = Deno.env.get('SECURITY_MODE') || 'dev';

console.log('[Security] Mode:', SECURITY_MODE);
console.log('[CORS] Allowed origins:', allowedOrigins);

app.use('*', cors({
  origin: (origin) => {
    // Allow requests without origin (like from Postman/curl)
    if (!origin) return '*';

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) return origin;

    // In dev mode, allow all origins
    if (SECURITY_MODE === 'dev') return origin;

    // In strict mode, reject unauthorized origins
    return allowedOrigins[0]; // Return first allowed origin as default
  },
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use('*', logger(console.log));

// Health check endpoint
app.get('/make-server-dc1f2437/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'PubHub API is running'
  });
});

// Inngest serve endpoint - handles all Inngest background jobs
app.on(['GET', 'POST', 'PUT'], '/make-server-dc1f2437/inngest', serve({
  client: inngest,
  functions,
}));

// Auth test endpoint
app.get('/make-server-dc1f2437/auth-test', async (c) => {
  const user = await getAuthUser(c.req.raw);
  if (!user) {
    return c.json({ error: 'Not authenticated', details: 'Check server logs' }, 401);
  }
  return c.json({ 
    authenticated: true,
    user: user,
    message: 'Authentication working!'
  });
});

// Helper to get authenticated user with proper JWT verification
async function getAuthUser(request: Request) {
  const authHeader = request.headers.get('Authorization');

  console.log('==================== AUTH CHECK ====================');
  console.log('Authorization header:', authHeader ? 'Present' : 'Missing');
  console.log('Security mode:', SECURITY_MODE);

  if (!authHeader) {
    if (SECURITY_MODE === 'strict') {
      throw new Error('Authentication required');
    }
    console.log('No auth header - using demo user (dev mode)');
    return {
      id: 'demo-user-123',
      email: 'demo@pubhub.test',
      name: 'Demo User',
    };
  }

  const token = authHeader.replace('Bearer ', '');
  if (!token || token === authHeader) {
    if (SECURITY_MODE === 'strict') {
      throw new Error('Invalid authorization format');
    }
    console.log('No Bearer token - using demo user (dev mode)');
    return {
      id: 'demo-user-123',
      email: 'demo@pubhub.test',
      name: 'Demo User',
    };
  }

  console.log('Token received (first 30 chars):', token.substring(0, 30) + '...');
  console.log('Token length:', token.length);

  // Check if this is the Supabase anon key (used for public access)
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (supabaseAnonKey && token === supabaseAnonKey) {
    if (SECURITY_MODE === 'strict') {
      throw new Error('Supabase anon key not allowed in strict mode');
    }
    console.log('✅ Supabase anon key detected - using demo user (dev mode)');
    console.log('==================================================');
    return {
      id: 'demo-user-123',
      email: 'demo@pubhub.test',
      name: 'Demo User',
    };
  }

  try {
    // In strict mode, verify the token cryptographically
    if (SECURITY_MODE === 'strict') {
      console.log('🔒 Strict mode: Verifying JWT with Clerk API');
      try {
        const verified = await verifyClerkToken(token);
        console.log('✅ JWT verified successfully:', verified.userId);
        console.log('==================================================');

        return {
          id: verified.userId,
          email: verified.user?.email || 'user@example.com',
          name: verified.user?.first_name || verified.user?.username || 'User',
          verified: true,
        };
      } catch (verifyError) {
        console.error('❌ JWT verification failed:', verifyError.message);
        throw new Error('Authentication failed: ' + verifyError.message);
      }
    }

    // In dev mode, decode without verification (INSECURE - only for development)
    console.log('⚠️  Dev mode: Decoding JWT without verification');
    const payload = decodeJWTPayload(token);
    console.log('JWT payload decoded:', {
      sub: payload.sub,
      email: payload.email,
      exp: payload.exp,
      iat: payload.iat,
      iss: payload.iss,
    });

    // Check if token is expired
    const now = Date.now() / 1000;
    if (payload.exp && payload.exp < now) {
      console.log('Token expired:', { exp: payload.exp, now, diff: now - payload.exp });
      throw new Error('Token expired');
    }

    // Get user ID from the payload
    const userId = payload.sub;

    if (!userId) {
      throw new Error('No user ID in token payload');
    }

    console.log('✅ Authentication successful (unverified dev mode):', userId);
    console.log('==================================================');

    return {
      id: userId,
      email: payload.email || payload.email_addresses?.[0]?.email_address || 'user@example.com',
      name: payload.name || payload.given_name || payload.first_name || 'User',
      verified: false,
    };
  } catch (error) {
    console.error('Error in getAuthUser:', error);
    console.log('==================================================');

    if (SECURITY_MODE === 'strict') {
      throw error; // Propagate error in strict mode
    }

    // In dev mode, fall back to demo user
    console.log('Using demo user fallback (dev mode)');
    return {
      id: 'demo-user-123',
      email: 'demo@pubhub.test',
      name: 'Demo User',
    };
  }
}

// Legacy helper - now uses openai module
async function callAzureOpenAI(messages: any[], systemPrompt?: string) {
  return await openai.callAzureOpenAI(messages, systemPrompt);
}

// Initialize User Profile (called after Clerk signup)
app.post('/make-server-dc1f2437/init-profile', async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);

    // Check if profile already exists
    const existingProfile = await kv.get(`user:${user.id}`);
    if (existingProfile) {
      console.log('Returning existing profile for user:', user.id);
      return c.json(existingProfile);
    }

    console.log('Creating new profile for user:', user.id);
    // Create default user profile
    const profile = {
      id: user.id,
      email: user.email,
      name: user.name || user.email.split('@')[0],
      tier: 'pro', // TEMPORARY: Set to 'pro' for testing (until Clerk subscriptions are setup)
      theme: 'system',
      onboardingCompleted: false, // Track if user completed onboarding
      created_at: new Date().toISOString(),
    };

    await kv.set(`user:${user.id}`, profile);

    return c.json(profile);
  } catch (error) {
    console.log(`Init profile error: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

// Get User Profile
app.get('/make-server-dc1f2437/user-profile', async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);

    const profile = await kv.get(`user:${user.id}`);
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    return c.json(profile);
  } catch (error) {
    console.log(`Get profile error: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

// Update User Profile
app.patch('/make-server-dc1f2437/user-profile', async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);

    const updates = await c.req.json();
    const profile = await kv.get(`user:${user.id}`);
    
    const updated = { ...profile, ...updates };
    await kv.set(`user:${user.id}`, updated);

    return c.json(updated);
  } catch (error) {
    console.log(`Update profile error: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

// Create Project
app.post('/make-server-dc1f2437/projects', async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { name, description, url, icon, subreddits, persona } = await c.req.json();

    // Check project limits based on tier
    const profile = await kv.get(`user:${user.id}`);
    const existingProjects = await kv.getByPrefix(`project:${user.id}:`);

    // TEMPORARY: Remove limits for testing (until Clerk subscriptions are setup)
    // const limits = { free: 1, basic: 5, pro: Infinity };
    // const limit = limits[profile.tier] || 1;
    // if (existingProjects.length >= limit) {
    //   return c.json({ error: `Project limit reached for ${profile.tier} tier` }, 400);
    // }
    console.log('[Testing Mode] Project limits disabled - allowing unlimited projects');

    // Generate keywords using AI
    console.log('Generating keywords for project:', description);
    let keywords = [];
    try {
      const keywordPrompt = `Analyze this app description and extract 5-10 key terms that would help identify relevant Reddit posts. Focus on:
- Core features and functionality
- Target audience needs
- Problem being solved
- Industry/category terms
- User intent keywords

App description: "${description}"

Return ONLY a JSON array of lowercase keywords without explanations. Example: ["productivity", "automation", "developers", "workflow", "efficiency"]`;

      const keywordResponse = await openrouter.callOpenRouter([
        { role: 'user', content: keywordPrompt }
      ], 'You are a keyword extraction expert. Return only valid JSON.', { model: 'perplexity/sonar' });

      keywords = openrouter.safeJSONParse(keywordResponse, []);
      console.log('AI generated keywords:', keywords);

      // Fallback to basic extraction if AI fails
      if (!Array.isArray(keywords) || keywords.length === 0) {
        keywords = reddit.extractKeywords(description);
        console.log('Using fallback keyword extraction:', keywords);
      }
    } catch (error) {
      console.log('Keyword generation failed, using fallback:', error.message);
      keywords = reddit.extractKeywords(description);
    }

    const projectId = crypto.randomUUID();
    const project = {
      id: projectId,
      userId: user.id,
      name,
      description,
      url,
      icon,
      subreddits: subreddits || [],
      keywords: keywords,
      persona: persona || 'You are a helpful and friendly app developer responding to potential users on Reddit.',
      settings: {
        aiResponses: true,
        notifications: {
          dms: true,
          comments: true,
          posts: true,
        },
      },
      created_at: new Date().toISOString(),
    };

    await kv.set(`project:${user.id}:${projectId}`, project);

    return c.json(project);
  } catch (error) {
    console.log(`Create project error: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

// Get Projects
app.get('/make-server-dc1f2437/projects', async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const projects = await kv.getByPrefix(`project:${user.id}:`);
    return c.json(projects);
  } catch (error) {
    console.log(`Get projects error: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

// Get Project
app.get('/make-server-dc1f2437/projects/:id', async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const projectId = c.req.param('id');
    const project = await kv.get(`project:${user.id}:${projectId}`);
    
    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    return c.json(project);
  } catch (error) {
    console.log(`Get project error: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

// Update Project
app.patch('/make-server-dc1f2437/projects/:id', async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const projectId = c.req.param('id');
    const updates = await c.req.json();
    const project = await kv.get(`project:${user.id}:${projectId}`);
    
    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const updated = { ...project, ...updates };
    await kv.set(`project:${user.id}:${projectId}`, updated);

    return c.json(updated);
  } catch (error) {
    console.log(`Update project error: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

// Delete Project
app.delete('/make-server-dc1f2437/projects/:id', async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const projectId = c.req.param('id');
    await kv.del(`project:${user.id}:${projectId}`);
    
    // Clean up feed items
    const feedItems = await kv.getByPrefix(`feed:${projectId}:`);
    for (const item of feedItems) {
      await kv.del(`feed:${projectId}:${item.id}`);
    }

    return c.json({ success: true });
  } catch (error) {
    console.log(`Delete project error: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

// Suggest Subreddits - Using OpenRouter with Perplexity Sonar
app.post('/make-server-dc1f2437/suggest-subreddits', async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { description, url } = await c.req.json();

    console.log('Suggesting subreddits for:', { description, url });

    const systemPrompt = 'You are a Reddit expert who helps app developers find relevant communities. Provide specific, active subreddit names where developers can authentically engage with potential users. Return ONLY a valid JSON array with no additional text or explanation.';

    const userPrompt = `Based on this app: "${description}"${url ? ` (${url})` : ''}, suggest 8-10 relevant subreddits where the developer could engage with potential users.

Requirements:
- Focus on active communities with engaged users
- Include both niche and broader subreddits
- Avoid overly promotional or spam-heavy communities
- Consider where the target audience naturally discusses their problems

Return ONLY a JSON array of subreddit names without the r/ prefix.
Example format: ["webdev", "SaaS", "startups", "Entrepreneur", "smallbusiness"]`;

    const response = await openrouter.callOpenRouter([
      { role: 'user', content: userPrompt }
    ], systemPrompt, { model: 'perplexity/sonar' });

    console.log('OpenRouter raw response:', response);

    // Use safeJSONParse to handle markdown code blocks
    const subreddits = openrouter.safeJSONParse(response, []);

    console.log('Parsed subreddits:', subreddits);

    if (!Array.isArray(subreddits) || subreddits.length === 0) {
      console.error('Invalid subreddits format, returning empty array');
      return c.json({ subreddits: [] });
    }

    return c.json({ subreddits });
  } catch (error) {
    console.error(`Suggest subreddits error: ${error.message}`);
    console.error('Full error:', error);
    console.error('Stack:', error.stack);
    return c.json({ error: error.message }, 500);
  }
});

// Validate Subreddit
app.post('/make-server-dc1f2437/validate-subreddit', async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { subreddit } = await c.req.json();
    
    // Check format
    if (!reddit.isValidSubredditName(subreddit)) {
      return c.json({ valid: false, error: 'Invalid subreddit name format' });
    }

    // Check if subreddit exists
    try {
      const info = await reddit.getSubredditInfo(subreddit);
      return c.json({ 
        valid: true, 
        info: {
          name: info.display_name,
          title: info.title,
          subscribers: info.subscribers,
          description: info.public_description,
        }
      });
    } catch (error) {
      return c.json({ valid: false, error: 'Subreddit not found or is private' });
    }
  } catch (error) {
    console.log(`Validate subreddit error: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

// Scan History - Triggers Inngest background job
app.post('/make-server-dc1f2437/scan-history', async (c) => {
  try {
    console.log('==================== SCAN HISTORY START ====================');
    const user = await getAuthUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { projectId, subreddits } = await c.req.json();
    console.log('Request data:', { projectId, subreddits, userId: user.id });

    const profile = await kv.get(`user:${user.id}`);
    console.log('User profile:', { tier: profile?.tier, email: profile?.email });

    const project = await kv.get(`project:${user.id}:${projectId}`);
    console.log('Project data:', {
      name: project?.name,
      description: project?.description?.substring(0, 100),
      hasKeywords: project?.keywords?.length > 0,
      keywordsCount: project?.keywords?.length || 0
    });

    if (!project) {
      console.log('❌ Project not found');
      return c.json({ error: 'Project not found' }, 404);
    }

    // Trigger Inngest background job for scanning
    console.log('[Scan] Triggering Inngest background job');
    await inngest.send({
      name: 'reddit/scan.requested',
      data: {
        projectId,
        userId: user.id,
        subreddits,
        tier: profile?.tier || 'free',
      },
    });

    // Return immediately - scan will run in background
    return c.json({
      status: 'scanning',
      message: 'Scan started in background. Results will appear in your feed shortly.',
      projectId,
      subreddits: subreddits.length,
    });

  } catch (error) {
    console.log(`❌ Scan history error: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

/* Original inline scanning code removed - handled by Inngest function 'scanRedditSubreddits'
// Kept here for reference if needed to revert to inline implementation

app.post('/make-server-dc1f2437/scan-history-inline-backup', async (c) => {
  try {
    // Determine scan days based on tier
    // Free: 1 day, Basic: 30 days, Pro: 90 days
    const scanDays = profile.tier === 'pro' ? 90 : profile.tier === 'basic' ? 30 : 1;
    console.log(`Scan settings: ${scanDays} days for ${profile.tier} tier`);

    // Use project keywords if available, otherwise extract from description
    const keywords = project.keywords && project.keywords.length > 0
      ? project.keywords
      : reddit.extractKeywords(project.description);

    console.log(`✅ Keywords (${keywords.length}):`, keywords);

    const feedItems: any[] = [];
    let totalScanned = 0;
    let withinDateRange = 0;
    let matchedPosts = 0;
    const cutoffDate = Date.now() - (scanDays * 24 * 60 * 60 * 1000);
    console.log(`Cutoff date: ${new Date(cutoffDate).toISOString()}`);

    // Get user's Reddit tokens
    const userTokens = profile.reddit;
    if (!userTokens) {
      console.log('❌ User has not connected Reddit account');
      return c.json({
        error: 'Reddit account not connected. Please connect your Reddit account in settings.',
        requiresRedditAuth: true
      }, 403);
    }

    // Ensure token is valid (refresh if needed)
    let accessToken: string;
    try {
      accessToken = await reddit.getUserToken(userTokens);

      // If token was refreshed, update profile
      if (accessToken !== userTokens.access_token) {
        const newTokens = await reddit.refreshUserToken(userTokens.refresh_token);
        profile.reddit = {
          ...userTokens,
          access_token: newTokens.access_token,
          expires_at: newTokens.expires_at,
        };
        await kv.set(`user:${user.id}`, profile);
        console.log('[Scan] Refreshed user Reddit token');
      }
    } catch (error) {
      console.error('[Scan] Failed to get valid Reddit token:', error);
      return c.json({
        error: 'Failed to authenticate with Reddit. Please reconnect your account.',
        requiresRedditAuth: true
      }, 403);
    }

    // Scan each subreddit
    for (const subreddit of subreddits) {
      try {
        console.log(`\n📡 Fetching posts from r/${subreddit}...`);
        const { posts } = await reddit.getSubredditPostsWithUserToken(accessToken, subreddit, 100);
        console.log(`Retrieved ${posts.length} posts from r/${subreddit}`);

        for (const postData of posts) {
          const postDate = postData.created_utc * 1000;
          totalScanned++;

          if (postDate < cutoffDate) {
            if (totalScanned <= 3) {
              console.log(`⏰ Post too old: "${postData.title.substring(0, 50)}" (${new Date(postDate).toISOString()})`);
            }
            continue;
          }

          withinDateRange++;

          // Check relevance
          const text = `${postData.title} ${postData.selftext}`;
          const debugMode = withinDateRange <= 5;
          const relevanceScore = reddit.calculateRelevanceScore(text, keywords, debugMode);
          const isRelevant = reddit.isRelevant(text, keywords);

          // Log first few posts for debugging
          if (debugMode) {
            console.log(`\n🔍 Post #${withinDateRange}: "${postData.title.substring(0, 60)}"`);
            console.log(`   Date: ${new Date(postDate).toISOString()}`);
            console.log(`   Score: ${relevanceScore}, IsRelevant: ${isRelevant}`);
            console.log(`   Text preview: ${text.substring(0, 100)}...`);
          }

          if (relevanceScore > 0 || isRelevant) {
            matchedPosts++;
            console.log(`✅ MATCH #${matchedPosts}! Title: "${postData.title.substring(0, 60)}" | Score: ${relevanceScore}`);
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
              ai_response: null,
              status: 'pending', // pending, approved, posted, ignored
            };

            await kv.set(`feed:${projectId}:${itemId}`, feedItem);
            feedItems.push(feedItem);
          }
        }

        // Also scan comments for highly relevant posts
        const highRelevancePosts = posts
          .filter(p => {
            const text = `${p.title} ${p.selftext}`;
            return reddit.calculateRelevanceScore(text, keywords) > 20;
          })
          .slice(0, 10); // Limit to top 10 relevant posts

        for (const post of highRelevancePosts) {
          try {
            const comments = await reddit.getPostComments(subreddit, post.id);
            
            for (const comment of comments) {
              const text = comment.body;
              const relevanceScore = reddit.calculateRelevanceScore(text, keywords);

              if (relevanceScore > 0 || reddit.isRelevant(text, keywords)) {
                const itemId = crypto.randomUUID();
                const feedItem = {
                  id: itemId,
                  projectId,
                  type: 'comment',
                  subreddit,
                  title: `Comment on: ${post.title}`,
                  content: comment.body,
                  author: comment.author,
                  url: `https://reddit.com${comment.permalink}`,
                  reddit_id: comment.id,
                  parent_id: post.id,
                  score: comment.score,
                  num_comments: 0,
                  relevance_score: relevanceScore,
                  created_at: reddit.formatRedditTimestamp(comment.created_utc),
                  ai_response: null,
                  status: 'pending',
                };

                await kv.set(`feed:${projectId}:${itemId}`, feedItem);
                feedItems.push(feedItem);
              }
            }
          } catch (error) {
            console.log(`Error fetching comments for post ${post.id}: ${error.message}`);
          }
        }
      } catch (error) {
        console.log(`❌ Error scanning r/${subreddit}: ${error.message}`);
        console.error('Full error:', error);
      }
    }

    // Sort by relevance score
    feedItems.sort((a, b) => b.relevance_score - a.relevance_score);

    console.log('\n==================== SCAN SUMMARY ====================');
    console.log(`Total posts retrieved: ${totalScanned}`);
    console.log(`Posts within date range: ${withinDateRange}`);
    console.log(`Matched posts: ${matchedPosts}`);
    console.log(`Feed items created: ${feedItems.length}`);
    console.log('=======================================================\n');

*/

// Monitor Subreddits - Real-time monitoring
app.post('/make-server-dc1f2437/monitor-subreddits', async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { projectId, subreddits } = await c.req.json();
    
    const project = await kv.get(`project:${user.id}:${projectId}`);
    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const keywords = reddit.extractKeywords(project.description);
    const newItems: any[] = [];

    // Get user's Reddit tokens
    const profile = await kv.get(`user:${user.id}`);
    const userTokens = profile?.reddit;
    if (!userTokens) {
      return c.json({
        error: 'Reddit account not connected. Please connect your Reddit account in settings.',
        requiresRedditAuth: true
      }, 403);
    }

    // Ensure token is valid (refresh if needed)
    let accessToken: string;
    try {
      accessToken = await reddit.getUserToken(userTokens);

      // If token was refreshed, update profile
      if (accessToken !== userTokens.access_token) {
        const newTokens = await reddit.refreshUserToken(userTokens.refresh_token);
        profile.reddit = {
          ...userTokens,
          access_token: newTokens.access_token,
          expires_at: newTokens.expires_at,
        };
        await kv.set(`user:${user.id}`, profile);
      }
    } catch (error) {
      return c.json({
        error: 'Failed to authenticate with Reddit. Please reconnect your account.',
        requiresRedditAuth: true
      }, 403);
    }

    // Get the last scan timestamp for this project
    const lastScanKey = `last_scan:${projectId}`;
    const lastScan = await kv.get(lastScanKey) || { timestamp: Date.now() - 3600000 }; // Default to 1 hour ago

    for (const subreddit of subreddits) {
      try {
        const { posts } = await reddit.getSubredditPostsWithUserToken(accessToken, subreddit, 25);

        for (const postData of posts) {
          const postDate = postData.created_utc * 1000;
          
          // Only process new posts since last scan
          if (postDate <= lastScan.timestamp) continue;

          const text = `${postData.title} ${postData.selftext}`;
          const relevanceScore = reddit.calculateRelevanceScore(text, keywords);

          if (relevanceScore > 0 || reddit.isRelevant(text, keywords)) {
            // Check if already exists
            const existingItems = await kv.getByPrefix(`feed:${projectId}:`);
            const exists = existingItems.some(item => item.reddit_id === postData.id);
            
            if (!exists) {
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
                ai_response: null,
                status: 'pending',
              };

              await kv.set(`feed:${projectId}:${itemId}`, feedItem);
              newItems.push(feedItem);
            }
          }
        }
      } catch (error) {
        console.log(`Error monitoring r/${subreddit}: ${error.message}`);
      }
    }

    // Update last scan timestamp
    await kv.set(lastScanKey, { timestamp: Date.now() });

    return c.json({ newItems: newItems.length, items: newItems });
  } catch (error) {
    console.log(`Monitor subreddits error: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

// Get Feed
app.get('/make-server-dc1f2437/feed/:projectId', async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const projectId = c.req.param('projectId');
    const sortBy = c.req.query('sort') || 'recent';
    
    const project = await kv.get(`project:${user.id}:${projectId}`);
    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    let items = await kv.getByPrefix(`feed:${projectId}:`);

    // Sort based on parameter
    if (sortBy === 'recent') {
      items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'engagement') {
      items.sort((a, b) => (b.score + b.num_comments) - (a.score + a.num_comments));
    } else if (sortBy === 'relevance') {
      // Simple relevance based on score
      items.sort((a, b) => b.score - a.score);
    }

    return c.json(items);
  } catch (error) {
    console.log(`Get feed error: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

// Generate Response
app.post('/make-server-dc1f2437/generate-response', async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { projectId, feedItemId, postContent } = await c.req.json();
    
    const project = await kv.get(`project:${user.id}:${projectId}`);
    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const systemPrompt = project.persona;
    const prompt = `The user posted: "${postContent}"\n\nGenerate a helpful, engaging response about ${project.name}: ${project.description}. Keep it conversational and under 200 words.`;

    const response = await callAzureOpenAI([
      { role: 'user', content: prompt }
    ], systemPrompt);

    // Update feed item with AI response
    const feedItem = await kv.get(`feed:${projectId}:${feedItemId}`);
    if (feedItem) {
      feedItem.ai_response = response;
      await kv.set(`feed:${projectId}:${feedItemId}`, feedItem);
    }

    return c.json({ response });
  } catch (error) {
    console.log(`Generate response error: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

// Generate Post
app.post('/make-server-dc1f2437/generate-post', async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { projectId, subreddit, userPrompt, enhance } = await c.req.json();
    
    const project = await kv.get(`project:${user.id}:${projectId}`);
    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const systemPrompt = project.persona;
    let prompt: string;

    if (enhance) {
      prompt = `Enhance this post for r/${subreddit}: "${userPrompt}"\n\nMake it more engaging and Reddit-appropriate while maintaining the core message. About ${project.name}: ${project.description}`;
    } else {
      prompt = `Create a Reddit post for r/${subreddit} about ${project.name}: ${project.description}. User guidance: ${userPrompt || 'Create an engaging post'}. Make it authentic and valuable.`;
    }

    const response = await callAzureOpenAI([
      { role: 'user', content: prompt }
    ], systemPrompt);

    return c.json({ post: response });
  } catch (error) {
    console.log(`Generate post error: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

// Suggest Post Ideas
app.post('/make-server-dc1f2437/suggest-posts', async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { projectId } = await c.req.json();
    
    const project = await kv.get(`project:${user.id}:${projectId}`);
    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const prompt = `Generate 3 engaging Reddit post ideas for ${project.name}: ${project.description}. Return as JSON array of strings. Example: ["Post idea 1", "Post idea 2", "Post idea 3"]`;

    const response = await callAzureOpenAI([
      { role: 'user', content: prompt }
    ]);

    console.log('OpenAI raw response for post ideas:', response);

    // Use safeJSONParse to handle markdown code blocks
    const suggestions = openai.safeJSONParse(response, []);
    
    console.log('Parsed suggestions:', suggestions);
    return c.json({ suggestions });
  } catch (error) {
    console.log(`Suggest posts error: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

// Update Feed Item
app.patch('/make-server-dc1f2437/feed/:projectId/:itemId', async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const projectId = c.req.param('projectId');
    const itemId = c.req.param('itemId');
    const updates = await c.req.json();

    const feedItem = await kv.get(`feed:${projectId}:${itemId}`);
    if (!feedItem) {
      return c.json({ error: 'Feed item not found' }, 404);
    }

    const updated = { ...feedItem, ...updates };
    await kv.set(`feed:${projectId}:${itemId}`, updated);

    return c.json(updated);
  } catch (error) {
    console.log(`Update feed item error: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

// Reddit OAuth - Initiate Authentication
app.get('/make-server-dc1f2437/reddit/auth', async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const clientId = Deno.env.get('REDDIT_CLIENT_ID');
    if (!clientId) {
      return c.json({ error: 'Reddit OAuth not configured' }, 500);
    }

    // Reddit OAuth URL
    const redirectUri = `https://${Deno.env.get('SUPABASE_PROJECT_ID') || 'vcdfzxjlahsajulpxzsn'}.supabase.co/functions/v1/make-server-dc1f2437/reddit/callback`;
    const state = user.id; // Use user ID as state for verification
    const scope = 'identity read submit'; // Permissions: read user identity, read posts, submit comments

    const authUrl = `https://www.reddit.com/api/v1/authorize?client_id=${clientId}&response_type=code&state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}&duration=permanent&scope=${encodeURIComponent(scope)}`;

    console.log('[Reddit][Auth] Generated OAuth URL', { userId: user.id, redirectUri });

    return c.json({ authUrl });
  } catch (error) {
    console.error('[Reddit][Auth] Error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Reddit OAuth - Callback Handler
app.get('/make-server-dc1f2437/reddit/callback', async (c) => {
  try {
    const code = c.req.query('code');
    const state = c.req.query('state');
    const error = c.req.query('error');

    console.log('[Reddit][Callback] Received callback', { code: !!code, state, error });

    if (error) {
      console.error('[Reddit][Callback] OAuth error:', error);
      return c.redirect(`${Deno.env.get('NEXT_PUBLIC_APP_URL') || 'https://pubhub.dev'}/?reddit_error=${error}`);
    }

    if (!code || !state) {
      return c.json({ error: 'Missing code or state parameter' }, 400);
    }

    // Exchange code for tokens
    const redirectUri = `https://${Deno.env.get('SUPABASE_PROJECT_ID') || 'vcdfzxjlahsajulpxzsn'}.supabase.co/functions/v1/make-server-dc1f2437/reddit/callback`;
    const tokens = await reddit.exchangeCodeForToken(code, redirectUri);

    // Get Reddit username
    const identity = await reddit.getUserIdentity(tokens.access_token);

    console.log('[Reddit][Callback] Successfully authenticated', {
      userId: state,
      redditUsername: identity.name,
    });

    // Store tokens in user profile
    const profile = await kv.get(`user:${state}`);
    if (!profile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    profile.reddit = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expires_at,
      scope: tokens.scope,
      username: identity.name,
      connected_at: new Date().toISOString(),
    };

    await kv.set(`user:${state}`, profile);

    // Redirect back to home page with success
    return c.redirect(`${Deno.env.get('NEXT_PUBLIC_APP_URL') || 'https://pubhub.dev'}/?reddit_connected=true`);
  } catch (error) {
    console.error('[Reddit][Callback] Error:', error);
    return c.redirect(`${Deno.env.get('NEXT_PUBLIC_APP_URL') || 'https://pubhub.dev'}/?reddit_error=failed`);
  }
});

// Reddit OAuth - Check Connection Status
app.get('/make-server-dc1f2437/reddit/status', async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    if (!profile || !profile.reddit) {
      return c.json({ connected: false });
    }

    return c.json({
      connected: true,
      username: profile.reddit.username,
      connected_at: profile.reddit.connected_at,
    });
  } catch (error) {
    console.error('[Reddit][Status] Error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Reddit OAuth - Disconnect Account
app.post('/make-server-dc1f2437/reddit/disconnect', async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    // Remove Reddit credentials
    delete profile.reddit;
    await kv.set(`user:${user.id}`, profile);

    console.log('[Reddit][Disconnect] Disconnected Reddit account', { userId: user.id });

    return c.json({ success: true });
  } catch (error) {
    console.error('[Reddit][Disconnect] Error:', error);
    return c.json({ error: error.message }, 500);
  }
});

Deno.serve(app.fetch);
