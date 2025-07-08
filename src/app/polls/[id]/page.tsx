import Header from '@/components/Header';
import PollDetailsClient from '@/components/PollDetailsClient';
import type { Poll } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Mock function to simulate fetching data for a specific poll
const getPollData = async (id: string): Promise<Poll | null> => {
  // In a real app, you would fetch from your API:
  // const res = await fetch(`https://your-api.com/api/polls/${id}`);
  // if (!res.ok) return null;
  // return res.json();
  
  if (id === 'poll404') return null;

  const mockPoll: Poll = {
    id: id,
    title: 'Favorite Programming Language',
    description: 'What is your go-to language for new projects? We are looking into what to teach next semester and would love your input. Please vote for your favorite language, or the one you are most interested in learning.',
    category: 'Technology',
    creator_id: 'user1',
    is_anonymous: false,
    is_active: true,
    starts_at: new Date().toISOString(),
    ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    options: [
      { id: 'opt1', poll_id: id, text: 'JavaScript', order_index: 0, vote_count: 15 },
      { id: 'opt2', poll_id: id, text: 'Python', order_index: 1, vote_count: 32 },
      { id: 'opt3', poll_id: id, text: 'Rust', order_index: 2, vote_count: 8 },
      { id: 'opt4', poll_id: id, text: 'Go', order_index: 3, vote_count: 12 },
    ]
  };

  return Promise.resolve(mockPoll);
}

export default async function PollDetailsPage({ params }: { params: { id: string } }) {
  const poll = await getPollData(params.id);

  if (!poll) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <h1 className="text-4xl font-bold">Poll Not Found</h1>
          <p className="mt-2 text-muted-foreground">Sorry, we couldn't find the poll you're looking for.</p>
          <Button asChild className="mt-6">
            <Link href="/">Back to Polls</Link>
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <PollDetailsClient initialPoll={poll} />
      </main>
    </div>
  );
}
