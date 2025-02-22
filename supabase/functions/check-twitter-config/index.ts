
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const BEARER_TOKEN = Deno.env.get("TWITTER_BEARER_TOKEN")?.trim();

  return new Response(
    JSON.stringify({
      configured: !!BEARER_TOKEN,
    }),
    {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    }
  );
});
