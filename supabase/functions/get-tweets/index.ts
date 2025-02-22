
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BEARER_TOKEN = Deno.env.get("TWITTER_BEARER_TOKEN")?.trim();
const CACHE_DURATION_HOURS = 1; // Consider cached tweets valid for 1 hour

// Initialize Supabase client for the Edge Function with SERVICE_ROLE key
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

async function getCachedTweets(username: string): Promise<any[] | null> {
  const { data: tweets, error } = await supabaseClient
    .from('tweets')
    .select('*')
    .eq('author_username', username)
    .gte('fetched_at', new Date(Date.now() - CACHE_DURATION_HOURS * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching cached tweets:', error);
    return null;
  }

  return tweets.length > 0 ? tweets : null;
}

async function cacheTweets(tweets: any[], username: string) {
  const tweetsToUpsert = tweets.map(tweet => ({
    id: tweet.id,
    content: tweet.text,
    created_at: tweet.created_at,
    author_username: username,
    url: `https://twitter.com/i/web/status/${tweet.id}`,
    fetched_at: new Date().toISOString()
  }));

  const { error } = await supabaseClient
    .from('tweets')
    .upsert(tweetsToUpsert, {
      onConflict: 'id',
      ignoreDuplicates: false
    });

  if (error) {
    console.error('Error caching tweets:', error);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!BEARER_TOKEN) {
      throw new Error("TWITTER_BEARER_TOKEN environment variable is not configured");
    }

    const { username } = await req.json();
    if (!username) {
      throw new Error("Username is required");
    }

    console.log("Checking cache for tweets from:", username);
    
    // First try to get cached tweets
    const cachedTweets = await getCachedTweets(username);
    if (cachedTweets) {
      console.log("Found cached tweets, returning them");
      return new Response(
        JSON.stringify({ data: cachedTweets }),
        {
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    console.log("No cached tweets found, fetching from Twitter API");

    // If no cached tweets, fetch from Twitter API
    const userResponse = await fetch(
      `https://api.twitter.com/2/users/by/username/${username}`,
      {
        headers: {
          'Authorization': `Bearer ${BEARER_TOKEN}`,
        },
      }
    );

    if (userResponse.status === 429) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded. Please try again in a few minutes.",
          isRateLimit: true
        }),
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          }
        }
      );
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

    const tweetsResponse = await fetch(
      `https://api.twitter.com/2/users/${userId}/tweets?tweet.fields=created_at,text&max_results=10`,
      {
        headers: {
          'Authorization': `Bearer ${BEARER_TOKEN}`,
        },
      }
    );

    if (tweetsResponse.status === 429) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded. Please try again in a few minutes.",
          isRateLimit: true
        }),
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          }
        }
      );
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

    const tweets = await tweetsResponse.json();
    console.log("Successfully fetched tweets from Twitter API");

    // Cache the new tweets
    if (tweets.data && tweets.data.length > 0) {
      console.log("Caching newly fetched tweets");
      await cacheTweets(tweets.data, username);
    }

    return new Response(JSON.stringify(tweets), {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Edge Function Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        isRateLimit: error.message.includes('429')
      }),
      { 
        status: error.message.includes('429') ? 429 : 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        }
      }
    );
  }
});
