import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { getCached, setCache } from '@/utils/cache';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Search query is required' });
  }

  // Check cache first
  const cacheKey = `ebay_search_${q.toLowerCase()}`;
  const cachedData = getCached(cacheKey);

  if (cachedData) {
    console.log(`✅ Returning cached data for: "${q}"`);
    return res.status(200).json({
      ...cachedData,
      cached: true,
      cacheTimestamp: new Date().toISOString(),
    });
  }

  try {
    // ===============================================================
    // eBay Finding API - Real Sold Items Integration
    // ===============================================================

    const EBAY_APP_ID = process.env.EBAY_CLIENT_ID || process.env.EBAY_APP_ID;

    console.log('🔍 eBay API Debug:');
    console.log('  - EBAY_CLIENT_ID:', process.env.EBAY_CLIENT_ID ? 'Set' : 'Not set');
    console.log('  - EBAY_APP_ID:', process.env.EBAY_APP_ID ? 'Set' : 'Not set');
    console.log('  - Using:', EBAY_APP_ID ? `${EBAY_APP_ID.substring(0, 20)}...` : 'None');

    if (!EBAY_APP_ID || EBAY_APP_ID === 'YOUR_APP_ID_HERE') {
      console.warn('⚠️ eBay API credentials not configured - using mock data');
      return res.status(200).json({ results: generateMockData(q) });
    }

    const findingApiUrl = 'https://svcs.ebay.com/services/search/FindingService/v1';

    // Search for completed/sold items (last 90 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);

    const params = {
      'OPERATION-NAME': 'findCompletedItems',
      'SERVICE-VERSION': '1.0.0',
      'SECURITY-APPNAME': EBAY_APP_ID,
      'RESPONSE-DATA-FORMAT': 'JSON',
      'REST-PAYLOAD': 'true',
      'keywords': q,
      'paginationInput.entriesPerPage': '50',
      'sortOrder': 'EndTimeSoonest',
      'itemFilter(0).name': 'EndTimeFrom',
      'itemFilter(0).value': startDate.toISOString(),
      'itemFilter(1).name': 'EndTimeTo',
      'itemFilter(1).value': endDate.toISOString(),
      'itemFilter(2).name': 'SoldItemsOnly',
      'itemFilter(2).value': 'true',
      'itemFilter(3).name': 'ListingType',
      'itemFilter(3).value': 'FixedPrice'
    };

    console.log(`Fetching eBay data for: "${q}"`);

    const response = await axios.get(findingApiUrl, { params });

    if (response.data.findCompletedItemsResponse) {
      const result = response.data.findCompletedItemsResponse[0];
      const ack = result.ack[0];

      if (ack !== 'Success') {
        const errorMsg = result.errorMessage?.[0]?.error?.[0]?.message?.[0];
        throw new Error(errorMsg || 'eBay API error');
      }

      const searchResult = result.searchResult[0];
      const count = parseInt(searchResult['@count']);

      if (count === 0) {
        console.log('No sold items found, returning mock data');
        return res.status(200).json({ results: generateMockData(q) });
      }

      const items = searchResult.item;
      const results = items.slice(0, 20).map((item: any) => ({
        title: item.title[0],
        price: parseFloat(item.sellingStatus[0].currentPrice[0].__value__),
        condition: item.condition?.[0]?.conditionDisplayName?.[0] || 'Unknown',
        seller: item.sellerInfo?.[0]?.sellerUserName?.[0] || 'Unknown',
        url: item.viewItemURL[0],
        imageUrl: item.galleryURL?.[0],
        shipping: parseFloat(item.shippingInfo?.[0]?.shippingServiceCost?.[0].__value__ || 0)
      }));

      console.log(`✅ Found ${results.length} sold items from eBay`);

      // Cache the successful response
      const responseData = { results, source: 'eBay Real Data' };
      setCache(cacheKey, responseData);

      return res.status(200).json(responseData);
    }

    throw new Error('Unexpected API response format');

  } catch (error: any) {
    console.error('❌ eBay API Error:');
    console.error('  - Message:', error.message);
    console.error('  - Status:', error.response?.status);
    console.error('  - Data:', JSON.stringify(error.response?.data, null, 2));

    if (error.response?.data) {
      console.error('  - Full Response:', error.response.data);
    }

    // Check for rate limit
    if (error.response?.data?.errorMessage) {
      const ebayError = error.response.data.errorMessage[0]?.error?.[0];
      console.error('  - eBay Error ID:', ebayError?.errorId?.[0]);
      console.error('  - eBay Error Message:', ebayError?.message?.[0]);

      if (ebayError?.errorId?.[0] === '10001') {
        return res.status(429).json({
          error: 'eBay API rate limit reached. Please try again later.',
          results: generateMockData(q)
        });
      }
    }

    // Return mock data on error
    console.log('⚠️ Returning mock data due to error');
    return res.status(200).json({
      results: generateMockData(q),
      source: 'Mock Data',
      note: 'Using sample data. Configure EBAY_CLIENT_ID in .env for real prices.',
      error: error.message
    });
  }
}

// Generate mock data as fallback
function generateMockData(query: string) {
  // Use real eBay search URLs with specific filters for mock data
  const listings = [
    {
      suffix: 'Near Mint Condition',
      condition: 'Near Mint',
      price: 125.00 + Math.random() * 50,
      shipping: 5.00,
      // SVG data URI for placeholder image
      imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%236366f1" width="400" height="400"/%3E%3Ctext fill="white" font-family="Arial" font-size="24" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ETCG Card%3C/text%3E%3C/svg%3E'
    },
    {
      suffix: 'Lightly Played',
      condition: 'Lightly Played',
      price: 90.00 + Math.random() * 40,
      shipping: 4.50,
      imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%238b5cf6" width="400" height="400"/%3E%3Ctext fill="white" font-family="Arial" font-size="24" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ETCG Card%3C/text%3E%3C/svg%3E'
    },
    {
      suffix: 'PSA 9 Mint',
      condition: 'PSA 9',
      price: 200.00 + Math.random() * 100,
      shipping: 8.00,
      imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23a855f7" width="400" height="400"/%3E%3Ctext fill="white" font-family="Arial" font-size="24" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EPSA 9%3C/text%3E%3C/svg%3E'
    },
    {
      suffix: 'Moderately Played',
      condition: 'Moderately Played',
      price: 60.00 + Math.random() * 30,
      shipping: 3.50,
      imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23ec4899" width="400" height="400"/%3E%3Ctext fill="white" font-family="Arial" font-size="24" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ETCG Card%3C/text%3E%3C/svg%3E'
    },
    {
      suffix: 'First Edition PSA 10',
      condition: 'PSA 10 Gem Mint',
      price: 500.00 + Math.random() * 200,
      shipping: 12.00,
      imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f43f5e" width="400" height="400"/%3E%3Ctext fill="white" font-family="Arial" font-size="24" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EPSA 10%3C/text%3E%3C/svg%3E'
    },
  ];

  return listings.map(item => ({
    title: `${query} - ${item.suffix}`,
    price: item.price,
    condition: item.condition,
    seller: `seller${Math.floor(Math.random() * 1000)}`,
    // Use actual eBay search with condition filter - this will show real similar items
    url: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query + ' ' + item.condition)}&_sop=12&rt=nc&LH_Sold=1&LH_Complete=1`,
    imageUrl: item.imageUrl,
    shipping: item.shipping,
  }));
}
