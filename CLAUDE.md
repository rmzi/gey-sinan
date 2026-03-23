# Portable Development System

AI-assisted development methodology. Skills for consistency. Agents for scale.

## Skills System (MANDATORY)

**CRITICAL: Skills in `.claude/skills/` contain workflow patterns and requirements. Skipping relevant skills leads to inconsistent implementations and rework.**

### Workflow

1. **At session start**:
   - Check `.claude/.pds-version` against https://raw.githubusercontent.com/rmzi/portable-dev-system/main/VERSION
   - If outdated: run `pds-update`, commit the changes, and create a PR (or add to existing PR)
   - Scan `.claude/skills/` to understand available capabilities
2. **Before any task**: Check if the task matches a skill (commit, review, debug, test, design, etc.)
3. **During work**: Read and follow the skill documentation before performing the action
4. **When stuck**: Read `/ethos` for principles, `/debug` for systematic troubleshooting

### Rule

**Before performing ANY action, check if a skill exists for it. If a relevant skill exists, read it FIRST.**

### Available Skills

| Skill | When to Use |
|-------|-------------|
| `/ethos` | Starting work, when stuck, need principles |
| `/commit` | Before any git commit |
| `/review` | Before submitting or reviewing PRs |
| `/debug` | When troubleshooting issues |
| `/test` | Writing or running tests |
| `/design` | Architecture decisions, new features |
| `/worktree` | Branch isolation, parallel work |
| `/merge` | Merging subtask worktrees back to coordinator |
| `/bump` | Version bump and changelog update |
| `/permission-router` | Permission hook policy, subagent routing |
| `/team` | Agent roster, roles, capabilities |
| `/swarm` | Launch agent team for parallel work |
| `/quickref` | PDS skills, agents, and conventions reference |
| `/trim` | Context efficiency maintenance |


---

## Rules

**NEVER clone the repository.** Always use git worktrees for isolation:
- Need a new branch? Use `git worktree add`
- Cloning creates disconnected copies. Worktrees share git history and stay in sync.

**Send denied commands to the terminal.** When a command is blocked by permissions (force push, etc.) or otherwise requires manual action, don't just print it — send it to the user's terminal pane via `tmux send-keys -t 2 'command' ''` (no Enter, so the user can review before executing).

**Read terminal output to stay current.** After sending commands to tmux or when you need to know the state of the user's environment, read the terminal pane:
- `tmux capture-pane -t 2 -p` — read current visible content from the terminal pane
- Use this after sending a denied command to check if the user executed it and what happened
- Use this when the user references terminal output or you need to verify external state

**NEVER use /tmp for code or worktrees.** Worktrees go inside the repo at `.worktrees/`:
- Correct: `.worktrees/feature-branch/` (inside the main repo)
- Wrong: `/tmp/project/` or `/tmp/feature-work/`
- Wrong: `../project-feature-branch/` (old sibling format — migrate with `git worktree move`)
- /tmp is only for temporary files (downloads, build artifacts, large files that shouldn't persist)

**iOS/native mobile work: worktree exception.** Do NOT use worktrees for changes that touch native iOS/Android code or require device builds:
- Native builds (`expo prebuild`, `expo run:ios`) generate large `ios/`/`android/` dirs with CocoaPods, Xcode projects, and signing configs that don't transfer between worktrees
- Each worktree would need a full prebuild + pod install (~500MB, minutes of setup) and re-configuration of Xcode signing
- Instead: do native mobile work on a single branch in the main checkout or a long-lived worktree. Use worktrees for backend, infra, and non-native frontend work that can run in parallel.

## Deployment

**Verified deployment workflow.** Never declare a deploy "done" without smoke-testing the live URL:

1. Run the build and capture any warnings or errors
2. Deploy to the target environment
3. Wait 30 seconds, then curl the live URL and check for:
   - HTTP 200 response
   - Non-empty body (>1KB)
   - Presence of the app's root div or key content string
4. If any check fails, diagnose from build logs and network response, fix the issue, and redeploy
5. Repeat until all smoke tests pass
6. Only declare done when the live site is verified working
