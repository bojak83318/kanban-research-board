# Vercel Deployment Setup Instructions

To enable the GitHub Action, you must add the following secrets to your GitHub repository at:
`https://github.com/bojak83318/kanban-research-board/settings/secrets/actions`

### 1. VERCEL_TOKEN
- Go to [Vercel Account Tokens](https://vercel.com/account/tokens)
- Create a new token (Scope: Full Access)
- Copy the value to GitHub Secret: `VERCEL_TOKEN`

### 2. VERCEL_ORG_ID and VERCEL_PROJECT_ID
Since the project is new, you need to link it once locally or manually create it.
- **Manual Method**:
  1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and create a new project.
  2. Under Project Settings, find your **Project ID**.
  3. Under Team/User Settings, find your **Org ID** (or Account ID).
- **Automated Method**:
  If you have Vercel CLI locally, run `vercel link`. It will create a `.vercel/project.json` file containing these IDs.

### 3. Update Workflow
Once you have the IDs, you can either add them as GitHub Secrets (`VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`) or I can update the `deploy.yml` to include them directly if you provide them.

---
*Current Status: Workflow file created and pushed to GitHub.*
