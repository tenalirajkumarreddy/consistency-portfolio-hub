
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
  const url = `${BASE_URL}/users/me/tweets?tweet.fields=created_at&max_results=10`;
  const headers = {
    Authorization: `Bearer ${ACCESS_TOKEN}`,
  };

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

Deno.serve(async (req) => {
  try {
    validateEnvironmentVariables();
    const tweets = await getTweets();
    return new Response(JSON.stringify(tweets), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }
});
