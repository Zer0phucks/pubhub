import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { CheckCircle2, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { CreateProjectModal } from './CreateProjectModal';
import { api } from '../lib/api';

interface OnboardingProps {
  userTier: string;
  onComplete: () => void;
}

export function Onboarding({ userTier, onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState<'reddit' | 'project'>('reddit');
  const [redditStatus, setRedditStatus] = useState<any>(null);
  const [loadingRedditStatus, setLoadingRedditStatus] = useState(true);
  const [connectingReddit, setConnectingReddit] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);

  useEffect(() => {
    loadRedditStatus();
  }, []);

  useEffect(() => {
    // Check if Reddit is already connected, skip to project step
    if (redditStatus?.connected && currentStep === 'reddit') {
      setCurrentStep('project');
    }
  }, [redditStatus]);

  const loadRedditStatus = async () => {
    setLoadingRedditStatus(true);
    try {
      const status = await api.getRedditStatus();
      setRedditStatus(status);
    } catch (error) {
      console.error('Error loading Reddit status:', error);
    } finally {
      setLoadingRedditStatus(false);
    }
  };

  const handleConnectReddit = async () => {
    setConnectingReddit(true);
    try {
      const { authUrl } = await api.getRedditAuthUrl();
      // Store that we're in onboarding flow
      sessionStorage.setItem('onboarding_flow', 'true');
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error connecting Reddit:', error);
      alert('Failed to connect Reddit account');
      setConnectingReddit(false);
    }
  };

  const handleProjectCreated = () => {
    setShowProjectModal(false);
    // Complete onboarding
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-5xl mb-2 bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent">
            Welcome to PubHub
          </h1>
          <p className="text-xl text-muted-foreground">
            Let's get you set up in 2 quick steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center items-center gap-4">
          <div className={`flex items-center gap-2 ${currentStep === 'reddit' ? 'text-teal-600' : redditStatus?.connected ? 'text-green-600' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              redditStatus?.connected
                ? 'bg-green-100'
                : currentStep === 'reddit'
                  ? 'bg-teal-100'
                  : 'bg-gray-100'
            }`}>
              {redditStatus?.connected ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <span className="font-semibold">1</span>
              )}
            </div>
            <span className="font-medium">Connect Reddit</span>
          </div>

          <ArrowRight className="h-5 w-5 text-muted-foreground" />

          <div className={`flex items-center gap-2 ${currentStep === 'project' ? 'text-teal-600' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep === 'project' ? 'bg-teal-100' : 'bg-gray-100'
            }`}>
              <span className="font-semibold">2</span>
            </div>
            <span className="font-medium">Create Project</span>
          </div>
        </div>

        {/* Step Content */}
        {currentStep === 'reddit' && (
          <Card className="border-2 border-teal-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🔗</span>
                Step 1: Connect Your Reddit Account
              </CardTitle>
              <CardDescription>
                Connect your Reddit account to scan subreddits and engage with relevant discussions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingRedditStatus ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                </div>
              ) : redditStatus?.connected ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-green-900">Connected as u/{redditStatus.username}</p>
                      <p className="text-sm text-green-700">
                        Your Reddit account is connected and ready to use
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setCurrentStep('project')}
                    className="w-full bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 text-lg py-6"
                  >
                    Continue to Project Setup
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <AlertCircle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <p className="font-medium text-orange-900">Why Connect Reddit?</p>
                      <ul className="text-sm text-orange-800 space-y-1 list-disc list-inside">
                        <li>Scan subreddits for relevant discussions about your product</li>
                        <li>Generate AI-powered responses to engage with users</li>
                        <li>Post and comment directly from PubHub</li>
                        <li>Track conversations and measure engagement</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-muted-foreground">
                      <strong>Secure Connection:</strong> We use Reddit's official OAuth2 authentication.
                      We only request the minimum permissions needed and never store your password.
                    </p>
                  </div>

                  <Button
                    onClick={handleConnectReddit}
                    disabled={connectingReddit}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-lg py-6"
                  >
                    {connectingReddit ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Connecting to Reddit...
                      </>
                    ) : (
                      <>
                        Connect Reddit Account
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {currentStep === 'project' && (
          <Card className="border-2 border-teal-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🚀</span>
                Step 2: Create Your First Project
              </CardTitle>
              <CardDescription>
                Tell us about your product or service to start finding relevant Reddit conversations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                <p className="text-sm text-teal-900">
                  <strong>What's a Project?</strong> A project represents your product, service, or brand.
                  You can create multiple projects to track different products or campaigns.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">AI-Powered Keyword Extraction</p>
                    <p className="text-sm text-muted-foreground">We'll automatically identify relevant keywords from your description</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Smart Subreddit Suggestions</p>
                    <p className="text-sm text-muted-foreground">Get AI recommendations for the best subreddits to monitor</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Custom AI Persona</p>
                    <p className="text-sm text-muted-foreground">Define how AI should respond on your behalf</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setShowProjectModal(true)}
                className="w-full bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 text-lg py-6"
              >
                Create Your First Project
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Helper Text */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Need help? Check out our{' '}
            <a href="#" className="text-teal-600 hover:underline">
              quick start guide
            </a>
            {' '}or{' '}
            <a href="#" className="text-teal-600 hover:underline">
              watch the tutorial video
            </a>
          </p>
        </div>
      </div>

      {/* Project Creation Modal */}
      <CreateProjectModal
        open={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onSuccess={handleProjectCreated}
        userTier={userTier}
      />
    </div>
  );
}
