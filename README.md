# Claude Coder

An AI-powered coding assistant with GitHub integration and Railway deployment.

## Features

- 💬 Chat with Claude AI about your code
- 📁 Automatic GitHub repository context loading
- 🔀 Safe Mode: Creates branches for review before merging
- ⚡ Direct Mode: Push changes straight to main
- 🎨 Premium Claude-inspired UI design
- 💰 Real-time cost tracking
- 📎 File upload support (images, PDFs)
- 🔐 Optional password protection
- 🌙 Dark/Light mode

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
npm install
```

### 2. Set Environment Variables

Create `.env.local` for local development:

```env
ANTHROPIC_API_KEY=sk-ant-xxxxx
GITHUB_TOKEN=ghp_xxxxx
GITHUB_REPO_OWNER=your-username
GITHUB_REPO_NAME=your-repo
```

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Railway

### Environment Variables (Required)

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key |
| `GITHUB_TOKEN` | GitHub Classic PAT with `repo` scope |
| `GITHUB_REPO_OWNER` | Your GitHub username |
| `GITHUB_REPO_NAME` | Repository name |

### Optional Variables

| Variable | Description |
|----------|-------------|
| `APP_PASSWORD` | Password to protect the app |
| `RAILWAY_PROJECT_ID` | For preview URL generation |

### Deploy Steps

1. Push this code to GitHub
2. Connect repo to Railway
3. Add environment variables
4. Deploy

## How It Works

### Chat Flow

1. Ask Claude to modify code
2. Claude responds with code blocks:
   ```typescript:src/app/page.tsx
   // your code here
   ```
3. Code parser extracts file changes
4. **Safe Mode**: Creates branch → you review → merge or discard
5. **Direct Mode**: Commits directly to main

### File Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts      # Main Claude API + GitHub push
│   │   │   ├── github/route.ts    # GitHub actions (commit, merge, etc)
│   │   │   └── auth/verify/       # Password verification
│   │   ├── globals.css            # Premium Claude UI styles
│   │   ├── layout.tsx
│   │   └── page.tsx               # Main chat interface
│   ├── components/
│   │   ├── ChatMessage.tsx        # Message bubbles
│   │   ├── WelcomeScreen.tsx      # Landing screen
│   │   ├── SettingsPanel.tsx      # Settings drawer
│   │   ├── BranchManager.tsx      # Merge/discard UI
│   │   ├── CostTracker.tsx        # Token usage display
│   │   ├── DiffViewer.tsx         # Code diff display
│   │   ├── FileUpload.tsx         # File attachment
│   │   ├── Sidebar.tsx            # Conversation history
│   │   └── PasswordProtection.tsx # Auth wrapper
│   ├── lib/
│   │   ├── codeParser.ts          # Extract code blocks
│   │   ├── github.ts              # GitHub API client
│   │   └── claude.ts              # Claude utilities
│   └── types/
│       └── index.ts               # TypeScript types
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Models Available

| Model | Best For |
|-------|----------|
| Haiku 4.5 | Fast, simple tasks |
| Sonnet 4.5 | Balanced (default) |
| Sonnet 4 | Previous generation |
| Opus 4.5 | Most capable |
| Opus 4.1 | Previous flagship |

## License

MIT
