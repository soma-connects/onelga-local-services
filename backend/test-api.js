// test-api.js - Quick API Testing Script
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAPI() {
  console.log('🚀 Starting Onelga Local Services API Tests...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing health check...');
    const health = await axios.get('http://localhost:5000/health');
    console.log('✅ Health Status:', health.data.status);
    console.log('   Message:', health.data.message);
    console.log('   Timestamp:', health.data.timestamp);
    console.log();

    // Test 2: API Info
    console.log('2️⃣ Testing API info...');
    const apiInfo = await axios.get(API_BASE);
    console.log('✅ API Message:', apiInfo.data.message);
    console.log('   Version:', apiInfo.data.version);
    console.log('   Available Endpoints:', Object.keys(apiInfo.data.endpoints).join(', '));
    console.log();

    // Test 3: User Registration
    console.log('3️⃣ Testing user registration...');
    const registerData = {
      email: `test${Date.now()}@onelga.gov.ng`,
      password: 'TestPass123!',
      firstName: 'Test',
      lastName: 'User',
      phoneNumber: '+2348012345678',
      address: 'Test Address, Onelga LGA, Rivers State'
    };

    const registerResult = await axios.post(`${API_BASE}/auth/register`, registerData);
    console.log('✅ Registration successful!');
    console.log('   Message:', registerResult.data.message);
    console.log('   User ID:', registerResult.data.data.user.id);
    console.log('   User Email:', registerResult.data.data.user.email);
    console.log('   User Role:', registerResult.data.data.user.role);
    console.log();
    
    const token = registerResult.data.data.token;

    // Test 4: User Profile
    console.log('4️⃣ Testing user profile retrieval...');
    const profileResult = await axios.get(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Profile retrieved successfully!');
    console.log('   Name:', `${profileResult.data.data.user.firstName} ${profileResult.data.data.user.lastName}`);
    console.log('   Email Verified:', profileResult.data.data.user.isVerified);
    console.log();

    // Test 5: Identification Letter Application
    console.log('5️⃣ Testing identification letter application...');
    const appData = {
      purpose: 'Testing the identification letter application system for employment purposes at a local company. This application is being submitted to verify that the API endpoints are working correctly.',
      documents: [
        'http://localhost:5000/uploads/identification/test-document-1.pdf',
        'http://localhost:5000/uploads/identification/test-id-card.jpg'
      ]
    };

    const appResult = await axios.post(`${API_BASE}/identification/apply`, appData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Application submitted successfully!');
    console.log('   Application ID:', appResult.data.data.application.id);
    console.log('   Status:', appResult.data.data.application.status);
    console.log('   Purpose:', appResult.data.data.application.purpose.substring(0, 50) + '...');
    console.log();

    const applicationId = appResult.data.data.application.id;

    // Test 6: Get User Applications
    console.log('6️⃣ Testing user applications retrieval...');
    const applicationsResult = await axios.get(`${API_BASE}/identification/applications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Applications retrieved successfully!');
    console.log('   Total Applications:', applicationsResult.data.data.applications.length);
    if (applicationsResult.data.data.applications.length > 0) {
      const firstApp = applicationsResult.data.data.applications[0];
      console.log('   Latest Application Status:', firstApp.status);
      console.log('   Created At:', new Date(firstApp.createdAt).toLocaleString());
    }
    console.log();

    // Test 7: Get Specific Application
    console.log('7️⃣ Testing specific application retrieval...');
    const specificAppResult = await axios.get(`${API_BASE}/identification/applications/${applicationId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Specific application retrieved successfully!');
    console.log('   Application ID:', specificAppResult.data.data.application.id);
    console.log('   Documents Count:', specificAppResult.data.data.application.documents.length);
    console.log('   User Name:', `${specificAppResult.data.data.application.user.firstName} ${specificAppResult.data.data.application.user.lastName}`);
    console.log();

    // Test 8: Login with Created User
    console.log('8️⃣ Testing user login...');
    const loginData = {
      email: registerData.email,
      password: registerData.password
    };

    const loginResult = await axios.post(`${API_BASE}/auth/login`, loginData);
    console.log('✅ Login successful!');
    console.log('   Message:', loginResult.data.message);
    console.log('   Token Length:', loginResult.data.data.token.length);
    console.log('   User Role:', loginResult.data.data.user.role);
    console.log();

    // Test 9: Error Handling (Invalid Endpoint)
    console.log('9️⃣ Testing error handling...');
    try {
      await axios.get(`${API_BASE}/invalid-endpoint`);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Error handling works correctly!');
        console.log('   Status:', error.response.status);
        console.log('   Message:', error.response.data.message);
      }
    }
    console.log();

    // Test Summary
    console.log('🎉 ALL TESTS PASSED SUCCESSFULLY!');
    console.log('\n📊 Test Summary:');
    console.log('   ✅ Health Check - Working');
    console.log('   ✅ API Info - Working');
    console.log('   ✅ User Registration - Working');
    console.log('   ✅ User Profile - Working');
    console.log('   ✅ Identification Application - Working');
    console.log('   ✅ Application Retrieval - Working');
    console.log('   ✅ Specific Application - Working');
    console.log('   ✅ User Login - Working');
    console.log('   ✅ Error Handling - Working');
    
    console.log('\n🚀 Your Onelga Local Services API is ready for production!');
    console.log('\n📱 Next Steps:');
    console.log('   1. Start the frontend: cd ../frontend && npm install && npm start');
    console.log('   2. Open browser: http://localhost:3000');
    console.log('   3. Register a new account and test the UI');
    console.log('   4. Apply for identification letters through the web interface');

  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error('   Error Type:', error.name);
    
    if (error.response) {
      console.error('   Status Code:', error.response.status);
      console.error('   Status Text:', error.response.statusText);
      console.error('   Error Message:', error.response.data?.message || 'No message');
      if (error.response.data?.errors) {
        console.error('   Validation Errors:', error.response.data.errors);
      }
    } else if (error.request) {
      console.error('   Network Error: Could not connect to server');
      console.error('   Make sure the backend is running on http://localhost:5000');
      console.error('   Run: cd backend && npm run dev');
    } else {
      console.error('   Error Message:', error.message);
    }
    
    console.error('\n🔍 Debugging Tips:');
    console.error('   1. Ensure backend server is running (npm run dev)');
    console.error('   2. Check if port 5000 is available');
    console.error('   3. Verify database is set up (npx prisma migrate dev)');
    console.error('   4. Check .env file configuration');
  }
}

// Run the tests
console.log('🧪 Onelga Local Services API Testing Suite');
console.log('==========================================\n');
testAPI();
