---
description: Git branching and release workflow
---

## Branch Strategy

```
feature/xxx  →  dev  →  main (prod)
```

### Rules
1. **Never commit directly to `main` or `dev`**
2. **Feature branches** are always created from `dev`
3. **Merge to `dev`** when feature is ready for integration testing
4. **Merge to `main`** only as a final release (triggers Vercel production deploy)
5. **Environment variables** must never be committed — use `.env` locally, Vercel dashboard for prod

### Creating a feature branch
// turbo
```bash
git checkout dev && git pull origin dev && git checkout -b feat/<feature-name>
```

### Merging feature → dev
```bash
git checkout dev && git pull origin dev && git merge feat/<feature-name> && git push origin dev
```

### Releasing dev → main (prod)
```bash
git checkout main && git pull origin main && git merge dev && git push origin main
```

### Vercel
- Only `main` branch builds are deployed (Ignored Build Step filters non-main)
- Env vars needed by frontend must be prefixed with `VITE_`
