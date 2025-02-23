
import { useEffect, useState } from 'react';
import ConsistencyTracker from '@/components/ConsistencyTracker';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const Learn = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session and subscribe to auth changes
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleTwitterLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          redirectTo: window.location.origin + '/learn'
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error logging in with Twitter:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 px-4 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

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
          {!session ? (
            <div className="text-center">
              <Alert className="mb-6">
                <Twitter className="h-4 w-4" />
                <AlertTitle>Not Connected to Twitter</AlertTitle>
                <AlertDescription>
                  Please sign in with your Twitter account to view your timeline.
                </AlertDescription>
              </Alert>
              <Button 
                onClick={handleTwitterLogin}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Twitter className="h-4 w-4 mr-2" />
                Sign in with Twitter
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-gray-600">
                  Signed in as {session.user.user_metadata.user_name}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </div>
              <a 
                className="twitter-timeline" 
                data-theme="light"
                data-chrome="noheader nofooter noborders transparent"
                data-tweet-limit="5"
                data-dnt="true"
                data-show-replies="false"
                href={`https://twitter.com/${session.user.user_metadata.user_name}?ref_src=twsrc%5Etfw`}
              >
                Loading tweets...
              </a>
              <div className="mt-4 text-center">
                <a 
                  href={`https://twitter.com/${session.user.user_metadata.user_name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600"
                >
                  View more on Twitter
                </a>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Learn;
