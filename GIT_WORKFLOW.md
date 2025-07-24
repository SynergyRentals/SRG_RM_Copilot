# Git Workflow for Synergy RM Copilot

## Overview
This document outlines the Git version control workflow for the Synergy RM Copilot revenue management platform.

## Branch Structure

### Main Branches
- `main` - Production-ready code
- `develop` - Integration branch for features

### Feature Branches
- Format: `feature/description` (e.g., `feature/ai-recommendations`)
- Created from: `develop`
- Merged back to: `develop`

### Hotfix Branches
- Format: `hotfix/description` (e.g., `hotfix/api-rate-limit`)
- Created from: `main`
- Merged to: `main` and `develop`

## Workflow Steps

### 1. Starting a New Feature
```bash
# Update your local develop branch
git checkout develop
git pull origin develop

# Create a new feature branch
git checkout -b feature/your-feature-name
```

### 2. Making Changes
```bash
# Check status
git status

# Add changes
git add .

# Commit with descriptive message
git commit -m "feat: add AI recommendation confidence scoring"
```

### 3. Commit Message Convention
Follow conventional commits format:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

### 4. Pushing Changes
```bash
# Push your feature branch
git push origin feature/your-feature-name
```

### 5. Creating a Pull Request
1. Go to GitHub/GitLab
2. Click "New Pull Request"
3. Base: `develop`, Compare: `feature/your-feature-name`
4. Add description of changes
5. Request review from team members

### 6. After Merge
```bash
# Switch back to develop
git checkout develop
git pull origin develop

# Delete local feature branch
git branch -d feature/your-feature-name
```

## Best Practices

### Before Committing
- Run tests: `npm test`
- Check TypeScript: `npm run type-check`
- Lint code: `npm run lint`

### Commit Guidelines
- Make atomic commits (one logical change per commit)
- Write clear, descriptive commit messages
- Reference issue numbers when applicable

### Branch Guidelines
- Keep branches focused on single features
- Delete branches after merging
- Regularly sync with develop branch

## Common Commands

### View Branches
```bash
# List all branches
git branch -a

# Show current branch
git branch --show-current
```

### Stashing Changes
```bash
# Save uncommitted changes
git stash

# Apply stashed changes
git stash pop
```

### Viewing History
```bash
# View commit history
git log --oneline --graph

# View changes in a file
git diff filename
```

### Undoing Changes
```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard local changes
git checkout -- filename
```

## Integration with CI/CD
- All pushes to `develop` trigger automated tests
- Merges to `main` trigger deployment pipeline
- Failed tests block merging

## Security Notes
- Never commit sensitive data (API keys, passwords)
- Use environment variables for secrets
- Review `.gitignore` to ensure proper exclusions