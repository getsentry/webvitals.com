# Contributing Guide

Thank you for your interest in contributing to WebVitals.com! This guide covers development workflow and contribution patterns.

## Development Areas

### 1. Core Platform
- **Performance Analysis**: CrUX data integration and processing
- **AI Integration**: OpenAI analysis and recommendation engine
- **Technology Detection**: Cloudflare-based tech stack identification
- **User Interface**: Chat interface and performance visualization

### 2. Monitoring & Analytics
- **Sentry Integration**: RUM setup and performance tracking
- **Error Handling**: Comprehensive error tracking and alerting
- **Performance Optimization**: Core Web Vitals improvements

### 3. Documentation & Content
- **Technical Documentation**: API references and guides
- **Educational Content**: Performance best practices
- **Integration Guides**: Setup and configuration

## Getting Started

### Prerequisites

Before contributing, make sure you have:

- **Node.js**: Version 22.19.0 (via Volta) or latest LTS
- **pnpm**: Latest version (`npm install -g pnpm`)
- **Git**: For version control
- **GitHub Account**: For submitting contributions

### Setup Development Environment

1. **Fork the Repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/your-username/webvitals.com.git
   cd webvitals.com
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Set Up Environment**
   ```bash
   cp .env.example .env.local
   # Add your API keys to .env.local
   ```

4. **Start Development Server**
   ```bash
   pnpm dev
   ```

5. **Verify Setup**
   - Open [http://localhost:3000](http://localhost:3000)
   - Analyze a website to ensure everything works

## Development Workflow

### 1. Create a Branch

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Or a bugfix branch
git checkout -b fix/issue-description
```

### 2. Make Changes

Follow our code standards and ensure your changes are well-tested.

### 3. Test Your Changes

```bash
# Type checking
pnpm check-types

# Linting
pnpm lint

# Build verification
pnpm build
```

### 4. Commit Changes

We use conventional commits:

```bash
# Format: type(scope): description
git commit -m "feat(ai): add technology-specific recommendations"
git commit -m "fix(api): handle missing CrUX data gracefully"
git commit -m "docs(deployment): add Docker configuration"
```

**Commit Types:**
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### 5. Submit Pull Request

```bash
# Push your branch
git push origin your-branch-name

# Create pull request on GitHub
```

## Pull Request Guidelines

### Before Submitting

- [ ] Code follows project standards
- [ ] All tests pass
- [ ] Documentation updated if needed
- [ ] Commit messages follow conventional format
- [ ] Branch is up to date with main

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Refactoring

## Testing
- [ ] Tested locally
- [ ] Added/updated tests
- [ ] All existing tests pass

## Screenshots (if applicable)
Include screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed the code
- [ ] Added comments for complex logic
- [ ] Updated documentation
- [ ] No breaking changes (or documented)
```

### Review Process

1. **Automated Checks**: CI/CD pipeline runs tests and checks
2. **Code Review**: Maintainers review your code
3. **Feedback**: Address any requested changes
4. **Approval**: Once approved, your PR will be merged

## Reporting Issues

### Bug Reports

Use the bug report template and include:

- **Environment**: OS, browser, Node.js version
- **Steps to Reproduce**: Clear, step-by-step instructions
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Screenshots**: If applicable
- **Additional Context**: Logs, error messages, etc.

### Feature Requests

Use the feature request template and include:

- **Problem Description**: What problem does this solve?
- **Proposed Solution**: How would you implement this?
- **Alternatives**: What other approaches have you considered?
- **Use Cases**: Who would benefit from this feature?

## Design Contributions

### UI/UX Improvements

When contributing design changes:

1. **Follow Design System**: Use existing components and patterns
2. **Consider Accessibility**: Ensure changes meet WCAG guidelines
3. **Test Responsiveness**: Verify on mobile, tablet, and desktop
4. **Document Changes**: Update component documentation

### Assets and Icons

- **SVG Format**: Prefer SVG for icons and graphics
- **Optimization**: Optimize assets for web performance
- **Accessibility**: Include alt text and proper markup
- **Consistency**: Match existing visual style

## Testing Guidelines

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test components/ChatInterface.test.tsx

# Run tests in watch mode
pnpm test --watch
```

### Writing Tests

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user workflows
- **Performance Tests**: Test for performance regressions

## Documentation Standards

### Writing Style

- **Clear and Concise**: Use simple, direct language
- **Code Examples**: Include practical examples
- **Cross-References**: Link to related documentation
- **Up-to-Date**: Keep examples current with latest code

## Security Contributions

For security-related changes:

1. **Private Disclosure**: Contact maintainers privately first (see SECURITY.md)
2. **Coordinate Release**: Plan security release timeline
3. **Documentation**: Update security documentation
4. **Testing**: Verify security improvements

## Contribution Checklist

Before submitting any contribution:

- [ ] Read and understand the contribution guidelines
- [ ] Set up development environment correctly
- [ ] Follow code standards and style guidelines
- [ ] Add or update tests as appropriate
- [ ] Update documentation if needed
- [ ] Test changes thoroughly
- [ ] Follow conventional commit format
- [ ] Submit descriptive pull request

## Getting Help

- **Documentation**: Check these docs first
- **GitHub Issues**: For bugs and technical problems
- **GitHub Discussions**: For questions and general discussion

Thank you for contributing to WebVitals.com! Your efforts help make web performance analysis more accessible and actionable for developers worldwide.
