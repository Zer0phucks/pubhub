import { useState } from 'react';
import { X, AlertCircle, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';

export function SetupBanner() {
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem('setup-banner-dismissed') === 'true';
  });

  const handleDismiss = () => {
    localStorage.setItem('setup-banner-dismissed', 'true');
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <Alert className="mb-6 border-teal-200 bg-gradient-to-r from-teal-50 to-emerald-50">
      <AlertCircle className="h-4 w-4 text-teal-600" />
      <AlertTitle className="flex items-center justify-between">
        <span>Welcome to PubHub!</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertTitle>
      <AlertDescription className="mt-2 text-sm">
        <p className="mb-2">
          To get started, make sure you've configured your API keys:
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Clerk Secret Key (for authentication)</li>
          <li>Azure OpenAI credentials (for AI features)</li>
          <li>Reddit API credentials (for monitoring)</li>
        </ul>
        <a
          href="/SETUP.md"
          target="_blank"
          className="inline-flex items-center gap-1 mt-3 text-teal-600 hover:underline"
        >
          View setup guide
          <ExternalLink className="h-3 w-3" />
        </a>
      </AlertDescription>
    </Alert>
  );
}
