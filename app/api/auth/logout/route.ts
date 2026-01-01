import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Sign out the user with Supabase Auth
    const { error } = await supabase.auth.signOut();

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({ message: 'Logout successful' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: 'Logout failed', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}