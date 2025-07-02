// Simple test script for responder status API
// Run this after starting the dev server

console.log('Testing Responder Status API...\n');
console.log('Please run the following commands in your browser console or use a tool like Postman:\n');

console.log('1. Test GET responder by username:');
console.log('fetch("/api/responder/status?username=testuser")');
console.log('  .then(r => r.json())');
console.log('  .then(console.log)');
console.log('  .catch(console.error);\n');

console.log('2. Test POST status update (will fail if responder not found):');
console.log('fetch("/api/responder/status", {');
console.log('  method: "POST",');
console.log('  headers: { "Content-Type": "application/json" },');
console.log('  body: JSON.stringify({');
console.log('    responderId: 999,');
console.log('    status: "Available",');
console.log('    latitude: 40.7128,');
console.log('    longitude: -74.0060,');
console.log('    accuracy: 10');
console.log('  })');
console.log('})');
console.log('  .then(r => r.json())');
console.log('  .then(console.log)');
console.log('  .catch(console.error);\n');

console.log('3. Test with invalid data:');
console.log('fetch("/api/responder/status", {');
console.log('  method: "POST",');
console.log('  headers: { "Content-Type": "application/json" },');
console.log('  body: JSON.stringify({');
console.log('    responderId: null,');
console.log('    status: "InvalidStatus"');
console.log('  })');
console.log('})');
console.log('  .then(r => r.json())');
console.log('  .then(console.log)');
console.log('  .catch(console.error);\n');

console.log('Expected results:');
console.log('- Test 1: Should return 404 "Responder not found"');
console.log('- Test 2: Should update status but may fail if responder 999 doesn\'t exist');
console.log('- Test 3: Should return 400 "Invalid status" and "Responder ID required"'); 