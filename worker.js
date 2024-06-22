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
    const requestBody = await request.json()
  
    // Define your Cloudflare Worker AI API endpoint and key
    const apiUrl = 'https://api.cloudflare.com/client/v4/accounts/0ace3b07ef566bc61d722a7d3a4bc895/ai/run/@cf/meta/llama-3-8b-instruct'
    const apiKey = 'xDVpTtb395h-M0YDhEnCpuGwQ8KrsPCdLGbCpMlq'
  
    // Forward the request to the Cloudflare Worker AI API
    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
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
  