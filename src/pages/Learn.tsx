
import { useQuery } from '@tanstack/react-query';
import { TweetCard } from '@/components/TweetCard';
import ConsistencyTracker from '@/components/ConsistencyTracker';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const Learn = () => {
  const { data: tweets, isLoading, error } = useQuery({
    queryKey: ['tweets'],
    queryFn: async () => {
      // Placeholder for Twitter API integration
      return [
        {
          id: '1',
          content: "Just learned about React Query's new features! The stale-while-revalidate pattern is a game changer. #LearnInPublic",
          date: new Date().toISOString(),
          url: 'https://twitter.com',
        },
        {
          id: '2',
          content: 'Built my first custom hook today. Understanding the rules of hooks has made my React code much cleaner. #LearnInPublic',
          date: new Date(Date.now() - 86400000).toISOString(),
          url: 'https://twitter.com',
        },
      ];
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
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load tweets. Please try again later.
              </AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
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
