# Modern Todo App - GitHub Copilot Instructions

**ALWAYS follow these instructions first and only fallback to search or bash commands when the information here is incomplete or found to be in error.**

## Overview

Modern Todo App is a standalone single-file HTML application with vanilla JavaScript and Tailwind CSS. It runs entirely in the browser using localStorage for data persistence. No server, database, build process, or package manager required.

## Working Effectively

### Local Development Setup
- **Start local server**: `python3 -m http.server 8000` (starts in <1 second)
- **Open application**: Visit `http://localhost:8000` in your browser
- **Alternative**: Open `index.html` directly in any modern browser
- **NEVER CANCEL**: No build commands exist - this is a static file application

### File Structure
```
├── .github/
│   └── copilot-instructions.md    # These instructions
├── .gitignore                     # Standard ignore patterns
├── README.md                      # Project documentation  
├── DEPLOYMENT.md                  # GitHub Pages deployment guide
└── index.html                     # Complete application (HTML/CSS/JS)
```

### Core Technologies
- **HTML5** - Semantic markup and structure
- **CSS3** - Custom animations plus Tailwind CSS from CDN
- **JavaScript ES6+** - TodoApp class with localStorage persistence
- **Tailwind CSS** - Utility-first CSS framework (loaded from CDN)

## Validation Scenarios

**CRITICAL**: After any changes, ALWAYS manually test these user scenarios:

### Essential User Flows
1. **Add Todo**: Type text in input field, press Enter → Todo appears in list, counter updates
2. **Toggle Completion**: Click circle icon → Todo gets strikethrough, counter decreases by 1
3. **Edit Todo**: Double-click todo text → Becomes editable input, press Enter to save
4. **Delete Todo**: Hover over todo, click X button → Todo disappears with animation  
5. **Clear Completed**: Complete at least one todo, click "Clear completed" → Only incomplete todos remain
6. **Theme Toggle**: Click sun/moon icon → Background and styling change between light/dark
7. **Persistence**: Refresh browser → All todos and theme preference preserved

### Quick Validation Commands
```bash
# Start server and validate
python3 -m http.server 8000 &
# Open http://localhost:8000 in browser
# Run through all 7 user scenarios above
# Kill server when done: killall python3
```

## Common Tasks

### Making Code Changes
- **Edit application**: Modify `index.html` (contains all HTML, CSS, and JavaScript)  
- **Test changes**: Refresh browser (no build step required)
- **Validate**: Always run through the 7 user scenarios listed above
- **Deploy**: Commit and push to main branch (auto-deploys to GitHub Pages)

### Key Code Sections in index.html
- **Lines 1-23**: HTML head, Tailwind CSS config
- **Lines 24-63**: CSS animations and glassmorphism effects  
- **Lines 64-138**: HTML structure and UI elements
- **Lines 139-375**: TodoApp JavaScript class with all functionality

### GitHub Pages Deployment  
- **Enable**: Repository Settings → Pages → Deploy from branch → main → / (root)
- **URL**: `https://[username].github.io/[repo-name]/`
- **Time**: Deployment completes in 1-2 minutes after push
- **No build step**: Static files deploy directly

## Application Architecture

### TodoApp Class Methods
- `init()` - Initialize app, setup listeners, load data
- `addTodo(text)` - Create new todo item
- `toggleTodo(id)` - Switch completion status  
- `updateTodo(id, text)` - Edit existing todo text
- `deleteTodo(id)` - Remove todo with animation
- `clearCompleted()` - Remove all completed todos
- `render()` - Update DOM with current state
- `saveToLocalStorage()` - Persist data to browser storage
- `loadFromLocalStorage()` - Restore data from browser storage

### Data Structure
```javascript
// Each todo object:
{
  id: number,           // Unique identifier
  text: string,         // Todo text content  
  completed: boolean,   // Completion status
  createdAt: string    // ISO timestamp
}
```

## Development Guidelines

### Making Changes
- **Small changes**: Edit `index.html` directly
- **Test immediately**: Refresh browser after each change
- **NO build tools**: Never run npm, webpack, or build commands - they don't exist
- **NO package.json**: This is a dependency-free static application

### Code Style
- **HTML**: Use semantic elements, maintain accessibility  
- **CSS**: Use Tailwind utility classes, custom CSS in `<style>` section
- **JavaScript**: ES6+ class syntax, maintain TodoApp pattern
- **Comments**: Only add if they match existing style or explain complex logic

### Performance Notes  
- **Tailwind CSS**: Loaded from CDN - may fail in restrictive environments
- **localStorage**: Stores all todo data in browser  
- **Animations**: CSS-based transitions for smooth UX
- **Offline**: App works completely offline after initial load

## Troubleshooting

### Common Issues
- **Tailwind not loading**: CDN blocked (shows console error: "Failed to load resource" and "tailwind is not defined") → App still functions with core styling, just missing some Tailwind utilities
- **Data not persisting**: localStorage disabled → Check browser settings, private browsing mode disables localStorage
- **JavaScript errors**: Check browser console for specific issues
- **App appears unstyled**: Normal if Tailwind CDN is blocked - core functionality still works

### Browser Compatibility  
- ✅ Chrome (latest)
- ✅ Firefox (latest) 
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers

## Repository Context

### Project History
- Originally a Node.js/Express app, converted to static single-file
- Optimized for GitHub Pages deployment
- Uses localStorage instead of database
- No backend or API endpoints

### Key Files Content Summary

**README.md**: Project overview, features list, deployment instructions
**DEPLOYMENT.md**: Detailed GitHub Pages deployment guide  
**index.html**: Complete application with embedded CSS/JS (15,743 bytes)

Always reference these specific files for project context before making changes.