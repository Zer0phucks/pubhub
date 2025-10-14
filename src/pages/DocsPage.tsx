import { Book, Rocket, Settings, MessageSquare, Shield, Zap } from 'lucide-react';

export function DocsPage() {
  const sections = [
    {
      icon: Rocket,
      title: 'Getting Started',
      content: [
        {
          subtitle: 'Create Your First Project',
          text: 'After signing up, click "Create Project" and describe your app. Our AI will analyze your description and suggest relevant subreddits where your target audience hangs out.',
        },
        {
          subtitle: 'Add Subreddits',
          text: 'Review the AI suggestions and add subreddits to monitor. You can also manually add subreddits you know are relevant to your app.',
        },
        {
          subtitle: 'Configure Historical Scan',
          text: 'Choose how far back you want to scan (30 days for Basic, 90 days for Pro). This helps you catch up on past conversations.',
        },
      ],
    },
    {
      icon: MessageSquare,
      title: 'Using the Feed',
      content: [
        {
          subtitle: 'Understanding Feed Items',
          text: 'Your feed combines Reddit posts, comments, and DMs that mention topics relevant to your app. Each item shows the context, engagement metrics, and an AI-generated response suggestion.',
        },
        {
          subtitle: 'Sorting and Filtering',
          text: 'Use the sort options to prioritize by date, engagement level, or sentiment. Filter by post type, subreddit, or keyword to focus on what matters most.',
        },
        {
          subtitle: 'AI-Generated Responses',
          text: 'For each feed item, PubHub generates a contextual, authentic response. Review the suggestion, edit if needed, and approve to post directly to Reddit.',
        },
      ],
    },
    {
      icon: Settings,
      title: 'Project Settings',
      content: [
        {
          subtitle: 'Custom AI Personas',
          text: 'Configure how your AI responds by setting tone (professional, casual, technical), response length, and key talking points. This ensures responses match your brand voice.',
        },
        {
          subtitle: 'Subreddit Management',
          text: 'Add or remove subreddits, view scanning status, and see engagement metrics for each community you monitor.',
        },
        {
          subtitle: 'Notification Preferences',
          text: 'Set up email or webhook notifications for high-priority mentions, helping you respond quickly to important conversations.',
        },
      ],
    },
    {
      icon: Zap,
      title: 'Creating Posts',
      content: [
        {
          subtitle: 'AI-Assisted Post Creation',
          text: 'Use the "Create Post" feature to draft new Reddit posts. Provide a topic and target subreddit, and our AI will generate authentic, community-friendly content.',
        },
        {
          subtitle: 'Best Practices',
          text: 'Always review AI-generated content before posting. Ensure it follows subreddit rules, provides value, and doesn\'t come across as promotional.',
        },
        {
          subtitle: 'Scheduling',
          text: 'Pro users can schedule posts for optimal engagement times based on subreddit activity patterns.',
        },
      ],
    },
    {
      icon: Shield,
      title: 'Privacy & Security',
      content: [
        {
          subtitle: 'Reddit Authentication',
          text: 'PubHub uses OAuth to securely connect to your Reddit account. We only request the permissions needed for monitoring and posting.',
        },
        {
          subtitle: 'Data Storage',
          text: 'We store feed data securely and delete it according to your tier\'s retention period. You can export or delete your data at any time.',
        },
        {
          subtitle: 'AI Processing',
          text: 'All AI processing uses Azure OpenAI with enterprise-grade security. Your data is never used to train models.',
        },
      ],
    },
    {
      icon: Book,
      title: 'API & Integrations',
      content: [
        {
          subtitle: 'Webhook Support (Pro)',
          text: 'Configure webhooks to receive real-time notifications when new mentions are detected. Perfect for integrating with Slack, Discord, or custom systems.',
        },
        {
          subtitle: 'API Access (Pro)',
          text: 'Use our REST API to programmatically create projects, fetch feed items, and generate responses. Full documentation available in your dashboard.',
        },
        {
          subtitle: 'Export Data',
          text: 'Export your feed data as CSV or JSON for analysis in external tools. Available on all tiers.',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50">
      {/* Header */}
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl text-center space-y-4">
          <h1 className="text-5xl sm:text-6xl bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent">
            Documentation
          </h1>
          <p className="text-xl text-gray-600">
            Everything you need to know about using PubHub
          </p>
        </div>
      </section>

      {/* Documentation Content */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl space-y-16">
          {sections.map((section, sectionIndex) => (
            <div
              key={sectionIndex}
              className="bg-white rounded-2xl p-8 shadow-lg border border-teal-200/50"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 flex items-center justify-center">
                  <section.icon className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-3xl text-gray-900">{section.title}</h2>
              </div>

              <div className="space-y-8">
                {section.content.map((item, itemIndex) => (
                  <div key={itemIndex} className="space-y-2">
                    <h3 className="text-xl text-gray-900">{item.subtitle}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Support CTA */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 rounded-2xl p-8 text-center text-white space-y-4">
            <h2 className="text-3xl">Need More Help?</h2>
            <p className="text-xl text-white/90">
              Our support team is here to help you succeed
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button className="px-6 py-3 bg-white text-teal-600 rounded-lg hover:bg-gray-50 transition-colors">
                Contact Support
              </button>
              <button className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-colors">
                Join Community
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
