import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';
import * as reddit from './reddit.tsx';
import * as openai from './openai.tsx';
import * as openrouter from './openrouter.tsx';

const app = new Hono();

// Configure CORS to allow all origins for development
app.use('*', cors({
  origin: '*',
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

// Helper to decode base64url (used in JWT)
function base64UrlDecode(str: string): string {
  try {
    // Replace URL-safe characters with standard base64 characters
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    
    // Add padding if needed
    const padding = base64.length % 4;
    if (padding > 0) {
      base64 += '='.repeat(4 - padding);
    }
    
    // Decode from base64 using TextDecoder
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    return new TextDecoder().decode(bytes);
  } catch (error) {
    console.error('Error in base64UrlDecode:', error);
    throw error;
  }
}

// Helper to get authenticated user from Clerk or Supabase
async function getAuthUser(request: Request) {
  const authHeader = request.headers.get('Authorization');

  console.log('==================== AUTH CHECK ====================');
  console.log('Authorization header:', authHeader ? 'Present' : 'Missing');

  if (!authHeader) {
    console.log('No auth header - using demo user');
    return {
      id: 'demo-user-123',
      email: 'demo@pubhub.test',
      name: 'Demo User',
    };
  }

  const token = authHeader.replace('Bearer ', '');
  if (!token || token === authHeader) {
    console.log('No Bearer token - using demo user');
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
    console.log('✅ Supabase anon key detected - using demo user for public access');
    console.log('==================================================');
    return {
      id: 'demo-user-123',
      email: 'demo@pubhub.test',
      name: 'Demo User',
    };
  }
  
  try {
    const clerkSecretKey = Deno.env.get('CLERK_SECRET_KEY');
    console.log('CLERK_SECRET_KEY configured:', clerkSecretKey ? 'Yes' : 'No');
    
    if (!clerkSecretKey) {
      console.log('No Clerk secret key - using demo user');
      return {
        id: 'demo-user-123',
        email: 'demo@pubhub.test',
        name: 'Demo User',
      };
    }

    // Split JWT into parts
    const parts = token.split('.');
    console.log('JWT parts count:', parts.length);
    
    if (parts.length !== 3) {
      console.log('Invalid JWT format - using demo user');
      return {
        id: 'demo-user-123',
        email: 'demo@pubhub.test',
        name: 'Demo User',
      };
    }

    // Decode the payload (middle part)
    let payload;
    try {
      const decodedPayload = base64UrlDecode(parts[1]);
      payload = JSON.parse(decodedPayload);
      console.log('JWT payload decoded:', {
        sub: payload.sub,
        email: payload.email,
        exp: payload.exp,
        iat: payload.iat,
        iss: payload.iss,
      });
    } catch (decodeError) {
      console.error('Failed to decode JWT payload:', decodeError);
      console.log('Using demo user');
      return {
        id: 'demo-user-123',
        email: 'demo@pubhub.test',
        name: 'Demo User',
      };
    }
    
    // Check if token is expired
    const now = Date.now() / 1000;
    if (payload.exp && payload.exp < now) {
      console.log('Token expired:', { exp: payload.exp, now, diff: now - payload.exp });
      console.log('Using demo user');
      return {
        id: 'demo-user-123',
        email: 'demo@pubhub.test',
        name: 'Demo User',
      };
    }

    // Get user ID from the payload
    const userId = payload.sub;
    
    if (!userId) {
      console.log('No user ID in payload - using demo user');
      return {
        id: 'demo-user-123',
        email: 'demo@pubhub.test',
        name: 'Demo User',
      };
    }

    // Successfully decoded and validated
    console.log('✅ Authentication successful for user:', userId);
    console.log('==================================================');
    
    return {
      id: userId,
      email: payload.email || payload.email_addresses?.[0]?.email_address || 'user@example.com',
      name: payload.name || payload.given_name || payload.first_name || 'User',
    };
  } catch (error) {
    console.error('Error in getAuthUser:', error);
    console.log('Using demo user');
    console.log('==================================================');
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
      tier: 'free', // free, basic, pro
      theme: 'system',
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

    const limits = { free: 1, basic: 5, pro: Infinity };
    const limit = limits[profile.tier] || 1;

    if (existingProjects.length >= limit) {
      return c.json({ error: `Project limit reached for ${profile.tier} tier` }, 400);
    }

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

// Scan History - Enhanced with better relevance scoring
app.post('/make-server-dc1f2437/scan-history', async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { projectId, subreddits } = await c.req.json();
    
    const profile = await kv.get(`user:${user.id}`);
    const project = await kv.get(`project:${user.id}:${projectId}`);
    
    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    // Determine scan days based on tier
    // Free: 1 day, Basic: 30 days, Pro: 90 days
    const scanDays = profile.tier === 'pro' ? 90 : profile.tier === 'basic' ? 30 : 1;

    // Use project keywords if available, otherwise extract from description
    const keywords = project.keywords && project.keywords.length > 0
      ? project.keywords
      : reddit.extractKeywords(project.description);

    console.log(`Scanning with keywords: ${keywords.join(', ')}`);

    const feedItems: any[] = [];
    let totalScanned = 0;
    const cutoffDate = Date.now() - (scanDays * 24 * 60 * 60 * 1000);

    // Scan each subreddit
    for (const subreddit of subreddits) {
      try {
        const { posts } = await reddit.getSubredditPosts(subreddit, 100);

        for (const postData of posts) {
          const postDate = postData.created_utc * 1000;
          totalScanned++;

          if (postDate < cutoffDate) continue;

          // Check relevance
          const text = `${postData.title} ${postData.selftext}`;
          const relevanceScore = reddit.calculateRelevanceScore(text, keywords);

          if (relevanceScore > 0 || reddit.isRelevant(text, keywords)) {
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
        console.log(`Error scanning r/${subreddit}: ${error.message}`);
      }
    }

    // Sort by relevance score
    feedItems.sort((a, b) => b.relevance_score - a.relevance_score);

    return c.json({
      scanned: totalScanned,
      newItems: feedItems.length,
      items: feedItems
    });
  } catch (error) {
    console.log(`Scan history error: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

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

    // Get the last scan timestamp for this project
    const lastScanKey = `last_scan:${projectId}`;
    const lastScan = await kv.get(lastScanKey) || { timestamp: Date.now() - 3600000 }; // Default to 1 hour ago

    for (const subreddit of subreddits) {
      try {
        const { posts } = await reddit.getSubredditPosts(subreddit, 25);

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

Deno.serve(app.fetch);
