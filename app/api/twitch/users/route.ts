import { NextRequest, NextResponse } from 'next/server';

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

async function getTwitchAccessToken() {
  const response = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: TWITCH_CLIENT_ID!,
      client_secret: TWITCH_CLIENT_SECRET!,
      grant_type: 'client_credentials',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to get Twitch access token');
  }

  const data = await response.json();
  return data.access_token;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userLogins = searchParams.get('user_logins');

    if (!userLogins) {
      return NextResponse.json({ error: 'user_logins parameter is required' }, { status: 400 });
    }

    if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) {
      return NextResponse.json({ error: 'Twitch credentials not configured' }, { status: 500 });
    }

    const accessToken = await getTwitchAccessToken();

    const response = await fetch(`https://api.twitch.tv/helix/users?login=${userLogins}`, {
      headers: {
        'Client-ID': TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Twitch API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching Twitch users:', error);
    return NextResponse.json({ error: 'Failed to fetch Twitch users' }, { status: 500 });
  }
} 