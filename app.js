const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// In-memory storage for todos (in production, use a database)
let todos = [
    { id: 1, text: 'Learn Express.js', completed: false, createdAt: new Date().toISOString() },
    { id: 2, text: 'Build a todo API', completed: false, createdAt: new Date().toISOString() }
];
let nextId = 3;

// API Routes

// GET /api/todos - Get all todos with optional filter
app.get('/api/todos', (req, res) => {
    const { filter } = req.query;
    
    let filteredTodos = todos;
    
    if (filter === 'active') {
        filteredTodos = todos.filter(todo => !todo.completed);
    } else if (filter === 'completed') {
        filteredTodos = todos.filter(todo => todo.completed);
    }
    // 'all' or no filter returns all todos
    
    res.json(filteredTodos);
});

// GET /api/todos/:id - Get a specific todo
app.get('/api/todos/:id', (req, res) => {
    const todo = todos.find(t => t.id === parseInt(req.params.id));
    if (!todo) {
        return res.status(404).json({ error: 'Todo not found' });
    }
    res.json(todo);
});

// POST /api/todos - Create a new todo
app.post('/api/todos', (req, res) => {
    const { text } = req.body;
    
    if (!text || text.trim() === '') {
        return res.status(400).json({ error: 'Todo text is required' });
    }
    
    const newTodo = {
        id: nextId++,
        text: text.trim(),
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    todos.push(newTodo);
    res.status(201).json(newTodo);
});

// PUT /api/todos/:id - Update a todo
app.put('/api/todos/:id', (req, res) => {
    const todoIndex = todos.findIndex(t => t.id === parseInt(req.params.id));
    
    if (todoIndex === -1) {
        return res.status(404).json({ error: 'Todo not found' });
    }
    
    const { text, completed } = req.body;
    
    if (text !== undefined) {
        if (text.trim() === '') {
            return res.status(400).json({ error: 'Todo text cannot be empty' });
        }
        todos[todoIndex].text = text.trim();
    }
    
    if (completed !== undefined) {
        todos[todoIndex].completed = Boolean(completed);
    }
    
    todos[todoIndex].updatedAt = new Date().toISOString();
    
    res.json(todos[todoIndex]);
});

// DELETE /api/todos/:id - Delete a todo
app.delete('/api/todos/:id', (req, res) => {
    const todoIndex = todos.findIndex(t => t.id === parseInt(req.params.id));
    
    if (todoIndex === -1) {
        return res.status(404).json({ error: 'Todo not found' });
    }
    
    const deletedTodo = todos.splice(todoIndex, 1)[0];
    res.json(deletedTodo);
});

// PATCH /api/todos/:id/toggle - Toggle todo completion status
app.patch('/api/todos/:id/toggle', (req, res) => {
    const todoIndex = todos.findIndex(t => t.id === parseInt(req.params.id));
    
    if (todoIndex === -1) {
        return res.status(404).json({ error: 'Todo not found' });
    }
    
    todos[todoIndex].completed = !todos[todoIndex].completed;
    todos[todoIndex].updatedAt = new Date().toISOString();
    
    res.json(todos[todoIndex]);
});

// DELETE /api/todos/completed - Clear all completed todos
app.delete('/api/todos/completed', (req, res) => {
    const completedTodos = todos.filter(t => t.completed);
    todos = todos.filter(t => !t.completed);
    res.json({ deleted: completedTodos.length, todos: completedTodos });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// (was) Simple homepage
// Serve the frontend
app.get('/', (req, res) => {
    if (require('fs').existsSync(path.join(__dirname, 'public', 'index.html'))) {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } else {
        res.send(`
            <h1>Todo API is Running! 🚀</h1>
            <p>API Endpoints are working!</p>
            <p>Create public/index.html for the frontend.</p>
        `);
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Todo API server running on http://localhost:${PORT}`);
    console.log(`📋 API endpoints available at http://localhost:${PORT}/api/todos`);
});

module.exports = app;
