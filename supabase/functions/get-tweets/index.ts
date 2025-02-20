
import { createHmac } from "node:crypto";

const API_KEY = Deno.env.get("TWITTER_CONSUMER_KEY")?.trim();
const API_SECRET = Deno.env.get("TWITTER_CONSUMER_SECRET")?.trim();
const ACCESS_TOKEN = Deno.env.get("TWITTER_ACCESS_TOKEN")?.trim();
const ACCESS_TOKEN_SECRET = Deno.env.get("TWITTER_ACCESS_TOKEN_SECRET")?.trim();

function validateEnvironmentVariables() {
  if (!API_KEY) throw new Error("Missing TWITTER_CONSUMER_KEY");
  if (!API_SECRET) throw new Error("Missing TWITTER_CONSUMER_SECRET");
  if (!ACCESS_TOKEN) throw new Error("Missing TWITTER_ACCESS_TOKEN");
  if (!ACCESS_TOKEN_SECRET) throw new Error("Missing TWITTER_ACCESS_TOKEN_SECRET");
}

function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  const signatureBaseString = `${method}&${encodeURIComponent(
    url
  )}&${encodeURIComponent(
    Object.entries(params)
      .sort()
      .map(([k, v]) => `${k}=${v}`)
      .join("&")
  )}`;
  
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;
  const hmacSha1 = createHmac("sha1", signingKey);
  const signature = hmacSha1.update(signatureBaseString).digest("base64");
  
  console.log("Signature Base String:", signatureBaseString);
  console.log("Generated Signature:", signature);
  
  return signature;
}

function generateOAuthHeader(method: string, url: string): string {
  const oauthParams = {
    oauth_consumer_key: API_KEY!,
    oauth_nonce: Math.random().toString(36).substring(2),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: ACCESS_TOKEN!,
    oauth_version: "1.0",
  };

  const signature = generateOAuthSignature(
    method,
    url,
    oauthParams,
    API_SECRET!,
    ACCESS_TOKEN_SECRET!
  );

  const signedOAuthParams = {
    ...oauthParams,
    oauth_signature: signature,
  };

  return (
    "OAuth " +
    Object.entries(signedOAuthParams)
      .sort()
      .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
      .join(", ")
  );
}

const BASE_URL = "https://api.twitter.com/2";

async function getUser() {
  const url = `${BASE_URL}/users/me`;
  const method = "GET";
  const oauthHeader = generateOAuthHeader(method, url);
  
  console.log("Getting user details...");
  console.log("OAuth Header for user request:", oauthHeader);
  
  const response = await fetch(url, {
    method: method,
    headers: {
      Authorization: oauthHeader,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Twitter API Error (getUser):", {
      status: response.status,
      statusText: response.statusText,
      errorText,
    });
    throw new Error(`Twitter API error (getUser): ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log("User data received:", data);
  return data.data.id;
}

async function getTweets(userId: string) {
  console.log("Starting getTweets function for user:", userId);
  
  const url = `${BASE_URL}/users/${userId}/tweets?tweet.fields=created_at&max_results=100`;
  const method = "GET";
  const oauthHeader = generateOAuthHeader(method, url);
  
  console.log("OAuth Header for tweets request:", oauthHeader);
  
  const response = await fetch(url, {
    method: method,
    headers: {
      Authorization: oauthHeader,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Twitter API Error (getTweets):", {
      status: response.status,
      statusText: response.statusText,
      errorText,
    });
    throw new Error(`Twitter API error (getTweets): ${response.status} - ${errorText}`);
  }

  console.log("Successfully received tweets from Twitter API");
  return await response.json();
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting edge function execution");
    validateEnvironmentVariables();
    
    // First get the user ID
    const userId = await getUser();
    console.log("Got user ID:", userId);
    
    // Then get the tweets
    const tweets = await getTweets(userId);
    console.log("Got tweets:", tweets);
    
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
