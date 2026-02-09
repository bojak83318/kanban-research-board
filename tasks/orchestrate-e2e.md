# Orchestrate E2E Tests: Kanban Board (Gemini Flash)

**Role**: Orchestrator (Gemini 3.0 Flash)
**Task**: Develop and Execute E2E Tests via Remote Codex
**Target**: Penguin (`rocm@100.116.204.95`)
**Reference**: `.codex/workflows/e2e-full-cycle.yml`

This task instructs Gemini 3.0 Flash to act as the primary orchestrator, managing the lifecycle of E2E test development using the `/codex-task` workflow.

---

## 🛠️ Phase 1: Environment Sync & Preparation
> **Objective**: Ensure the remote Codex environment has the latest project context.

1.  **Sync Configuration**:
    - Use `scp` to copy `.codex/`, `prd/`, and `KanbanBoard.jsx` to `~/workspace/kanban/` on Penguin.
    - **Command**: 
      ```bash
      scp -i /home/kasm-user/workspace/dspy/kasm-cleanup-test/id_ed25519_penguin -r .codex prd KanbanBoard.jsx rocm@100.116.204.95:~/workspace/kanban/
      ```
    - *Verify*: `ssh -i /home/kasm-user/workspace/dspy/kasm-cleanup-test/id_ed25519_penguin rocm@100.116.204.95 "ls -R ~/workspace/kanban/.codex"` shows all files.

2.  **Verify Codex Readiness**:
    - Check Codex version/status on remote: `ssh -i /home/kasm-user/workspace/dspy/kasm-cleanup-test/id_ed25519_penguin rocm@100.116.204.95 "codex --version"`.
    - Ensure `nvm` and `node` are available.

## 🤖 Phase 2: Test Generation (Codex)
> **Objective**: Generate the Playwright test suite using `gpt-5.3-codex`.

1.  **Initialize Workflow**:
    - Trigger Codex with the explicit instruction derived from the workflow definition (Note: `--workflow` flag is not supported on this Codex version).
    - **Command**: 
      ssh -i /home/kasm-user/workspace/dspy/kasm-cleanup-test/id_ed25519_penguin rocm@100.116.204.95 "source ~/.config/nvm/nvm.sh; cd ~/workspace/kanban; codex exec --model gpt-5.3-codex 'Generate a COMPLETE Playwright test suite...' > tests/codex-thinking-gen.log 2>&1"
      ```

2.  **Monitor Progress**:
    - Poll for completion (look for `tests/e2e/kanban-dragdrop.spec.ts` creation).
    - **Command**:
      ```bash
      ssh -i /home/kasm-user/workspace/dspy/kasm-cleanup-test/id_ed25519_penguin rocm@100.116.204.95 "ls tests/e2e/kanban-dragdrop.spec.ts"
      ```

## 🧪 Phase 3: Test Execution
> **Objective**: Run the generated tests and capture results.

1.  **Dependency Check**:
    - Ensure Playwright is installed on remote.
    - **Command**:
      ```bash
      ssh -i /home/kasm-user/workspace/dspy/kasm-cleanup-test/id_ed25519_penguin rocm@100.116.204.95 "source ~/.config/nvm/nvm.sh; cd ~/workspace/kanban; npm install && npx playwright install --with-deps"
      ```
  
2.  **Execute Suite**:
    - Run the tests headlessly.
    - **Command**: 
      ```bash
      ssh -i /home/kasm-user/workspace/dspy/kasm-cleanup-test/id_ed25519_penguin rocm@100.116.204.95 "source ~/.config/nvm/nvm.sh; cd ~/workspace/kanban; npx playwright test --reporter=json > test-results.json"
      ```
  
3.  **Retrieve Artifacts**:
    - Pull `test-results.json` back to local.
    - **Command**: `scp -i /home/kasm-user/workspace/dspy/kasm-cleanup-test/id_ed25519_penguin rocm@100.116.204.95:~/workspace/kanban/test-results.json .`

## 📊 Phase 4: Analysis & Reporting
> **Objective**: Analyze failures and suggest fixes using `gpt-5.3-codex-High`.

1.  **Analyze Failures**:
    - If `test-results.json` indicates failures, trigger analysis:
    - **Command**: 
      ssh -i /home/kasm-user/workspace/dspy/kasm-cleanup-test/id_ed25519_penguin rocm@100.116.204.95 "source ~/.config/nvm/nvm.sh; cd ~/workspace/kanban; codex exec --model gpt-5.3-codex --config model_reasoning_effort='high' --instruction 'Analyze Playwright failures...' > tests/codex-thinking-analysis.log 2>&1"
      ```
  
2.  **Final Report**:
    - Summarize:
      - Pass/Fail Rate
      - Key Failure Categories (e.g., "Drag-Drop Timeout", "Priority Selector Miss")
      - Recommended Fixes (from Codex analysis)

---
*Execute this plan sequentially. Stop and report if any Critical Path step fails.*
