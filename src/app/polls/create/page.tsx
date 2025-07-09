"use client";

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { suggestPollCategory } from '@/ai/flows/suggest-poll-category';
import { Lightbulb, PlusCircle, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';

const pollSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  is_anonymous: z.boolean().default(false),
  starts_at: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid start date" }),
  ends_at: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid end date" }),
  options: z.array(z.object({ value: z.string().min(1, 'Option cannot be empty') })).min(2, 'Must have at least two options'),
});

type PollFormValues = z.infer<typeof pollSchema>;

const API_URL = 'https://localhost:8080/api';

export default function CreatePollPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { token, isLoading: authLoading } = useAuth();
  const [isSuggesting, setIsSuggesting] = useState(false);

  const form = useForm<PollFormValues>({
    resolver: zodResolver(pollSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'General',
      is_anonymous: false,
      starts_at: new Date().toISOString().slice(0, 16),
      ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      options: [{ value: '' }, { value: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  const handleSuggestCategory = async () => {
    const { title, description } = form.getValues();
    if (!title || !description) {
      toast({ variant: 'destructive', title: 'Cannot suggest category', description: 'Please fill in the title and description first.' });
      return;
    }
    setIsSuggesting(true);
    try {
      const result = await suggestPollCategory({ title, description });
      form.setValue('category', result.category, { shouldValidate: true });
      toast({ title: 'Category Suggested!', description: `We've filled in "${result.category}" for you.` });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Suggestion Failed', description: 'Could not generate a category.' });
    } finally {
      setIsSuggesting(false);
    }
  };

  const onSubmit = async (data: PollFormValues) => {
    const payload = { ...data, options: data.options.map(opt => opt.value) };
    try {
      const response = await fetch(`${API_URL}/polls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Failed to create poll');
      const newPoll = await response.json();
      toast({ title: 'Poll Created!', description: 'Your poll is now live.' });
      router.push(`/polls/${newPoll.id}`);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Creation Failed', description: error instanceof Error ? error.message : 'An unknown error occurred.' });
    }
  };

  if (authLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!token) {
    router.push('/login');
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <Card className="max-w-3xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Create a New Poll</CardTitle>
            <CardDescription>Fill out the details below to launch your poll.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Poll Title</FormLabel>
                    <FormControl><Input placeholder="What's your favorite season?" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl><Textarea placeholder="Briefly describe what this poll is about." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <div className="flex gap-2">
                      <FormControl><Input placeholder="e.g., General, Tech, Food" {...field} /></FormControl>
                      <Button type="button" variant="outline" onClick={handleSuggestCategory} disabled={isSuggesting}>
                        {isSuggesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lightbulb className="h-4 w-4" />}
                        <span className="ml-2 hidden sm:inline">Suggest</span>
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />

                <div>
                  <FormLabel>Options</FormLabel>
                  <div className="space-y-2 mt-2">
                    {fields.map((field, index) => (
                      <FormField
                        key={field.id}
                        control={form.control}
                        name={`options.${index}.value`}
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center gap-2">
                              <FormControl><Input placeholder={`Option ${index + 1}`} {...field} /></FormControl>
                              {fields.length > 2 && <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ value: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Option</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField control={form.control} name="starts_at" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl><Input type="datetime-local" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="ends_at" render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl><Input type="datetime-local" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="is_anonymous" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Anonymous Poll</FormLabel>
                      <FormDescription>If enabled, creator's identity will be hidden.</FormDescription>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )} />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="ghost" asChild><Link href="/">Cancel</Link></Button>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Poll
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
