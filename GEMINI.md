# Penguin Configuration & Access Workflow

This document records the verified workflow for accessing the **Penguin** environment (Crostini) from this workspace.

## Host Information
- **Name**: Penguin
- **IP Address**: `100.116.204.95`
- **User**: `rocm`
- **Identity File**: `/home/kasm-user/workspace/dspy/kasm-cleanup-test/id_ed25519_penguin`

## Connection Methods

### 1. Direct SSH (Verified)
The most reliable way to execute commands or open a shell:
```bash
ssh -i /home/kasm-user/workspace/dspy/kasm-cleanup-test/id_ed25519_penguin rocm@100.116.204.95
```

### 2. Tailscale Sidecar (Alternative)
If direct access is restricted, use the ROCm server as a jump point:
- **Jump Host**: `rocm@100.110.50.51`
- **Identity File**: `/home/kasm-user/workspace/dspy/kasm-cleanup-test/id_ed25519_rocm`
- **Path**: `incus exec kasm-vm bash` -> `docker ps` -> Find Tailscale sidecar.

## File Synchronization

### Copy to Penguin
Since `rsync` is unavailable, use `scp`:
```bash
# Create directory first
ssh -i /home/kasm-user/workspace/dspy/kasm-cleanup-test/id_ed25519_penguin rocm@100.116.204.95 "mkdir -p ~/workspace/kanban"

# Copy files
scp -i /home/kasm-user/workspace/dspy/kasm-cleanup-test/id_ed25519_penguin /home/kasm-user/workspace/kanban/* rocm@100.116.204.95:~/workspace/kanban/
```

## Running Codex Tasks
To execute a task via Codex CLI on Penguin:
```bash
ssh -i /home/kasm-user/workspace/dspy/kasm-cleanup-test/id_ed25519_penguin rocm@100.116.204.95 "source ~/.config/nvm/nvm.sh; cd ~/workspace/kanban; codex exec --instruction 'TASK_SUMMARY_HERE'"
```

---
*Verified on: 2026-02-09*
