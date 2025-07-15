import SharePage from '@/components/SharePage';

interface SharePageProps {
  params: {
    shareToken: string;
  };
}

export default function Share({ params }: SharePageProps) {
  return <SharePage shareToken={params.shareToken} />;
}