# Contributing to Onelga Local Services

Thank you for your interest in contributing to the Onelga Local Services project! This document provides guidelines for developers working on this government services platform.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing Guidelines](#testing-guidelines)
- [Security Guidelines](#security-guidelines)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)

## Getting Started

### Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher
- **PostgreSQL** 14 or higher
- **Docker** (optional, recommended)
- **Flutter SDK** 3.0.0+ (for mobile development)

### Initial Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/onelga-gov/local-services-app.git
   cd onelga-local-services
   ```

2. Run the setup script:
   ```powershell
   .\scripts\setup-dev.ps1
   ```

3. Start the development environment:
   ```bash
   npm run dev
   ```

## Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/feature-name` - Individual features
- `bugfix/issue-description` - Bug fixes
- `hotfix/critical-fix` - Critical production fixes

### Commit Messages

Follow conventional commits format:

```
type(scope): brief description

More detailed explanation if needed

Fixes #123
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code formatting
- `refactor` - Code restructuring
- `test` - Adding tests
- `chore` - Maintenance tasks

**Examples:**
```
feat(auth): add JWT authentication
fix(api): resolve user registration validation
docs(readme): update setup instructions
```

## Code Standards

### TypeScript/JavaScript

- Use **TypeScript** for all new code
- Follow **ESLint** and **Prettier** configurations
- Use **meaningful variable names** and **function names**
- Add **JSDoc comments** for public APIs

```typescript
/**
 * Registers a new user in the system
 * @param userData - User registration data
 * @returns Promise resolving to created user
 */
export async function registerUser(userData: UserRegistrationData): Promise<User> {
  // Implementation
}
```

### React/Frontend

- Use **functional components** with hooks
- Implement **proper error boundaries**
- Follow **accessibility guidelines** (WCAG 2.1)
- Use **semantic HTML** elements

```typescript
// Good
const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Implementation
};

// Use semantic HTML
<main role="main">
  <h1>User Dashboard</h1>
  <nav aria-label="Service navigation">
    {/* Navigation items */}
  </nav>
</main>
```

### Backend/API

- Use **proper HTTP status codes**
- Implement **comprehensive error handling**
- Add **request validation**
- Use **structured logging**

```typescript
// Good API endpoint
export const createIdentificationLetter = async (req: Request, res: Response) => {
  try {
    const validatedData = identificationSchema.parse(req.body);
    const letter = await identificationService.create(validatedData);
    
    logger.info('Identification letter created', { 
      userId: req.user.id, 
      letterId: letter.id 
    });
    
    res.status(201).json({
      success: true,
      data: letter,
      message: 'Identification letter application submitted successfully'
    });
  } catch (error) {
    logger.error('Error creating identification letter', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
```

### Database

- Use **Prisma** for database operations
- Write **descriptive migration names**
- Add **database indexes** for performance
- Use **transactions** for related operations

```typescript
// Good database operation
export async function createUserWithProfile(userData: CreateUserData) {
  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        // ... other fields
      },
    });

    await tx.notification.create({
      data: {
        userId: user.id,
        title: 'Welcome to Onelga Services',
        message: 'Your account has been created successfully.',
        type: 'SYSTEM_ANNOUNCEMENT',
      },
    });

    return user;
  });
}
```

## Testing Guidelines

### Unit Tests

- Write tests for **all business logic**
- Use **descriptive test names**
- Follow **AAA pattern** (Arrange, Act, Assert)

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a new user with valid data', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'securePassword123'
      };

      // Act
      const user = await userService.createUser(userData);

      // Assert
      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.password).not.toBe(userData.password); // Should be hashed
    });
  });
});
```

### Integration Tests

- Test **API endpoints** end-to-end
- Use **test database**
- Clean up after tests

### Frontend Tests

- Test **user interactions**
- Use **React Testing Library**
- Test **accessibility features**

```typescript
describe('LoginForm', () => {
  it('should submit form with valid credentials', async () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    expect(mockOnSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });
});
```

## Security Guidelines

### Data Protection

- **Never log sensitive data** (passwords, tokens, PII)
- Use **environment variables** for secrets
- **Validate all inputs** on both client and server
- Implement **proper authentication** and authorization

### API Security

- Use **HTTPS** in production
- Implement **rate limiting**
- Add **CORS** configuration
- Use **helmet** for security headers

```typescript
// Good: Input validation
const userSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

// Good: Authentication middleware
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};
```

## Documentation

- Update **API documentation** for new endpoints
- Add **code comments** for complex logic
- Update **README** for setup changes
- Document **breaking changes**

## Pull Request Process

### Before Submitting

1. **Run tests**: `npm test`
2. **Check linting**: `npm run lint`
3. **Build project**: `npm run build`
4. **Update documentation** if needed

### PR Requirements

- **Clear title** and description
- **Link related issues**: "Fixes #123"
- **Add screenshots** for UI changes
- **Include test coverage** for new features

### PR Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console logs left in code
```

## Code Review Guidelines

### For Authors
- **Self-review** before submitting
- **Respond promptly** to feedback
- **Keep PRs small** and focused

### For Reviewers
- **Be constructive** and respectful
- **Focus on code quality** and security
- **Test the changes** locally when needed
- **Approve only** when confident

## Getting Help

- **Documentation**: Check `/docs` directory
- **Issues**: Create GitHub issues for bugs/features
- **Discussions**: Use GitHub Discussions for questions
- **Email**: development-team@onelga-services.gov.ng

## Recognition

Contributors will be acknowledged in:
- Project README
- Release notes
- Annual project report

Thank you for contributing to public service technology in Onelga! 🏛️✨
