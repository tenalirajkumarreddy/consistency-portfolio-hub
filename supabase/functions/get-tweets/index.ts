
import { createHmac } from "node:crypto";

const API_KEY = Deno.env.get("TWITTER_CONSUMER_KEY")?.trim();
const API_SECRET = Deno.env.get("TWITTER_CONSUMER_SECRET")?.trim();
const ACCESS_TOKEN = Deno.env.get("TWITTER_ACCESS_TOKEN")?.trim();

function validateEnvironmentVariables() {
  if (!API_KEY) throw new Error("Missing TWITTER_CONSUMER_KEY");
  if (!API_SECRET) throw new Error("Missing TWITTER_CONSUMER_SECRET");
  if (!ACCESS_TOKEN) throw new Error("Missing TWITTER_ACCESS_TOKEN");
}

const BASE_URL = "https://api.twitter.com/2";

async function getTweets() {
  console.log("Starting getTweets function");
  console.log("Using API_KEY length:", API_KEY?.length);
  console.log("Using ACCESS_TOKEN length:", ACCESS_TOKEN?.length);

  const url = `${BASE_URL}/users/me/tweets?tweet.fields=created_at&max_results=10`;
  const headers = {
    Authorization: `Bearer ${ACCESS_TOKEN}`,
  };

  console.log("Making request to Twitter API...");
  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Twitter API Error:", {
      status: response.status,
      statusText: response.statusText,
      errorText,
    });
    throw new Error(`Twitter API error: ${response.status} - ${errorText}`);
  }

  console.log("Successfully received response from Twitter API");
  return await response.json();
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting edge function execution");
    validateEnvironmentVariables();
    const tweets = await getTweets();
    
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
