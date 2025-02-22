
import { createHmac } from "node:crypto";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BEARER_TOKEN = Deno.env.get("TWITTER_BEARER_TOKEN")?.trim();

function validateEnvironmentVariables() {
  if (!BEARER_TOKEN) {
    throw new Error("TWITTER_BEARER_TOKEN environment variable is not configured");
  }
}

async function fetchTweetsWithBearer(userId: string) {
  console.log("Fetching tweets with Bearer token for user ID:", userId);
  
  // Add retry mechanism for rate limiting
  const maxRetries = 3;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      const tweetsResponse = await fetch(
        `https://api.twitter.com/2/users/${userId}/tweets?tweet.fields=created_at,text&max_results=10`,
        {
          headers: {
            'Authorization': `Bearer ${BEARER_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Handle rate limiting
      if (tweetsResponse.status === 429) {
        const retryAfter = tweetsResponse.headers.get('retry-after');
        const delay = (retryAfter ? parseInt(retryAfter) : 60) * 1000;
        console.log(`Rate limited. Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        attempt++;
        continue;
      }

      if (!tweetsResponse.ok) {
        const errorText = await tweetsResponse.text();
        console.error("Twitter API Error (getTweets):", {
          status: tweetsResponse.status,
          statusText: tweetsResponse.statusText,
          error: errorText,
        });
        throw new Error(`Twitter API error: ${tweetsResponse.status} - ${errorText}`);
      }

      return tweetsResponse.json();
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      console.log(`Attempt ${attempt + 1} failed, retrying...`);
      attempt++;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting edge function execution");
    validateEnvironmentVariables();

    const { username } = await req.json();
    if (!username) {
      throw new Error("Username is required");
    }
    console.log("Fetching tweets for username:", username);

    // First get the user ID using the username with retry mechanism
    let userResponse;
    let retries = 3;
    
    while (retries > 0) {
      userResponse = await fetch(
        `https://api.twitter.com/2/users/by/username/${username}`,
        {
          headers: {
            'Authorization': `Bearer ${BEARER_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (userResponse.status === 429) {
        retries--;
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      break;
    }

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error("Twitter API Error (getUser):", {
        status: userResponse.status,
        statusText: userResponse.statusText,
        error: errorText,
      });
      throw new Error(`Twitter API error: ${userResponse.status} - ${errorText}`);
    }

    const userData = await userResponse.json();
    const userId = userData.data.id;
    console.log("Got user ID:", userId);

    // Then get the tweets using Bearer token authentication
    const tweets = await fetchTweetsWithBearer(userId);
    console.log("Successfully fetched tweets:", tweets);

    return new Response(JSON.stringify(tweets), {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Edge Function Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: error.message.includes('rate') ? 429 : 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        }
      }
    );
  }
});
