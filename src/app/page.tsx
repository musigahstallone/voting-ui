"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Clock, User, FileQuestion } from 'lucide-react';
import type { Poll } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

function PollCard({ poll }: { poll: Poll }) {
  const endsAt = new Date(poll.ends_at);
  const formattedEndDate = endsAt.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  return (
    <Link href={`/polls/${poll.id}`} className="block h-full">
      <Card className="hover:border-primary transition-colors h-full flex flex-col justify-between rounded-lg shadow-md hover:shadow-xl">
        <div>
          <CardHeader>
            <div className="flex justify-between items-start gap-2">
              <CardTitle className="text-xl leading-tight">{poll.title}</CardTitle>
              <Badge variant="secondary" className="whitespace-nowrap">{poll.category}</Badge>
            </div>
            <CardDescription className="pt-2 line-clamp-2">{poll.description}</CardDescription>
          </CardHeader>
        </div>
        <CardFooter className="text-sm text-muted-foreground flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Ends {formattedEndDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{poll.is_anonymous ? "Anonymous" : `Creator: ...${poll.creator_id.slice(-4)}`}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}

const API_URL = 'https://localhost:8080/api';

export default function HomePage() {
  const { token, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!token) {
        router.push('/login');
      } else {
        const fetchPolls = async () => {
          setIsLoading(true);
          try {
            const response = await fetch(`${API_URL}/polls`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch polls');
            const data = await response.json();
            setPolls(data || []);
          } catch (error) {
            console.error('Failed to fetch polls:', error);
            toast({
              variant: 'destructive',
              title: 'Error',
              description: 'Could not load polls. Please try again later.'
            });
          } finally {
            setIsLoading(false);
          }
        };
        fetchPolls();
      }
    }
  }, [token, authLoading, router, toast]);

  if (authLoading || (!token && !authLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-24 animate-pulse rounded-md bg-muted"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Active Polls</h1>
          <Button asChild className="shadow">
            <Link href="/polls/create">
              <PlusCircle className="mr-2 h-4 w-4" /> Create Poll
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 rounded-lg" />)}
          </div>
        ) : polls.length === 0 ? (
          <div className="text-center py-16 border-dashed border-2 rounded-lg mt-8 bg-card">
            <FileQuestion className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">No active polls found</h2>
            <p className="text-muted-foreground mt-2">Be the first to create one and get the conversation started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {polls.map(poll => <PollCard key={poll.id} poll={poll} />)}
          </div>
        )}
      </main>
    </div>
  );
}
