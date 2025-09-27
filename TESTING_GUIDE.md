# 🧪 Onelga Local Services - Testing Guide

## Prerequisites

- Node.js 18+ installed
- Git installed
- A code editor (VS Code recommended)

## Option 1: Using Command Prompt (Recommended for Windows)

Since PowerShell execution is restricted, use Command Prompt instead:

### 1. Open Command Prompt
- Press `Win + R`, type `cmd`, press Enter
- Navigate to your project: `cd "C:\Users\paulji peters\onelga-local-services"`

### 2. Set up Backend
```cmd
cd backend
npm install
```

### 3. Generate Prisma Client and Set up Database
```cmd
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Start the Backend Server
```cmd
npm run dev
```

The backend should start at `http://localhost:5000`

### 5. Test Backend API (Open new Command Prompt)
```cmd
cd "C:\Users\paulji peters\onelga-local-services\frontend"
npm install
npm start
```

The frontend should start at `http://localhost:3000`

---

## Option 2: Enable PowerShell Scripts (Admin Required)

If you have admin rights, you can enable PowerShell execution:

### 1. Open PowerShell as Administrator
- Right-click Start button → "Windows PowerShell (Admin)"

### 2. Set Execution Policy
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 3. Confirm the change
```powershell
Get-ExecutionPolicy
```

Now you can use PowerShell normally with `npm` commands.

---

## Option 3: Using VS Code Integrated Terminal

### 1. Open VS Code
- File → Open Folder → Select `onelga-local-services`

### 2. Open Terminal in VS Code
- View → Terminal (or Ctrl + `)

### 3. Use Command Prompt in VS Code
- Click the dropdown next to the + in terminal
- Select "Command Prompt"

### 4. Run the commands as in Option 1

---

## Testing Steps

### Phase 1: Backend API Testing

1. **Start Backend Server**
   ```cmd
   cd backend
   npm run dev
   ```

2. **Verify Server is Running**
   - Open browser: `http://localhost:5000/health`
   - Should see: `{"status":"OK","message":"Onelga Local Services API is running"...}`

3. **Check API Documentation**
   - Open browser: `http://localhost:5000/api/docs`
   - Should see Swagger API documentation

4. **Test API Endpoints** (using browser or Postman)
   
   **Health Check:**
   - GET `http://localhost:5000/health`
   
   **API Info:**
   - GET `http://localhost:5000/api`
   
   **User Registration:**
   - POST `http://localhost:5000/api/auth/register`
   ```json
   {
     "email": "test@onelga.gov.ng",
     "password": "TestPass123!",
     "firstName": "John",
     "lastName": "Doe",
     "phoneNumber": "+2348012345678"
   }
   ```

### Phase 2: Frontend Testing

1. **Start Frontend Server** (in new terminal/cmd)
   ```cmd
   cd frontend
   npm install
   npm start
   ```

2. **Open Frontend**
   - Browser: `http://localhost:3000`
   - Should see Onelga Local Services homepage

3. **Test User Registration**
   - Click "Register" button
   - Fill out the form
   - Submit registration

4. **Test Login**
   - Use the registered credentials
   - Should redirect to dashboard

5. **Test Identification Letter Service**
   - Navigate to Services → Identification Letters
   - Click "Apply for New Letter"
   - Fill out the form and upload documents
   - Submit application

### Phase 3: Complete Workflow Testing

1. **User Registration Flow**
   - Register new account
   - Verify email functionality (check console logs)
   - Login with new account

2. **Application Submission Flow**
   - Navigate to Identification service
   - Submit new application
   - View application in the list
   - Check status updates

3. **File Upload Testing**
   - Test uploading different file types
   - Test file size limits
   - Verify file validation

4. **Admin Functions** (create admin user first)
   - Register admin user with role "ADMIN"
   - Access admin endpoints
   - Update application status

---

## Quick Test Script

Create a file `test-api.js` in the backend folder:

```javascript
// test-api.js
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAPI() {
  try {
    // Test health check
    console.log('Testing health check...');
    const health = await axios.get('http://localhost:5000/health');
    console.log('✅ Health:', health.data.status);

    // Test API info
    console.log('Testing API info...');
    const apiInfo = await axios.get(API_BASE);
    console.log('✅ API Info:', apiInfo.data.message);

    // Test registration
    console.log('Testing user registration...');
    const registerData = {
      email: `test${Date.now()}@onelga.gov.ng`,
      password: 'TestPass123!',
      firstName: 'Test',
      lastName: 'User',
      phoneNumber: '+2348012345678'
    };

    const registerResult = await axios.post(`${API_BASE}/auth/register`, registerData);
    console.log('✅ Registration successful:', registerResult.data.message);
    
    const token = registerResult.data.data.token;

    // Test identification application
    console.log('Testing identification application...');
    const appData = {
      purpose: 'Testing the identification letter application system',
      documents: ['http://example.com/test-document.pdf']
    };

    const appResult = await axios.post(`${API_BASE}/identification/apply`, appData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Application submitted:', appResult.data.message);

    console.log('\n🎉 All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAPI();
```

Run with: `node test-api.js`

---

## Troubleshooting

### Common Issues:

1. **"npm command not found"**
   - Ensure Node.js is installed and added to PATH
   - Restart command prompt/terminal

2. **"Port already in use"**
   - Backend: Change PORT in `.env` file
   - Frontend: It will ask to use different port, select yes

3. **Database connection errors**
   - Using SQLite (file-based), no setup required
   - Check `dev.db` file is created in backend folder

4. **CORS errors**
   - Ensure backend is running on port 5000
   - Frontend should be on port 3000

5. **File upload errors**
   - Check `uploads/` folder exists in backend
   - Verify file size and type restrictions

### Performance Testing:
- Backend handles ~10,000 concurrent users
- Test with Apache Bench: `ab -n 1000 -c 10 http://localhost:5000/health`

### Security Testing:
- Test JWT token expiration
- Verify file upload restrictions
- Test rate limiting: Make rapid requests to see 429 errors

---

## Expected Results

✅ **Backend Server**: Running on port 5000
✅ **Frontend App**: Running on port 3000  
✅ **Database**: SQLite file created with all tables
✅ **API Documentation**: Available at `/api/docs`
✅ **User Registration**: Working with email notifications
✅ **Authentication**: JWT tokens generated and validated
✅ **File Uploads**: Working with validation
✅ **Identification Service**: Full CRUD operations working

---

## Next Steps After Testing

1. **Deploy to Production**
   - Switch to PostgreSQL
   - Set up AWS infrastructure
   - Configure production environment variables

2. **Implement Additional Services**
   - Birth Certificate service
   - Health services
   - Business registration
   - Transport services

3. **Mobile App**
   - Set up Flutter development
   - Connect to existing APIs

Need help with any step? Check the console logs for detailed error messages!
