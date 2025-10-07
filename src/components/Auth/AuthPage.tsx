import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { PubHubLogo } from '../PubHubLogo';

interface AuthPageProps {
  onAuthenticated: () => void;
}

export function AuthPage({ onAuthenticated }: AuthPageProps) {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <PubHubLogo />
          <h1 className="mt-6 text-3xl font-bold">PubHub</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Multi-platform content creator dashboard
          </p>
        </div>

        {showLogin ? (
          <LoginForm
            onSuccess={onAuthenticated}
            onSwitchToSignup={() => setShowLogin(false)}
          />
        ) : (
          <SignupForm
            onSuccess={onAuthenticated}
            onSwitchToLogin={() => setShowLogin(true)}
          />
        )}
      </div>
    </div>
  );
}
