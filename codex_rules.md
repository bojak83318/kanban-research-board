---
description: Execute complex coding tasks via remote Codex CLI on Crostini
---

# Codex Task Workflow

Delegate heavy coding tasks to OpenAI Codex running on Crostini (penguin) via SSH.

## When to Use

- Multi-file refactoring
- Code migrations (e.g., Express → Fastify, callbacks → async/await)
- Test generation for existing code
- Large-scale codebase changes
- Tasks requiring 5+ minutes of autonomous work

## Prerequisites

- SSH config: `Host penguin` pointing to Crostini (100.116.204.95)
- Codex CLI authenticated on Crostini
- Project synced to Crostini workspace

---

## Workflow Steps

### Step 1: Define Task Scope & Select Model

Identify the task type and select the appropriate Codex model:

| Task Type | Recommended Model | Use Case |
|-----------|-------------------|----------|
| **New Features / Refactoring** | `gpt-5.3-codex` | Latest syntax, React 19, modern patterns |
| **Complex Logic / Debugging** | `gpt-5.1-codex-max` | Deep reasoning, root cause analysis |
| **Quick Fixes / Scaffolding** | `gpt-5.1-codex-mini` | Simple updates, cost efficiency |

```yaml
task:
  type: refactor | migration | test-gen | feature
  model: gpt-5.3-codex # Default to latest
  scope: 
    - files: [list affected paths]
  standards:
    - [relevant .agent/standards/ to apply]
```

### Step 2: Generate Codex Instruction

Create a structured instruction for Codex:

```
TASK: [one-line summary]

CONTEXT:
- Working directory: ~/workspace/[project]
- Files: [specific paths]
- Constraints: [from .agent/standards/]

REQUIREMENTS:
1. [specific requirement]
2. [specific requirement]
3. [specific requirement]

VERIFICATION:
- [how to verify success, e.g., "npm test passes"]
```

## Rules & Constraints

### 1. Package File Management
- **Rule**: `package.json` and `package-lock.json` are RESTRICTED files.
- **Action**: Do NOT include these files in LLM context windows or automated edits unless explicitly requested.
- **Reasoning**: To prevent token bloat and accidental dependency corruption. Use `npm` CLI for all package management.

### Step 3: Execute on Crostini

// turbo
```bash
ssh penguin "source ~/.config/nvm/nvm.sh; cd ~/workspace/PROJECT; codex exec --model gpt-5.3-codex --instruction 'TASK: ...'"
```

**For debugging** (use deeper reasoning model):
```bash
ssh penguin "source ~/.config/nvm/nvm.sh; cd ~/workspace/PROJECT; codex exec --model gpt-5.1-codex-max --instruction 'ANALYZE: ...'"
```

**For interactive mode** (complex tasks):
```bash
ssh -t penguin "source ~/.config/nvm/nvm.sh; cd ~/workspace/PROJECT; codex"
```

### Step 4: Monitor Progress

Codex runs autonomously. For long tasks:
- Check Codex session: `ssh penguin "cat ~/.codex/sessions/*/status.json"`
- View logs: `ssh penguin "tail -f ~/.codex/log/codex.log"`

### Step 5: Retrieve Results

// turbo
```bash
# Check what changed
ssh penguin "cd ~/workspace/PROJECT; git status"

# Pull specific files
scp penguin:~/workspace/PROJECT/src/changed-file.ts ./src/

# Or sync entire directory
rsync -avz penguin:~/workspace/PROJECT/src/ ./src/
```

### Step 6: Update Checkpoints

Mark the task complete in your spec:

```markdown
## Checkpoints
- [x] Auth module migration ← Completed via Codex
```

---

## Example: Migrate Callbacks to Async/Await

```bash
# 1. Define instruction
INSTRUCTION="TASK: Migrate auth module from callbacks to async/await

CONTEXT:
- Files: src/auth/*.js
- Standards: Promise-based error handling

REQUIREMENTS:
1. Convert all callback functions to async/await
2. Maintain existing function signatures
3. Update error handling to try/catch
4. Run npm test after changes

VERIFICATION:
- All tests pass
- No callback patterns remain in src/auth/"

# 2. Execute
ssh penguin "source ~/.config/nvm/nvm.sh; cd ~/workspace/myapp; codex exec --instruction '$INSTRUCTION'"

# 3. Sync results
rsync -avz penguin:~/workspace/myapp/src/auth/ ./src/auth/
```

---

## Integration with Orchestration

When the orchestrator (`.agent/skills/orchestration/SKILL.md`) identifies a heavy coding task:

1. **Orchestrator** adds to `task_plan.json`:
   ```json
   {
     "task_id": "auth-migration",
     "executor": "codex-remote",
     "instruction": "...",
     "status": "pending"
   }
   ```

2. **Worker** executes via this workflow

3. **Orchestrator** updates checkpoint on completion

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `codex: not found` | Source nvm: `source ~/.config/nvm/nvm.sh` |
| SSH timeout | Check Tailscale: `tailscale status` |
| Auth expired | Run `codex auth` on Crostini |
| Rate limited | Wait and retry (ChatGPT quota) |

---

## Related

- Skill: `.agent/skills/codex-remote/SKILL.md`
- Orchestration: `.agent/skills/orchestration/SKILL.md`
- Standards handoff: `.agent/workflows/orchestration-handoff.md`
