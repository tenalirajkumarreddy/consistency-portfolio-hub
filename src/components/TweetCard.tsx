
import { format } from 'date-fns';
import { Twitter } from 'lucide-react';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';

interface TweetCardProps {
  content: string;
  date: string;
  url: string;
}

export const TweetCard = ({ content, date, url }: TweetCardProps) => {
  return (
    <Card className="transition-all duration-300 hover:shadow-lg scale-enter">
      <CardHeader className="text-sm text-gray-500">
        {format(new Date(date), 'MMMM d, yyyy')}
      </CardHeader>
      <CardContent>
        <p className="text-lg">{content}</p>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(url, '_blank')}
          className="gap-2"
        >
          <Twitter className="h-4 w-4" />
          View on Twitter
        </Button>
      </CardFooter>
    </Card>
  );
};
