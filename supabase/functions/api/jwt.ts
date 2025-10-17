// JWT verification utilities for Clerk tokens

/**
 * Verify Clerk JWT token by calling Clerk's API
 * This is more reliable than trying to verify signatures locally
 * as Clerk rotates keys and uses JWKS
 */
export async function verifyClerkToken(token: string): Promise<any> {
  const clerkSecretKey = Deno.env.get('CLERK_SECRET_KEY');
  if (!clerkSecretKey) {
    throw new Error('CLERK_SECRET_KEY not configured');
  }

  try {
    // Use Clerk's session verification API
    const response = await fetch('https://api.clerk.dev/v1/sessions/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${clerkSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      throw new Error(`Clerk verification failed: ${response.status}`);
    }

    const session = await response.json();

    // Check if session is active
    if (session.status !== 'active') {
      throw new Error('Session is not active');
    }

    return {
      userId: session.user_id,
      sessionId: session.id,
      ...session,
    };
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
}

/**
 * Helper to decode JWT payload without verification
 * ONLY use this for non-production or when verification is handled elsewhere
 */
export function decodeJWTPayload(token: string): any {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }

  try {
    return JSON.parse(base64UrlDecode(parts[1]));
  } catch (error) {
    throw new Error('Failed to decode JWT payload');
  }
}

/**
 * Decode base64url string to regular string
 */
function base64UrlDecode(str: string): string {
  // Replace URL-safe characters
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');

  // Add padding
  const padding = base64.length % 4;
  if (padding > 0) {
    base64 += '='.repeat(4 - padding);
  }

  // Decode
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return new TextDecoder().decode(bytes);
}
