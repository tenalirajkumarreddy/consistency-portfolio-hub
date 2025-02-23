
import { useEffect, useState } from 'react';
import ConsistencyTracker from '@/components/ConsistencyTracker';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Mail } from 'lucide-react';
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

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/learn'
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error logging in with Google:', error);
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
            Documenting my learning journey.
          </p>
        </section>

        <section className="mb-12">
          <ConsistencyTracker />
        </section>

        <section className="space-y-6">
          {!session ? (
            <div className="text-center">
              <Alert className="mb-6">
                <Mail className="h-4 w-4" />
                <AlertTitle>Not Signed In</AlertTitle>
                <AlertDescription>
                  Please sign in with your Google account to access your learning dashboard.
                </AlertDescription>
              </Alert>
              <Button 
                onClick={handleGoogleLogin}
                className="bg-red-500 hover:bg-red-600"
              >
                <Mail className="h-4 w-4 mr-2" />
                Sign in with Google
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-gray-600">
                  Signed in as {session.user.email}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-semibold mb-4">Welcome back!</h2>
                <p>You're now signed in to your learning dashboard.</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Learn;
