# Smart Todo — GitHub Copilot Instructions

Static vanilla JS todo app. No build step, package manager, or backend.

## Local development

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`. Or open `index.html` directly.

Run tests with:

```bash
node test.js
```

## File structure

```
index.html          Markup
styles.css          Styles
todo-ui.js          Browser UI
smart-todo-app.js   Data layer shared with tests
test.js             Node test suite
manifest.json       PWA manifest
LICENSE             MIT
```

Do not add `app.js` at the repo root — it is gitignored from an older Node/Express layout.

## After UI changes, verify

1. Add a task with Enter and with the Add button
2. Toggle complete; counter updates
3. Edit via pencil or double-click; Enter saves, Escape cancels
4. Delete a task
5. Complete one task and use Clear completed
6. Theme toggle persists across refresh
7. Tasks persist across refresh
8. Filters, search, and sort change the visible list
9. Export downloads JSON; import restores it
10. A payload like `<img src=x onerror=alert(1)>` renders as text, not HTML
