import Header from '@/components/Header';
import PollDetailsClient from '@/components/PollDetailsClient';

export default function PollDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) {
    return <div className="container mx-auto p-4">Poll ID is required</div>;
  }
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <PollDetailsClient pollId={params.id} />
      </main>
    </div>
  );
}
