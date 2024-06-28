addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
  })
  
  async function handleRequest(request) {
   
  
    if (request.method === 'OPTIONS') {
        // Respond to CORS preflight request.
        const headers = {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400', // Cache preflight response for 1 day
        };
      
        return new Response(null, { status: 204, headers });
      
    }
  
    // Ensure this is a POST request
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }
  
    // Parse the request body
    const {accountID,token,modelName,prompt} = await request.json()
    // Define your Cloudflare Worker AI API endpoint and key
    const apiUrl = `https://api.cloudflare.com/client/v4/accounts/${accountID.length > 8 ? accountID : '03e6356abbf9f3e94b9c975db2a9bdc8'}/ai/run/${modelName.length > 8 ? modelName : '@cf/meta/llama-3-8b-instruct'}`
    const apiKey = `${token.length > 8 ? token : '3GpWpJnMn5JJPLsJ__rkrblFIlET3zu7y_gCEhh4'}`
  
    // Forward the request to the Cloudflare Worker AI API
    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({prompt: prompt})
    })
  
    // Return the API response
    return new Response(apiResponse.body, {
      status: apiResponse.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        
      }
    })
  }
  