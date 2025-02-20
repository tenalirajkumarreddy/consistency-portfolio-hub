
import { useQuery } from '@tanstack/react-query';
import { TweetCard } from '@/components/TweetCard';
import ConsistencyTracker from '@/components/ConsistencyTracker';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Twitter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const Learn = () => {
  const { toast } = useToast();
  
  const { data: tweets, isLoading, error, isError } = useQuery({
    queryKey: ['tweets'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-tweets');
        if (error) {
          console.error('Error fetching tweets:', error);
          // Check if the error is due to missing Twitter credentials
          if (error.message?.includes('Missing TWITTER_')) {
            throw new Error('Twitter credentials not configured');
          }
          throw error;
        }
        
        if (!data?.data || data.data.length === 0) {
          return [];
        }

        // Map the tweets to our format
        return data.data.map((tweet: any) => ({
          id: tweet.id,
          content: tweet.text,
          date: tweet.created_at,
          url: `https://twitter.com/i/web/status/${tweet.id}`,
        }));
      } catch (err: any) {
        console.error('Error in tweet fetch:', err);
        toast({
          variant: "destructive",
          title: "Error fetching tweets",
          description: err.message || "Failed to load tweets. Please try again later.",
        });
        throw err;
      }
    },
    refetchInterval: 60000, // Refetch every minute
  });

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <section className="mb-12 fade-enter">
          <h1 className="text-4xl font-bold mb-4">Learn in Public</h1>
          <p className="text-xl text-gray-600 mb-8">
            Documenting my learning journey, one tweet at a time.
          </p>
        </section>

        <section className="mb-12">
          <ConsistencyTracker />
        </section>

        <section className="space-y-6">
          {isError && error?.message === 'Twitter credentials not configured' ? (
            <Alert>
              <Twitter className="h-4 w-4" />
              <AlertTitle>Twitter Not Connected</AlertTitle>
              <AlertDescription className="mt-2">
                <p className="mb-4">Please make sure all Twitter API credentials are properly configured.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => window.open('https://developer.twitter.com/en/portal/dashboard', '_blank')}
                >
                  <Twitter className="h-4 w-4" />
                  Twitter Developer Portal
                </Button>
              </AlertDescription>
            </Alert>
          ) : isError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to load tweets. Please try again later.
              </AlertDescription>
            </Alert>
          ) : null}

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : tweets?.length === 0 ? (
            <Alert>
              <AlertTitle>No Tweets Found</AlertTitle>
              <AlertDescription>
                Start sharing your learning journey on Twitter to see your tweets here.
              </AlertDescription>
            </Alert>
          ) : (
            tweets?.map((tweet) => (
              <TweetCard
                key={tweet.id}
                content={tweet.content}
                date={tweet.date}
                url={tweet.url}
              />
            ))
          )}
        </section>
      </div>
    </div>
  );
};

export default Learn;
