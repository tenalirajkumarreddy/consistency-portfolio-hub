
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BEARER_TOKEN = Deno.env.get("TWITTER_BEARER_TOKEN")?.trim();

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting edge function execution");
    
    if (!BEARER_TOKEN) {
      throw new Error("Missing TWITTER_BEARER_TOKEN");
    }

    const { username } = await req.json();
    if (!username) {
      throw new Error("Username is required");
    }
    console.log("Fetching tweets for username:", username);

    // First get the user ID using the username
    const userResponse = await fetch(
      `https://api.twitter.com/2/users/by/username/${username}`,
      {
        headers: {
          'Authorization': `Bearer ${BEARER_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

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

    // Then get the tweets
    const tweetsResponse = await fetch(
      `https://api.twitter.com/2/users/${userId}/tweets?tweet.fields=created_at,text&max_results=10`,
      {
        headers: {
          'Authorization': `Bearer ${BEARER_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!tweetsResponse.ok) {
      const errorText = await tweetsResponse.text();
      console.error("Twitter API Error (getTweets):", {
        status: tweetsResponse.status,
        statusText: tweetsResponse.statusText,
        error: errorText,
      });
      throw new Error(`Twitter API error: ${tweetsResponse.status} - ${errorText}`);
    }

    const tweets = await tweetsResponse.json();
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
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        }
      }
    );
  }
});
