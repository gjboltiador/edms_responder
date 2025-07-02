// Test script to verify completed reports filtering logic

// Sample data from your API response
const apiData = [
  {
    "id": 2,
    "type": "Medical",
    "status": "accepted",
    "responder_name": null
  },
  {
    "id": 3,
    "type": "Medical", 
    "status": "accepted",
    "responder_name": null
  },
  {
    "id": 4,
    "type": "Medical",
    "status": "Pending",
    "responder_name": null
  },
  {
    "id": 1,
    "type": "Trauma",
    "status": "completed",
    "responder_name": "Light Boltiador"
  },
  {
    "id": 16,
    "type": "Other",
    "status": "completed", 
    "responder_name": null
  }
];

console.log('🔍 Testing Completed Reports Filtering Logic\n');

// Test 1: Current (broken) filtering logic
console.log('1. Current (broken) filtering logic:');
const currentFilter = apiData.filter((alert) => 
  alert.status === 'Completed' || alert.status === 'Resolved'
);
console.log(`   ❌ Found ${currentFilter.length} completed alerts`);
currentFilter.forEach(alert => {
  console.log(`      - Alert #${alert.id}: ${alert.type} (${alert.status})`);
});

// Test 2: Fixed (case-insensitive) filtering logic
console.log('\n2. Fixed (case-insensitive) filtering logic:');
const fixedFilter = apiData.filter((alert) => {
  const status = alert.status?.toLowerCase();
  return status === 'completed' || status === 'resolved';
});
console.log(`   ✅ Found ${fixedFilter.length} completed alerts`);
fixedFilter.forEach(alert => {
  console.log(`      - Alert #${alert.id}: ${alert.type} (${alert.status})`);
});

// Test 3: Show all statuses for debugging
console.log('\n3. All alert statuses in data:');
const statuses = [...new Set(apiData.map(alert => alert.status))];
statuses.forEach(status => {
  const count = apiData.filter(alert => alert.status === status).length;
  console.log(`   - "${status}": ${count} alerts`);
});

console.log('\n🎉 Test completed!');
console.log('\n💡 The issue is case sensitivity in the filtering logic.');
console.log('   Current code looks for "Completed" but data has "completed".'); 