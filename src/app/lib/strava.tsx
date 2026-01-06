import axios from 'axios';

const STRAVA_API_BASE = 'https://www.strava.com/api/v3';
const STRAVA_AUTH_URL = 'https://www.strava.com/oauth/token';

// Get environment variables
const getClientCredentials = () => ({
  clientId: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID,
  clientSecret: process.env.NEXT_PUBLIC_STRAVA_CLIENT_SECRET,
});

// Exchange authorization code for access token
export async function getAccessToken(code: string) {
  const { clientId, clientSecret } = getClientCredentials();

  try {
    const res = await axios.post(STRAVA_AUTH_URL, {
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
    });

    const tokenData = res.data;
    localStorage.setItem('stravaAccessToken', JSON.stringify(tokenData));

    return tokenData;
  } catch (error) {
    console.error('Failed to get access token:', error);
    throw error;
  }
}

// Refresh access token if expired
export async function refreshAccessToken(refreshToken: string) {
  const { clientId, clientSecret } = getClientCredentials();

  try {
    const res = await axios.post(STRAVA_AUTH_URL, {
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });

    const tokenData = res.data;
    localStorage.setItem('stravaAccessToken', JSON.stringify(tokenData));

    return tokenData;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    throw error;
  }
}

// Check if token is expired and refresh if needed
export async function getValidAccessToken(): Promise<string | null> {
  const stored = localStorage.getItem('stravaAccessToken');
  if (!stored) return null;

  try {
    const tokenData = JSON.parse(stored);
    const expiresAt = tokenData.expires_at * 1000; // Convert to milliseconds

    // If token expires in less than 5 minutes, refresh it
    if (Date.now() > expiresAt - 5 * 60 * 1000) {
      const newTokenData = await refreshAccessToken(tokenData.refresh_token);
      return newTokenData.access_token;
    }

    return tokenData.access_token;
  } catch (error) {
    console.error('Failed to get valid access token:', error);
    return null;
  }
}

// Get authenticated athlete's activities with optional date range
export async function getActivities(
  accessToken: string,
  options?: {
    perPage?: number;
    after?: Date; // Start date
    before?: Date; // End date
  }
) {
  const { perPage = 100, after, before } = options || {};

  try {
    const params: any = {
      per_page: perPage,
    };

    // Convert dates to Unix timestamps (seconds)
    if (after) {
      params.after = Math.floor(after.getTime() / 1000);
    }
    if (before) {
      params.before = Math.floor(before.getTime() / 1000);
    }

    const res = await axios.get(`${STRAVA_API_BASE}/athlete/activities`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params,
    });
    return res.data;
  } catch (error) {
    console.error('Failed to fetch activities:', error);
    throw error;
  }
}

// Get club activities (Blusukan Club)
export async function getClubActivities(
  accessToken: string,
  clubId: string = '1199959',
  perPage: number = 200
) {
  try {
    const response = await axios.get(
      `${STRAVA_API_BASE}/clubs/${clubId}/activities`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          per_page: perPage,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Failed to fetch club activities:', error);
    throw error;
  }
}

// Get athlete profile
export async function getAthlete(accessToken: string) {
  try {
    const res = await axios.get(`${STRAVA_API_BASE}/athlete`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error('Failed to fetch athlete:', error);
    throw error;
  }
}

// Get club details
export async function getClub(accessToken: string, clubId: string = '1199959') {
  try {
    const res = await axios.get(`${STRAVA_API_BASE}/clubs/${clubId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error('Failed to fetch club:', error);
    throw error;
  }
}
