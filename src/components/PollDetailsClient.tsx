"use client";

import { useState, useEffect, useMemo } from 'react';
import type { Poll } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { useWebSocket } from '@/hooks/useWebSocket';

export default function PollDetailsClient({ initialPoll }: { initialPoll: Poll }) {
  const [poll, setPoll] = useState<Poll>(initialPoll);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const { toast } = useToast();
  const { token } = useAuth();
  
  const wsUrl = typeof window !== 'undefined' ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws` : null;
  const { lastMessage, isConnected } = useWebSocket(wsUrl, poll.id);

  useEffect(() => {
    if (lastMessage?.type === 'vote_update' && lastMessage.poll_id === poll.id) {
        setPoll(currentPoll => {
            const newOptions = currentPoll.options?.map(opt => {
                const updatedResult = lastMessage.results.find((r: {id: string}) => r.id === opt.id);
                return updatedResult ? { ...opt, vote_count: updatedResult.vote_count } : opt;
            }) || [];
            return { ...currentPoll, options: newOptions };
        });
    }
  }, [lastMessage, poll.id]);


  const totalVotes = useMemo(() => {
    return poll.options?.reduce((acc, option) => acc + option.vote_count, 0) || 0;
  }, [poll.options]);

  const handleVote = async () => {
    if (!selectedOption) {
      toast({ variant: 'destructive', title: 'No option selected', description: 'Please choose an option to vote.' });
      return;
    }
    setIsVoting(true);
    try {
      // MOCK API CALL
    //   const response = await fetch('/api/vote', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    //     body: JSON.stringify({ poll_id: poll.id, option_id: selectedOption }),
    //   });
    //   if (!response.ok) throw new Error('Failed to cast vote');
      
      // Manually update for instant feedback in mock
      setPoll(currentPoll => {
        const newOptions = currentPoll.options?.map(opt => 
          opt.id === selectedOption ? { ...opt, vote_count: opt.vote_count + 1 } : opt
        ) || [];
        return { ...currentPoll, options: newOptions };
      });

      toast({ title: 'Vote Cast!', description: 'Your vote has been recorded.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Vote Failed', description: error instanceof Error ? error.message : 'An unknown error occurred.' });
    } finally {
      setIsVoting(false);
    }
  };
  
  const isPollActive = new Date(poll.ends_at) > new Date();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <Card className="lg:col-span-2 shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-start gap-4">
            <CardTitle className="text-3xl font-bold tracking-tight">{poll.title}</CardTitle>
            <Badge variant="secondary" className="whitespace-nowrap">{poll.category}</Badge>
          </div>
          <CardDescription className="pt-4 text-base text-foreground/80">{poll.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Cast Your Vote</h3>
            <RadioGroup value={selectedOption ?? undefined} onValueChange={setSelectedOption} disabled={!isPollActive || isVoting}>
              {poll.options?.map(option => (
                <div key={option.id} className="flex items-center space-x-3 rounded-md border p-4 has-[:checked]:border-primary transition-all">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="text-lg flex-1 cursor-pointer">{option.text}</Label>
                </div>
              ))}
            </RadioGroup>
            {isPollActive ? (
              <Button onClick={handleVote} disabled={isVoting || !selectedOption} size="lg" className="w-full sm:w-auto">
                {isVoting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Vote
              </Button>
            ) : (
                <p className="font-bold text-destructive p-4 bg-destructive/10 rounded-md">This poll has ended.</p>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Live Results</CardTitle>
            <div className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} title={isConnected ? 'Connected' : 'Disconnected'}></div>
          </div>
          <CardDescription>Vote counts are updated in real-time.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {poll.options?.map(option => {
            const percentage = totalVotes > 0 ? (option.vote_count / totalVotes) * 100 : 0;
            return (
              <div key={option.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-medium">{option.text}</span>
                  <span className="text-sm text-muted-foreground">{option.vote_count} votes</span>
                </div>
                <Progress value={percentage} className="h-3" />
                <p className="text-right text-xs text-muted-foreground mt-1">{percentage.toFixed(1)}%</p>
              </div>
            );
          })}
          <div className="border-t pt-4 mt-4 text-center">
            <p className="font-bold text-2xl">{totalVotes}</p>
            <p className="text-sm text-muted-foreground">Total Votes</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
