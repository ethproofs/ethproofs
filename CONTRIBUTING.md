# Contributing to Ethproofs

Thank you for your interest in contributing to Ethproofs! We welcome contributions from the community and appreciate your help in making this project better.

## Table of Contents

- [Getting Started](#getting-started)
- [Contribution Requirements](#contribution-requirements)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Communication](#communication)

## Getting Started

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ethproofs.git
   cd ethproofs
   ```

### Local Development Setup

Follow the setup instructions in the [README.md](./README.md) to:
- Install dependencies
- Set up Supabase locally
- Configure environment variables
- Run the development server

### Additional Tools for Contributors

Install the Git hooks (happens automatically after `pnpm install`):
```bash
pnpm prepare
```

This sets up commitlint to enforce commit message standards.

## Contribution Requirements

### Building Familiarity with the Codebase

**Before making significant contributions, new contributors are required to:**

- Successfully merge **3-5 'good first issue' PRs** to build familiarity with the codebase, development workflow, and code standards
- These issues are tagged with the `good first issue` label in the issue tracker
- This requirement helps ensure you understand the project structure, coding conventions, and review process

**What counts as a "good first issue" PR:**
- Bug fixes for small, well-defined issues
- Documentation improvements
- Minor UI/UX enhancements
- Small refactoring tasks
- Test additions or improvements

Once you've completed this requirement, you'll be eligible to work on more complex features and improvements.

### Issue Linkage Requirement

**All pull requests must be linked to an issue that has been prioritized by the team.**

- Before starting work, check that an issue exists and is labeled as prioritized (e.g., `priority: high`, `priority: medium`, or included in a milestone)
- If you want to work on something that doesn't have an issue, create one first and wait for team review and prioritization
- In your PR description, reference the issue using `Fixes #123` or `Closes #123`
- PRs without linked issues will be closed until a prioritized issue is created

This ensures that:
- Work aligns with project goals and roadmap
- Efforts are not duplicated
- The team can provide guidance before significant time is invested

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

Use descriptive branch names:
- `feature/` for new features
- `fix/` for bug fixes
- `docs/` for documentation
- `refactor/` for code refactoring
- `test/` for test additions/modifications

### 2. Make Your Changes

- Write clean, readable code that follows the project's style
- Add tests for new functionality
- Update documentation as needed
- Keep commits focused and atomic

### 3. Test Your Changes

```bash
# Run linting
pnpm lint

# Run type checking
pnpm typecheck

# Run the development server and test manually
pnpm dev

# Test the production build
pnpm build
```

### 4. Database Changes

If you've made changes to the database schema, see the database workflows in the [README.md](./README.md) for:
- Creating migrations
- Regenerating TypeScript types
- Seeding data

Always test your migrations locally before submitting a PR.

### 5. Commit Your Changes

**This project enforces commit message standards using commitlint.** All commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

#### Commit Message Format

```
<type>: <description>

[optional body]

[optional footer]
```

#### Commit Types

- `feat` - A new feature
- `fix` - A bug fix
- `docs` - Documentation only changes
- `style` - Changes that do not affect the meaning of the code (white-space, formatting, etc)
- `refactor` - A code change that neither fixes a bug nor adds a feature
- `perf` - A code change that improves performance
- `test` - Adding missing tests or correcting existing tests
- `build` - Changes that affect the build system or external dependencies
- `ci` - Changes to CI configuration files and scripts
- `chore` - Other changes that don't modify src or test files
- `revert` - Reverts a previous commit

#### Examples

```bash
feat: add user authentication flow
fix: resolve database connection timeout
docs: update API documentation
refactor: simplify proof verification logic
test: add tests for claim submission
perf: optimize proof verification algorithm
build: upgrade next.js to version 15
```

#### With Scope (Optional)

You can add a scope to provide additional context:

```bash
feat(auth): add OAuth integration
fix(api): handle null response in proof endpoint
docs(readme): add deployment instructions
```

#### Rules

- Type must be lowercase
- Description must not end with a period
- Header (type + description) must be 100 characters or less
- Body and footer lines must be 100 characters or less
- Use the imperative, present tense: "change" not "changed" nor "changes"

#### What Happens When You Commit

When you run `git commit`, commitlint will automatically validate your commit message. If it doesn't follow the format:

```bash
# ❌ This will be rejected
git commit -m "Updated some files"
git commit -m "feat:added new feature"  # Missing space after colon
git commit -m "Fix: bug fix"  # Type should be lowercase

# ✅ These will be accepted
git commit -m "feat: add new feature"
git commit -m "fix: resolve login bug"
git commit -m "docs: update contributing guide"
```

If your commit message is invalid, you'll see an error explaining what's wrong, and the commit will be rejected until you fix it.

## Code Standards

### TypeScript

- Use TypeScript for all new code
- Avoid `any` types; use proper type definitions
- Leverage type inference where appropriate
- Use Zod for runtime validation

### Code Style

- Use Prettier for code formatting (run `pnpm format`)
- Follow ESLint rules (run `pnpm lint:fix`)
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### React/Next.js

- Use functional components and hooks
- Implement proper error handling
- Use React Server Components where appropriate
- Follow Next.js best practices for routing and data fetching

### Database

- Use Drizzle ORM for database queries
- Write migrations for all schema changes
- Include rollback logic in migrations
- Document complex queries

## Pull Request Process

### Before Submitting

1. Ensure your code passes all checks:
   ```bash
   pnpm lint
   pnpm typecheck
   pnpm build
   ```

2. Update relevant documentation
3. Add or update tests as needed
4. Ensure your branch is up to date with `dev`:
   ```bash
   git fetch origin
   git rebase origin/dev
   ```

### PR Template

When creating a PR, include:

**Title:** Clear, descriptive title following conventional commits format

**Description:**
```markdown
## Description
Brief description of the changes

## Related Issue
Fixes #[issue number]

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] I have tested this locally
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing tests pass locally with my changes

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] Any dependent changes have been merged and published
```

### Review Process

1. **Automated Checks:** PRs must pass all CI checks (linting, type checking, build)
2. **Code Review:** At least one maintainer approval required
3. **Testing:** Reviewers will verify the changes work as expected
4. **Feedback:** Address all reviewer comments and questions
5. **Merge:** Once approved, a maintainer will merge your PR

### After Merge

- Delete your feature branch
- Update your local repository:
  ```bash
  git checkout dev
  git pull origin dev
  ```

## Issue Guidelines

### Creating Issues

Before creating a new issue:

1. **Search existing issues** to avoid duplicates
2. **Use issue templates** when available
3. **Provide clear, detailed information:**
   - For bugs: steps to reproduce, expected vs actual behavior, environment details
   - For features: use case, proposed solution, alternatives considered

### Issue Labels

- `good first issue` - Suitable for newcomers
- `bug` - Something isn't working
- `feature` - New feature request
- `documentation` - Documentation improvements
- `priority: high/medium/low` - Prioritization by team
- `help wanted` - Extra attention needed

### Working on Issues

1. Comment on the issue to express interest before starting work
2. Wait for a maintainer to assign the issue to you
3. Ask questions if requirements are unclear
4. Provide updates if you're no longer able to work on it

## Communication

### Where to Ask Questions

- **GitHub Issues:** Bug reports, feature requests, technical discussions
- **GitHub Discussions:** General questions, ideas, community discussions
- **Pull Requests:** Code-specific questions and reviews

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Assume positive intent
- Follow professional standards

## Recognition

Contributors who have merged PRs will be recognized in our project documentation. Thank you for helping make Ethproofs better!

## License

Ethproofs is dual-licensed under MIT and Apache 2.0. By contributing to Ethproofs, you agree that your contributions will be licensed under the same dual license terms:

- [MIT License](LICENSE-MIT)
- [Apache License 2.0](LICENSE-APACHE)

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work shall be dual licensed as above, without any additional terms or conditions. See [LICENSE](LICENSE) for more details.

---

If you have questions about contributing, please open a discussion or reach out to the maintainers. We're here to help!
