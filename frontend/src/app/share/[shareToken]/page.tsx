import SharePage from '@/components/SharePage';

interface SharePageProps {
  params: Promise<{
    shareToken: string;
  }>;
}

export default async function Share({ params }: SharePageProps) {
  const { shareToken } = await params;
  return <SharePage shareToken={shareToken} />;
}