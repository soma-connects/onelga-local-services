# Onelga Local Services - Development Setup Script
# This script sets up the development environment for Windows

param(
    [switch]$SkipDependencies,
    [switch]$SkipDatabase,
    [switch]$Help
)

if ($Help) {
    Write-Host "Onelga Local Services - Development Setup Script" -ForegroundColor Green
    Write-Host ""
    Write-Host "Usage: .\setup-dev.ps1 [OPTIONS]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -SkipDependencies    Skip installing npm dependencies"
    Write-Host "  -SkipDatabase        Skip database setup"
    Write-Host "  -Help               Show this help message"
    Write-Host ""
    exit 0
}

Write-Host "🚀 Setting up Onelga Local Services Development Environment" -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Green

# Check if Node.js is installed
Write-Host "📦 Checking Node.js installation..." -ForegroundColor Cyan
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ and try again." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed." -ForegroundColor Red
    exit 1
}

# Check if Docker is installed (optional)
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker version: $dockerVersion" -ForegroundColor Green
    $dockerAvailable = $true
} catch {
    Write-Host "⚠️  Docker is not installed. You can still run the project but will need to set up PostgreSQL manually." -ForegroundColor Yellow
    $dockerAvailable = $false
}

if (-not $SkipDependencies) {
    # Install root dependencies
    Write-Host "📦 Installing root dependencies..." -ForegroundColor Cyan
    npm install

    # Install backend dependencies
    Write-Host "📦 Installing backend dependencies..." -ForegroundColor Cyan
    Set-Location backend
    npm install
    Set-Location ..

    # Install frontend dependencies
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Cyan
    Set-Location frontend
    npm install
    Set-Location ..

    Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
}

# Set up environment files
Write-Host "🔧 Setting up environment files..." -ForegroundColor Cyan

if (-not (Test-Path "backend\.env")) {
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "✅ Created backend .env file" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Backend .env file already exists" -ForegroundColor Yellow
}

if (-not (Test-Path "frontend\.env")) {
    @"
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENVIRONMENT=development
GENERATE_SOURCEMAP=false
"@ | Out-File -FilePath "frontend\.env" -Encoding utf8
    Write-Host "✅ Created frontend .env file" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Frontend .env file already exists" -ForegroundColor Yellow
}

if (-not $SkipDatabase) {
    if ($dockerAvailable) {
        # Set up database with Docker
        Write-Host "🐳 Setting up database with Docker..." -ForegroundColor Cyan
        
        try {
            # Start PostgreSQL and Redis containers
            docker-compose up -d postgres redis
            
            Write-Host "⏳ Waiting for database to be ready..." -ForegroundColor Cyan
            Start-Sleep -Seconds 10
            
            # Generate Prisma client and run migrations
            Set-Location backend
            npx prisma generate
            npx prisma migrate dev --name init
            npx prisma db seed
            Set-Location ..
            
            Write-Host "✅ Database setup completed!" -ForegroundColor Green
            
        } catch {
            Write-Host "❌ Error setting up database: $_" -ForegroundColor Red
        }
        
    } else {
        Write-Host "⚠️  Please set up PostgreSQL manually and update the DATABASE_URL in backend/.env" -ForegroundColor Yellow
    }
}

# Create necessary directories
Write-Host "📁 Creating necessary directories..." -ForegroundColor Cyan
$directories = @("backend\uploads", "backend\logs", "infrastructure\nginx\ssl")
foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "✅ Created directory: $dir" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "🎉 Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Review the .env files in backend/ and frontend/ directories" -ForegroundColor White
Write-Host "2. Update database credentials if not using Docker" -ForegroundColor White
Write-Host "3. Run 'npm run dev' to start both frontend and backend" -ForegroundColor White
Write-Host ""
Write-Host "Available commands:" -ForegroundColor Cyan
Write-Host "  npm run dev          - Start both frontend and backend" -ForegroundColor White
Write-Host "  npm run dev:frontend - Start frontend only" -ForegroundColor White
Write-Host "  npm run dev:backend  - Start backend only" -ForegroundColor White
Write-Host ""
Write-Host "Docker commands:" -ForegroundColor Cyan
Write-Host "  docker-compose up -d                 - Start all services" -ForegroundColor White
Write-Host "  docker-compose up -d postgres redis  - Start database services only" -ForegroundColor White
Write-Host "  docker-compose down                  - Stop all services" -ForegroundColor White
Write-Host ""
Write-Host "Database management:" -ForegroundColor Cyan
Write-Host "  npx prisma studio                   - Open database browser" -ForegroundColor White
Write-Host "  http://localhost:8080               - PgAdmin (if using Docker)" -ForegroundColor White
