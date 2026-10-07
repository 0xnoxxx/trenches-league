# Trenches League

A countries' league game: players pick a flag, play a few minutes a day, and push their country up a weekly league. Built for Solana; the token's creator fees and in-game spending fill a weekly war chest.

## Folders

| Folder | What it is |
|---|---|
| `docs/` | Season 0 pre-registration site (static, served by GitHub Pages) |
| `supabase/` | Database schema for pre-registration |
| `game/` | Game prototype (single page + scripts). `python game/_build.py` rebuilds `trenches-league.html` from `_shell.html` |

## Run the site locally

Any static server works, for example:

```
cd docs
python -m http.server 8080
```

Without Supabase settings the site runs in **demo mode**: registrations stay in the browser and country counts are simulated.

## Go live

1. **GitHub:** create an empty repository named `trenches-league`, then push this folder:
   ```
   git remote add origin https://github.com/<your-user>/trenches-league.git
   git push -u origin main
   ```
2. **GitHub Pages:** repository Settings > Pages > Source: *Deploy from a branch*, Branch: `main`, Folder: `/docs`. The site appears at `https://<your-user>.github.io/trenches-league/`.
3. **Supabase** (free tier): create a project, open SQL Editor, run `supabase/schema.sql`. Copy *Project URL* and *anon public key* from Settings > API into `docs/config.js`, commit and push.
4. **X handle:** put the account name in `docs/config.js` (`xHandle`) to show the follow button.

## Before the public launch

- Add a bot check (Cloudflare Turnstile) to `register` once traffic grows.
- Have native speakers review the 8 languages.
- Legal review of the Founder rewards and war chest before the token launch.
