# Deployment

This app is static files only. GitHub Pages, Netlify, nginx, or `python3 -m http.server` all work.

## GitHub Pages

1. Push to GitHub
2. Settings → Pages → Deploy from a branch
3. Branch: `main`, folder: `/ (root)`
4. App URL: `https://<user>.github.io/<repo>/`

## Local

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Notes

- Data lives in the browser’s `localStorage` (`smart-todos`). Clearing site data deletes tasks.
- Use Export / Import in the toolbar to move tasks between browsers.
- HTTPS is required for `localStorage` on some browsers; GitHub Pages provides HTTPS.
- There is no server, database, or CDN dependency besides the files in this repo.
