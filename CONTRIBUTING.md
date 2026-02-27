# Contributing to Drive UCSD

Thanks for your interest in contributing! Here's how to get started.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/drive-ucsd.git`
3. Install dependencies: `npm install`
4. Copy `.env.example` to `.env` and fill in your keys
5. Start the dev server: `npm run dev`

## Development Workflow

1. Create a feature branch: `git checkout -b feat/my-feature`
2. Make your changes with clear, focused commits
3. Ensure TypeScript compiles: `npx tsc --noEmit`
4. Open a pull request against `main`

## Commit Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation only
- `refactor:` — Code restructuring
- `chore:` — Tooling, deps, config

## Code Style

- TypeScript strict mode
- Functional React components with hooks
- Tailwind CSS with semantic design tokens (no raw colors in components)
- shadcn/ui for base UI primitives

## Reporting Issues

Open a GitHub Issue with:
- Steps to reproduce
- Expected vs actual behavior
- Browser / OS info

## Code of Conduct

Be respectful, inclusive, and constructive. We follow the [Contributor Covenant](https://www.contributor-covenant.org/).
