import { AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

export function DemoModeBanner() {
  return (
    <Alert className="mb-4 bg-blue-50 border-blue-200">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-900">
        <strong>Demo Mode Active:</strong> Your Clerk production keys are configured for <code className="px-1 py-0.5 bg-blue-100 rounded">pubhub.dev</code>, 
        but you're accessing the app from a different domain. The app is using demo user mode so all features work normally. 
        When you deploy to <code className="px-1 py-0.5 bg-blue-100 rounded">pubhub.dev</code>, full authentication will work automatically.
      </AlertDescription>
    </Alert>
  );
}
