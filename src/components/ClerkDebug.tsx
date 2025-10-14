import { useAuth, useUser } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Card } from './ui/card';

export function ClerkDebug() {
  const { isSignedIn, isLoaded, userId } = useAuth();
  const { user } = useUser();
  const [tokenStatus, setTokenStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [tokenError, setTokenError] = useState<string>('');
  const { getToken } = useAuth();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      checkToken();
    }
  }, [isLoaded, isSignedIn]);

  const checkToken = async () => {
    try {
      const token = await getToken();
      if (token) {
        setTokenStatus('success');
        console.log('Token successfully retrieved');
        
        // Try to decode the token to see what's inside
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          console.log('Token payload:', {
            sub: payload.sub,
            iss: payload.iss,
            exp: new Date(payload.exp * 1000).toISOString(),
          });
        }
      } else {
        setTokenStatus('error');
        setTokenError('No token returned');
      }
    } catch (error) {
      setTokenStatus('error');
      setTokenError(error instanceof Error ? error.message : String(error));
      console.error('Token retrieval error:', error);
    }
  };

  if (!isLoaded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium">Clerk Loading...</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className={`p-4 ${
        tokenStatus === 'success' ? 'bg-green-50 border-green-200' : 
        tokenStatus === 'error' ? 'bg-red-50 border-red-200' : 
        'bg-blue-50 border-blue-200'
      }`}>
        <div className="flex items-start gap-2">
          {tokenStatus === 'success' && <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />}
          {tokenStatus === 'error' && <XCircle className="h-5 w-5 text-red-600 mt-0.5" />}
          {tokenStatus === 'loading' && <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />}
          
          <div className="space-y-1">
            <p className="text-sm font-medium">Clerk Status</p>
            <div className="text-xs space-y-0.5">
              <p>User ID: {userId?.substring(0, 12)}...</p>
              <p>Email: {user?.primaryEmailAddress?.emailAddress}</p>
              <p>Token: {tokenStatus}</p>
              {tokenError && <p className="text-red-600">Error: {tokenError}</p>}
            </div>
            <button
              onClick={checkToken}
              className="text-xs underline mt-2"
            >
              Refresh Token
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
