# Contributing to Password Vault

Thank you for your interest in contributing to Password Vault! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Environment](#development-environment)
- [Branching Strategy](#branching-strategy)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Security Considerations](#security-considerations)
- [Documentation](#documentation)
- [Issue Reporting](#issue-reporting)

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Add the original repository as a remote named "upstream"
4. Create a new branch for your feature or bugfix
5. Make your changes, following our [coding standards](#coding-standards)
6. Push your branch to your fork
7. Submit a pull request from your branch to our `main` branch

## Development Environment

### Prerequisites

- Node.js (v14+)
- MongoDB (v4.4+)
- npm or yarn
- Git

### Setup

1. Install dependencies:

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

2. Set up environment variables:

   - Create `.env` file in the server directory (see README.md for required variables)
   - Create `.env.local` file in the client directory

3. Run the development servers:

```bash
# Run server
cd server
npm run dev

# Run client in another terminal
cd client
npm run dev
```

## Branching Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/feature-name` - For new features
- `bugfix/issue-description` - For bug fixes
- `hotfix/issue-description` - For critical production fixes
- `release/vX.Y.Z` - For version releases

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Types include:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system changes
- `ci`: CI configuration changes
- `chore`: Other changes that don't modify src or test files

Example:

```
feat(auth): implement password reset functionality

- Add reset password form
- Create API endpoint for password reset
- Send reset email with token

Closes #123
```

## Pull Request Process

1. Ensure your code adheres to the project's coding standards
2. Update documentation as necessary
3. Include tests for new functionality
4. Ensure the test suite passes
5. Fill out the pull request template completely
6. Request review from at least one maintainer
7. Address any feedback from reviewers
8. Once approved, a maintainer will merge your pull request

## Coding Standards

### JavaScript/React

- Use ES6+ features
- Follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use functional components with hooks for React
- Use PropTypes or TypeScript for type checking
- Keep components small and focused
- Use meaningful variable and function names
- Add comments for complex logic

### CSS/Tailwind

- Follow the component-based approach
- Use Tailwind utility classes when possible
- Avoid global styles
- Use meaningful class names when custom CSS is needed
- Use CSS variables for theme colors

### Backend

- Follow RESTful API design principles
- Validate all inputs
- Handle errors gracefully
- Use async/await for asynchronous operations
- Document all API endpoints

## Testing

We use Jest for testing. Please ensure your code includes:

- Unit tests for utility functions
- Component tests for React components
- API tests for backend endpoints

To run tests:

```bash
# Run client tests
cd client
npm test

# Run server tests
cd server
npm test
```

## Security Considerations

Security is paramount for a password manager. Always:

1. Use secure cryptographic libraries and algorithms
2. Never store sensitive information in plain text
3. Validate and sanitize all user inputs
4. Use parameterized queries to prevent SQL injection
5. Implement proper authentication and authorization
6. Report any security concerns immediately as a security issue

## Documentation

- Keep README.md and other documentation up to date
- Document all functions, components, and modules
- Include JSDoc comments for functions
- Update API documentation when endpoints change
- Document any non-obvious code with inline comments

## Issue Reporting

When reporting issues:

1. Use the issue template
2. Include detailed steps to reproduce
3. Include error messages and stack traces if applicable
4. Describe expected behavior
5. Include screenshots if relevant
6. Mention your environment (browser, OS, Node.js version)

## Review Process

All contributions will be reviewed by project maintainers. The review process includes:

1. Code quality review
2. Security review for sensitive code
3. Documentation review
4. Test coverage review

Thank you for contributing to Password Vault!

## License

By contributing to Password Vault, you agree that your contributions will be licensed under the project's MIT License.
