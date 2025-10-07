import { useState } from "react";
import { Button } from "./ui/button";
import { PubHubLogo } from "./PubHubLogo";
import {
  LayoutDashboard,
  PenSquare,
  Calendar,
  BarChart3,
  Sparkles,
  Video,
  Zap,
  Globe,
  Users,
  Clock,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [email, setEmail] = useState("");

  const features = [
    {
      icon: PenSquare,
      title: "Unified Content Creation",
      description: "Create once, publish everywhere. Compose content optimized for each platform from a single interface.",
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Plan your content strategy with visual calendar views and automated posting across all platforms.",
    },
    {
      icon: BarChart3,
      title: "Comprehensive Analytics",
      description: "Track performance across all platforms with unified metrics and actionable insights.",
    },
    {
      icon: Sparkles,
      title: "AI-Powered Assistance",
      description: "Get content suggestions, caption generation, and optimization recommendations from our AI assistant.",
    },
    {
      icon: Video,
      title: "Media Library",
      description: "Centralize all your media assets with smart organization and AI-powered transformations.",
    },
    {
      icon: Zap,
      title: "Workflow Automation",
      description: "Set up automated workflows to save time and maintain consistency across your content strategy.",
    },
  ];

  const platforms = [
    "Twitter",
    "Instagram",
    "LinkedIn",
    "Facebook",
    "YouTube",
    "TikTok",
    "Pinterest",
    "Reddit",
  ];

  const benefits = [
    {
      icon: Clock,
      title: "Save 10+ Hours Weekly",
      description: "Streamline your content workflow and focus on what matters most - creating great content.",
    },
    {
      icon: TrendingUp,
      title: "Grow Faster",
      description: "Leverage data-driven insights to optimize your content strategy and reach more people.",
    },
    {
      icon: Users,
      title: "Engage Better",
      description: "Manage all interactions from a unified inbox and never miss an important comment or message.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <PubHubLogo className="h-8 w-auto" />
            </div>
            <Button onClick={onGetStarted} variant="default">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm mb-8">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>The all-in-one creator platform</span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl mb-6">
              Manage All Your Social Media
              <span className="text-primary block mt-2">In One Place</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Create, schedule, and analyze your content across all major platforms.
              Save time, grow faster, and engage better with your audience.
            </p>

            {/* Email Signup */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-4 py-3 rounded-lg border border-input bg-background w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button size="lg" onClick={onGetStarted} className="w-full sm:w-auto">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              No credit card required • Free 14-day trial
            </p>
          </div>

          {/* Platform Logos */}
          <div className="mt-16 max-w-4xl mx-auto">
            <p className="text-center text-sm text-muted-foreground mb-6">
              WORKS WITH ALL MAJOR PLATFORMS
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
              {platforms.map((platform) => (
                <div
                  key={platform}
                  className="flex items-center justify-center px-4 py-2 rounded-lg bg-muted/50 border border-border/50"
                >
                  <span className="text-sm font-medium">{platform}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-32 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to help creators manage their entire content workflow.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="border-border/50 bg-background/50 backdrop-blur">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Why Creators Love PubHub
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands of creators who have transformed their social media workflow.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
                    <benefit.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Ready to Transform Your Content Workflow?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Start your free 14-day trial today. No credit card required.
            </p>
            <Button size="lg" onClick={onGetStarted} className="text-lg px-8 py-6">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <PubHubLogo className="h-6 w-auto" />
              <span className="text-sm text-muted-foreground">
                © 2025 PubHub. All rights reserved.
              </span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
