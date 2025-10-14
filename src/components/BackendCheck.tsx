import { useEffect, useState } from 'react';
import { projectId } from '../utils/supabase/info';

export function BackendCheck() {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    checkBackend();
  }, []);

  const checkBackend = async () => {
    const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-dc1f2437/health`;
    console.log('Checking backend at:', apiUrl);
    
    try {
      const response = await fetch(apiUrl);
      console.log('Backend response:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Backend data:', data);
        setStatus('online');
      } else {
        setStatus('offline');
        setError(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err: any) {
      console.error('Backend check failed:', err);
      setStatus('offline');
      setError(err.message);
    }
  };

  if (status === 'checking') {
    return (
      <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 rounded-lg p-4 shadow-lg">
        <p className="text-sm text-yellow-800">Checking backend connection...</p>
      </div>
    );
  }

  if (status === 'offline') {
    return (
      <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 rounded-lg p-4 shadow-lg max-w-md">
        <h3 className="font-semibold text-red-800 mb-2">⚠️ Backend Offline</h3>
        <p className="text-sm text-red-700 mb-2">
          Cannot connect to the API server. Please deploy the Edge Function.
        </p>
        <p className="text-xs text-red-600 font-mono">{error}</p>
        <button
          onClick={checkBackend}
          className="mt-2 text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 rounded-lg p-3 shadow-lg">
      <p className="text-sm text-green-800">✓ Backend Online</p>
    </div>
  );
}
