const fetch = require('node-fetch');

async function testApiEndpoints() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  
  console.log('Testing API endpoints at:', baseUrl);
  
  // Test 1: Alerts endpoint
  try {
    console.log('\n1. Testing /api/alerts...');
    const alertsResponse = await fetch(`${baseUrl}/api/alerts`);
    console.log('Status:', alertsResponse.status);
    
    if (alertsResponse.ok) {
      const alertsData = await alertsResponse.json();
      console.log('✅ Alerts endpoint working. Found', alertsData.length, 'alerts');
    } else {
      const errorText = await alertsResponse.text();
      console.log('❌ Alerts endpoint failed:', errorText);
    }
  } catch (error) {
    console.log('❌ Alerts endpoint error:', error.message);
  }
  
  // Test 2: Responder status endpoint
  try {
    console.log('\n2. Testing /api/responder/status...');
    const responderResponse = await fetch(`${baseUrl}/api/responder/status?username=test_responder`);
    console.log('Status:', responderResponse.status);
    
    if (responderResponse.ok) {
      const responderData = await responderResponse.json();
      console.log('✅ Responder status endpoint working:', responderData);
    } else {
      const errorText = await responderResponse.text();
      console.log('❌ Responder status endpoint failed:', errorText);
    }
  } catch (error) {
    console.log('❌ Responder status endpoint error:', error.message);
  }
  
  // Test 3: GPS endpoint
  try {
    console.log('\n3. Testing /api/gps...');
    const gpsResponse = await fetch(`${baseUrl}/api/gps`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dispatch_id: 1,
        latitude: 14.5995,
        longitude: 120.9842,
      }),
    });
    console.log('Status:', gpsResponse.status);
    
    if (gpsResponse.ok) {
      const gpsData = await gpsResponse.json();
      console.log('✅ GPS endpoint working:', gpsData);
    } else {
      const errorText = await gpsResponse.text();
      console.log('❌ GPS endpoint failed:', errorText);
    }
  } catch (error) {
    console.log('❌ GPS endpoint error:', error.message);
  }
}

testApiEndpoints(); 