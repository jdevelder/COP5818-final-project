import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const EBAY_APP_ID = process.env.EBAY_CLIENT_ID || process.env.EBAY_APP_ID;

  console.log('🧪 Testing eBay API...');
  console.log('App ID:', EBAY_APP_ID ? `${EBAY_APP_ID.substring(0, 30)}...` : 'NOT SET');

  if (!EBAY_APP_ID) {
    return res.status(400).json({ error: 'eBay API key not configured' });
  }

  try {
    // Try a simple findItemsByKeywords call (usually has higher limits)
    const testUrl = 'https://svcs.ebay.com/services/search/FindingService/v1';
    const params = {
      'OPERATION-NAME': 'findItemsByKeywords',
      'SERVICE-VERSION': '1.0.0',
      'SECURITY-APPNAME': EBAY_APP_ID,
      'RESPONSE-DATA-FORMAT': 'JSON',
      'REST-PAYLOAD': 'true',
      'keywords': 'pokemon',
      'paginationInput.entriesPerPage': '3',
    };

    console.log('Making test API call...');
    const response = await axios.get(testUrl, { params, timeout: 10000 });

    console.log('✅ API Response received');
    console.log('Status:', response.status);

    if (response.data.findItemsByKeywordsResponse) {
      const result = response.data.findItemsByKeywordsResponse[0];
      const ack = result.ack[0];

      return res.status(200).json({
        success: true,
        ack,
        message: 'eBay API is working!',
        timestamp: result.timestamp?.[0],
        itemCount: result.searchResult?.[0]?.['@count'] || 0,
      });
    }

    return res.status(200).json({
      success: false,
      message: 'Unexpected response format',
      data: response.data
    });

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);

    if (error.response?.data?.errorMessage) {
      const ebayError = error.response.data.errorMessage[0]?.error?.[0];
      return res.status(error.response.status || 500).json({
        success: false,
        error: ebayError?.message?.[0] || error.message,
        errorId: ebayError?.errorId?.[0],
        details: ebayError,
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
