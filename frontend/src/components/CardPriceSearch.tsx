import React, { useState } from 'react';
import { Search, TrendingUp, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface PriceResult {
  title: string;
  price: number;
  condition: string;
  seller: string;
  url: string;
  imageUrl?: string;
  shipping?: number;
}

export default function CardPriceSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PriceResult[]>([]);
  const [averagePrice, setAveragePrice] = useState<number | null>(null);

  const searchPrices = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a card name to search');
      return;
    }

    setLoading(true);
    try {
      // This will call your eBay API endpoint
      const response = await fetch(`/api/ebay/search?q=${encodeURIComponent(searchQuery)}`);

      const data = await response.json();

      // Check for rate limit (429 status)
      if (response.status === 429) {
        toast('eBay rate limit reached. Showing sample data.', {
          icon: '⚠️',
          duration: 5000,
        });
      }

      if (data.results && data.results.length > 0) {
        setResults(data.results);

        // Calculate average price
        const prices = data.results.map((r: PriceResult) => r.price);
        const avg = prices.reduce((a: number, b: number) => a + b, 0) / prices.length;
        setAveragePrice(avg);

        // Show different message based on data source
        if (data.source === 'Mock Data' || response.status === 429) {
          toast.success(`Showing ${data.results.length} sample listings (eBay limit reached)`);
        } else {
          toast.success(`Found ${data.results.length} real listings from eBay`);
        }
      } else {
        setResults([]);
        setAveragePrice(null);
        toast.error('No results found');
      }
    } catch (error) {
      console.error('Error searching prices:', error);
      toast.error('Failed to search prices. Showing sample data.');

      // Mock data for development/testing
      const mockResults: PriceResult[] = [
        {
          title: `${searchQuery} - Near Mint`,
          price: 150.00,
          condition: 'Near Mint',
          seller: 'cardshop123',
          url: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(searchQuery + ' Near Mint')}&_sop=12&rt=nc&LH_Sold=1&LH_Complete=1`,
          imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%236366f1" width="400" height="400"/%3E%3Ctext fill="white" font-family="Arial" font-size="24" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ETCG Card%3C/text%3E%3C/svg%3E',
          shipping: 5.00,
        },
        {
          title: `${searchQuery} - Lightly Played`,
          price: 120.00,
          condition: 'Lightly Played',
          seller: 'tcgdeals',
          url: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(searchQuery + ' Lightly Played')}&_sop=12&rt=nc&LH_Sold=1&LH_Complete=1`,
          imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%238b5cf6" width="400" height="400"/%3E%3Ctext fill="white" font-family="Arial" font-size="24" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ETCG Card%3C/text%3E%3C/svg%3E',
          shipping: 5.00,
        },
        {
          title: `${searchQuery} - Mint PSA 10`,
          price: 500.00,
          condition: 'Graded PSA 10',
          seller: 'gradedcards',
          url: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(searchQuery + ' PSA 10')}&_sop=12&rt=nc&LH_Sold=1&LH_Complete=1`,
          imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23a855f7" width="400" height="400"/%3E%3Ctext fill="white" font-family="Arial" font-size="24" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EPSA 10%3C/text%3E%3C/svg%3E',
          shipping: 10.00,
        },
      ];

      setResults(mockResults);
      const avg = mockResults.reduce((a, b) => a + b.price, 0) / mockResults.length;
      setAveragePrice(avg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchPrices();
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Search Card Prices</h2>
        </div>

        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Search for real-time TCG card prices from eBay marketplace
        </p>

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., Charizard Base Set, Black Lotus Alpha..."
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
            onClick={searchPrices}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Search
              </>
            )}
          </button>
        </div>

        {/* Info Banner */}
        <div className="mt-4 p-3 rounded-lg bg-blue-500/10 dark:bg-blue-500/10 border border-blue-500/30">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Note:</strong> Prices are fetched from eBay in real-time. Due to API rate limits, historical charts are not available.
            </div>
          </div>
        </div>
      </div>

      {/* Average Price Card */}
      {averagePrice !== null && (
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 dark:from-purple-500/20 dark:to-pink-500/20 backdrop-blur-md border border-purple-500/30 dark:border-purple-500/30 rounded-2xl p-6">
          <div className="text-center">
            <div className="text-gray-700 dark:text-gray-300 text-sm mb-2">Average Market Price</div>
            <div className="text-4xl font-bold text-gray-900 dark:text-white">${averagePrice.toFixed(2)}</div>
            <div className="text-gray-600 dark:text-gray-400 text-sm mt-2">
              Based on {results.length} recent listings
            </div>
          </div>
        </div>
      )}

      {/* Results Grid */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Listings</h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((result, index) => (
              <div
                key={index}
                className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-xl p-4 hover:bg-white/90 dark:hover:bg-white/10 transition"
              >
                {result.imageUrl && (
                  <img
                    src={result.imageUrl}
                    alt={result.title}
                    className="w-full h-48 object-cover rounded-lg mb-3"
                  />
                )}

                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {result.title}
                </h4>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Price:</span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      ${result.price.toFixed(2)}
                    </span>
                  </div>

                  {result.shipping && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Shipping:</span>
                      <span className="text-gray-700 dark:text-gray-300">
                        ${result.shipping.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Condition:</span>
                    <span className="text-gray-700 dark:text-gray-300">{result.condition}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Seller:</span>
                    <span className="text-gray-700 dark:text-gray-300">{result.seller}</span>
                  </div>
                </div>

                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-white/20 transition"
                >
                  View on eBay
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && results.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            No results found. Try a different search term.
          </p>
        </div>
      )}
    </div>
  );
}
