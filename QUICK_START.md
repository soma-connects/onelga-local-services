# 🚀 Quick Start Guide - Onelga Local Services

## ✅ Prerequisites Check
- [x] Node.js installed (check with `node --version`)
- [x] Project files downloaded to your computer
- [x] You're currently in the project folder

## 🎯 Step-by-Step Testing (Using Command Prompt)

### Step 1: Open Command Prompt
- Press `Win + R`
- Type `cmd` and press Enter
- Navigate to project: `cd "C:\Users\paulji peters\onelga-local-services"`

### Step 2: Start Backend Server
```cmd
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

**Expected Output:**
```
🚀 Onelga Local Services API server running on port 5000
📚 API Documentation available at http://localhost:5000/api/docs
🏥 Health check available at http://localhost:5000/health
```

**✅ Verification:** Open browser → `http://localhost:5000/health`
Should see: `{"status":"OK","message":"Onelga Local Services API is running"}`

### Step 3: Test Backend API (Optional)
**In the same cmd window:**
```cmd
node test-api.js
```

**Expected:** Should see ✅ for all 9 tests

### Step 4: Start Frontend (New Command Prompt)
- Open **NEW** Command Prompt (keep backend running)
- Navigate to project:
```cmd
cd "C:\Users\paulji peters\onelga-local-services\frontend"
npm install
npm start
```

**Expected:** Browser opens automatically at `http://localhost:3000`

## 🌟 What You Should See

### Backend (Port 5000)
- ✅ Health Check: `http://localhost:5000/health`
- ✅ API Documentation: `http://localhost:5000/api/docs`
- ✅ Welcome Message: `http://localhost:5000/api`

### Frontend (Port 3000)
- ✅ Professional Onelga Homepage
- ✅ Blue header with "Onelga Local Services"
- ✅ Navigation menu with Home, Services, Login, Register
- ✅ "Get Started" buttons

## 🧪 Testing the Application

### 1. User Registration
1. Click **"Register"** button
2. Fill out the form:
   - Email: `test@onelga.gov.ng`
   - Password: `TestPass123!`
   - First Name: `John`
   - Last Name: `Doe`
   - Phone: `+2348012345678`
3. Click **"Register"**
4. Should see success message

### 2. Login
1. Click **"Login"** button
2. Use the same credentials
3. Should redirect to dashboard

### 3. Apply for Identification Letter
1. Navigate to **Services** → **"Identification Letters"**
2. Click **"Apply for New Letter"**
3. Fill purpose: `"For employment at my new job in Onelga Local Government"`
4. Upload test files (any PDF/JPG/PNG files)
5. Click **"Submit Application"**
6. Should see success toast and application in table

### 4. View Application Status
1. Check the applications table
2. See your application with "PENDING" status
3. Click the eye icon to view details
4. For mock approved applications, try download

## 🔍 Troubleshooting

### "npm command not found"
- Ensure Node.js is installed and in PATH
- Restart Command Prompt

### "Port already in use" 
- Backend: Change PORT in `.env` file
- Frontend: Select "yes" when asked to use different port

### "Module not found" errors
- Run `npm install` in the respective folder
- Delete `node_modules` and run `npm install` again

### Database errors
- Delete `backend/dev.db` file
- Re-run `npx prisma migrate dev --name init`

### CORS errors in browser
- Ensure backend runs on port 5000
- Frontend should be on port 3000
- Check `.env` files have correct URLs

## ⚡ Quick Fix Commands

**Reset everything:**
```cmd
# In backend folder
del dev.db
npm install
npx prisma migrate dev --name init

# In frontend folder  
rmdir /s node_modules
npm install
```

**Check if ports are available:**
```cmd
netstat -ano | findstr :5000
netstat -ano | findstr :3000
```

## 🎉 Success Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000  
- [ ] Can register new users
- [ ] Can login with credentials
- [ ] Can navigate to Identification service
- [ ] Can submit applications with file uploads
- [ ] Can view application status
- [ ] No errors in browser console

## 📱 Expected Features Working

✅ **Authentication System**
- User registration with validation
- Login/logout functionality
- JWT token management
- Profile management

✅ **Identification Letter Service**
- Application form with file upload
- File validation (type, size)
- Application status tracking
- Mock data for testing

✅ **UI/UX Features**
- Responsive design
- Professional Onelga branding
- Toast notifications
- Loading states
- Error handling

## 🚀 Next Steps

Once everything is working:

1. **Add Real API Integration**
   - Update `services/api.ts` to use real backend
   - Remove mock data from components

2. **Implement Additional Services**
   - Birth Certificate
   - Health Services  
   - Business Registration
   - Transport Services

3. **Deploy to Production**
   - Set up PostgreSQL database
   - Configure AWS infrastructure
   - Deploy backend and frontend

## 💡 Tips for Success

- Keep both Command Prompt windows open
- Use Ctrl+C to stop servers
- Check browser console for errors
- Use network tab to debug API calls
- Check backend logs for server errors

## 🆘 Need Help?

If you encounter issues:
1. Check the console logs carefully
2. Verify ports 5000 and 3000 are available
3. Ensure Node.js is properly installed
4. Try the Quick Fix Commands above
5. Create new Command Prompt windows if needed

**Happy Testing! 🎊**
