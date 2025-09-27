# Onelga Comprehensive Local Services Application

A user-friendly, secure, and scalable web and mobile application providing citizens and non-citizens in Onelga with a centralized platform for accessing essential local government services.

## 🎯 Project Overview

This application digitizes and automates access to local government services in Onelga, improving efficiency, transparency, and user experience. It serves diverse users (citizens, businesses, government administrators) via web and mobile platforms.

## 🏗️ Architecture

```
onelga-local-services/
├── frontend/           # React.js web application (TypeScript)
├── backend/            # Node.js/Express API server
├── mobile/             # Flutter mobile application
├── infrastructure/     # AWS infrastructure & DevOps configs
├── docs/               # Documentation & API specs
└── tests/              # Integration & E2E tests
```

## 🚀 Services Provided

### Core Services
- **Local Identification Letters** - Register and retrieve digital ID letters
- **Birth Certificates** - Online birth registration and certificate retrieval
- **Health Services** - Appointment booking and emergency services
- **Business/Trade Services** - Registration, licensing, and tax filing
- **Transport/Delivery Services** - Vehicle registration and logistics
- **Social Security/Complaints** - Complaint tracking and benefit applications
- **Education Services** - School registration and scholarship applications
- **Housing/Land Services** - Property registration and tax payments


## ♿ Accessibility

This project is committed to providing an accessible experience for all users, including those with disabilities. Key accessibility features include:

- Use of ARIA roles and attributes (e.g., `aria-label`, `role`, `aria-live`) for screen reader support.
- Semantic HTML and Material-UI components for better keyboard and assistive technology compatibility.
- Visible focus indicators and keyboard navigation for all interactive elements.
- Sufficient color contrast and support for high-contrast modes.
- Accessible form labels and error messages.
- Regular accessibility testing using `@testing-library/react` and `jest-axe`.

We follow [WCAG 2.1 AA](https://www.w3.org/WAI/standards-guidelines/wcag/) guidelines and best practices for web accessibility.

## 🛠️ Technology Stack

### Frontend (Web)
- **Framework:** React.js with TypeScript
- **UI Library:** Material-UI / Ant Design
- **State Management:** Redux Toolkit / Zustand
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Build Tool:** Vite / Create React App

### Backend (API)
- **Runtime:** Node.js (18+)
- **Framework:** Express.js
- **Language:** TypeScript
- **Authentication:** JWT + bcrypt
- **Database ORM:** Prisma / Sequelize
- **Validation:** Joi / Zod
- **Documentation:** Swagger/OpenAPI

### Mobile
- **Framework:** Flutter (Dart)
- **State Management:** Bloc / Provider
- **HTTP Client:** Dio
- **Local Storage:** SharedPreferences / Hive

### Database
- **Primary:** PostgreSQL
- **Caching:** Redis
- **File Storage:** AWS S3

### Infrastructure
- **Cloud:** AWS (EC2, RDS, S3, Lambda)
- **Containerization:** Docker
- **CI/CD:** GitHub Actions
- **Monitoring:** AWS CloudWatch

## 📋 Prerequisites

Before running this project, ensure you have:

- **Node.js** (18.0.0 or higher)
- **npm** (9.0.0 or higher)
- **Flutter SDK** (3.0.0 or higher)
- **PostgreSQL** (14 or higher)
- **Git**
- **Docker** (optional, for containerization)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/onelga-gov/local-services-app.git
cd onelga-local-services
```

### 2. Install Dependencies

```bash
# Install root dependencies and all workspace dependencies
npm run install:all
```

### 3. Environment Setup

Create environment files:

```bash
# Backend environment
cp backend/.env.example backend/.env

# Frontend environment
cp frontend/.env.example frontend/.env
```

Update the environment variables with your configuration.

### 4. Database Setup

```bash
# Start PostgreSQL (if using Docker)
docker-compose up postgres -d

# Run database migrations
cd backend
npm run migrate
npm run seed
```

### 5. Start Development Servers

```bash
# Start both frontend and backend concurrently
npm run dev

# Or start individually
npm run dev:frontend  # React app at http://localhost:3000
npm run dev:backend   # API server at http://localhost:5000
```

### 6. Mobile App Setup

```bash
cd mobile

# Install dependencies
flutter pub get

# Run on Android
flutter run

# Run on iOS (macOS only)
flutter run -d ios
```

## 📚 Project Structure

### Frontend (`/frontend`)
```
src/
├── components/         # Reusable UI components
├── pages/             # Route components
├── services/          # API calls and external services
├── utils/             # Helper functions
├── styles/            # Global styles and themes
├── hooks/             # Custom React hooks
├── store/             # State management
└── types/             # TypeScript type definitions
```

### Backend (`/backend`)
```
src/
├── controllers/       # Route handlers
├── models/           # Database models
├── routes/           # API route definitions
├── middleware/       # Express middleware
├── config/           # Configuration files
├── utils/            # Helper functions
└── tests/            # Unit tests
```

### Mobile (`/mobile`)
```
lib/
├── screens/          # UI screens
├── widgets/          # Reusable widgets
├── services/         # API and external services
├── models/           # Data models
├── utils/            # Helper functions
└── state/            # State management
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests for specific workspace
npm test --workspace=frontend
npm test --workspace=backend

# Run Flutter tests
cd mobile && flutter test
```

## 🚀 Deployment

### Production Build

```bash
# Build all applications
npm run build

# Build specific workspace
npm run build --workspace=frontend
npm run build --workspace=backend
```

### Docker Deployment

```bash
# Build and start all services
docker-compose up --build

# Production deployment
docker-compose -f docker-compose.prod.yml up -d
```

### AWS Deployment

See `/infrastructure` directory for Terraform configurations and deployment scripts.

## 📖 API Documentation

API documentation is available at:
- **Development:** http://localhost:5000/api/docs
- **Production:** https://api.onelga-services.gov.ng/docs

## 🔧 Available Scripts

### Root Project
- `npm run dev` - Start both frontend and backend
- `npm run build` - Build all applications
- `npm test` - Run all tests
- `npm run lint` - Lint all code
- `npm run clean` - Clean all dependencies

### Frontend
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Lint code

### Backend
- `npm run dev` - Start development server
- `npm run build` - Build TypeScript
- `npm test` - Run tests
- `npm run migrate` - Run database migrations

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@onelga-services.gov.ng or create an issue in this repository.

## 🏛️ Government Partnership

This project is developed in partnership with the Onelga Local Government Area to improve citizen services and government efficiency.

---

**Built with ❤️ for the people of Onelga**
