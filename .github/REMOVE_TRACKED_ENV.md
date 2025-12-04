# Remove Tracked .env Files from Git

If `.env` files are already tracked by git, you need to remove them from git's index (but keep them locally).

## Run this command:

```bash
# Remove backend/.env from git tracking
git rm --cached backend/.env

# Or remove all .env files in backend
git rm --cached backend/.env*

# Commit the removal
git commit -m "Remove .env files from git tracking"
```

After this, the files will remain on your local machine but won't be tracked by git anymore.

