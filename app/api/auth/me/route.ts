import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get current session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return new Response(
        JSON.stringify({ error: 'No active session' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get user info from session
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser(session.access_token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: userError?.message || 'Could not retrieve user' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Return user data
    return new Response(
      JSON.stringify({
        user: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || null
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: 'Failed to get user info', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}