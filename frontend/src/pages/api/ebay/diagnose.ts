import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const EBAY_APP_ID = process.env.EBAY_CLIENT_ID || process.env.EBAY_APP_ID;

  console.log('🔬 eBay API Diagnostic Starting...\n');

  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    keyConfigured: !!EBAY_APP_ID,
    keyPrefix: EBAY_APP_ID ? EBAY_APP_ID.substring(0, 25) + '...' : 'NOT SET',
    tests: [],
  };

  if (!EBAY_APP_ID) {
    return res.status(400).json({
      ...diagnostics,
      error: 'No API key configured',
    });
  }

  // Test 1: Basic connectivity
  console.log('Test 1: Testing basic eBay API connectivity...');
  try {
    const response = await axios.get('https://svcs.ebay.com/services/search/FindingService/v1', {
      params: {
        'OPERATION-NAME': 'getVersion',
        'SERVICE-VERSION': '1.0.0',
        'SECURITY-APPNAME': EBAY_APP_ID,
        'RESPONSE-DATA-FORMAT': 'JSON',
        'REST-PAYLOAD': 'true',
      },
      timeout: 5000,
    });

    diagnostics.tests.push({
      name: 'Basic Connectivity',
      status: 'PASS',
      message: 'eBay API is reachable',
      version: response.data.getVersionResponse?.[0]?.version?.[0],
    });
  } catch (error: any) {
    diagnostics.tests.push({
      name: 'Basic Connectivity',
      status: 'FAIL',
      error: error.message,
    });
  }

  // Test 2: Authentication
  console.log('Test 2: Testing authentication...');
  try {
    const response = await axios.get('https://svcs.ebay.com/services/search/FindingService/v1', {
      params: {
        'OPERATION-NAME': 'findItemsByKeywords',
        'SERVICE-VERSION': '1.0.0',
        'SECURITY-APPNAME': EBAY_APP_ID,
        'RESPONSE-DATA-FORMAT': 'JSON',
        'REST-PAYLOAD': 'true',
        'keywords': 'test',
        'paginationInput.entriesPerPage': '1',
      },
      timeout: 10000,
    });

    const ack = response.data.findItemsByKeywordsResponse?.[0]?.ack?.[0];

    if (ack === 'Success') {
      diagnostics.tests.push({
        name: 'Authentication',
        status: 'PASS',
        message: 'API key is valid and working',
        ack,
      });
    } else if (ack === 'Warning') {
      diagnostics.tests.push({
        name: 'Authentication',
        status: 'WARNING',
        message: 'API key works but with warnings',
        ack,
        warnings: response.data.findItemsByKeywordsResponse?.[0]?.errorMessage,
      });
    } else {
      diagnostics.tests.push({
        name: 'Authentication',
        status: 'FAIL',
        message: 'API key not working properly',
        ack,
      });
    }
  } catch (error: any) {
    const ebayError = error.response?.data?.errorMessage?.[0]?.error?.[0];

    diagnostics.tests.push({
      name: 'Authentication',
      status: 'FAIL',
      error: ebayError?.message?.[0] || error.message,
      errorId: ebayError?.errorId?.[0],
      errorDetails: ebayError,
    });

    // Check if it's specifically a rate limit issue
    if (ebayError?.errorId?.[0] === '10001') {
      diagnostics.rateLimitHit = true;
      diagnostics.rateLimitMessage = ebayError?.message?.[0];
    }
  }

  // Test 3: Check different operations
  const operations = ['findItemsByKeywords', 'findCompletedItems'];

  for (const operation of operations) {
    console.log(`Test 3: Testing ${operation} operation...`);

    try {
      const params: any = {
        'OPERATION-NAME': operation,
        'SERVICE-VERSION': '1.0.0',
        'SECURITY-APPNAME': EBAY_APP_ID,
        'RESPONSE-DATA-FORMAT': 'JSON',
        'REST-PAYLOAD': 'true',
        'keywords': 'test',
        'paginationInput.entriesPerPage': '1',
      };

      // Add specific filters for completed items
      if (operation === 'findCompletedItems') {
        params['itemFilter(0).name'] = 'SoldItemsOnly';
        params['itemFilter(0).value'] = 'true';
      }

      const response = await axios.get(
        'https://svcs.ebay.com/services/search/FindingService/v1',
        { params, timeout: 10000 }
      );

      const ack = response.data[`${operation}Response`]?.[0]?.ack?.[0];

      diagnostics.tests.push({
        name: `Operation: ${operation}`,
        status: ack === 'Success' ? 'PASS' : 'FAIL',
        ack,
      });

      // Small delay between tests to avoid rapid-fire requests
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error: any) {
      const ebayError = error.response?.data?.errorMessage?.[0]?.error?.[0];

      diagnostics.tests.push({
        name: `Operation: ${operation}`,
        status: 'FAIL',
        errorId: ebayError?.errorId?.[0],
        error: ebayError?.message?.[0] || error.message,
      });
    }
  }

  console.log('\n📊 Diagnostic Results:', JSON.stringify(diagnostics, null, 2));

  return res.status(200).json(diagnostics);
}
