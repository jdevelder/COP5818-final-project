import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function FuturesPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to main trade page with futures type pre-selected
    router.replace('/trade?type=futures');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading Futures Trading...</p>
      </div>
    </div>
  );
}
