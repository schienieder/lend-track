import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { loginSchema } from '@/schemas/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    const { email, password } = validatedData;

    // Sign in the user with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Return user data on successful login
    return new Response(
      JSON.stringify({
        message: 'Login successful',
        user: {
          id: data.user?.id,
          email: data.user?.email,
          name: data.user?.user_metadata?.name || null
        },
        session: data.session
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: error.errors }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Login failed', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}