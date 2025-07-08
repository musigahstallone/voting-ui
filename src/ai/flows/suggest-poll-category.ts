'use server';

/**
 * @fileOverview Category suggestion flow.
 *
 * - suggestPollCategory - A function that suggests categories for a poll
 *   based on the title and description.
 * - SuggestPollCategoryInput - The input type for the suggestPollCategory
 *   function.
 * - SuggestPollCategoryOutput - The return type for the
 *   suggestPollCategory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestPollCategoryInputSchema = z.object({
  title: z.string().describe('The title of the poll.'),
  description: z.string().describe('The description of the poll.'),
});

export type SuggestPollCategoryInput = z.infer<
  typeof SuggestPollCategoryInputSchema
>;

const SuggestPollCategoryOutputSchema = z.object({
  category: z
    .string()
    .describe(
      'A suggested category for the poll, based on the title and description.'
    ),
});

export type SuggestPollCategoryOutput = z.infer<
  typeof SuggestPollCategoryOutputSchema
>;

export async function suggestPollCategory(
  input: SuggestPollCategoryInput
): Promise<SuggestPollCategoryOutput> {
  return suggestPollCategoryFlow(input);
}

const suggestPollCategoryPrompt = ai.definePrompt({
  name: 'suggestPollCategoryPrompt',
  input: {schema: SuggestPollCategoryInputSchema},
  output: {schema: SuggestPollCategoryOutputSchema},
  prompt: `Suggest a category for a poll with the following title and description:

Title: {{{title}}}
Description: {{{description}}}

Category:`,
});

const suggestPollCategoryFlow = ai.defineFlow(
  {
    name: 'suggestPollCategoryFlow',
    inputSchema: SuggestPollCategoryInputSchema,
    outputSchema: SuggestPollCategoryOutputSchema,
  },
  async input => {
    const {output} = await suggestPollCategoryPrompt(input);
    return output!;
  }
);
