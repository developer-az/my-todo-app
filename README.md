# Smart Todo

A small, offline-first todo app. No build step, no backend, no accounts. Open `index.html` or host the folder on GitHub Pages.

Live demo: [developer-az.github.io/my-todo-app](https://developer-az.github.io/my-todo-app/)

## What it actually does

- Add, complete, edit, and delete tasks
- Filter by status, category, and priority; search; sort by newest, priority, or due date
- Detect categories, tags, priority keywords, and due dates from the text you type
- Persist everything in `localStorage`
- Export / import a JSON backup
- Optional per-task timer
- Light / dark theme
- Analytics snapshot of the current list

It does **not** call an AI API. Categorization is keyword matching on your device.

## Quick start

```bash
git clone https://github.com/developer-az/my-todo-app.git
cd my-todo-app
python3 -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000). You can also open `index.html` directly.

## Typing tips

| You type | What happens |
| --- | --- |
| `Call doctor tomorrow #health urgent` | Health, critical, due tomorrow, tag `#health` |
| `Prepare board meeting #work important` | Work, high priority |
| `Buy groceries Friday #shopping` | Shopping, due Friday |
| `Read chapter 5 someday #learning` | Learning, low priority |

Due dates understood: `today`, `tomorrow`, weekday names, `next week`, `in 3 days`, and `YYYY-MM-DD`.

## Tests

```bash
node test.js
```

Requires Node 18+.

## Project layout

```
index.html          UI markup
styles.css          Layout and theme
todo-ui.js          DOM, filters, analytics
smart-todo-app.js   Data layer (also used by tests)
test.js             Assertion-based unit tests
manifest.json       Add-to-home-screen metadata
```

## GitHub Pages

Settings → Pages → Deploy from a branch → `main` → `/ (root)`.

## License

MIT. See [LICENSE](LICENSE).
