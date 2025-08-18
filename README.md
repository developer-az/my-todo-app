# ✨ Modern Todo App

A beautiful, modern todo application built with vanilla JavaScript and Tailwind CSS. This app works entirely offline using localStorage, making it perfect for GitHub Pages deployment.

## 🌟 Features

- **🎨 Modern Design** - Beautiful glassmorphism UI with dark/light theme support
- **💾 Offline-First** - Works completely offline using localStorage
- **⚡ Instant Updates** - No server required, all changes saved locally
- **📱 Responsive** - Works perfectly on desktop and mobile devices
- **🎭 Theme Toggle** - Switch between light and dark themes
- **✨ Smooth Animations** - Elegant transitions and micro-interactions
- **🔧 Full CRUD Operations** - Create, read, update, and delete todos
- **📊 Smart Counter** - Shows remaining items count
- **🧹 Bulk Actions** - Clear all completed todos at once

## 🚀 Live Demo

[View the live demo on GitHub Pages](https://developer-az.github.io/my-todo-app/)

## 🛠️ Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with Tailwind CSS
- **JavaScript (ES6+)** - Vanilla JS with modern features
- **localStorage** - Client-side data persistence
- **Tailwind CSS** - Utility-first CSS framework

## 📦 Installation & Deployment

### For GitHub Pages:

1. **Fork or clone this repository**
   ```bash
   git clone https://github.com/yourusername/your-repo-name.git
   cd your-repo-name
   ```

2. **Enable GitHub Pages**
   - Go to your repository settings
   - Scroll down to "GitHub Pages" section
   - Select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Click "Save"

3. **Your app will be live at:**
   ```
   https://yourusername.github.io/your-repo-name/
   ```

### For Local Development:

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/your-repo-name.git
   cd your-repo-name
   ```

2. **Open in your browser**
   - Simply open `index.html` in your web browser
   - Or use a local server:
     ```bash
     # Using Python 3
     python -m http.server 8000
     
     # Using Node.js (if you have http-server installed)
     npx http-server
     
     # Using PHP
     php -S localhost:8000
     ```

3. **Visit** `http://localhost:8000`

## 🎯 How It Works

### Data Storage
- All todos are stored in the browser's localStorage
- No server or database required
- Data persists across browser sessions
- Works completely offline

### Features
- **Add Todos**: Type and press Enter to add new todos
- **Toggle Completion**: Click the circle to mark as complete/incomplete
- **Edit Todos**: Double-click any todo text to edit inline
- **Delete Todos**: Hover over a todo and click the X button
- **Clear Completed**: Click "Clear completed" to remove all finished todos
- **Theme Toggle**: Click the sun/moon icon to switch themes

## 🎨 Customization

### Colors & Styling
The app uses Tailwind CSS classes. You can customize:
- Background gradients in the `.gradient-bg` class
- Glassmorphism effects in the `.glassmorphism` class
- Animations in the CSS keyframes

### Adding Features
The app is built with a clean, modular structure:
- `TodoApp` class handles all functionality
- `localStorage` methods for data persistence
- Event listeners for user interactions
- Render methods for UI updates

## 📱 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Tailwind CSS** for the beautiful utility-first CSS framework
- **Glassmorphism** design trend for the modern UI
- **GitHub Pages** for free hosting

---

Made with ❤️ for the open source community
