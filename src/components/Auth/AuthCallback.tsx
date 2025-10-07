import { useEffect, useState } from 'react';
import { PubHubLogo } from '../PubHubLogo';
import { API_URL } from '@/config/env';

export function AuthCallback() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      // Get authorization code from URL
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const errorParam = params.get('error');

      if (errorParam) {
        setError('Authentication failed. Please try again.');
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
        return;
      }

      if (!code) {
        setError('No authorization code received');
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/callback?code=${code}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Authentication failed');
        }

        // Store session
        if (data.session) {
          localStorage.setItem('session', JSON.stringify(data.session));
        }

        // Redirect to app
        window.location.href = '/';
      } catch (err: any) {
        console.error('Callback error:', err);
        setError(err.message || 'Failed to complete authentication');
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <PubHubLogo className="h-16 w-auto mx-auto mb-4" />
        {error ? (
          <>
            <p className="text-destructive mb-2">{error}</p>
            <p className="text-sm text-muted-foreground">Redirecting...</p>
          </>
        ) : (
          <>
            <p className="mb-2">Completing sign-in...</p>
            <p className="text-sm text-muted-foreground">Please wait</p>
          </>
        )}
      </div>
    </div>
  );
}
