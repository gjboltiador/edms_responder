const https = require('https');
const http = require('http');

async function testAPICompleted() {
  try {
    console.log('🔍 Testing API for Completed alerts...\n');
    
    const data = await new Promise((resolve, reject) => {
      const req = http.get('http://localhost:3000/api/alerts', (res) => {
        console.log(`📡 API Response Status: ${res.statusCode}`);
        
        let body = '';
        res.on('data', chunk => {
          body += chunk;
          console.log(`📦 Received ${chunk.length} bytes`);
        });
        
        res.on('end', () => {
          console.log(`📦 Total received: ${body.length} bytes`);
          try {
            const parsed = JSON.parse(body);
            console.log('✅ JSON parsed successfully');
            resolve(parsed);
          } catch (e) {
            console.error('❌ JSON parse error:', e.message);
            console.log('Raw body:', body.substring(0, 200));
            reject(e);
          }
        });
      });
      
      req.on('error', (err) => {
        console.error('❌ Request error:', err.message);
        reject(err);
      });
      
      req.setTimeout(5000, () => {
        console.error('❌ Request timeout');
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });

    console.log(`📊 Total alerts: ${data.length}`);
    
    // Filter for completed alerts
    const completedAlerts = data.filter(alert => alert.status === 'Completed');
    
    console.log(`\n✅ Found ${completedAlerts.length} completed alerts:`);
    completedAlerts.forEach(alert => {
      console.log(`   - Alert #${alert.id}: ${alert.type} (${alert.status})`);
      console.log(`     Location: ${alert.location}`);
      console.log(`     Responder: ${alert.responder_name || 'Not assigned'}`);
      console.log('');
    });

    // Check if the filtering logic would work
    console.log('🔍 Testing current filtering logic:');
    const currentFilter = data.filter(alert => 
      alert.status === 'Completed' || alert.status === 'Resolved'
    );
    console.log(`   Current filter finds: ${currentFilter.length} alerts`);
    
    console.log('\n🎉 API test completed!');
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testAPICompleted(); 