
import { useEffect } from 'react';
import ConsistencyTracker from '@/components/ConsistencyTracker';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Twitter } from 'lucide-react';

// Replace this with your Twitter username
const TWITTER_USERNAME = 'rajkumartenali';

// Load Twitter embed script
const loadTwitterWidget = () => {
  const script = document.createElement('script');
  script.src = "https://platform.twitter.com/widgets.js";
  script.async = true;
  script.charset = "utf-8";
  document.body.appendChild(script);
  return () => {
    document.body.removeChild(script);
  };
};

const Learn = () => {
  useEffect(() => {
    const cleanup = loadTwitterWidget();
    return cleanup;
  }, []);

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
          {!TWITTER_USERNAME ? (
            <Alert>
              <Twitter className="h-4 w-4" />
              <AlertTitle>Twitter Not Connected</AlertTitle>
              <AlertDescription>
                Please update the TWITTER_USERNAME constant in the code with your Twitter username.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <a 
                className="twitter-timeline" 
                data-theme="light"
                data-chrome="noheader nofooter noborders transparent"
                data-tweet-limit="5"
                data-dnt="true"
                data-show-replies="false"
                href={`https://twitter.com/${TWITTER_USERNAME}?ref_src=twsrc%5Etfw`}
              >
                Loading tweets...
              </a>
              <div className="mt-4 text-center">
                <a 
                  href={`https://twitter.com/${TWITTER_USERNAME}`}
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
